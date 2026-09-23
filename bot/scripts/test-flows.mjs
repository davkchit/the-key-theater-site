// Deterministic checks of the scenario logic -- no model, no n8n, no network.
// Each case replays a short conversation and asserts on what the bot says.
//
//   node bot/scripts/test-flows.mjs

import { buildKnowledge } from '../core/knowledge.mjs'
import { repoRoot } from './env.mjs'
import { loadLib } from './simulate.mjs'

const lib = loadLib()
const knowledge = buildKnowledge(repoRoot)
let failures = 0

function chat(id) {
  let state = null
  let t = Date.UTC(2026, 8, 15, 16, 0)
  const effects = []
  const send = (update) => {
    t += 60_000
    const ev = lib.normalizeUpdate(update)
    const res = lib.decide(ev, state, null, knowledge, { nowMs: t })
    if (res.state) state = res.state
    effects.push(...res.effects)
    return { texts: res.out.map((m) => m.text), buttons: res.out.flatMap((m) => (m.reply_markup?.inline_keyboard || []).flat().map((b) => b.callback_data)), model: Boolean(res.model), effects: res.effects }
  }
  const base = { chat: { id, type: 'private' }, from: { id, first_name: 'Тест' }, message_id: 1 }
  return {
    text: (s) => send({ message: { ...base, text: s } }),
    tap: (data) => send({ callback_query: { id: 'cb', from: base.from, data, message: { message_id: 1, chat: base.chat } } }),
    contact: (phone) => send({ message: { ...base, contact: { phone_number: phone } } }),
    effects,
  }
}

function check(name, cond, detail) {
  if (cond) console.log('  ✓ ' + name)
  else { failures++; console.log('  ✗ ' + name + (detail ? '  →  ' + JSON.stringify(detail).slice(0, 160) : '')) }
}

function signUp(c, name = 'Марина', age = '7') {
  c.text('хочу записаться')
  c.tap('consent:yes')
  c.text(name)
  c.text(age)
  c.contact('79061234567')
  return c.tap('confirm:yes')
}

console.log('\nЗапись с нуля')
{
  const c = chat(1)
  const r = c.text('хочу оставить заявку')
  check('«хочу оставить заявку» открывает согласие без модели', !r.model && r.buttons.includes('consent:yes'), r)
  const done = signUp(chat(11))
  check('полная запись создаёт заявку', done.effects.some((e) => e.type === 'leadSave' && e.isNew), done.effects)
}

console.log('\nЖивой баг: «привет» записалось как имя')
{
  const c = chat(12)
  c.text('хочу записаться')
  c.tap('consent:yes')
  for (const w of ['привет', 'да', 'ок', 'хочу']) {
    const r = c.text(w)
    check(`«${w}» на шаге имени не принято`, r.texts.join(' ').includes('как вас зовут'), r.texts)
  }
  const r = c.text('Анна')
  check('а настоящее имя принято', r.texts.join(' ').includes('Анна, сколько лет'), r.texts)
}

console.log('\nСкриншот: заявка уже есть, человек спрашивает «как записаться?»')
{
  const c = chat(2)
  signUp(c)
  const r = c.text('как записаться?')
  check('модель не вызывается', !r.model, r)
  check('бот не решает сам за человека, а спрашивает', r.buttons.includes('signup:extra') && r.buttons.includes('signup:new'), r)
  check('и не пишет «Добавлю ещё одного ребёнка»', !r.texts.join(' ').includes('Добавлю ещё одного'), r.texts)
  const n = c.tap('signup:new')
  check('«Новая заявка» ведёт на согласие', n.buttons.includes('consent:yes'), n)
}

console.log('\n«ещё дочку запишите» при открытой заявке — сразу к той же заявке')
{
  const c = chat(3)
  signUp(c)
  const r = c.text('запишите ещё дочку, ей 12')
  check('ребёнок добавлен без лишних вопросов', r.effects.some((e) => e.type === 'leadSave' && e.lead.children?.some((c) => c.includes('12 лет') && c.includes('Дети'))), r)
}

console.log('\nСкриншот: «отмена заявки» посреди записи')
{
  const c = chat(4)
  c.text('хочу записаться')
  c.tap('consent:yes')
  c.text('Марина')
  const r = c.text('отмена заявки')
  check('запись отменена', r.texts.join(' ').includes('отменил'), r.texts)
  const after = c.text('Марина')
  check('после отмены «Марина» не принимается как ответ шага', !after.texts.join(' ').includes('сколько лет'), after.texts)
}

console.log('\nОтмена уже отправленной заявки')
{
  const c = chat(5)
  signUp(c)
  const ask = c.text('отменить заявку')
  check('бот переспрашивает', ask.buttons.includes('mylead:cancel'), ask)
  const r = c.tap('mylead:cancel')
  check('администратору уходит отмена', r.effects.some((e) => e.type === 'leadCancel'), r.effects)
  const nudge = c.text('мне не перезвонили')
  check('по отменённой заявке «ждёт звонка» не шлётся', !nudge.effects.some((e) => e.type === 'leadSave'), nudge.effects)
  const again = c.text('хочу записаться')
  check('после отмены можно записаться заново', again.buttons.includes('consent:yes'), again)
}

console.log('\nОтмена, когда отменять нечего')
{
  const r = chat(6).text('отмена')
  check('вежливо: отменять нечего', r.texts.join(' ').includes('нечего') && !r.model, r)
}

console.log('\nБолтовня отвечает кот, без модели')
{
  for (const s of ['привввиит', 'салям', 'как ты?', 'спасибо']) {
    const r = chat(7).text(s)
    check(`«${s}»`, !r.model && r.texts.length === 1, r)
  }
  const q = chat(8).text('привет, а какие спектакли в сентябре?')
  check('приветствие с настоящим вопросом уходит в модель', q.model, q)
}

console.log(failures ? `\n✗ провалено: ${failures}` : '\n✓ всё зелёное')
process.exit(failures ? 1 : 0)
