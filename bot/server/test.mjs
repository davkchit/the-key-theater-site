// Offline check of the server's turn: real bot logic, real SQLite (in a temp
// folder), fake model and fake Telegram. Free and fast; run after any change
// to bot/server:
//
//   node bot/server/test.mjs

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { repoRoot } from '../scripts/env.mjs'
import { buildKnowledge } from '../core/knowledge.mjs'
import { loadBotLib } from './lib.mjs'
import { openStore } from './store.mjs'
import { createTurn } from './turn.mjs'

const lib = loadBotLib()
const knowledge = buildKnowledge(repoRoot)
const ADMIN = '-100777'
let updateId = 1000

function rig({ llm, parser = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kluch-test-'))
  const store = openStore(dir)
  const sent = []
  const logs = []
  const env = { ADMIN_CHAT_ID: ADMIN, BOT_PARSER: parser ? '1' : '0', LLM_MODEL: 'm', LLM_PARSER_MODEL: 'p' }
  const turn = createTurn({
    env, lib, store,
    getKnowledge: () => knowledge,
    llm: llm || (async () => { throw new Error('модель не должна вызываться') }),
    send: async (item) => { sent.push(item) },
    log: (...a) => logs.push(a.join(' ')),
    now: () => Date.UTC(2026, 8, 19, 10, 0) + updateId * 1000,
  })
  const say = (chatId, text) => turn.handle({ update_id: ++updateId, message: { message_id: updateId, date: 0, chat: { id: chatId, type: 'private' }, from: { id: chatId, first_name: 'Тест' }, text } })
  const tap = (chatId, data, messageId = 5, inChat = chatId) => turn.handle({ update_id: ++updateId, callback_query: { id: 'cb' + updateId, from: { id: chatId, first_name: 'Тест' }, message: { message_id: messageId, chat: { id: inChat, type: inChat < 0 ? 'group' : 'private' }, text: 'карточка' }, data } })
  const texts = () => sent.filter((s) => s.method === 'sendMessage').map((s) => s.payload.text)
  return { store, sent, logs, say, tap, texts, close: () => { store.close(); fs.rmSync(dir, { recursive: true, force: true }) } }
}

const tests = []
const test = (name, fn) => tests.push([name, fn])

test('приветствие отвечает сам, без модели, и запоминает чат', async () => {
  const t = rig()
  await t.say(1, 'привет')
  assert.equal(t.texts().length, 1)
  assert.ok(/кот|привет/i.test(t.texts()[0]))
  assert.ok(t.store.getChat(1), 'состояние диалога не сохранено')
  t.close()
})

test('вопрос уходит модели, название спектакля в ответе жирное', async () => {
  let asked = null
  const t = rig({ llm: async (body) => { asked = body; return { choices: [{ message: { content: '«Симон» - весёлая комедия о похоронах, 18+.' } }] } } })
  await t.say(2, 'расскажи про спектакль Симон')
  assert.ok(asked, 'модель не вызывалась')
  assert.equal(asked.model, 'm')
  assert.ok(asked.messages[0].content.includes('Симон'), 'знание не попало в промт')
  assert.ok(t.texts()[0].includes('<b>«Симон»</b>'), t.texts()[0])
  assert.equal(t.store.getChat(2).history.length, 2, 'история не сохранилась')
  t.close()
})

test('модель недоступна: человек получает честный ответ, админу уходит сигнал', async () => {
  const t = rig({ llm: async () => { throw new Error('лимит') } })
  await t.say(3, 'расскажи про спектакль Симон')
  assert.ok(t.texts().some((x) => /перегружен/.test(x)), t.texts().join(' | '))
  const alert = t.sent.find((s) => s.payload && s.payload.chat_id === ADMIN)
  assert.ok(alert && /Модель не ответила/.test(alert.payload.text), 'нет сигнала админу')
  assert.ok(t.store.getChat(3), 'состояние не сохранено')
  t.close()
})

test('парсер: ответ разбирается, а его сбой не роняет ход', async () => {
  const calls = []
  const t = rig({
    parser: true,
    llm: async (body) => {
      calls.push(body.model)
      if (body.model === 'p') throw new Error('парсер лёг')
      return { choices: [{ message: { content: 'Ответ.' } }] }
    },
  })
  await t.say(4, 'а сколько идёт Никаких последствий?')
  assert.ok(calls.includes('p'), 'парсер не вызывался')
  assert.ok(calls.includes('m'), 'модель не вызывалась после сбоя парсера')
  assert.ok(t.texts().length >= 1)
  t.close()
})

test('запись на курс до конца: заявка в базе, карточка админу, статус кнопкой', async () => {
  const t = rig()
  await t.say(10, 'запишите дочку, ей 7')
  await t.tap(10, 'consent:yes')
  await t.say(10, 'Марина')
  await t.say(10, '7')
  await t.say(10, '89061234567')
  await t.tap(10, 'confirm:yes')
  const lead = t.store.db.prepare('SELECT * FROM leads').get()
  assert.ok(lead, 'заявка не сохранена: ' + t.texts().join(' | '))
  assert.equal(lead.phone, '+7 906 123-45-67') // stored the way the bot formats it, as under n8n
  assert.equal(lead.status, 'новая')
  assert.equal(lead.source, 'бот')
  const card = t.sent.find((s) => s.payload && s.payload.chat_id === ADMIN && /Марина/.test(s.payload.text))
  assert.ok(card, 'карточка админу не ушла')

  // the admin presses a status button under the card
  const keyboard = card.payload.reply_markup.inline_keyboard.flat()
  const btn = keyboard.find((b) => /^lead:/.test(b.callback_data))
  assert.ok(btn, 'у карточки нет кнопок статуса')
  await t.tap(99, btn.callback_data, 77, Number(ADMIN))
  const after = t.store.db.prepare('SELECT status, status_by FROM leads').get()
  assert.notEqual(after.status, 'новая', 'статус не изменился')
  assert.equal(after.status_by, 'Тест')
  assert.ok(t.sent.some((s) => s.method === 'editMessageText'), 'карточку не обновили')
  t.close()
})

test('запись на фестиваль: свои вопросы, заявка помнит направление и ответы', async () => {
  const t = rig()
  await t.say(20, 'запишите на фестиваль')
  await t.tap(20, 'consent:yes')
  await t.say(20, 'Анна')
  assert.ok(/коллектив/i.test(t.texts().at(-1)), 'не спросил про коллектив: ' + t.texts().at(-1))
  await t.say(20, 'Театр «Огонёк»')
  await t.say(20, 'Казань')
  await t.say(20, 'не почта')
  assert.ok(/почт/i.test(t.texts().at(-1)), 'принял неправильную почту')
  await t.say(20, 'anna@mail.ru')
  await t.say(20, '89061234567')
  assert.ok(/Проверьте/.test(t.texts().at(-1)), t.texts().at(-1))
  await t.tap(20, 'confirm:yes')
  const lead = t.store.db.prepare('SELECT * FROM leads').get()
  assert.ok(lead, 'заявка не сохранена')
  assert.match(lead.direction, /Действующие лица/)
  assert.match(lead.answers, /Коллектив: Театр «Огонёк»/)
  assert.match(lead.answers, /Email: anna@mail\.ru/)
  const card = t.sent.find((s) => s.payload && s.payload.chat_id === ADMIN)
  assert.ok(card && /Заявка: Фестиваль/.test(card.payload.text), 'карточка админу без направления')
  t.close()
})

test('ответ, упёршийся в лимит токенов, не уходит обрывком', async () => {
  const cutOff = 'Первое предложение полностью и понятно. Второе предложение тоже полностью, с цифрами 2 500. Третье обрывается на полусл'
  const t = rig({ llm: async () => ({ choices: [{ finish_reason: 'length', message: { content: cutOff } }] }) })
  await t.say(30, 'расскажи про спектакль Симон')
  const said = t.texts()[0]
  assert.ok(said.endsWith('2 500.'), said)
  t.close()
})

test('закрытый квест: формы нет, отвечает модель', async () => {
  let asked = 0
  const t = rig({ llm: async () => { asked++; return { choices: [{ message: { content: 'Приём заявок на квест пока закрыт.' } }] } } })
  await t.say(21, 'запишите на квест')
  assert.equal(asked, 1, 'модель должна была ответить')
  assert.ok(!/Согласен/.test(t.texts().join(' ')), 'форма открылась на закрытый квест')
  assert.equal(t.store.getChat(21).step, null)
  t.close()
})

test('рассылка: телефон не спрашивается, заявка без него', async () => {
  const t = rig()
  await t.say(22, 'хочу записаться на рассылку')
  await t.tap(22, 'consent:yes')
  await t.say(22, 'Олег')
  await t.say(22, 'oleg@mail.ru')
  assert.ok(/Проверьте/.test(t.texts().at(-1)), 'после почты должно быть подтверждение: ' + t.texts().at(-1))
  await t.tap(22, 'confirm:yes')
  const lead = t.store.db.prepare('SELECT * FROM leads').get()
  assert.equal(lead.phone, '')
  assert.match(lead.direction, /Рассылка/)
  t.close()
})

test('«давай» после предложения записаться на подготовительную группу открывает именно её', async () => {
  const t = rig({ llm: async () => ({ choices: [{ message: { content: 'Есть подготовительная группа для малышей. Оформить заявку можно прямо в чате.' } }] }) })
  await t.say(23, 'а есть подготовительная группа?')
  const btn = t.sent.flatMap((s) => (s.payload.reply_markup && s.payload.reply_markup.inline_keyboard ? s.payload.reply_markup.inline_keyboard.flat() : [])).find((b) => /signup:dir:/.test(b.callback_data || ''))
  assert.ok(btn, 'кнопки записи на направление нет')
  assert.match(btn.callback_data, /preparatory/)
  await t.say(23, 'давай')
  assert.ok(t.texts().some((x) => /Подготовительная группа/.test(x) && /Согласен/.test(x)), t.texts().at(-1))
  t.close()
})

test('курс записывается по-старому, как до направлений', async () => {
  const t = rig()
  await t.say(24, 'запишите дочку, ей 7')
  await t.tap(24, 'consent:yes')
  await t.say(24, 'Марина')
  assert.ok(/сколько лет/i.test(t.texts().at(-1)), 'курс должен спросить возраст: ' + t.texts().at(-1))
  t.close()
})

test('повторное сохранение заявки не сбрасывает её статус', async () => {
  const t = rig()
  t.store.commit({ chats: [], statuses: [], unanswered: [], leads: [{ lead_id: 'L1', created_at: 'a', updated_at: 'a', status: 'новая', status_by: '', chat_id: '1', source: 'бот', name: 'А', phone: '1', children: '', questions: '', nudges: '0' }] })
  t.store.commit({ chats: [], leads: [], unanswered: [], statuses: [{ lead_id: 'L1', status: 'в работе', status_by: 'Аня', updated_at: 'b' }] })
  t.store.commit({ chats: [], statuses: [], unanswered: [], leads: [{ lead_id: 'L1', updated_at: 'c', chat_id: '1', source: 'бот', name: 'А2', phone: '1', children: '7 лет', questions: '', nudges: '1' }] })
  const row = t.store.db.prepare('SELECT * FROM leads').get()
  assert.equal(row.status, 'в работе')
  assert.equal(row.name, 'А2')
  assert.equal(row.created_at, 'a')
  t.close()
})

test('упавшая запись откатывается целиком', async () => {
  const t = rig()
  assert.throws(() => t.store.commit({ statuses: [], unanswered: [], chats: [{ chat_id: '9', state: '{}', updated_at: 'x' }], leads: [{ nonexistent_column: 1, lead_id: 'Z' }] }))
  assert.equal(t.store.getChat(9), null, 'состояние осталось после отката')
  t.close()
})

let failed = 0
for (const [name, fn] of tests) {
  try {
    await fn()
    console.log('  ✓', name)
  } catch (e) {
    failed++
    console.log('  ✗', name, '\n     ', String(e.message).split('\n').slice(0, 4).join('\n      '))
  }
}
console.log(failed ? `\nне прошло: ${failed} из ${tests.length}` : `\nвсё прошло: ${tests.length} из ${tests.length}`)
process.exit(failed ? 1 : 0)
