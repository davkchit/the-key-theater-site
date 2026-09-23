// Local bridge for testing with a real phone, without a public server:
// pulls updates from Telegram (long polling) and hands each one to the local
// n8n webhook exactly as Telegram's own webhook would.
//
//   node bot/scripts/poll-telegram.mjs
//
// On a real server this script is not used -- Telegram is pointed at the n8n
// webhook with setWebhook instead.

import { loadEnv, redactor } from './env.mjs'

const env = loadEnv()
const redact = redactor(env)
const TG = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`
const HOOK = 'http://127.0.0.1:5678/webhook/kluch-bot'

// hard timeout on every call: a long poll that silently hangs (it happened on
// the dev box) would otherwise freeze the bridge with messages piling up unseen
async function tg(method, body, timeoutMs = 15000) {
  const r = await fetch(`${TG}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal: AbortSignal.timeout(timeoutMs),
  })
  return r.json()
}

const kindOf = (u) => (u.callback_query ? 'кнопка' : u.message?.contact ? 'контакт' : u.message?.voice ? 'голосовое' : u.message?.text ? 'текст' : 'другое')

async function main() {
  const me = await tg('getMe')
  if (!me.ok) throw new Error('Telegram: ' + me.description)
  // polling and a webhook cannot coexist -- drop any webhook left from a server
  await tg('deleteWebhook', { drop_pending_updates: false })
  console.log(`мост запущен: @${me.result.username} → n8n`)

  let offset = 0
  for (;;) {
    let res
    try {
      res = await tg('getUpdates', { offset, timeout: 10, allowed_updates: ['message', 'callback_query'] }, 20000)
    } catch (e) {
      console.log('сеть:', redact(e.cause?.code ?? e.message))
      await new Promise((r) => setTimeout(r, 3000))
      continue
    }
    if (!res.ok) { console.log('Telegram:', res.description); await new Promise((r) => setTimeout(r, 3000)); continue }
    for (const u of res.result) {
      const chat = u.message?.chat || u.callback_query?.message?.chat
      const where = chat?.type === 'private' ? 'личка' : `группа ${chat?.id}`
      try {
        const r = await fetch(HOOK, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET || '' }, body: JSON.stringify(u) })
        // 404 = n8n is up but the webhook is not registered yet (still starting)
        if (r.status === 404) throw new Error('webhook ещё не зарегистрирован')
        console.log(`${new Date().toLocaleTimeString('ru-RU')} ${kindOf(u)} · ${where} → n8n ${r.status}`)
        // only move past an update once n8n actually took it -- otherwise a
        // restart of n8n silently eats whatever people wrote in the meantime
        offset = u.update_id + 1
      } catch (e) {
        console.log(`n8n недоступен (${e.cause?.code ?? e.message}) — повторю через 3 с`)
        await new Promise((r) => setTimeout(r, 3000))
        break
      }
    }
  }
}

main().catch((e) => { console.error(redact(e.message)); process.exit(1) })
