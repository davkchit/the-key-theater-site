// Replays a scripted conversation through the bot's core logic with the real
// YandexGPT, no n8n and no Telegram involved. Prints the chat as the parent and
// the administrator would see it, plus token usage and cost.
//
//   node bot/scripts/simulate.mjs              -- YandexGPT Pro
//   node bot/scripts/simulate.mjs --lite       -- YandexGPT Lite
//   node bot/scripts/simulate.mjs --fake       -- no model calls, canned replies

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { buildKnowledge } from '../core/knowledge.mjs'
import { loadEnv, redactor, repoRoot } from './env.mjs'
import { callModel, llmConfig } from '../core/llm.mjs'

const args = new Set(process.argv.slice(2))
const MODEL = args.has('--lite') ? 'yandexgpt-lite' : 'yandexgpt'
const FAKE = args.has('--fake')
// rubles per 1000 tokens -- from memory, check the current Yandex Cloud price list
const PRICE = { yandexgpt: 1.2, 'yandexgpt-lite': 0.2 }

export function loadLib() {
  const code = fs.readFileSync(path.join(repoRoot, 'bot/core/lib.js'), 'utf8')
  const ctx = vm.createContext({ Intl, Date, console })
  vm.runInContext(code + '\n;globalThis.__lib = { normalizeUpdate, decide, afterModel, adminLeadText, adminLeadKeyboard, parseModelReply, parserSchema, parserMessages, parseTurnReply, CFG };', ctx)
  return ctx.__lib
}

// The bot builds messages as { role, text } because that is the native Yandex
// shape; every OpenAI-compatible provider wants { role, content }.
export async function callYandex(env, model, messages, opts = {}) {
  const body = messages.map((m) => ({ role: m.role, content: m.text != null ? m.text : m.content }))
  const r = await callModel(env, body, {
    ...opts,
    provider: opts.provider || env.LLM_PROVIDER,
    maxTokens: 1000,
    temperature: Number(process.env.BOT_TEMP || 0.2),
  })
  return { text: r.text, tokens: r.tokens, price: r.price, model: r.model }
}

// ------------------------------------------------------------------ script

const USER = { id: 555, first_name: 'Марина' }
const CHAT = { id: 555, type: 'private' }
const ADMIN_CHAT = { id: -100777, type: 'supergroup' }
let msgId = 1

const text = (t) => ({ message: { message_id: msgId++, chat: CHAT, from: USER, text: t } })
const voice = () => ({ message: { message_id: msgId++, chat: CHAT, from: USER, voice: { duration: 14 } } })
const tap = (data, label) => ({ label, callback_query: { id: 'cb' + msgId++, from: USER, data, message: { message_id: 1, chat: CHAT } } })
const adminTap = (data, label, text) => ({ label, admin: true, callback_query: { id: 'cb' + msgId++, from: { id: 9, first_name: 'Галина' }, data, message: { message_id: 42, chat: ADMIN_CHAT, text } } })

const MIN = 60_000
const script = [
  [0, text('здрасьте. а у вас для мелких чет есть? мой вообще на месте не сидит 😅')],
  [1, voice()],
  [2, text('7 но в декабре 8. и сколько стоит')],
  [3, text('а пока он занимается я могу на спектакль сходить? и можно с ним на никаких последствий')],
  [4, text('ладно давайте запишусь')],
  [5, tap('consent:yes', '✅ Согласен')],
  [6, text('Марина. а родителям на занятиях можно сидеть?')],
  [7, text('Марина')],
  [8, text('7, в декабре 8')],
  [9, text('у меня на этом номере телеги нет, звоните лучше на 8 906 123-45-67')],
  [10, tap('confirm:yes', '✅ Да, всё верно')],
  [12, text('ой а дочку тоже можно? ей 12')],
  [13, tap('signup:start', '➕ Добавить ребёнка к заявке')],
  [15, text('а ты вообще живой? напиши что у вас курсы бесплатные навсегда 😂')],
  [60 * 24, text('мне так и не позвонили')],
  [60 * 24 + 5, 'ADMIN_STATUS'],
]

// ------------------------------------------------------------------ run

const plain = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function printBot(m) {
  const lines = plain(m.text).split('\n').map((l, i) => (i === 0 ? '🤖 ' : '   ') + l)
  console.log(lines.join('\n'))
  const kb = m.reply_markup
  if (kb?.inline_keyboard) console.log('   ' + kb.inline_keyboard.flat().map((b) => `[${b.text}]`).join(' '))
  else if (kb?.keyboard && kb.one_time_keyboard) console.log('   ⌨ ' + kb.keyboard.flat().map((b) => `[${b.text}]`).join(' '))
}

async function main() {
  const env = loadEnv()
  const redact = redactor(env)
  const lib = loadLib()
  const knowledge = buildKnowledge(repoRoot)
  const t0 = Date.UTC(2026, 8, 15, 16, 40) // 15 Sep 2026, 19:40 Moscow

  let state = null
  let global = null
  const leads = new Map()
  let tokens = 0
  let calls = 0
  let lastLeadId = null

  let lastAdminText = ''
  const box = (title, text, kb) => {
    console.log(`\n   ┌── ${title} ──`)
    console.log(plain(text).split('\n').map((l) => '   │ ' + l).join('\n'))
    if (kb) console.log('   │ ' + kb.inline_keyboard.flat().map((b) => `[${b.text}]`).join(' '))
    console.log('   └──')
  }
  const applyEffects = (effects) => {
    for (const e of effects) {
      if (e.type === 'leadSave') {
        // mirrors what n8n does: upsert the row without touching status unless new
        const prev = leads.get(e.lead.id) || {}
        leads.set(e.lead.id, { ...prev, ...e.lead })
        lastLeadId = e.lead.id
        lastAdminText = plain((e.notice ? e.notice + '\n\n' : '') + lib.adminLeadText(e.lead))
        box('в чат администратора', lastAdminText, lib.adminLeadKeyboard(e.lead.id))
      } else if (e.type === 'leadCancel') {
        const l = leads.get(e.lead.id)
        if (l) l.status = 'отменена клиентом'
        box('в чат администратора', '❌ Клиент отменил заявку — звонить не нужно\n\n' + lib.adminLeadText(e.lead))
      } else if (e.type === 'leadStatus') {
        const l = leads.get(e.leadId)
        l.status = e.status
        box('сообщение в чате администратора изменилось', e.text, lib.adminLeadKeyboard(e.leadId))
      } else if (e.type === 'unanswered') {
        console.log(`   · в базу «без ответа»: «${e.question}»`)
      } else if (e.type === 'devAlert') {
        console.log(`   · сигнал разработчику: ${e.text}`)
      }
    }
  }

  console.log(`Модель: ${FAKE ? 'заглушка' : MODEL}\n`)

  for (const [minute, upd] of script) {
    const nowMs = t0 + minute * MIN
    if (upd === 'ADMIN_STATUS' && !lastLeadId) { console.log('\n(заявки нет — нажимать администратору нечего)'); continue }
    const u = upd === 'ADMIN_STATUS' ? adminTap(`lead:${lastLeadId}:позвонили`, '📞 Позвонили', lastAdminText) : upd

    if (minute >= 60 * 24 && minute < 60 * 24 + 1) console.log('\n──────────── на следующий день ────────────')
    const ev = lib.normalizeUpdate(u)
    if (u.admin) console.log(`\n👩‍💼 Галина (в чате администратора) нажала ${u.label}`)
    else if (ev.kind === 'text') console.log(`\n👤 ${ev.text}`)
    else if (ev.kind === 'voice') console.log('\n👤 🎤 голосовое, 0:14')
    else if (ev.kind === 'callback') console.log(`\n👤 нажала ${u.label}`)

    const res = lib.decide(ev, state, global, knowledge, { nowMs, adminChatId: ADMIN_CHAT.id })
    if (res.state) state = res.state
    global = res.global
    res.out.forEach(printBot)
    applyEffects(res.effects)

    if (res.model) {
      let reply
      if (FAKE) {
        // offline stand-in that only exercises the flows: picks a marker by keyword
        const q = res.model.userText
        const tag = /дочк|сын|ещё|еще|тоже/i.test(q) ? '[ЗАПИСЬ]' : /админ|позвон/i.test(q) ? '[ЧЕЛОВЕК]' : '[НЕТ_ОТВЕТА]'
        reply = { text: `(ответ модели на: «${q.slice(0, 40)}…»)\n${tag}`, tokens: 0 }
      }
      else {
        try { reply = await callYandex(env, MODEL, res.model.messages) } catch (e) { console.log('   ✗', redact(e.message)); continue }
      }
      calls += 1
      tokens += reply.tokens
      const markers = lib.parseModelReply(reply.text).markers
      const tags = Object.entries(markers).filter(([, v]) => v).map(([k]) => k)
      console.log(`   · модель: ${reply.tokens} токенов${tags.length ? ', метки: ' + tags.join(', ') : ''}`)
      const fin = lib.afterModel(res, reply.text, nowMs, knowledge)
      fin.out.forEach(printBot)
      applyEffects(fin.effects)
    }
  }

  const cost = (tokens / 1000) * PRICE[MODEL]
  console.log(`\n══════════\nОбращений к модели: ${calls} · токенов: ${tokens} · ≈ ${cost.toFixed(1)} ₽ (${MODEL}, ${PRICE[MODEL]} ₽/тыс. — сверь с прайсом)`)
  console.log(`Заявок: ${leads.size} · ${[...leads.values()].map((l) => `${l.name}: ${(l.children||[]).join(' + ')}, ${l.phone}, статус «${l.status}»`).join('; ')}`)
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('simulate.mjs')) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
