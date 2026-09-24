// The bot as one small process (replaces n8n):
//
//   node bot/server/index.mjs        (npm run bot)
//
// It long-polls Telegram, so no public address or domain is needed, runs each
// update through bot/server/turn.mjs, keeps everything in SQLite, and answers
// GET /health on BOT_PORT (default 8787, localhost only).
//
// Settings come from .env.bot next to the repo, overridden by real environment
// variables (that is how Docker passes them):
//   TELEGRAM_BOT_TOKEN, ADMIN_CHAT_ID
//   LLM_BASE, LLM_AUTH, LLM_KEY, LLM_KEY_2..9, LLM_MODEL, LLM_PARSER_MODEL
//   SITE_URL          fetch knowledge.json from the deployed site (optional)
//   BOT_DATA_DIR      where kluch.sqlite and bot.log live (default bot/data)
//   BOT_PORT, BOT_HOST

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { loadEnv, redactor, repoRoot } from '../scripts/env.mjs'
import { loadBotLib, fetchHelpers } from './lib.mjs'
import { openStore } from './store.mjs'
import { createTelegram } from './telegram.mjs'
import { createKnowledge } from './knowledge.mjs'
import { createTurn } from './turn.mjs'

const env = { ...loadEnv(), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(TELEGRAM|ADMIN|LLM|YANDEX|SITE_URL|BOT_|KNOWLEDGE|SMTP|LEADS)/.test(k))) }
if (!env.TELEGRAM_BOT_TOKEN) { console.error('нет TELEGRAM_BOT_TOKEN: впишите его в .env.bot'); process.exit(1) }

const redact = redactor(env)
const dataDir = path.resolve(env.BOT_DATA_DIR || path.join(repoRoot, 'bot/data'))
fs.mkdirSync(dataDir, { recursive: true })
const logFile = path.join(dataDir, 'bot.log')

function log(...parts) {
  const line = `${new Date().toISOString()} ${redact(parts.join(' '))}`
  console.log(line)
  try {
    // a log that grows forever fills the disk of a server nobody watches
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > 5 * 1024 * 1024) fs.renameSync(logFile, logFile + '.1')
    fs.appendFileSync(logFile, line + '\n')
  } catch {}
}

const lib = loadBotLib()
const store = openStore(dataDir)
const tg = createTelegram(env.TELEGRAM_BOT_TOKEN, redact, log)

// a problem the developer must hear about: into the admin chat when there is one
async function alarm(text) {
  log('ВНИМАНИЕ:', text)
  if (env.ADMIN_CHAT_ID) await tg.send({ method: 'sendMessage', payload: lib.msg(env.ADMIN_CHAT_ID, '⚠️ Бот «Ключ»: ' + lib.esc(text)) })
}

const knowledge = createKnowledge({ env, repoRoot, store, log, alarm })
const deadKeys = store.getKv('deadKeys') || {}
const llm = async (body, budgetMs) => {
  const r = await lib.callLlm(fetchHelpers, env, { deadKeys }, body, budgetMs)
  store.putKv('deadKeys', deadKeys)
  return r
}

const turn = createTurn({ env, lib, store, getKnowledge: knowledge.get, llm, send: tg.send, log })

// ---- one line per chat: two quick messages from one person are answered in the
// order they were sent (in n8n they ran side by side and could swap places)
const lanes = new Map()
function inLane(key, job) {
  const prev = lanes.get(key) || Promise.resolve()
  const next = prev.then(job, job)
  lanes.set(key, next)
  next.finally(() => { if (lanes.get(key) === next) lanes.delete(key) })
  return next
}

const chatOf = (u) => String(u.message?.chat?.id ?? u.callback_query?.message?.chat?.id ?? u.update_id)
const seenUpdates = new Set()

async function handleUpdate(u) {
  // Telegram can deliver the same update twice after a restart
  if (seenUpdates.has(u.update_id)) return
  seenUpdates.add(u.update_id)
  if (seenUpdates.size > 500) seenUpdates.delete(seenUpdates.values().next().value)
  try {
    await inLane(chatOf(u), () => turn.handle(u))
  } catch (e) {
    log('ход не удался:', e.stack || e.message)
    await alarm('ход не удался: ' + String(e.message).slice(0, 200))
  }
}

// ---- health
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, knowledge: knowledge.info(), lanes: lanes.size }))
    return
  }
  res.writeHead(404)
  res.end()
})
server.on('error', (e) => {
  // a second copy of the bot would also fight the first for Telegram's updates
  log(e.code === 'EADDRINUSE' ? `порт ${env.BOT_PORT || 8787} занят: бот уже запущен в другом окне. Остановите его или смените BOT_PORT.` : 'ошибка сервера: ' + e.message)
  process.exit(1)
})
server.listen(Number(env.BOT_PORT || 8787), env.BOT_HOST || '127.0.0.1')

// ---- polling
let stopping = false
async function poll() {
  const me = await tg.call('getMe')
  if (!me.ok) throw new Error('Telegram: ' + me.description)
  // polling and a webhook cannot coexist: drop one left over from n8n
  await tg.call('deleteWebhook', { drop_pending_updates: false })
  log(`бот запущен: @${me.result.username} · знание ${knowledge.get().builtAt} · показов ${knowledge.get().afisha.length}`)

  const saved = store.getKv('offset')
  let offset = typeof saved === 'number' ? saved : 0
  while (!stopping) {
    let r
    try {
      r = await tg.call('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] }, 40000)
    } catch (e) {
      log('сеть:', redact(e.cause?.code ?? e.message))
      await new Promise((res) => setTimeout(res, 3000))
      continue
    }
    if (!r.ok) {
      if (r.error_code === 409) log('Telegram: бота уже читает другой процесс (мост n8n или второй запуск). Остановите его.')
      else log('Telegram:', r.description)
      await new Promise((res) => setTimeout(res, 5000))
      continue
    }
    // the batch is finished before the offset moves: a crash in the middle
    // makes Telegram deliver it again instead of losing what people wrote
    await Promise.all(r.result.map(handleUpdate))
    if (r.result.length) {
      offset = r.result[r.result.length - 1].update_id + 1
      store.putKv('offset', offset)
    }
  }
}

function stop() {
  if (stopping) return
  stopping = true
  log('останавливаюсь')
  server.close()
  // give the turns in flight a few seconds to write their state
  setTimeout(() => { try { store.close() } catch {} ; process.exit(0) }, 4000).unref()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
process.on('unhandledRejection', (e) => log('необработанная ошибка:', e && e.stack ? e.stack : e))

poll().catch((e) => { log('остановка из-за ошибки:', e.message); process.exit(1) })
