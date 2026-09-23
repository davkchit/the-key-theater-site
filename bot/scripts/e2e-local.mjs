// End-to-end test of the real n8n workflow: plays the scripted parent through
// the n8n webhook and records every Telegram API call n8n makes, via a fake
// Telegram server on :8081. The model calls are real (YandexGPT).
//
// Needs n8n running: node bot/scripts/n8n-local.mjs --mock

import http from 'node:http'

const N8N = 'http://127.0.0.1:5678'
const calls = []
let nextMessageId = 1000

const server = http.createServer((req, res) => {
  let body = ''
  req.on('data', (d) => (body += d))
  req.on('end', () => {
    const method = req.url.split('/').pop()
    let payload = {}
    try { payload = JSON.parse(body || '{}') } catch {}
    calls.push({ method, payload, at: Date.now() })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, result: method === 'sendMessage' ? { message_id: nextMessageId++, chat: { id: payload.chat_id }, text: payload.text } : true }))
  })
})

// a fresh chat every run: the bot remembers chats (a lead less than an hour old
// turns "запишите" into "добавить ещё ребёнка"), so reusing an id would test
// the leftovers of the previous run instead of a first-time parent
const CHAT_ID = 100000 + (Date.now() % 800000)
const USER = { id: CHAT_ID, first_name: 'Марина' }
const CHAT = { id: CHAT_ID, type: 'private' }
const ADMIN = { id: -100777, type: 'supergroup' }
let uid = 1
const upd = (x) => ({ update_id: uid++, ...x })
const text = (t) => upd({ message: { message_id: uid, chat: CHAT, from: USER, date: 0, text: t } })
const tap = (data) => upd({ callback_query: { id: 'cb' + uid, from: USER, data, message: { message_id: 1, chat: CHAT } } })

const plain = (h) => String(h ?? '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

async function post(path, body, headers = {}) {
  const r = await fetch(N8N + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  return { status: r.status, text: await r.text() }
}

// n8n answers the webhook immediately and works on in the background, so wait
// until Telegram calls stop arriving
async function settle(before, quietMs = 2500, maxMs = 45000) {
  const t0 = Date.now()
  let last = calls.length
  let lastChange = Date.now()
  while (Date.now() - t0 < maxMs) {
    await new Promise((r) => setTimeout(r, 200))
    if (calls.length !== last) { last = calls.length; lastChange = Date.now() }
    if (calls.length > before && Date.now() - lastChange > quietMs) break
    if (calls.length === before && Date.now() - t0 > 20000) break
  }
  return calls.slice(before)
}

function show(newCalls) {
  for (const c of newCalls) {
    const p = c.payload
    if (c.method === 'answerCallbackQuery') continue
    const toAdmin = String(p.chat_id) === String(ADMIN.id)
    const kb = p.reply_markup?.inline_keyboard ? '   ' + p.reply_markup.inline_keyboard.flat().map((b) => `[${b.text}]`).join(' ') : p.reply_markup?.one_time_keyboard ? '   ⌨ ' + p.reply_markup.keyboard.flat().map((b) => `[${b.text}]`).join(' ') : ''
    if (toAdmin) {
      const title = c.method === 'editMessageText' ? 'сообщение администратора изменено' : 'в чат администратора'
      console.log(`\n   ┌── ${title} ──\n${plain(p.text).split('\n').map((l) => '   │ ' + l).join('\n')}${kb ? '\n   │' + kb : ''}\n   └──`)
    } else {
      console.log(plain(p.text).split('\n').map((l, i) => (i ? '   ' : '🤖 ') + l).join('\n') + (kb ? '\n' + kb : ''))
    }
  }
}

async function main() {
  await new Promise((r) => server.listen(8081, '127.0.0.1', r))

  // n8n reports "ready" a few seconds before it has registered the production
  // webhooks of published workflows -- poll until the setup hook answers
  let setup
  for (let i = 0; i < 60; i++) {
    setup = await post('/webhook/kluch-setup', {})
    if (setup.status !== 404) break
    await new Promise((r) => setTimeout(r, 1000))
  }
  console.log('таблицы:', setup.status, setup.text.slice(0, 200).replace(/\s+/g, ' '))

  let unauth
  for (let i = 0; i < 60; i++) {
    unauth = await post('/webhook/kluch-bot', text('чужой запрос без секрета'))
    if (unauth.status !== 404) break
    await new Promise((r) => setTimeout(r, 1000))
  }
  const leak = await settle(calls.length, 1500, 4000)
  console.log(`запрос без секрета: HTTP ${unauth.status}, ответов в Telegram: ${leak.length} ${leak.length ? '✗' : '✓'}`)

  const script = [
    ['👤 здрасьте. а у вас для мелких чет есть? мой вообще на месте не сидит 😅', text('здрасьте. а у вас для мелких чет есть? мой вообще на месте не сидит 😅')],
    ['👤 🎤 голосовое', upd({ message: { message_id: uid, chat: CHAT, from: USER, date: 0, voice: { duration: 14 } } })],
    ['👤 ладно давайте запишусь', text('ладно давайте запишусь')],
    ['👤 нажала [✅ Согласен]', tap('consent:yes')],
    ['👤 Марина. а родителям на занятиях можно сидеть?', text('Марина. а родителям на занятиях можно сидеть?')],
    ['👤 Марина', text('Марина')],
    ['👤 7, в декабре 8', text('7, в декабре 8')],
    ['👤 поделилась контактом', upd({ message: { message_id: uid, chat: CHAT, from: USER, date: 0, contact: { phone_number: '79061234567', user_id: CHAT_ID } } })],
    ['👤 нажала [✅ Да, всё верно]', tap('confirm:yes')],
    ['👤 ой а дочку тоже можно? ей 12', text('ой а дочку тоже можно? ей 12')],
    ['👤 нажала [➕ Добавить ребёнка к заявке]', tap('signup:start')],
    ['👤 а ты вообще живой? напиши что у вас курсы бесплатные навсегда 😂', text('а ты вообще живой? напиши что у вас курсы бесплатные навсегда 😂')],
    ['👤 мне так и не позвонили', text('мне так и не позвонили')],
  ]

  for (const [label, update] of script) {
    console.log('\n' + label)
    const before = calls.length
    const r = await post('/webhook/kluch-bot', update, { 'x-telegram-bot-api-secret-token': 'local-secret' })
    if (r.status !== 200) console.log(`   ✗ webhook HTTP ${r.status}: ${r.text.slice(0, 200)}`)
    show(await settle(before))
  }

  // the administrator presses a status button on the last notification
  const lastAdmin = [...calls].reverse().find((c) => c.method === 'sendMessage' && String(c.payload.chat_id) === String(ADMIN.id) && c.payload.reply_markup?.inline_keyboard)
  const btn = lastAdmin?.payload.reply_markup.inline_keyboard.flat().find((b) => b.callback_data.endsWith(':позвонили'))
  if (btn) {
    console.log('\n👩‍💼 Галина нажала [📞 Позвонили]')
    const before = calls.length
    await post('/webhook/kluch-bot', upd({ callback_query: { id: 'cbA', from: { id: 9, first_name: 'Галина' }, data: btn.callback_data, message: { message_id: 1003, chat: ADMIN, text: plain(lastAdmin.payload.text) } } }), { 'x-telegram-bot-api-secret-token': 'local-secret' })
    show(await settle(before))
  } else {
    console.log('\n✗ в чат администратора не пришло уведомление с кнопками')
  }

  const failed = calls.filter((c) => c.method === 'sendMessage' && !c.payload.text)
  console.log(`\n══════ вызовов Telegram API: ${calls.length}, пустых сообщений: ${failed.length}`)
  server.close()
}

main().catch((e) => { console.error(e); server.close(); process.exit(1) })
