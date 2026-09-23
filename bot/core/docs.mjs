// The theatre's own documents as the bot's source of truth -- a temporary mode.
//
// The theatre plans its season in Word: a day-by-day table ("План 2026-2027")
// that mixes public shows with rehearsals, class sessions, tours and the camp,
// plus two prose files about the theatre and its people. Until they decide
// whether someone will keep the site's CMS up to date, the bot reads these
// files directly. Put new versions into bot/docs/ under the same names and run
// `npm run knowledge`:
//
//   bot/docs/plan.docx    the season plan (table: date | weekday | lines)
//   bot/docs/about.docx   «о нас»: history, productions, tours
//   bot/docs/people.docx  «о наших людях»
//
// What the documents do not have (course prices, show synopses, the ticket
// link, the FAQ) still comes from the site and faq.md.
//
// Nothing here guesses silently. A line of the plan that is neither a show nor
// something known to skip is reported by `npm run knowledge`, so a new kind of
// entry is seen by a person before it reaches visitors.

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

export const DOCS_DIR = 'bot/docs'

export function docsPresent(repoRoot) {
  return fs.existsSync(path.join(repoRoot, DOCS_DIR, 'plan.docx'))
}

// ---------------------------------------------------------------- .docx reading

// A .docx is a zip; the text lives in word/document.xml. Reading the central
// directory by hand keeps the bot free of a zip dependency for one file.
function unzipEntry(buf, name) {
  let eocd = buf.length - 22
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--
  if (eocd < 0) throw new Error('не похоже на .docx (нет оглавления zip)')
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10)
    const csize = buf.readUInt32LE(p + 20)
    const nlen = buf.readUInt16LE(p + 28)
    const xlen = buf.readUInt16LE(p + 30)
    const clen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    if (buf.toString('utf8', p + 46, p + 46 + nlen) === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
      const data = buf.subarray(start, start + csize)
      return method === 0 ? data : zlib.inflateRawSync(data)
    }
    p += 46 + nlen + xlen + clen
  }
  throw new Error(`в .docx нет ${name}`)
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

function paragraphs(xml) {
  return (xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [])
    .map((p) => decode((p.replace(/<w:tab\/>/g, ' ').match(/<w:t[^>]*>[^<]*<\/w:t>/g) || []).map((t) => t.replace(/<[^>]+>/g, '')).join('')))
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function readDocx(file) {
  const xml = unzipEntry(fs.readFileSync(file), 'word/document.xml').toString('utf8')
  const rows = (xml.match(/<w:tr[ >][\s\S]*?<\/w:tr>/g) || []).map((tr) => paragraphs(tr))
  return { xml, rows, paras: paragraphs(xml) }
}

// ---------------------------------------------------------------- the plan

const WD_SHORT = { понедельник: 'пн', вторник: 'вт', среда: 'ср', четверг: 'чт', пятница: 'пт', суббота: 'сб', воскресенье: 'вс' }
const WD_ORDER = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

// obvious typos of the plan, fixed so the same show is not listed twice
const TYPOS = [[/Дморозовке/g, 'Дедморозовке'], [/(детские) елки/gi, '$1 ёлки']]

const SKIP = /рпт|репетиц|прогон|эпизод|постановка света|орг\.? вопрос|выходн|^закрыти|^-+$/i
const CLASS = /групп|подрост|дошкол|курс/i
const TIME_RANGE = /^(\d{1,2})[:.](\d{2})\s*[–-]\s*(\d{1,2})[:.](\d{2})\s*[–-]\s*/

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const human = (isoDate, withYear) => {
  const [y, m, d] = isoDate.split('-').map(Number)
  return d + ' ' + MONTHS_GEN[m - 1] + (withYear ? ' ' + y : '')
}
const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^а-яa-z]/g, '')
const sentenceCase = (s) => (s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s)

// The plan's spelling of a title, mapped onto the site's where it is plainly
// the same show ("Эмиль из Ленниберги", "Бесконичный апрель").
function canonicalTitle(raw, knownTitles) {
  const n = norm(raw)
  for (const t of knownTitles) {
    const k = norm(t)
    if (k === n || (n.length >= 6 && k.slice(0, 6) === n.slice(0, 6) && Math.abs(k.length - n.length) <= 3)) return t
  }
  return raw
}

function parseShowLine(line, knownTitles) {
  const m = line.match(/^(?:(\d{1,2})[:.](\d{2}))?\s*[–-]?\s*(.*)$/)
  const time = m[1] ? `${m[1].padStart(2, '0')}:${m[2]}` : ''
  let rest = m[3].trim()
  const notes = []
  if (/премьер/i.test(rest)) notes.push('премьера')
  if (/открыти\S* сезона/i.test(rest)) notes.push('открытие сезона')
  const quoted = rest.match(/«\s*([^»]+?)\s*»/)
  let title
  if (quoted) title = quoted[1]
  else title = rest.replace(/^(премьера\s+)?(спектакл[ья]\s+)?/i, '')
  for (const [re, fix] of TYPOS) title = title.replace(re, fix)
  title = title.replace(/\s*\/\s*/g, ' / ').replace(/\s+/g, ' ').trim()
  if (title.includes(' / ')) {
    title = title.split(' / ').map((t) => canonicalTitle(sentenceCase(t), knownTitles)).join(' / ')
    notes.push('в плане театра два названия на это время, какое именно, уточнит администратор')
  } else title = canonicalTitle(sentenceCase(title), knownTitles)
  return { time, title, note: notes.join('; ') }
}

export function parsePlan(file, knownTitles, nowMs = Date.now()) {
  const { rows, paras } = readDocx(file)
  // The table has no years. The plan starts in late summer; the first row's
  // year is the one whose late summer is nearest, and every step back in the
  // month number (December -> January) moves to the next year.
  const head = paras.join(' ').match(/(20\d\d)\s*[-–]\s*20\d\d/)
  let year = head ? Number(head[1]) : new Date(nowMs).getFullYear()
  let prevMonth = 0

  const afisha = []
  const classes = []
  const festival = []
  const camp = {}
  const tours = []
  const unknown = []

  for (const cells of rows) {
    const dm = (cells[0] || '').match(/^(\d{1,2})\.+(\d{1,2})$/)
    if (!dm) continue
    const day = Number(dm[1])
    const month = Number(dm[2])
    // only a real wrap (December -> January) moves the year: the plan has a few
    // rows out of order, and treating each as a new year sent spring to 2028
    if (prevMonth && prevMonth - month >= 6) year++
    prevMonth = month
    const date = iso(year, month, day)
    const wd = WD_SHORT[String(cells[1] || '').toLowerCase()] || ''

    for (const line of cells.slice(2)) {
      if (SKIP.test(line)) continue
      const tour = line.match(/^Гастрол\S*\s+в\s+(.+)$/i)
      if (tour) { tours.push({ date, place: tour[1].trim() }); continue }
      if (/фестивал/i.test(line) && /действующие лица/i.test(line)) { festival.push(date); continue }
      const shift = line.match(/лагер\S*[^0-9]*?(\d+)\s*смен/i)
      if (shift) { (camp[shift[1]] = camp[shift[1]] || []).push(date); continue }
      if (/лагер/i.test(line)) continue
      const tr = line.match(TIME_RANGE)
      if (tr) {
        // "18:30 – 21:00 – 18:30 – 21:00 – КУРС" happens: drop a repeated range
        let what = line.replace(TIME_RANGE, '')
        while (TIME_RANGE.test(what)) what = what.replace(TIME_RANGE, '')
        if (CLASS.test(what)) {
          const bare = what.replace(/\(.*?\)/g, '').replace(/закрытие/i, '').replace(/\s+/g, ' ').trim().toLowerCase()
          const group = bare.charAt(0).toUpperCase() + bare.slice(1)
          classes.push({ date, wd, from: `${tr[1].padStart(2, '0')}:${tr[2]}`, to: `${tr[3].padStart(2, '0')}:${tr[4]}`, group, last: /закрыт/i.test(what) })
        }
        // any other two-time range is a working session, not a show
        continue
      }
      if (CLASS.test(line)) continue
      const show = parseShowLine(line, knownTitles)
      if (!show.title || show.title.length < 3) { unknown.push(`${date}: ${line}`); continue }
      afisha.push({ date, ...show })
    }
  }

  // the plan repeats some rows (3.04 twice); a timeless line that duplicates a
  // timed one on the same day adds nothing
  const seen = new Set()
  const deduped = []
  for (const a of afisha) {
    const key = a.date + '|' + a.time + '|' + norm(a.title)
    if (seen.has(key)) continue
    // ...including "Карнавальная ночь" on a day already listing "Карнавальная
    // ночь / Чудеса в Дедморозовке" at 19:00
    if (!a.time && afisha.some((b) => b !== a && b.date === a.date && b.time && norm(b.title).includes(norm(a.title)))) continue
    seen.add(key)
    deduped.push(a)
  }
  deduped.sort((a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')))
  return { afisha: deduped, classes, festival, camp, tours, unknown }
}

// ---------------------------------------------------------------- summaries

function range(dates, withYear) {
  const s = [...dates].sort()
  const a = s[0]
  const b = s[s.length - 1]
  if (a === b) return human(a, withYear)
  const [ya, ma] = a.split('-')
  const [yb, mb] = b.split('-')
  if (ya === yb && ma === mb) return Number(a.slice(8)) + '–' + human(b, withYear)
  return human(a, withYear && ya !== yb) + ' – ' + human(b, withYear)
}

// Weekly pattern of each group from today on: the days and hours it meets most
// often, and the span of dates it runs. Built from the plan, not typed in, so a
// changed plan changes the answer.
function scheduleText(classes, todayIso) {
  const byGroup = new Map()
  for (const c of classes) {
    if (c.date < todayIso) continue
    if (!byGroup.has(c.group)) byGroup.set(c.group, [])
    byGroup.get(c.group).push(c)
  }
  const lines = []
  for (const [group, list] of byGroup) {
    const times = new Map()
    for (const c of list) times.set(c.from + '–' + c.to, (times.get(c.from + '–' + c.to) || 0) + 1)
    const time = [...times.entries()].sort((a, b) => b[1] - a[1])[0][0]
    // a day counts only if the group meets on it regularly: two one-off Friday
    // sessions of the adult course are not its schedule
    const perDay = {}
    for (const c of list) if (c.from + '–' + c.to === time && c.wd) perDay[c.wd] = (perDay[c.wd] || 0) + 1
    const top = Math.max(...Object.values(perDay))
    const days = Object.keys(perDay).filter((d) => perDay[d] >= top / 3).sort((a, b) => WD_ORDER.indexOf(a) - WD_ORDER.indexOf(b))
    lines.push(`- ${group}: ${days.join(', ')} ${time}, занятия в плане с ${human(list[0].date)} по ${human(list[list.length - 1].date, true)}`)
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------- about / people

function aboutSections(file) {
  const { paras } = readDocx(file)
  const quote = paras.find((p) => /Гуэрр/.test(p))
  const history = paras.filter((p) => /^20\d\d\s*(год)?\s*[–-]\s*[а-яё]/i.test(p))
  const productions = paras.filter((p) => /^20\d\d\s*[–-]?\s*[«"]/.test(p)).map((p) => p.replace(/\s*[–-]\s*/, ' ').replace(/"([^"]+)"/g, '«$1»').replace(/«([^»]+)$/, '«$1»'))
  const toursAt = paras.indexOf('Гастроли')
  const touring = toursAt >= 0 ? paras.slice(toursAt + 1).filter((p) => /^[А-ЯЁ][а-яё]+$/.test(p)) : []
  // The full list of 32 past productions is left out of the prompt: nobody
  // asks for it, and every character is paid on every message. Its size is
  // what the bot can say about it.
  return [
    {
      id: 'history',
      always: false,
      title: 'История театра (из документа театра «о нас»)',
      body: [
        quote ? 'Эпиграф театра: ' + quote.replace(/\s*\(это о нашем театре\)\s*/, '') : '',
        ...history.map((h) => '- ' + h),
        productions.length ? `- Всего постановок с 2003 года: ${productions.length}. Из прошлых, например, ${productions.slice(-6, -2).map((p) => p.replace(/^20\d\d\s*/, '')).join(', ')}.` : '',
        touring.length ? '- Гастроли за всё время: ' + touring.join(', ') + '.' : '',
      ].filter(Boolean).join('\n'),
    },
  ]
}

const ROLES = [
  [/художественный руководитель/i, 'художественный руководитель'],
  [/директор[^.]*фестивал/i, 'директор фестиваля «Действующие лица»'],
  [/технический директор/i, 'технический директор'],
  [/главный администратор/i, 'главный администратор'],
  [/режисс[её]р-педагог/i, 'режиссёр-педагог, работает с детьми'],
  [/преподавател/i, 'педагог студии'],
  [/смм|smm/i, 'SMM-менеджер'],
  [/акт[её]р|актрис/i, 'актёр'],
]

function peopleSection(file) {
  const { paras } = readDocx(file)
  // a person starts with a name line that is followed by their motto in quotes
  const people = []
  for (let i = 0; i < paras.length; i++) {
    const isName = /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/.test(paras[i]) && /^[«"]/.test(paras[i + 1] || '')
    if (isName) people.push({ name: paras[i], text: [] })
    else if (people.length) people[people.length - 1].text.push(paras[i])
  }
  const staff = []
  const cast = []
  for (const p of people) {
    const body = p.text.join(' ')
    const roles = ROLES.filter(([re]) => re.test(body)).map(([, r]) => r)
    const main = roles.filter((r) => r !== 'актёр')
    if (main.length) staff.push(`- ${p.name}: ${main.join(', ')}${roles.includes('актёр') ? ', также играет в спектаклях' : ''}`)
    else if (roles.includes('актёр')) cast.push(p.name)
  }
  return {
    id: 'people',
    always: false,
    title: 'Кто есть кто в театре (из документа «о наших людях»)',
    body: staff.join('\n') + (cast.length ? '\n- Актёры театра: ' + cast.join(', ') + '. Кто играет в каком спектакле, в документах не сказано.' : ''),
  }
}

// ---------------------------------------------------------------- assembly

export function knowledgeFromDocs(repoRoot, base, nowMs = Date.now()) {
  const dir = path.join(repoRoot, DOCS_DIR)
  const known = base.shows.map((s) => s.title)
  const plan = parsePlan(path.join(dir, 'plan.docx'), known, nowMs)
  const ageOf = (title) => (base.shows.find((s) => norm(s.title) === norm(title)) || {}).age
  const afisha = plan.afisha.map((a) => ({
    date: a.date,
    time: a.time,
    title: a.title,
    ...(ageOf(a.title) ? { age: ageOf(a.title) } : {}),
    ...(a.note ? { note: a.note } : {}),
  }))

  const today = new Date(nowMs).toISOString().slice(0, 10)
  const faq = base.faq.map((s) => ({ ...s }))
  const section = (id) => faq.find((s) => s.id === id)

  // the plan answers "когда занятия?", so that stops being a thing to refuse
  const limits = faq.find((s) => s.always)
  if (limits) {
    limits.body = limits.body.split('\n')
      .filter((l) => !/расписание занятий/i.test(l))
      .map((l) => l.replace(/даты и стоимость лагеря/i, 'стоимость лагеря').replace(/программа и сроки фестиваля/i, 'программа фестиваля'))
      .join('\n')
  }

  const sched = scheduleText(plan.classes, today)
  if (sched) {
    faq.push({
      id: 'schedule',
      always: false,
      title: 'Расписание занятий групп (из плана театра)',
      body: sched + '\n- Названия групп в плане («младшая», «1-ая подростковая»…) не совпадают с курсами на сайте. Какому возрасту какая группа, в плане не сказано: если спрашивают про группу для конкретного возраста, это уточнит администратор.',
    })
  }
  if (plan.festival.length && section('festival')) section('festival').body += `\n- Ближайший фестиваль по плану театра: ${range(plan.festival, true)}.`
  const shifts = Object.keys(plan.camp).sort()
  if (shifts.length && section('camp')) {
    section('camp').body += '\n- Смены по плану театра: ' + shifts.map((n) => `${n} смена ${range(plan.camp[n], false)}`).join(', ') + ' ' + plan.camp[shifts[shifts.length - 1]].sort().slice(-1)[0].slice(0, 4) + ' года.'
    // the plan itself files 5-9 July under both the 2nd and the 3rd shift; the
    // bot names the dates as written but must not present the overlap as fact
    const clash = []
    for (let i = 1; i < shifts.length; i++) {
      const prevEnd = [...plan.camp[shifts[i - 1]]].sort().slice(-1)[0]
      const start = [...plan.camp[shifts[i]]].sort()[0]
      if (start <= prevEnd) clash.push(`${shifts[i - 1]} и ${shifts[i]}`)
    }
    if (clash.length) section('camp').body += `\n- В плане смены ${clash.join(', ')} пересекаются по датам. Если спрашивают точные даты этих смен, скажи, что их уточнит администратор.`
  }
  if (plan.tours.length) {
    const places = [...new Set(plan.tours.map((t) => t.place))]
    faq.push({
      id: 'tours',
      always: false,
      title: 'Гастроли по плану театра',
      body: places.map((pl) => `- ${range(plan.tours.filter((t) => t.place === pl).map((t) => t.date), true)}: театр на гастролях (${pl}). В эти дни спектаклей в Челнах нет.`).join('\n'),
    })
  }

  const aboutFile = path.join(dir, 'about.docx')
  if (fs.existsSync(aboutFile)) {
    faq.push(...aboutSections(aboutFile))
    // the document's history replaces the short one in faq.md; keeping both
    // doubled the text and gave the model two versions of the same years
    const about = section('about')
    if (about) {
      about.body = about.body.split('\n')
        .filter((l) => !/^- (Родился|20\d\d:|С 20\d\d года|Главный администратор)/.test(l))
        .map((l) => (/^- За всё время/.test(l) ? '- Сейчас идут только спектакли из раздела «Спектакли в репертуаре», постановки прошлых лет не играются.' : l))
        .join('\n')
    }
  }
  const peopleFile = path.join(dir, 'people.docx')
  if (fs.existsSync(peopleFile)) faq.push(peopleSection(peopleFile))

  // Tours go into the afisha too: "а 10 октября есть спектакль?" is answered
  // from the afisha, and the model said "нет" without the reason.
  const tours = [...new Set(plan.tours.map((t) => t.place))].map((place) => {
    const ds = plan.tours.filter((t) => t.place === place).map((t) => t.date).sort()
    return { from: ds[0], to: ds[ds.length - 1], place }
  })

  return { knowledge: { ...base, afisha, faq, tours, source: 'docs' }, report: { shows: afisha.length, classes: plan.classes.length, unknown: plan.unknown } }
}
