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

/**
 * Brings one show's afisha dates in line with its widget. Adds sessions the
 * site lacks and fixes time, link and age; never removes anything — a date on
 * the site but not on sale may be a plan or a cancellation, and that is a
 * person's call. Returns the new items and what changed or looks wrong.
 */
export function syncShow(items, title, sessions, todayIso) {
  const same = (a) => String(a.title || '').trim().toLowerCase() === title.trim().toLowerCase()
  const out = items.map((i) => ({ ...i }))
  const changes = []
  const mismatches = []
  const short = (iso) => `${iso.slice(8)}.${iso.slice(5, 7)}`
  for (const s of sessions) {
    if (s.date < todayIso) continue
    // the same show that day: by session number first, then by date
    let item = out.find((i) => same(i) && sessionIdOf(i.ticketUrl) === s.id) || out.find((i) => same(i) && i.date === s.date)
    if (!item) {
      out.push({ date: s.date, title, time: s.time, ...(s.age ? { age: s.age } : {}), band: 'paper', ticketUrl: s.link })
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
  // on the site, not on Bileton: only within what Bileton already sells —
  // dates beyond its last session are the season plan, not a problem
  const last = sessions.map((s) => s.date).sort().pop()
  for (const i of out) {
    if (!same(i) || i.date < todayIso) continue
    if (sessions.some((s) => s.date === i.date)) continue
    const hadLink = sessionIdOf(i.ticketUrl) !== null
    if (hadLink || (last && i.date <= last)) {
      mismatches.push(`«${title}» ${short(i.date)} ${i.time || ''} — на сайте есть, на Билетоне нет${hadLink ? ' (был в продаже: отменён или распродан?)' : ''}`)
    }
  }
  out.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  return { items: out, changes, mismatches }
}
