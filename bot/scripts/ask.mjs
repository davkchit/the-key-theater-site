// Asks the bot single questions, each as a fresh chat, and prints the replies.
// The seed of the 50–100 question regression run.
//
//   node bot/scripts/ask.mjs "привет" "для мелких что есть" "сколько стоит?"
//   node bot/scripts/ask.mjs --lite ...
//
// --topics=courses,contacts sends only those knowledge blocks instead of the
// whole file, to see what the answer loses when the context is narrowed.

import { buildKnowledge } from '../core/knowledge.mjs'
import { loadEnv, redactor, repoRoot } from './env.mjs'
import { loadLib, callYandex } from './simulate.mjs'

const args = process.argv.slice(2)
const model = args.includes('--lite') ? 'yandexgpt-lite' : 'yandexgpt'
const topicArg = args.find((a) => a.startsWith('--topics='))
const topics = topicArg ? topicArg.slice(9).split(',').map((t) => t.trim()).filter(Boolean) : null
const questions = args.filter((a) => !a.startsWith('--'))

const env = loadEnv()
const redact = redactor(env)
const lib = loadLib()
const knowledge = buildKnowledge(repoRoot)
const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

let tokens = 0
for (const [i, q] of questions.entries()) {
  const nowMs = Date.now() + i
  const ev = lib.normalizeUpdate({ message: { message_id: 1, chat: { id: 9000 + i, type: 'private' }, from: { id: 9000 + i }, text: q } })
  const res = lib.decide(ev, null, null, knowledge, { nowMs, topics })
  console.log(`\n👤 ${q}`)
  for (const m of res.out) console.log('🤖 ' + plain(m.text).replace(/\n/g, '\n   '))
  if (!res.model) { console.log('   · без модели'); continue }
  const promptChars = res.model.messages.map((m) => m.text.length).reduce((a, b) => a + b, 0)
  try {
    const r = await callYandex(env, model, res.model.messages)
    tokens += r.tokens
    const fin = lib.afterModel(res, r.text, nowMs, knowledge)
    for (const m of fin.out) console.log('🤖 ' + plain(m.text).replace(/\n/g, '\n   '))
    console.log(`   · модель, ${r.tokens} токенов, промт ${promptChars} симв.`)
  } catch (e) {
    console.log('   ✗ ' + redact(e.message))
  }
}
console.log(`\nвсего токенов: ${tokens}`)
