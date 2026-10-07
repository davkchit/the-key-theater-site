// Reading a show's Bileton widget (https://bileton.ru/widget/teatr_kluch_Simon).
// Bileton has no API; its support agreed to the widget page being read. The
// page carries its sessions as data — `window.WIDGET_DATA.EVENTS = [...]` —
// so no browser is needed: id, buying link, age, "18 Октября, Вс 18:00".
//
// Used by deploy/cms/sync-bileton.mjs (puts the sessions into the afisha) and
// by the bot server (checks the sync is alive). Plain functions, no I/O here
// except fetchWidget.

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export const isWidgetUrl = (url) => /^https:\/\/bileton\.ru\/widget\/[\w-]+\/?$/i.test(String(url || '').trim())

export async function fetchWidget(url, timeoutMs = 20000) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (teatr-kluch site sync)' }, signal: AbortSignal.timeout(timeoutMs) })
  if (!r.ok) throw new Error(`Билетон ответил ${r.status} на ${url}`)
  return r.text()
}

/** "YYYY-MM-DD" of a date without a year: the nearest one not in the past. */
function withYear(day, month, todayIso) {
  const y = Number(todayIso.slice(0, 4))
  const iso = (yy) => `${yy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  // a session a few days back can still be on the widget; more than a month
  // back means the date belongs to next year
  const thisYear = iso(y)
  const monthAgo = new Date(Date.parse(todayIso) - 31 * 86400000).toISOString().slice(0, 10)
  return thisYear >= monthAgo ? thisYear : iso(y + 1)
}

/**
 * The widget's sessions. Throws when the page no longer looks like a widget,
 * so a changed Bileton page raises an alarm instead of emptying the afisha.
 */
export function parseWidget(html, todayIso) {
  const m = String(html).match(/window\.WIDGET_DATA\.EVENTS\s*=\s*(\[[\s\S]*?\]);\s*(?:\n|<\/script>|window\.)/)
  if (!m) throw new Error('в виджете нет списка сеансов (WIDGET_DATA.EVENTS) — Билетон поменял страницу?')
  let list
  try {
    list = JSON.parse(m[1])
  } catch (e) {
    throw new Error('список сеансов в виджете не читается: ' + e.message)
  }
  if (!Array.isArray(list)) throw new Error('список сеансов в виджете не список')
  return list.map((e) => {
    const d = String(e.full_date || '').match(/(\d{1,2})\s+([А-ЯЁа-яё]+)[^\d]*?(\d{1,2}):(\d{2})/)
    const month = d ? MONTHS.indexOf(d[2].toLowerCase()) + 1 : 0
    if (!d || !month) throw new Error(`не понял дату сеанса ${e.id}: «${e.full_date}»`)
    return {
      id: Number(e.id),
      date: withYear(Number(d[1]), month, todayIso),
      time: `${d[3].padStart(2, '0')}:${d[4]}`,
      age: Number.isFinite(Number(e.age_limit)) && e.age_limit !== null && e.age_limit !== '' ? `${Number(e.age_limit)}+` : '',
      link: String(e.link || ''),
      price: String(e.price_range || ''),
      name: String(e.name || ''),
    }
  })
}

/** the Bileton session number a buying link points at, if any */
export const sessionIdOf = (url) => {
  const m = String(url || '').match(/id_event=(\d+)|\/events\/[\w-]*?-(\d{5,})\/?$/)
  return m ? Number(m[1] || m[2]) : null
}

const short = (iso) => `${iso.slice(8)}.${iso.slice(5, 7)}`
const sameTitle = (a, title) => String(a.title || '').trim().toLowerCase() === String(title).trim().toLowerCase()

/**
 * Makes one show's upcoming dates exactly its widget's: Bileton is the one
 * source of the afisha. Adds what the site lacks, fixes time, link and age,
 * and removes upcoming dates Bileton no longer sells (cancelled, moved).
 * Past dates stay — the review card looks at them, and they leave the list
 * by themselves after three months (prune-afisha.mjs).
 */
export function syncShow(items, title, sessions, todayIso) {
  const same = (a) => sameTitle(a, title)
  const out = items.map((i) => ({ ...i }))
  const changes = []
  const removed = []
  const claimed = new Set()
  for (const s of sessions) {
    if (s.date < todayIso) continue
    // the same session on the site: by its number, then by day and hour,
    // then by day (a show can play twice a day, at 12:00 and at 18:00)
    const free = (i) => same(i) && !claimed.has(i)
    let item =
      out.find((i) => free(i) && sessionIdOf(i.ticketUrl) === s.id) ||
      out.find((i) => free(i) && i.date === s.date && i.time === s.time) ||
      out.find((i) => free(i) && i.date === s.date)
    if (item) claimed.add(item)
    if (!item) {
      const added = { date: s.date, title, time: s.time, ...(s.age ? { age: s.age } : {}), band: 'paper', ticketUrl: s.link }
      out.push(added)
      claimed.add(added)
      changes.push(`добавлен «${title}» ${short(s.date)} ${s.time}`)
      continue
    }
    if (item.date !== s.date) {
      changes.push(`«${title}» перенесён с ${short(item.date)} на ${short(s.date)}`)
      item.date = s.date
    }
    if (item.time !== s.time) {
      changes.push(`«${title}» ${short(s.date)}: время ${item.time || '—'} → ${s.time}`)
      item.time = s.time
    }
    if (s.link && item.ticketUrl !== s.link) {
      if (sessionIdOf(item.ticketUrl) !== s.id) changes.push(`«${title}» ${short(s.date)}: ссылка на покупку`)
      item.ticketUrl = s.link
    }
    if (s.age && !item.age) {
      item.age = s.age
      changes.push(`«${title}»: возраст ${s.age}`)
    }
  }
  const kept = out.filter((i) => {
    if (!same(i) || i.date < todayIso || claimed.has(i)) return true
    removed.push(`«${title}» ${short(i.date)} ${i.time || ''}`.trim())
    return false
  })
  kept.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  return { items: kept, changes, removed }
}

/**
 * Upcoming dates of anything without a readable widget — shows not on
 * Bileton, events typed in by hand — leave the afisha: Bileton is its one
 * source. `protect` are titles whose widget failed to load this time; their
 * dates stay until it loads again, so a Bileton hiccup never empties them.
 */
export function dropNotOnBileton(items, onBileton, protect, todayIso) {
  const removed = []
  const keep = (i) =>
    i.date < todayIso || onBileton.some((t) => sameTitle(i, t)) || protect.some((t) => sameTitle(i, t))
  const out = items.filter((i) => {
    if (keep(i)) return true
    removed.push(`«${i.title}» ${short(i.date)} ${i.time || ''}`.trim())
    return false
  })
  return { items: out, removed }
}
