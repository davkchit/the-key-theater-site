// Puts the sessions from each show's Bileton widget into the afisha. A show
// takes part when its «Ссылка на билеты» in the admin is a widget link
// (https://bileton.ru/widget/teatr_kluch_Simon). Run hourly by
// kluch-bileton.timer through bileton-sync.sh, which commits the result like
// an admin edit. Prints one line per change (for the commit message) and
// writes a status file the bot reads to warn about problems by email.
//
//   node deploy/cms/sync-bileton.mjs [status.json]
import fs from 'node:fs'
import { fetchWidget, isWidgetUrl, parseWidget, syncShow } from '../../bot/core/bileton.mjs'

const STATUS = process.argv[2] || ''
const AFISHA = 'src/content/afisha.json'
const SHOWS = 'src/content/shows.json'

// today in Moscow: the theatre's day, wherever the server clock is
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

const shows = JSON.parse(fs.readFileSync(SHOWS, 'utf8')).shows || []
const afisha = JSON.parse(fs.readFileSync(AFISHA, 'utf8'))
const before = JSON.stringify(afisha.items)

const errors = []
const mismatches = []
const changes = []
let sessions = 0
let checked = 0
for (const show of shows) {
  if (!show.title || !isWidgetUrl(show.ticketUrl)) continue
  checked++
  try {
    const list = parseWidget(await fetchWidget(show.ticketUrl.trim()), today)
    sessions += list.length
    const r = syncShow(afisha.items, show.title, list, today)
    afisha.items = r.items
    changes.push(...r.changes)
    mismatches.push(...r.mismatches)
  } catch (e) {
    // one broken widget leaves that show's dates as they were
    errors.push(`«${show.title}»: ${e.message}`)
  }
}

if (JSON.stringify(afisha.items) !== before) {
  fs.writeFileSync(AFISHA, JSON.stringify(afisha, null, 2) + '\n')
  // a pure link-format update has no change line of its own
  console.log(changes.length ? changes.join('\n') : 'ссылки на покупку обновлены')
}

if (STATUS) {
  fs.writeFileSync(
    STATUS,
    JSON.stringify({ checkedAt: new Date().toISOString(), today, shows: checked, sessions, errors, mismatches, changes }, null, 2) + '\n',
  )
}
