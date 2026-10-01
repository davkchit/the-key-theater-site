// Builds the bot's knowledge snapshot from the site's own content files, so the
// bot never keeps a second copy of the afisha or the course list that could
// drift away from what the site shows.
//
// Course prices were held back for weeks because nobody had confirmed them.
// Released by the developer on 2026-09-17; the theatre itself still owes a
// written yes, since a wrong published price is worse than a coy bot.

import fs from 'node:fs'
import path from 'node:path'
import { docsPresent, knowledgeFromDocs } from './docs.mjs'

export function buildKnowledge(repoRoot, nowMs = Date.now()) {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(repoRoot, p), 'utf8'))

  const afisha = read('src/content/afisha.json').items.map((a) => ({
    date: a.date,
    time: a.time,
    title: a.title,
    ...(a.age ? { age: a.age } : {}),
  }))

  const shows = read('src/content/shows.json').shows.map((s) => ({
    title: s.title,
    ...(s.age ? { age: s.age } : {}),
    ...(s.genre ? { genre: s.genre } : {}),
    ...(s.based ? { based: s.based } : {}),
    ...(s.dir ? { dir: s.dir } : {}),
    ...(s.dur ? { dur: s.dur } : {}),
    ...(s.synopsis ? { synopsis: s.synopsis } : {}),
    ...(s.ticketUrl ? { ticketUrl: s.ticketUrl } : {}),
    // «В ролях» from the admin: names, and the part when the theatre gave it
    ...(Array.isArray(s.cast) && s.cast.some((c) => c && c.name)
      ? { cast: s.cast.filter((c) => c && c.name).map((c) => c.name + (c.role ? ' (' + c.role + ')' : '')) }
      : {}),
  }))

  const courses = read('src/content/courses.json').items.map((c) => ({
    name: c.name,
    ageRange: c.ageRange,
    desc: c.desc,
    ...(c.price ? { price: c.price } : {}),
    ...(c.start ? { start: c.start } : {}),
  }))

  const festFile = path.join(repoRoot, 'src/content/festival.json')
  const faq = faqFromContent(read('src/content/bot.json'), fs.existsSync(festFile) ? read('src/content/festival.json') : null)

  // Everything the theatre lets people sign up for besides the courses. Optional
  // file: a site without it simply has no directions.
  const dirFile = path.join(repoRoot, 'src/content/directions.json')
  const directions = fs.existsSync(dirFile)
    ? read('src/content/directions.json').items.map((d) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        ...(d.desc ? { desc: d.desc } : {}),
        ...(d.age ? { age: d.age } : {}),
        ...(d.schedule ? { schedule: d.schedule } : {}),
        ...(Array.isArray(d.prices) && d.prices.length ? { prices: d.prices.map((p) => ({ name: p.name, price: p.price })) } : {}),
        ...(d.showFrom ? { showFrom: d.showFrom } : {}),
        ...(d.showTo ? { showTo: d.showTo } : {}),
        open: d.open !== false,
        askPhone: d.askPhone !== false,
        fields: (d.fields || []).map((f) => ({
          label: f.label,
          kind: f.kind || 'text',
          ...(f.ask ? { ask: f.ask } : {}),
          ...(Array.isArray(f.options) && f.options.length ? { options: f.options } : {}),
        })),
      }))
    : []

  // the theatre's shop window on Bileton: every show and its seats in one place
  const settings = read('src/content/settings.json')
  const ticketsUrl = /^https?:\/\//.test(settings.ticketsWidgetUrl || '') ? settings.ticketsWidgetUrl : ''
  // «Настройки сайта»: the same phone the site shows, so the bot's own phrases
  // ("позвоните …") change with it instead of keeping a number typed into code
  const contact = contactFrom(settings)
  faq.unshift({ id: 'phones', always: false, title: 'Адрес, контакты и где купить билеты', body: contactLines(contact) })
  // The team, awards and past productions pages, so "кто у вас играет?" gets
  // the same answer the site gives. Optional files, like the directions.
  faq.push(...peopleSections(repoRoot, read))

  const base = { builtAt: new Date().toISOString(), afisha, shows, courses, faq, directions, contact, ...(ticketsUrl ? { ticketsUrl } : {}), source: 'site' }
  // The site is the source of truth: the theatre edits it in the admin and the
  // bot follows. The Word-document mode (bot/docs, the theatre's season plan)
  // stays for the day someone wants it: KNOWLEDGE_SOURCE=docs.
  if (process.env.KNOWLEDGE_SOURCE === 'docs' && docsPresent(repoRoot)) {
    const { knowledge, report } = knowledgeFromDocs(repoRoot, base, nowMs)
    return { ...knowledge, docsReport: report }
  }
  return base
}

function peopleSections(repoRoot, read) {
  const has = (p) => fs.existsSync(path.join(repoRoot, p))
  const out = []
  const team = has('src/content/team.json') ? (read('src/content/team.json').members || []).filter((m) => m && m.name) : []
  if (team.length) {
    out.push({
      id: 'team',
      always: false,
      // who plays whom and who teaches which group are not on the site
      title: 'Команда театра (кто в каком спектакле играет и кто какую группу ведёт, здесь не сказано — не выдумывай, это уточнит администратор)',
      body: team.map((m) => '- ' + m.name + (m.role ? ' — ' + m.role : '')).join('\n'),
    })
  }
  const awards = has('src/content/awards.json') ? (read('src/content/awards.json').items || []).filter(Boolean) : []
  if (awards.length) out.push({ id: 'awards', always: false, title: 'Награды и звания', body: awards.map((a) => '- ' + a).join('\n') })
  const past = has('src/content/productions.json') ? (read('src/content/productions.json').items || []).filter((p) => p && p.title) : []
  if (past.length) {
    out.push({
      id: 'history',
      always: false,
      // it lists current shows too, by the year of their premiere
      title: 'Все постановки театра с 2003 года, по году премьеры (что идёт сейчас и на что есть билеты — только «Спектакли в репертуаре»)',
      body: past.map((p) => (p.year ? p.year + ': ' : '') + '«' + p.title + '»').join('; '),
    })
  }
  return out
}

// The build fails on a missing phone rather than ship a bot that tells people
// to call "undefined".
export function contactFrom(settings) {
  const phone = String(settings.phone || '').trim()
  const hours = String(settings.hours || '').trim()
  const email = String(settings.email || '').trim()
  if (!phone || !hours || !email) throw new Error('src/content/settings.json («Настройки сайта» в админке): нужны телефон, часы звонков и почта')
  const address = String(settings.address || '').trim()
  const venue = String(settings.venue || '').trim()
  if (!address || !venue) throw new Error('src/content/settings.json («Настройки сайта» в админке): нужны адрес и площадка')
  const opt = {}
  for (const k of ['phone2', 'entrance', 'vk', 'telegram', 'ticketsWhere']) {
    const v = String(settings[k] || '').trim()
    if (v) opt[k] = v
  }
  return { phone, hours, email, address, venue, ...opt }
}

function contactLines(c) {
  return [
    '- Адрес: ' + c.address + ', ' + c.venue + (c.entrance ? ', ' + c.entrance : '') + '.',
    '- Телефоны: ' + c.phone + (c.phone2 ? ' и ' + c.phone2 : '') + '. Звонить: ' + c.hours + '.',
    '- Почта: ' + c.email,
    ...(c.vk ? ['- ВКонтакте: ' + c.vk] : []),
    ...(c.telegram ? ['- Telegram: ' + c.telegram] : []),
    ...(c.ticketsWhere ? ['- Билеты продаются ' + c.ticketsWhere + '.'] : []),
  ].join('\n')
}

// The bot's handbook: what the theatre edits in the admin under «Ответы бота»
// (src/content/bot.json). Each section becomes one block of the prompt; the
// "unconfirmed" list is not a fact but a limit on what the bot may say, so it
// always goes in. Nothing here repeats what another admin file already holds
// (prices live in the courses, the festival on its own page): a fact kept in
// two places is a fact that goes stale in one of them.
//
// A broken file must not take the bot down or send it out with no limits at
// all, so it fails the build instead: the site then stays as it was.
const MAX_SECTION_CHARS = 1800
const SIGNUP_SECTION = {
  id: 'signup',
  always: false,
  title: 'Запись на курсы',
  // how the bot itself works, so it is kept in code rather than in the admin
  body: [
    '- Заявка оформляется прямо в чате с ботом: он открывает короткую форму (имя, возраст, телефон). Отдельно заходить на сайт не нужно.',
    '- После заявки администратор перезванивает и рассказывает про расписание и подходящую группу.',
    '- Цены и набор — в разделе «Курсы».',
  ].join('\n'),
}

export function faqFromContent(bot, festival) {
  const problems = []
  const sections = []
  const seen = new Set()
  ;(bot.sections || []).forEach((s, i) => {
    const title = String(s.title || '').trim()
    const body = String(s.text || '').trim()
    if (!title || !body) { problems.push(`раздел №${i + 1}: нужны и заголовок, и текст`); return }
    if (body.length > MAX_SECTION_CHARS) problems.push(`раздел «${title}» разросся до ${body.length} знаков (предел ${MAX_SECTION_CHARS}) — разделите на два`)
    // sections added in the admin come without an id; the position gives one
    let id = /^[a-z0-9_-]+$/.test(s.id || '') ? s.id : 'section' + (i + 1)
    while (seen.has(id)) id += '_'
    seen.add(id)
    sections.push({ id, always: false, title, body })
  })
  sections.push(SIGNUP_SECTION)
  const fest = festivalSection(festival)
  if (fest) sections.push(fest)
  const unconfirmed = (bot.unconfirmed || []).map((x) => String(x).trim()).filter(Boolean)
  // the festival's programme is a fact only once the theatre has published it
  if (festival && !(festival.program || []).length) unconfirmed.push('программа фестиваля по дням')
  sections.push({
    id: 'limits',
    always: true,
    title: 'Этого театр пока не подтвердил: бот НЕ отвечает сам, а говорит, что уточнит администратор',
    body: unconfirmed.map((x) => '- ' + x).join('\n') || '- (всё подтверждено)',
  })
  if (problems.length) throw new Error('src/content/bot.json («Ответы бота» в админке):\n  - ' + problems.join('\n  - '))
  return sections
}

// The festival page's own text, so the bot says what the page says. Dates and
// whether applications are open come from the festival's direction.
function festivalSection(f) {
  if (!f) return null
  const lines = []
  for (const p of f.intro || []) if (String(p).trim()) lines.push('- ' + String(p).trim())
  for (const d of f.program || []) lines.push('- Программа, ' + d.day + ': ' + (d.items || []).join('; '))
  for (const q of f.faq || []) if (q.q && q.a) lines.push('- ' + q.q + ' — ' + q.a)
  lines.push('- Всё о фестивале — на странице «Фестиваль» на сайте. Заявку коллектива можно подать там или прямо в чате.')
  return { id: 'festival', always: false, title: 'Фестиваль «Действующие лица»', body: lines.join('\n') }
}
