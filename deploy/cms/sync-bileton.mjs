// Makes the afisha's upcoming dates exactly what Bileton sells: Bileton is the
// one source. It reads the theatre's own widget («Ссылка на все билеты» in the
// site settings, https://bileton.ru/widget/teatr_kluch), which lists every
// session of every show, so a show the theatre adds on Bileton reaches the site
// by itself:
//   - a session of a show the site knows goes into the afisha under its title;
//   - a session Bileton calls «Спектакль «…»» that the site does not know yet
//     also starts that show in «Репертуар» (title and age; description and
//     photo are then the theatre's to add in the admin);
//   - anything else (a carnival night, a quest) goes into the afisha only.
// When the theatre's widget cannot be read, the shows' own widgets
// (https://bileton.ru/widget/teatr_kluch_Simon) are read instead.
//
// Upcoming dates Bileton does not sell leave the afisha. Run hourly by
// kluch-bileton.timer through bileton-sync.sh, which commits the result like an
// admin edit. Prints one line per change (for the commit message) and writes a
// status file the bot reads to tell people by email what changed or failed.
//
//   node deploy/cms/sync-bileton.mjs [status.json]
import fs from 'node:fs'
import {
  biletonTitle,
  dropNotOnBileton,
  fetchWidget,
  isWidgetUrl,
  normTitle,
  parseWidget,
  syncShow,
} from '../../bot/core/bileton.mjs'

const STATUS = process.argv[2] || ''
const AFISHA = 'src/content/afisha.json'
const SHOWS = 'src/content/shows.json'
const SETTINGS = 'src/content/settings.json'
const DIRECTIONS = 'src/content/directions.json'

const readJson = (f, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch {
    return fallback
  }
}

// today in Moscow: the theatre's day, wherever the server clock is
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

const showsFile = readJson(SHOWS, { shows: [] })
const shows = showsFile.shows || []
const afisha = readJson(AFISHA, { items: [] })
const settings = readJson(SETTINGS, {})
const directions = readJson(DIRECTIONS, {}).items || []
const before = JSON.stringify(afisha.items)

const errors = []
const changes = []
const removed = []
const synced = []
const failed = []
const newShows = []
let sessions = 0

const sync = (title, list) => {
  sessions += list.length
  const r = syncShow(afisha.items, title, list, today)
  afisha.items = r.items
  changes.push(...r.changes)
  removed.push(...r.removed)
  synced.push(title)
}

// 1. the theatre's widget: everything at once
let all = null
const orgUrl = String(settings.ticketsWidgetUrl || '').trim()
if (isWidgetUrl(orgUrl)) {
  try {
    all = parseWidget(await fetchWidget(orgUrl), today)
  } catch (e) {
    errors.push(`общий виджет театра: ${e.message}`)
  }
}

if (all) {
  const byTitle = new Map()
  for (const s of all) {
    const { title, isShow } = biletonTitle(s.name)
    const show = shows.find((x) => normTitle(x.title) === normTitle(title))
    const dir = directions.find((d) => normTitle(d.title) === normTitle(title))
    const name = show?.title || dir?.title || title
    if (!show && !dir && isShow && !newShows.includes(name)) {
      // a new show on Bileton: its page starts with what Bileton knows
      shows.push({ title: name, ...(s.age ? { age: s.age } : {}), based: '', bg: 'ink' })
      newShows.push(name)
      changes.push(`новый спектакль «${name}» — добавьте описание и фото в админке`)
    }
    if (!byTitle.has(name)) byTitle.set(name, [])
    byTitle.get(name).push(s)
  }
  for (const [title, list] of byTitle) sync(title, list)
} else {
  // 2. the shows' own widgets, one by one
  for (const show of shows) {
    if (!show.title || !isWidgetUrl(show.ticketUrl)) continue
    try {
      sync(show.title, parseWidget(await fetchWidget(show.ticketUrl.trim()), today))
    } catch (e) {
      // a widget that did not load leaves that show's dates as they were
      errors.push(`«${show.title}»: ${e.message}`)
      failed.push(show.title)
    }
  }
}

// nothing read at all (Bileton down): touch nothing
if (synced.length) {
  const r = dropNotOnBileton(afisha.items, synced, failed, today)
  afisha.items = r.items
  removed.push(...r.removed)
}

if (newShows.length) fs.writeFileSync(SHOWS, JSON.stringify(showsFile, null, 2) + '\n')
if (JSON.stringify(afisha.items) !== before || newShows.length) {
  fs.writeFileSync(AFISHA, JSON.stringify(afisha, null, 2) + '\n')
  const lines = [...changes, ...removed.map((r) => `убран ${r} — нет на Билетоне`)]
  // a pure link-format update has no change line of its own
  console.log(lines.length ? lines.join('\n') : 'ссылки на покупку обновлены')
}

if (STATUS) {
  fs.writeFileSync(
    STATUS,
    JSON.stringify({ checkedAt: new Date().toISOString(), today, shows: synced.length, sessions, errors, changes, removed, newShows }, null, 2) + '\n',
  )
}
