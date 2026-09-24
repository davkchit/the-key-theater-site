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
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEADS_EMAIL_TO, DEV_EMAIL_TO   (see mail.mjs)
//   ALLOWED_ORIGINS   sites allowed to post leads from a browser, comma-separated
//   TRUST_PROXY=1     behind nginx/caddy: take the visitor's address from X-Forwarded-For
//   BOT_POLL=0        do not read Telegram (HTTP only: tests, a second copy)
//   GITHUB_OAUTH_ID, GITHUB_OAUTH_SECRET   admin login for Decap (see oauth.mjs)

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { loadEnv, redactor, repoRoot } from '../scripts/env.mjs'
import { loadBotLib, fetchHelpers } from './lib.mjs'
import { openStore } from './store.mjs'
import { createTelegram } from './telegram.mjs'
import { createKnowledge } from './knowledge.mjs'
import { createTurn } from './turn.mjs'
import { createMailer, devLetter } from './mail.mjs'
import { createSiteApi } from './site.mjs'
import { leadsCsv } from './csv.mjs'
import { createOauth } from './oauth.mjs'

const env = { ...loadEnv(), ...Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(TELEGRAM|ADMIN|LLM|YANDEX|SITE_URL|BOT_|KNOWLEDGE|SMTP|LEADS|MAIL_|DEV_EMAIL|ALLOWED_ORIGINS|TRUST_PROXY|GITHUB_OAUTH)/.test(k))) }
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
  if (env.DEV_EMAIL_TO) { store.commit({ chats: [], leads: [], statuses: [], unanswered: [], mail: [{ at: new Date().toISOString(), ...devLetter(text) }] }); mailer.flush() }
  if (env.ADMIN_CHAT_ID) await tg.send({ method: 'sendMessage', payload: lib.msg(env.ADMIN_CHAT_ID, '⚠️ Бот «Ключ»: ' + lib.esc(text)) })
}

const knowledge = createKnowledge({ env, repoRoot, store, log, alarm })
const deadKeys = store.getKv('deadKeys') || {}
const llm = async (body, budgetMs) => {
  const r = await lib.callLlm(fetchHelpers, env, { deadKeys }, body, budgetMs)
  store.putKv('deadKeys', deadKeys)
  return r
}

// a turn only queues its letters (outbox); they go out after the turn, see handleUpdate
const mailer = createMailer({ env, store, log })
const turn = createTurn({ env, lib, store, getKnowledge: knowledge.get, llm, send: tg.send, log })
const site = createSiteApi({ env, lib, store, getKnowledge: knowledge.get, send: tg.send, log })

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
    mailer.flush()
  } catch (e) {
    log('ход не удался:', e.stack || e.message)
    await alarm('ход не удался: ' + String(e.message).slice(0, 200))
  }
}

// ---- http: health, leads from the site, the cat's events
const origins = new Set(
  String(env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173')
    .split(',').map((o) => o.trim()).filter(Boolean),
)

// A form on the site itself posts to the same address through the proxy;
// browsers still send Origin with a POST, so that case is recognised by host
// instead of having to be listed.
function allowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return false
  if (origins.has(origin)) return true
  try { return new URL(origin).host === (req.headers['x-forwarded-host'] || req.headers.host) } catch { return false }
}

function reply(req, res, status, body) {
  const origin = req.headers.origin
  const headers = { 'Content-Type': 'application/json; charset=utf-8' }
  if (origin && allowedOrigin(req)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' })
  res.writeHead(status, headers)
  res.end(body == null ? '' : JSON.stringify(body))
}

function readJson(req, limit = 16 * 1024) {
  return new Promise((resolve) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) { resolve(undefined); req.destroy() } else chunks.push(c)
    })
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { resolve(null) } })
    req.on('error', () => resolve(null))
  })
}

const oauth = createOauth({ env, log })

const ipOf = (req) => (env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?'

const server = http.createServer(async (req, res) => {
  const url = (req.url || '').split('?')[0]
  try {
    if (url === '/health') return reply(req, res, 200, { ok: true, knowledge: knowledge.info(), lanes: lanes.size, mail: mailer.enabled })
    if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
      const origin = req.headers.origin
      if (!allowedOrigin(req)) { res.writeHead(403); return res.end() }
      res.writeHead(204, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', Vary: 'Origin' })
      return res.end()
    }
    if (req.method === 'POST' && (url === '/api/lead' || url === '/api/event')) {
      // a browser from a foreign site is refused; no Origin (a server, curl) is allowed
      if (req.headers.origin && !allowedOrigin(req)) return reply(req, res, 403, { ok: false, error: 'чужой сайт' })
      const body = await readJson(req)
      if (body === undefined) return reply(req, res, 413, { ok: false, error: 'слишком большая заявка' })
      const r = url === '/api/lead' ? await site.lead(body, ipOf(req)) : site.event(body, ipOf(req))
      if (url === '/api/lead' && r.status === 200) mailer.flush()
      return reply(req, res, r.status, r.body)
    }
    if (url.startsWith('/api/oauth/')) return oauth.handle(req, res, url)
    reply(req, res, 404, { ok: false })
  } catch (e) {
    log('ошибка запроса', url, e.stack || e.message)
    reply(req, res, 500, { ok: false, error: 'ошибка на сервере, позвоните нам' })
  }
})
server.on('error', (e) => {
  // a second copy of the bot would also fight the first for Telegram's updates
  log(e.code === 'EADDRINUSE' ? `порт ${env.BOT_PORT || 8787} занят: бот уже запущен в другом окне. Остановите его или смените BOT_PORT.` : 'ошибка сервера: ' + e.message)
  process.exit(1)
})
server.listen(Number(env.BOT_PORT || 8787), env.BOT_HOST || '127.0.0.1')

// ---- once a week the whole week's leads go to the mailbox as a file for Excel
function weekKey(nowMs) {
  const d = new Date(nowMs + 3 * 3600e3) // Moscow
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)))
  return { key: monday.toISOString().slice(0, 10), isMondayMorning: d.getUTCDay() === 1 && d.getUTCHours() >= 9 }
}
async function weeklyReport() {
  if (!mailer.enabled || env.LEADS_WEEKLY_CSV === '0') return
  const w = weekKey(Date.now())
  if (!w.isMondayMorning || store.getKv('weeklySent') === w.key) return
  const from = new Date(Date.parse(w.key + 'T00:00:00+03:00') - 7 * 86400e3).toISOString()
  const csv = leadsCsv(store.db, from)
  try {
    await mailer.sendNow({ to: 'leads', subject: 'Заявки за неделю: ' + csv.count, text: 'Заявки за прошлую неделю во вложении. Файл открывается в Excel.', attachments: [{ filename: 'заявки-' + w.key + '.csv', content: csv.text, contentType: 'text/csv; charset=utf-8' }] })
    store.putKv('weeklySent', w.key)
    log('недельная выгрузка отправлена:', csv.count, 'заявок')
  } catch (e) {
    log('недельная выгрузка не ушла, повторю через час:', e.message)
  }
}
setInterval(weeklyReport, 3600e3).unref()

// ---- polling
let stopping = false
async function poll() {
  const me = await tg.call('getMe')
  if (!me.ok) throw new Error('Telegram: ' + me.description)
  // polling and a webhook cannot coexist: drop one left over from n8n
  await tg.call('deleteWebhook', { drop_pending_updates: false })
  mailer.start()
  weeklyReport()
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

if (env.BOT_POLL === '0') {
  mailer.start()
  log(`сервис запущен без Telegram (BOT_POLL=0): только сайт и почта · знание ${knowledge.get().builtAt}`)
} else {
  poll().catch((e) => { log('остановка из-за ошибки:', e.message); process.exit(1) })
}
