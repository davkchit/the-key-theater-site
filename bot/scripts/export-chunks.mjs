// Exports the bot's knowledge as ready-made chunks for Yandex Vector Store.
//
//   node bot/scripts/export-chunks.mjs
//
// Vector Store can split files itself, but its splitter does not know where a
// thought ends -- it can cut a show in half between the genre and the synopsis.
// Here every chunk is a whole thing: one show, one course, one section of the
// handbook, one month of the schedule. That is what the "готовые чанки в JSONL"
// path in the Yandex docs is for.
//
// Each line carries metadata, so a search can be narrowed the same way the bot
// narrows it today: by topic.

import fs from 'node:fs'
import path from 'node:path'
import { buildKnowledge } from '../core/knowledge.mjs'
import { repoRoot } from './env.mjs'

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
// the genitive above belongs inside a date ('17 октября'); a heading needs the plain form
const MONTHS_NOM = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
const k = buildKnowledge(repoRoot)
const chunks = []

const add = (topic, title, text, extra = {}) => {
  const body = String(text).trim()
  if (body) chunks.push({ text: title + '\n' + body, metadata: { topic, title, source: 'Молодёжный театр «Ключ»', ...extra } })
}

// --- handbook: one chunk per labelled section, exactly as the bot routes them
for (const s of k.faq) add(s.id, s.title, s.body, s.always ? { kind: 'ограничение' } : { kind: 'справка' })

// --- shows: everything about one show stays together
for (const s of k.shows) {
  const lines = [
    s.age && 'Возрастная маркировка: ' + s.age,
    s.genre && 'Жанр: ' + s.genre,
    s.based && 'Основа: ' + s.based,
    s.dir && 'Режиссёр: ' + s.dir,
    s.dur && 'Длительность: ' + s.dur,
    s.synopsis && 'Сюжет: ' + s.synopsis,
    s.ticketUrl && 'Страница билетов: ' + s.ticketUrl,
  ].filter(Boolean)
  add('shows', 'Спектакль «' + s.title + '»', lines.join('\n'), { kind: 'спектакль', show: s.title })
}

// --- courses: one chunk per group
for (const c of k.courses) {
  add('courses', 'Курс «' + c.name + '» (' + c.ageRange + ')',
    [c.desc, c.price && 'Стоимость: ' + c.price, 'Набор в группы продолжается.'].filter(Boolean).join('\n'),
    { kind: 'курс', course: c.name, ageRange: c.ageRange })
}

// --- schedule: grouped by month, because "что в октябре" is how people ask
const byMonth = {}
for (const a of k.afisha) {
  const d = new Date(a.date + 'T12:00:00Z')
  const key = a.date.slice(0, 7)
  byMonth[key] = byMonth[key] || { name: MONTHS_NOM[d.getUTCMonth()] + ' ' + d.getUTCFullYear(), rows: [] }
  byMonth[key].rows.push('- ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ', ' + a.time + ' — «' + a.title + '»' + (a.age ? ', ' + a.age : ''))
}
for (const [key, m] of Object.entries(byMonth).sort()) {
  add('afisha', 'Афиша: ' + m.name, m.rows.join('\n'), { kind: 'афиша', month: key })
}

const outDir = path.join(repoRoot, 'bot/export')
fs.mkdirSync(outDir, { recursive: true })
const out = path.join(outDir, 'knowledge-chunks.jsonl')
fs.writeFileSync(out, chunks.map((c) => JSON.stringify(c)).join('\n') + '\n')

const sizes = chunks.map((c) => c.text.length)
console.log(`bot/export/knowledge-chunks.jsonl — ${chunks.length} фрагментов`)
console.log(`  самый длинный: ${Math.max(...sizes)} символов (предел Vector Store — 8000)`)
console.log(`  средний:       ${Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length)} символов`)
console.log('\nпо темам:')
const byTopic = {}
for (const c of chunks) byTopic[c.metadata.topic] = (byTopic[c.metadata.topic] || 0) + 1
for (const [t, n] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) console.log(`  ${t.padEnd(10)} ${n}`)
