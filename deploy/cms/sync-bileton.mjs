// Makes the afisha's upcoming dates exactly what Bileton sells: Bileton is the
// one source. A show takes part when its «Виджет Билетона» in the admin is a
// widget link (https://bileton.ru/widget/teatr_kluch_Simon); upcoming dates of
// anything else leave the afisha. Run hourly by kluch-bileton.timer through
// bileton-sync.sh, which commits the result like an admin edit. Prints one line
// per change (for the commit message) and writes a status file the bot reads
// to tell people by email what was removed or what failed.
//
//   node deploy/cms/sync-bileton.mjs [status.json]
import fs from 'node:fs'
import { dropNotOnBileton, fetchWidget, isWidgetUrl, parseWidget, syncShow } from '../../bot/core/bileton.mjs'

const STATUS = process.argv[2] || ''
const AFISHA = 'src/content/afisha.json'
const SHOWS = 'src/content/shows.json'

// today in Moscow: the theatre's day, wherever the server clock is
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

const shows = JSON.parse(fs.readFileSync(SHOWS, 'utf8')).shows || []
const afisha = JSON.parse(fs.readFileSync(AFISHA, 'utf8'))
const before = JSON.stringify(afisha.items)

const errors = []
const changes = []
const removed = []
const synced = []
const failed = []
let sessions = 0
for (const show of shows) {
  if (!show.title || !isWidgetUrl(show.ticketUrl)) continue
  try {
    const list = parseWidget(await fetchWidget(show.ticketUrl.trim()), today)
    sessions += list.length
    const r = syncShow(afisha.items, show.title, list, today)
    afisha.items = r.items
    changes.push(...r.changes)
    removed.push(...r.removed)
    synced.push(show.title)
  } catch (e) {
    // a widget that did not load leaves that show's dates as they were
    errors.push(`«${show.title}»: ${e.message}`)
    failed.push(show.title)
  }
}

// nothing read at all (Bileton down, no widgets yet): touch nothing
if (synced.length) {
  const r = dropNotOnBileton(afisha.items, synced, failed, today)
  afisha.items = r.items
  removed.push(...r.removed)
}

if (JSON.stringify(afisha.items) !== before) {
  fs.writeFileSync(AFISHA, JSON.stringify(afisha, null, 2) + '\n')
  const lines = [...changes, ...removed.map((r) => `убран ${r} — нет на Билетоне`)]
  // a pure link-format update has no change line of its own
  console.log(lines.length ? lines.join('\n') : 'ссылки на покупку обновлены')
}

if (STATUS) {
  fs.writeFileSync(
    STATUS,
    JSON.stringify({ checkedAt: new Date().toISOString(), today, shows: synced.length, sessions, errors, changes, removed }, null, 2) + '\n',
  )
}
