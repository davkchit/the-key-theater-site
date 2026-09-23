// Core logic of the «Ключ» Telegram bot.
//
// Plain functions only -- no imports, no exports, no n8n globals. The same text
// is inlined into the n8n Code nodes by scripts/build-workflow.mjs and loaded
// into Node by the local simulator/tests, so what is tested here is exactly
// what runs in n8n.
//
// The one rule the whole file is built around: the model TALKS, the code WRITES.
// The model only ever produces reply text plus an optional marker; names,
// phones and statuses are handled by the deterministic steps below.

const CFG = {
  maxLlmPerChatPerDay: 40,
  maxLlmPerChatPerMinute: 8,
  maxLlmGlobalPerDay: 150,
  maxInputChars: 500,
  historyTurns: 6,
  signupTtlMs: 6 * 60 * 60 * 1000,
  // consent is the one step nobody comes back to hours later
  consentTtlMs: 10 * 60 * 1000,
  secondChildWindowMs: 60 * 60 * 1000,
  afishaShown: 6,
  // months of afisha the model sees line by line; beyond that, per-show dates
  afishaMonths: 4,
  // how long "давай" still means "yes to the signup the bot just offered"
  offerTtlMs: 15 * 60 * 1000,
  // narrow the prompt to the topic the parser named? Off: the handbook is four
  // pages, so the whole of it is cheaper than the risk of sending the wrong part
  routeKnowledge: false,
  tz: 'Europe/Moscow',
}

const BTN = {
  afisha: '🎭 Афиша',
  tickets: '🎟 Купить билет',
  courses: '🎓 Курсы',
  signup: '✍️ Записаться на курс',
  address: '📍 Адрес и контакты',
  human: '🙋 Позвать администратора',
}

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

// ---------------------------------------------------------------- helpers

function todayIso(nowMs) {
  // calendar date in Moscow, not UTC -- a show "today" must not flip at 21:00
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: CFG.tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  return f.format(new Date(nowMs))
}

// The theatre's plan lists some shows without a time ("5.12 «Лариса»", the New
// Year block). An empty time must read as "not known yet", never as a blank.
function showTime(a) {
  return a.time ? a.time : 'время уточняется'
}

const WD_SHORT_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

function ruDate(iso) {
  const d = new Date(iso + 'T12:00:00Z')
  return { day: d.getUTCDate(), mon: MONTHS_GEN[d.getUTCMonth()], wd: WEEKDAYS[d.getUTCDay()] }
}

function mainKeyboard() {
  return {
    keyboard: [
      [{ text: BTN.afisha }, { text: BTN.tickets }],
      [{ text: BTN.courses }, { text: BTN.signup }],
      [{ text: BTN.address }, { text: BTN.human }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  }
}

function contactKeyboard() {
  return {
    keyboard: [[{ text: '📱 Поделиться контактом', request_contact: true }], [{ text: 'Отмена' }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
}

function ageKeyboard() {
  return {
    keyboard: [[{ text: '5–7 лет' }, { text: '8–12 лет' }], [{ text: '13–17 лет' }, { text: 'Взрослый курс' }], [{ text: 'Отмена' }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
}

function inline(rows) {
  return { inline_keyboard: rows.map((r) => r.map(([text, data]) => ({ text, callback_data: data }))) }
}

// Long dashes are the first thing people point at as "written by a neural net",
// and asking the model not to use them works only most of the time. So every
// outgoing text loses them here, whoever wrote it: the model, the CMS, or us.
// Ranges like 5–7 have no spaces around the dash and are left alone.
function noDashes(text) {
  // [^\S\n] is any space but a line break: models put narrow no-break spaces
  // (U+202F) around dashes, and a plain " " class let every one of them through
  return String(text)
    .replace(/(^|\n)[^\S\n]*[—–][^\S\n]+/g, '$1')
    // a dash before a number is a range ("7 – 18 июня", "18:00 – 19:30"): it
    // keeps a short dash, a comma there turned the camp's shift into two dates
    // -- but only between numbers or dates: «Малыши» — 5–7 лет is not a range
    .replace(/(\d|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)[^\S\n]+[—–][^\S\n]+(?=\d)/g, '$1–')
    // "Театр — это игра" reads fine as "Театр это игра", but not with a comma
    .replace(/[^\S\n]+[—–][^\S\n]+(это|значит)(?![а-яё])/gi, ' $1')
    .replace(/[^\S\n]+[—–][^\S\n]+/g, ', ')
    .replace(/([,:;.!?]), /g, '$1 ')
}

function msg(chatId, text, replyMarkup) {
  const m = { chat_id: chatId, text: noDashes(text), parse_mode: 'HTML', disable_web_page_preview: true }
  if (replyMarkup) m.reply_markup = replyMarkup
  return m
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function normPhone(raw) {
  let d = String(raw == null ? '' : raw).replace(/\D/g, '')
  if (d.length === 11 && (d[0] === '8' || d[0] === '7')) d = '7' + d.slice(1)
  else if (d.length === 10 && d[0] === '9') d = '7' + d
  if (d.length !== 11 || d[0] !== '7') return null
  return '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9, 11)
}

// "запишите", "хочу записаться", "оставить заявку", "как подать заявку" --
// any of these means: start the signup form, don't explain how to sign up
const SIGNUP_WORDS = /(запиш|записа|записыва|заявк)/i

const AGE_REPROMPT = 'И сколько лет? Если записываете ребёнка, напишите его возраст, а если себя, то свой. Передумали? Нажмите «Отмена».'

// Greetings and small talk get a cat reply straight from code: the model answers
// them with a flat "Здравствуйте! Чем могу помочь?" no matter what the prompt
// says, and there is nothing to look up anyway. Short messages only -- anything
// longer carries a real question and goes to the model.
const SMALL_TALK = [
  [/^(прив|здрав|здаров|салам|салям|хай|хэй|хеллоу|добр(ый|ое|ого)\b|доброго|ку\b|йо\b|hello|hi\b)/i, [
    'Мяу, привет! 🐾 Я кот театра «Ключ». Спрашивайте про спектакли и курсы или жмите кнопки внизу.',
    'Привет-привет! Кот «Ключа» на связи. Подскажу афишу, расскажу про курсы, запишу. С чего начнём?',
  ]],
  [/(как ты|как дела|как сам|как жизнь|как поживаешь|че как|чё как)/i, [
    'Мурчу потихоньку, в театре репетиции, на сцене свет 🐾 А у вас какой вопрос?',
    'Лучше всех: сплю на бархатном кресле в зале. Чем помочь?',
  ]],
  [/^(спасибо|спс|благодар|пасиб|сенкс|thanks)/i, [
    'Всегда пожалуйста! Если что, я тут 🐾',
    'Мяу, рад помочь! Заходите ещё, и в чат, и в театр.',
  ]],
  [/^(пока|до свидания|досвидания|бай|всего доброго)/i, [
    'До встречи в театре! 🐾',
    'Пока-пока! Лапкой машу из-за кулис.',
  ]],
]

// Reply-keyboard captions arrive as ordinary text but mean exactly one thing --
// parsing them would be paying for a decision already made.
function isButtonLabel(text) {
  const t = String(text || '').trim()
  for (const k in BTN) if (BTN[k] === t) return true
  return t === 'Отмена'
}

function smallTalkReply(text, nowMs) {
  if (text.split(/\s+/).length > 4) return null
  for (const [re, variants] of SMALL_TALK) if (re.test(text)) return variants[nowMs % variants.length]
  return null
}

function looksLikeQuestion(text) {
  return /\?/.test(text) || text.split(/\s+/).length > 6
}

// ---------------------------------------------------------------- telegram in

function normalizeUpdate(u) {
  const updateId = u && typeof u.update_id === 'number' ? u.update_id : null
  if (u && u.callback_query) {
    const q = u.callback_query
    return {
      updateId,
      kind: 'callback', chatId: q.message.chat.id, chatType: q.message.chat.type, userId: q.from.id,
      firstName: q.from.first_name || '', data: q.data || '', callbackId: q.id, messageId: q.message.message_id,
      messageText: q.message.text || '',
    }
  }
  const m = u && (u.message || u.edited_message)
  if (!m) return { kind: 'ignore' }
  const base = { updateId, chatId: m.chat.id, chatType: m.chat.type, userId: m.from ? m.from.id : null, firstName: (m.from && m.from.first_name) || '', messageId: m.message_id }
  if (m.contact) return Object.assign(base, { kind: 'contact', phone: m.contact.phone_number, contactUserId: m.contact.user_id })
  if (typeof m.text === 'string') return Object.assign(base, { kind: 'text', text: m.text.trim() })
  if (m.voice || m.audio || m.video_note) return Object.assign(base, { kind: 'voice' })
  return Object.assign(base, { kind: 'other' })
}

// ---------------------------------------------------------------- knowledge

function upcomingAfisha(knowledge, nowMs, limit) {
  const today = todayIso(nowMs)
  return knowledge.afisha
    .filter((a) => a.date >= today)
    .sort((a, b) => (a.date + (a.time || '99')).localeCompare(b.date + (b.time || '99')))
    .slice(0, limit)
}

// The single thing a visitor asked for that the bot could not give: a link to
// the actual showing. The URL lives in the CMS next to the show, so the moment
// the theatre pastes one in, every afisha line starts linking to it.
function ticketUrlFor(knowledge, title) {
  const t = String(title || '').toLowerCase().trim()
  for (const sh of knowledge.shows || []) {
    if (String(sh.title || '').toLowerCase().trim() === t && sh.ticketUrl) return sh.ticketUrl
  }
  return null
}

function afishaText(knowledge, nowMs) {
  const items = upcomingAfisha(knowledge, nowMs, CFG.afishaShown)
  if (!items.length) return 'Ближайших спектаклей в афише пока нет. Следите за новостями театра.'
  const lines = items.map((a) => {
    const d = ruDate(a.date)
    const url = ticketUrlFor(knowledge, a.title)
    const name = url ? '<a href="' + esc(url) + '">«' + esc(a.title) + '»</a>' : '«' + esc(a.title) + '»'
    return '• <b>' + d.day + ' ' + d.mon + '</b>, ' + d.wd + ', ' + showTime(a) + ', ' + name + (a.age ? ' (' + a.age + ')' : '') + (a.note ? ', ' + esc(a.note) : '')
  })
  return '<b>Ближайшие спектакли:</b>\n' + lines.join('\n')
}

function coursesText(knowledge) {
  const lines = knowledge.courses.map((c) => '• <b>' + esc(c.name) + '</b> (' + c.ageRange + '): ' + esc(c.desc))
  return '<b>Актёрские курсы:</b>\n' + lines.join('\n') + '\n\nНабор в группы продолжается. Стоимость и расписание расскажет администратор, когда перезвонит.'
}

function contactsText() {
  return [
    '<b>Театр «Ключ»</b>',
    '📍 Набережные Челны, Новый город, 1/02, молодёжный центр «НУР», второй вход',
    '📞 +7 906 120-22-62, +7 962 573-92-19 (пн–пт, 15:00–21:00)',
    '✉️ kluchtheatre@mail.ru',
    'ВКонтакте: vk.com/teatr_kluch',
  ].join('\n')
}

function ticketsText(knowledge, nowMs) {
  return 'Билеты продаются на <b>Билетоне</b> и на <b>Яндекс Афише</b>, а также в кассе театра.\n\n' + afishaText(knowledge, nowMs)
}

// Every block the model may be told about, keyed by topic id. The ids of the
// first three are fixed here; the rest come from the section labels in faq.md.

// One flat list of forty lines made the model drop the end of a month ("что в
// ноябре?" lost the 28th). A heading per month with its count lets it see where
// the month ends and check that it named them all.
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
function afishaByMonth(knowledge, nowMs) {
  const groups = []
  for (const a of upcomingAfisha(knowledge, nowMs)) {
    const key = a.date.slice(0, 7)
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, items: [] })
    groups[groups.length - 1].items.push(a)
  }
  // A whole season from the theatre's plan (75 shows) pushed the prompt past
  // Groq's 8000 tokens a minute on its own. The next few months are listed in
  // full; later months keep only their count and what is not in the
  // repertoire, because every repertoire show already carries all its dates.
  const repertoire = new Set((knowledge.shows || []).map((s) => String(s.title).toLowerCase().trim()))
  return groups.map((g, gi) => {
    // The year stays even though the model then copies it into dates: without
    // it the model skipped September as if it were over (2 runs of 3). The
    // current year is taken back out of the reply in afterModel instead.
    const head = '### ' + MONTHS_NOM[Number(g.key.slice(5, 7)) - 1] + ' ' + g.key.slice(0, 4) + ', показов: ' + g.items.length
    const far = gi >= CFG.afishaMonths
    const items = far ? g.items.filter((a) => !repertoire.has(String(a.title).toLowerCase().trim())) : g.items
    const pointer = far ? '\n- даты спектаклей репертуара на этот месяц указаны у каждого спектакля в разделе «Спектакли в репертуаре»' : ''
    // short month and weekday: with a whole season from the theatre's plan the
    // full words alone cost a thousand tokens per message
    const lines = items.map((a) => { const d = ruDate(a.date); return '- ' + d.day + ' ' + d.mon.slice(0, 3) + ' (' + WD_SHORT_RU[new Date(a.date + 'T12:00:00Z').getUTCDay()] + '), ' + showTime(a) + ', «' + a.title + '»' + (a.age ? ', ' + a.age : '') + (a.note ? ', ' + a.note : '') })
    // days the theatre is away: "есть спектакль 10 октября?" needs the reason
    const today = todayIso(nowMs)
    const away = (knowledge.tours || [])
      .filter((t) => t.to >= today && t.from.slice(0, 7) <= g.key && t.to.slice(0, 7) >= g.key)
      .map((t) => { const a = ruDate(t.from); const b = ruDate(t.to); return '- ' + a.day + (a.mon === b.mon ? '' : ' ' + a.mon.slice(0, 3)) + '–' + b.day + ' ' + b.mon.slice(0, 3) + ': театр на гастролях (' + t.place + '), спектаклей в Челнах нет' })
    lines.unshift(...away)
    return head + (lines.length ? '\n' + lines.join('\n') : '') + pointer
  }).join('\n')
}

// "Когда будет Симон?" made the model pick one title's lines out of forty, and
// it dropped a different date each time (27 сентября, 29 ноября). The dates of
// each show are gathered here, so answering is reading, not searching.
function showDates(knowledge, nowMs, title) {
  const t = String(title || '').toLowerCase().trim()
  const items = upcomingAfisha(knowledge, nowMs).filter((a) => String(a.title || '').toLowerCase().trim() === t)
  if (!items.length) return 'Ближайших показов в афише нет'
  // dd.mm keeps this list short: with the whole season from the plan it is
  // repeated for every show, and the prompt has a hard size limit on Groq
  const thisYear = todayIso(nowMs).slice(0, 4)
  return 'Все ближайшие показы (' + items.length + '): ' + items.map((a) => a.date.slice(8) + '.' + a.date.slice(5, 7) + (a.date.slice(0, 4) === thisYear ? '' : '.' + a.date.slice(0, 4)) + (a.time ? ' ' + a.time : ' время уточняется') + (a.note ? ' (' + a.note + ')' : '')).join(', ')
}

function knowledgeBlocks(knowledge, nowMs) {
  const blocks = {
    // The model gets the whole season, not the six lines the button shows: a
    // screen limit is not a knowledge limit, and "что в ноябре?" needs November.
    // December's New Year block is not published yet, so the list is "what is
    // out so far", never "all there will be".
    afisha: '## Афиша (все опубликованные показы. Театр может добавить новые, поэтому не говори, что других не будет)\n' + (afishaByMonth(knowledge, nowMs) || '- ближайших спектаклей нет'),
    shows: '## Спектакли в репертуаре\n' + knowledge.shows
      .map((s) => '- «' + s.title + '»: ' + [s.age ? 'возраст ' + s.age : 'возраст уточняется у администратора', s.genre, s.based, s.dir && 'режиссёр ' + s.dir, s.dur && 'длительность ' + s.dur].filter(Boolean).join('; ') + (s.synopsis ? '. Сюжет: ' + s.synopsis : '') + (s.ticketUrl ? '. Страница билетов: ' + s.ticketUrl : '') + '. ' + showDates(knowledge, nowMs, s.title))
      .join('\n'),
    courses: '## Курсы (группы по возрасту)\n' + knowledge.courses.map((c) => '- «' + c.name + '», ' + c.ageRange + ': ' + c.desc + (c.price ? '. Стоимость: ' + c.price : '')).join('\n'),
  }
  for (const s of knowledge.faq) blocks[s.id] = '## ' + s.title + '\n' + s.body
  // A ticket question is answered out of the tickets block, so the links have to
  // live there too: routing can only carry what the chosen topic contains, and
  // the first run through the parser lost them because they sat under shows.
  const links = (knowledge.shows || []).filter((sh) => sh.ticketUrl).map((sh) => '- «' + sh.title + '»: ' + sh.ticketUrl)
  if (links.length && blocks.tickets) blocks.tickets += '\nСтраницы покупки билетов:\n' + links.join('\n')
  return blocks
}

// Blocks that go in whatever the question is: the "not confirmed" list is not a
// fact but a limit on what may be said, and dropping it for an off-topic
// question is exactly when the model starts inventing prices.
function alwaysTopics(knowledge) {
  return knowledge.faq.filter((s) => s.always).map((s) => s.id)
}

// Everything the model is allowed to know, as compact text. Two things keep it
// small, and both matter because this text is paid for on every single call:
// the afisha is cut to the upcoming few, and `topics` selects which blocks are
// relevant to this turn. `topics = null` means "send everything", which is the
// behaviour until the turn parser is in place and can name the topic itself.
function knowledgeForPrompt(knowledge, nowMs, topics) {
  const today = todayIso(nowMs)
  const td = ruDate(today)
  const blocks = knowledgeBlocks(knowledge, nowMs)
  const wanted = topics
    ? [...new Set(topics.concat(alwaysTopics(knowledge)))].filter((id) => blocks[id])
    : Object.keys(blocks)
  return ['Сегодня: ' + td.day + ' ' + td.mon + ' ' + today.slice(0, 4) + ', ' + td.wd + '.']
    .concat(wanted.map((id) => blocks[id]))
    .join('\n\n')
}

// ---------------------------------------------------------------- course fit

// Which group an age falls into, and whether we are allowed to say so out loud.
// The bot must never *assign* a group -- the teacher does that -- but showing
// which one the age matches is information, not a decision, and it catches
// typos ("8" when someone meant "18") before the lead is filed.
function ageBounds(range) {
  const r = String(range || '').replace(/\s/g, '')
  const plus = r.match(/^(\d{1,2})\+/)
  if (plus) return { lo: Number(plus[1]), hi: 200 }
  const span = r.match(/^(\d{1,2})[^\d]+(\d{1,2})/)
  if (span) return { lo: Number(span[1]), hi: Number(span[2]) }
  return null
}

function courseForAge(knowledge, text) {
  const nums = String(text || '').match(/\d{1,3}/g) || []
  const n = nums.length ? Number(nums[0]) : NaN
  if (!Number.isFinite(n)) return null
  for (const c of knowledge.courses || []) {
    const b = ageBounds(c.ageRange)
    if (!b || n < b.lo || n > b.hi) continue
    // The season-old trap: "7, в декабре 8" sits on the edge of two groups, and
    // so does any age equal to the top of its range. Show it, but do not promise.
    const edge = n === b.hi || nums.length > 1 || /скор|исполн|будет|станет/i.test(String(text))
    return { name: c.name, ageRange: c.ageRange, desc: c.desc, sure: !edge }
  }
  return null
}

// What the administrator sees in the lead: the age as written plus the group it
// matches, so nobody has to work it out on the phone.
function childLine(knowledge, ageText) {
  const fit = courseForAge(knowledge, ageText)
  if (!fit) return ageText
  return ageText + ' · ' + fit.name + ' (' + fit.ageRange + ')' + (fit.sure ? '' : ', уточнить группу')
}

// «🧒 24» read oddly in a real lead -- somebody signing themselves up for the
// adult course is not a child.
function personIcon(knowledge, ageText) {
  const n = Number((String(ageText || '').match(/\d{1,3}/) || [])[0])
  return Number.isFinite(n) && n >= 18 ? '🧑' : '🧒'
}

// ---------------------------------------------------------- turn parser

// Reads one incoming message and returns a structured description of it, so the
// state machine can branch on a label instead of on a pile of keyword regexps.
// The model never answers the person here and never sees personal data beyond
// the message itself -- it only labels.
//
// Deliberately absent: an "answerable" flag. Asking the model whether it can
// answer *without showing it the knowledge* is asking it to know what it does
// not know; in testing both Pro and Lite got it wrong in opposite directions.
// Whether an answer exists is decided later, by the code and by the answering
// call that actually has the facts in front of it.

const PARSER_TOPICS = {
  afisha: 'ближайшие показы, даты, время, что идёт на этой неделе или в конкретный день',
  shows: 'сами спектакли: сюжет, жанр, длительность, режиссёр, возрастная маркировка',
  courses: 'студия и курсы: группы по возрасту, чему учат, стоимость занятий, скидки и оплата занятий',
  signup: 'как записаться на курс, что будет после заявки',
  tickets: 'где купить билет, ссылки, Пушкинская карта',
  festival: 'фестиваль «Действующие лица», как стать участником',
  camp: 'летний лагерь «Солнечная пыль»',
  lab: 'лаборатория современной драматургии «ЛСД»',
  about: 'история театра, награды, художественный руководитель, труппа',
  contacts: 'адрес, как добраться, телефоны, часы работы, почта, соцсети',
}

const PARSER_INTENTS = {
  question: 'спрашивает факт о театре: что идёт, сколько стоит, где вы, про что спектакль',
  signup: 'речь о занятиях в студии: «хочу записаться», «запишите дочку», «как записаться?», «можно моего ребёнка к вам отдать?». ТОЛЬКО про курсы. Купить билет на спектакль — это НЕ signup, это question с темой tickets. И «сколько стоит?», «есть ли пробное?», «в какую группу?» — тоже question: человек собирает сведения',
  add_child: 'хочет добавить ещё одного человека к уже оставленной заявке',
  cancel: 'отказывается от записи: «отмена», «стоп», «не надо», «передумал», «забей», «потом», «проехали». Во время заполнения формы любой такой отказ — это cancel',
  small_talk: 'приветствие, благодарность, прощание, болтовня. Сюда же «ты бот или человек?» — это любопытство, а не просьба позвать сотрудника',
  complaint: 'жалуется: не перезвонили, не дозвонился, недоволен',
  human: 'просит СОЕДИНИТЬ его с живым сотрудником: «позовите администратора», «дайте человека»',
  confirm: 'соглашается или подтверждает: «согласен», «да», «ок», «верно», «давай», «угу». Только как ответ на заданный вопрос, не сам по себе',
  decline: 'отказывается от предложенного: «не согласен», «нет», «не хочу», «не буду». Это не отмена всей записи, а ответ «нет» на вопрос',
  other: 'ничего из перечисленного: посторонние темы, бессмыслица, набор букв',
}

function parserSchema() {
  return {
    name: 'turn',
    schema: {
      type: 'object',
      properties: {
        intent: { type: 'string', enum: Object.keys(PARSER_INTENTS) },
        // The distinction every wrong turn today came down to: «запишите меня»
        // is an order, «а заявки делаешь?» is a question. Acting on the second
        // as if it were the first is what hijacked the conversation.
        wants_action: { type: 'boolean' },
        // maxItems is load-bearing: without it the smaller model loops on the
        // array and repeats topics until it runs out of output tokens
        topics: { type: 'array', items: { type: 'string', enum: Object.keys(PARSER_TOPICS) }, maxItems: 3 },
        // Union types like ["integer","null"] are rejected by some providers'
        // schema validation, so absence is a sentinel: 0 and "" mean "not said".
        age: { type: 'integer' },
        show: { type: 'string' },
      },
      required: ['intent', 'wants_action', 'topics', 'age', 'show'],
      additionalProperties: false,
    },
  }
}

function parserMessages(userText, history, hasOpenLead, step, lastTopics) {
  const sys = [
    'Ты размечаешь одно сообщение посетителя театра «Ключ». Ты НЕ отвечаешь человеку — только описываешь его сообщение структурой.',
    '',
    'intent — что человек делает:',
    ...Object.keys(PARSER_INTENTS).map((k) => '- ' + k + ': ' + PARSER_INTENTS[k]),
    '',
    'topics — какие разделы справочника нужны, чтобы ответить. Не больше трёх, только необходимые. Если сообщение не вопрос — пустой список.',
    ...Object.keys(PARSER_TOPICS).map((k) => '- ' + k + ': ' + PARSER_TOPICS[k]),
    '',
    'age — возраст числом, ТОЛЬКО если он назван в самом сообщении. Если возраст не назван — ставь 0. Не угадывай.',
    'show — название спектакля, если упомянуто, иначе пустая строка.',
    '',
    'wants_action — ПРОСИТ СДЕЛАТЬ прямо сейчас (оформи, запиши, отмени, добавь) → true.',
    'Если человек СПРАШИВАЕТ — «а заявки делаешь?», «можно ли записаться?», «а как отменить?» — это false, даже если тема та же.',
    'Повелительное наклонение и «хочу/давайте» → true. Вопросительная форма → почти всегда false.',
    '',
    hasOpenLead ? 'У этого человека уже есть незакрытая заявка.' : 'Заявки у этого человека сейчас нет — значит intent add_child и cancel почти наверняка не подходят.',
    step ? 'Сейчас идёт заполнение формы, шаг: ' + step + '.' : '',
    // "а ещё что-то есть?" went to the afisha because nothing told the parser
    // what the previous question had been about
    (lastTopics && lastTopics.length) ? 'Предыдущий вопрос был про: ' + lastTopics.join(', ') + '. Если это уточнение к нему — верни те же темы, добавив нужные.' : '',
  ].filter(Boolean).join('\n')

  const msgs = [{ role: 'system', content: sys }]
  for (const h of (history || []).slice(-2)) msgs.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.text).slice(0, 300) })
  msgs.push({ role: 'user', content: String(userText).slice(0, CFG.maxInputChars) })
  return msgs
}

// What the code is willing to act on. A label is probabilistic; whether it is
// allowed in the current state is not. This gate is what keeps a misread
// "отмените" from cancelling a lead that does not exist.
function intentAllowed(intent, state, nowMs) {
  if (intent === 'add_child') return hasOpenLead(state, nowMs)
  if (intent === 'cancel') return Boolean(state.step) || Boolean(state.lastLead && !state.lastLead.cancelled)
  return true
}

function parseTurnReply(raw, sourceText) {
  let text = String(raw == null ? '' : raw).trim()
  // some versions fence the JSON even when a schema is attached
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) text = fenced[1].trim()
  let v = null
  try { v = JSON.parse(text) } catch (e) { return null }
  if (!v || typeof v !== 'object') return null
  const intent = Object.prototype.hasOwnProperty.call(PARSER_INTENTS, v.intent) ? v.intent : null
  if (!intent) return null
  const topics = Array.isArray(v.topics) ? v.topics.filter((t) => Object.prototype.hasOwnProperty.call(PARSER_TOPICS, t)).slice(0, 3) : []
  // The cheaper model invents ages -- it answered "1" to «привет». An age is
  // only accepted when that exact number is actually present in the message,
  // which is a check against the input, not a guess about the model.
  let age = Number.isInteger(v.age) && v.age >= 1 && v.age <= 120 ? v.age : null
  if (age != null && sourceText != null) {
    const seen = String(sourceText).match(/\d{1,3}/g) || []
    if (seen.indexOf(String(age)) === -1) age = null
  }
  const show = typeof v.show === 'string' && v.show.trim() ? v.show.trim().slice(0, 80) : null
  const wantsAction = v.wants_action === true
  return { intent, wantsAction, topics, age, show }
}

// ---------------------------------------------------------------- model

const SYSTEM_PROMPT = [
  'Ты кот-помощник молодёжного театра «Ключ». Живёшь в театре, знаешь всё про спектакли и курсы и отвечаешь родителям и зрителям в Telegram.',
  '',
  'ХАРАКТЕР:',
  '- Тёплый, живой, чуть театральный кот. Говоришь легко, с улыбкой, без канцелярита.',
  '- Кошачье щепоткой: «мяу», «мяу-обещаю», «лапкой подпишусь», не больше одного раза за ответ и не в начале каждого ответа. Ответ важнее шутки.',
  '- Почти в каждом ответе один эмодзи по смыслу: 🎭 спектакли и репертуар, 🎟 билеты, 🎬 премьера, 🗓 даты и афиша, 🎓 курсы и занятия, ✨ впечатления, 📍 адрес, 🐾 про себя-кота. Один на ответ, в конце фразы или строки.',
  '- Обращайся на «вы». Если человек сам пишет на «ты», можно на «ты».',
  '- Никаких действий в звёздочках вроде *мурлычет* или *виляет хвостом*.',
  '- Если человек расстроен, жалуется, ему не перезвонили или речь о возрастных ограничениях, отвечай серьёзно и по делу, без кошачьих шуток.',
  '- Характер никогда не важнее правил ниже: кот тоже не придумывает цены и даты.',
  '',
  'КАК ПИСАТЬ:',
  '- Пиши как живой администратор в переписке: просто, прямо, обычными словами. Фразы разной длины.',
  '- Начинай сразу с сути. Без вводных вроде «конечно», «отличный вопрос», «с радостью расскажу», «давайте разберёмся».',
  '- Не повторяй одну мысль разными словами и не добавляй фраз для красоты или объёма.',
  '- Не ставь длинное тире. Вместо него запятая, двоеточие или точка.',
  '- Если в ответе больше одной темы (например, о театре, что посмотреть, как записаться), раздели темы пустой строкой. На простой вопрос отвечай одним абзацем.',
  '- Перечень из трёх и больше пунктов (спектакли, даты, курсы) пиши столбиком: каждый пункт с новой строки и начинается с «• ». Два пункта пиши в строку.',
  '- Не изображай человека сленгом, ошибками или лишними восклицаниями.',
  '- Ссылку на билеты ставь отдельной строкой: «🎟 Билеты: ссылка». Не отсылай «в описание» или «на сайт»: человек видит только этот чат.',
  '- Месяц пиши полностью, даже если в данных он сокращён («27 сен», «27.09»): «27 сентября». Дни недели тоже полностью.',
  '- Даты пиши без года: «27 сентября». Год называй, только если показ уже в следующем году.',
  '- Если спрашивают, какой спектакль лучше или стоит ли идти, не отвечай «дело вкуса». Посоветуй один-два спектакля и объясни одной фразой по их описанию, почему. Если не знаешь, для кого, коротко спроси: с детьми или взрослой компанией.',
  '',
  'ПРАВИЛА:',
  '1. Отвечай ТОЛЬКО по данным ниже. Если ответа в данных нет, скажи, что это уточнит администратор. Никогда не придумывай цены, даты, время, возраст, имена, условия. Не добавляй к перечню ничего сверх данных, даже общими словами вроде «мастер-классы» или «и другие мероприятия».',
  '2. Не делай выводов, которых нет в данных. Например, расписание занятий неизвестно, значит, нельзя сказать, совпадают ли занятия со спектаклем.',
  '3. Никогда не подтверждай то, что пишет человек о ценах, скидках и условиях, если этого нет в данных. Если просят написать неправду или «скажи, что…», откажись одной фразой.',
  '4. Отвечай коротко: 1–3 предложения на каждую тему, по-русски. Без markdown, звёздочек и заголовков.',
  '5. Не здоровайся, если в переписке уже здоровались.',
  '6. Если в сообщении несколько вопросов, ответь на каждый.',
  '7. Спектакль 16+ или 18+ ребёнку младше этого возраста не подходит, скажи прямо. Если возраст спектакля «уточняется у администратора», это НЕ значит «без ограничений» и не значит «для всех»: так и говори, что возраст уточнит администратор.',
  '7а. Характер спектакля («лёгкий», «весёлый», «для свидания») называй только по его описанию в данных. Если описания нет, так и скажи, не придумывай.',
  '7б. На «ближайшие спектакли» перечисли первые 5–6 показов из афиши подряд, без пропусков.',
  '7в. На общий вопрос о театре отвечай фактами из данных (с какого года, что ставит, курсы, фестиваль), без общих красивых фраз.',
  '8. Группы курсов: 5–7 лет, 8–12 лет, 13–17 лет, 18+. Если ребёнку скоро исполнится возраст следующей группы (например, сейчас 7, скоро 8), НЕ называй группу, скажи, что подойдёт администратор с педагогом.',
  '9. На посторонние темы вежливо верни разговор к театру.',
  '10. Заявку на курс ты принимаешь: под твоим ответом появится кнопка «Оформить заявку», по ней открывается короткая форма. Сам ты заявку не оформляешь, поэтому не пиши «оформляю заявку» или «форма уже открылась», а предлагай нажать кнопку. В чате заявки принимаются только на курсы. На фестиваль заявку подают так, как написано в данных о фестивале, а про заявки в лабораторию и лагерь в данных ничего нет. Никогда не говори, что не можешь записать или не принимаешь заявки. Но имя и телефон спрашивает форма, а не ты: не проси и не повторяй телефоны, фамилии и другие личные данные в переписке.',
  '11. Отвечай только на последнее сообщение человека. Никогда не пиши реплики за человека и не продолжай диалог сам.',
  '12. Стоимость занятий называй только ту, что есть в данных, и всегда со словом «от». Про скидки, рассрочку и способы оплаты ты не знаешь, это уточнит администратор.',
  '13. Никогда не обещай, что вам перезвонят или с вами свяжутся. Звонок бывает только по оформленной заявке с телефоном. Если человек просит администратора, дай телефон и часы работы или предложи оставить заявку, но не обещай звонок сам.',
  '',
  'МЕТКИ. Ставь в самом конце ответа, отдельной строкой, только когда они точно подходят:',
  '[ЗАПИСЬ]: человек прямо говорит, что хочет записаться или записать ребёнка (в том числе ещё одного). Не ставь её на вопросы о курсах, ценах и на шутки.',
  '[ЧЕЛОВЕК]: человек прямо просит живого администратора или жалуется. Не ставь её, если просто нет ответа в данных, для этого есть [НЕТ_ОТВЕТА].',
  '[НЕТ_ОТВЕТА]: ответа хотя бы на один вопрос в данных нет.',
  '',
  'ДАННЫЕ ТЕАТРА:',
  '',
].join('\n')

// Shown to the model as if they were earlier turns. YandexGPT copies the voice of
// previous replies far more faithfully than it follows a description of a voice
// in the system prompt. No facts in them on purpose -- only tone -- so they can
// never contradict the theatre's data.
const TONE_EXAMPLES = [
  // The old first pair answered "сколько стоит?" with "не знаю, мяу-обещаю, не
  // потеряем вас": prices are known now, and it promised a callback that rule 13
  // forbids. An example outranks a rule, so examples must never contradict one.
  { role: 'user', text: 'привет, а ты кто?' },
  { role: 'assistant', text: 'Кот театра «Ключ», живу за кулисами. Подскажу, что идёт, расскажу про курсы и могу записать 🐾' },
  { role: 'user', text: 'а рассрочка есть?' },
  { role: 'assistant', text: 'Про рассрочку не подскажу, это лучше уточнить у администратора.' },
  { role: 'user', text: 'а с ребёнком 10 лет на спектакль 18+ можно?' },
  { role: 'assistant', text: 'Нет, спектакль 18+, ребёнка на него не пустят. Но для юных зрителей у нас тоже кое-что найдётся.' },
  { role: 'user', text: 'а вы далеко от центра?' },
  { role: 'assistant', text: 'Мы в Новом городе, в молодёжном центре «НУР», второй вход 📍' },
]

function buildModelRequest(knowledge, nowMs, history, userText, topics) {
  const messages = [{ role: 'system', text: SYSTEM_PROMPT + knowledgeForPrompt(knowledge, nowMs, topics) }].concat(TONE_EXAMPLES)
  for (const h of (history || []).slice(-CFG.historyTurns)) messages.push({ role: h.role, text: h.text })
  messages.push({ role: 'user', text: String(userText).slice(0, CFG.maxInputChars) })
  return messages
}

// A prompt rule is a request, not a guarantee. "Никогда не говори, что не
// можешь записать" was in the instructions and the model said it anyway, to a
// real visitor, twice in a row. What the bot claims about its own abilities is
// not knowledge about the theatre -- it is knowledge about this system, which
// the model has no reliable access to. So it is checked here instead of asked
// for in words.
const NEVER_SAY = [
  [/(форм\w*|заявк\w*)[^.!?]{0,30}(на сайте|на нашем сайте|через сайт)/i,
   'Заявку оформляем прямо здесь: я открою форму, это полминуты.'],
  [/(не\s+принима\w*|не\s+оформля\w*|не\s+могу\s+(принят\w*|запис\w*|оформ\w*))[^.!?]{0,40}(заявк|запис)/i,
   'Заявку я принимаю, это быстро. Администратор потом перезвонит и всё расскажет.'],
  [/(я\s+не\s+могу|не\s+умею)[^.!?]{0,30}(запис|оформ)/i,
   'Записать могу, сейчас открою форму.'],
]

function stripForbidden(text) {
  for (const pair of NEVER_SAY) {
    if (pair[0].test(text)) return { text: pair[1], replaced: true }
  }
  return { text: text, replaced: false }
}

function parseModelReply(raw) {
  // YandexGPT sometimes keeps going after its answer and writes the rest of the
  // chat itself ("Пользователь: …\nАссистент: …"). Everything from the first
  // such role line on is invented and must never reach the person.
  const text = String(raw || '').split(/\n\s*(?:Пользователь|Ассистент|Бот|Клиент|Родитель|User|Assistant)\s*:/i)[0]
  const markers = {
    signup: /\[ЗАПИСЬ\]/i.test(text),
    human: /\[ЧЕЛОВЕК\]/i.test(text),
    // the model forgets this marker far more often than it forgets to say
    // "администратор уточнит" -- so the wording itself also counts. This log is
    // what the monthly FAQ update is built from, it must not miss questions.
    unknown: /\[НЕТ_ОТВЕТА\]/i.test(text) || /(уточнит|подскажет|расскажет|сообщит)\s+администратор|администратор\s+(уточнит|подскажет|расскажет|сообщит|сможет)|у\s+администратора|не\s+знаю|нет\s+(такой\s+)?информации|не\s+могу\s+ответить/i.test(text),
  }
  const clean = text
    .replace(/\[(ЗАПИСЬ|ЧЕЛОВЕК|НЕТ_ОТВЕТА)\]/gi, '')
    .replace(/\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const checked = stripForbidden(clean)
  return { text: checked.text, markers, replaced: checked.replaced }
}

// ---------------------------------------------------------------- state

function emptyState(chatId) {
  return { chatId, promptV: '', step: null, stepAt: 0, draft: null, lastLead: null, pendingAge: null, ageAsked: null, pendingQuestions: null, history: [], day: '', llmDay: 0, llmMinute: [] }
}

// A reply the bot gave under an older set of rules is replayed to the model as
// its own earlier turn, and the model copies it verbatim -- a live chat repeated
// "Я не принимаю заявки" three times in a row, hours after the rule that caused
// it had been fixed. Fixing the instructions cannot beat a literal precedent
// sitting in the conversation, so changing them drops the history that was
// written under the old ones.
function promptVersion() {
  const src = SYSTEM_PROMPT + TONE_EXAMPLES.map(function (m) { return m.text }).join('')
  let h = 0
  for (let i = 0; i < src.length; i++) { h = (h * 31 + src.charCodeAt(i)) | 0 }
  return String(h)
}

function freshState(state, chatId, nowMs) {
  const s = Object.assign(emptyState(chatId), state && typeof state === 'object' ? state : {})
  // someone who vanished mid-signup and comes back later with "здравствуйте"
  // must not be asked "сколько лет ребёнку?" in reply
  const ttl = s.step === 'consent' ? CFG.consentTtlMs : CFG.signupTtlMs
  if (s.step && nowMs - s.stepAt > ttl) { s.step = null; s.draft = null; s.stepMiss = 0; s.reminded = 0 }
  const pv = promptVersion()
  if (s.promptV !== pv) { s.history = []; s.promptV = pv }
  const day = todayIso(nowMs)
  if (s.day !== day) { s.day = day; s.llmDay = 0 }
  s.llmMinute = (s.llmMinute || []).filter((t) => nowMs - t < 60000)
  return s
}

function pushHistory(state, role, text) {
  state.history = (state.history || []).concat([{ role, text: String(text).slice(0, 600) }]).slice(-CFG.historyTurns)
}

// ---------------------------------------------------------------- signup

// "ей 12", "сыну 9 лет" -> "12", "9". Only used to skip re-asking the age of
// an extra child the person already named in the same breath.
function extractAge(text) {
  const m = String(text || '').match(/(?:^|\D)(\d{1,2})(?:\s*(?:лет|год|года))?(?:\D|$)/)
  if (!m) return null
  const n = Number(m[1])
  return n >= 3 && n <= 80 ? String(n) : null
}

// The chat keeps its own copy of the lead, so a second child or a "мне не
// перезвонили" can be saved without reading the leads table first. Status is
// left out on purpose: the administrator changes it from their chat, and this
// copy would overwrite it with a stale "новая".
function leadSaveEffect(lead, notice) {
  const copy = Object.assign({}, lead)
  delete copy.status
  delete copy.at
  return { type: 'leadSave', lead: copy, notice }
}

function addChildEffect(state, age, knowledge) {
  state.lastLead.children = (state.lastLead.children || []).concat([knowledge ? childLine(knowledge, age) : age])
  return leadSaveEffect(state.lastLead, '➕ Добавлен ещё ребёнок')
}

function hasOpenLead(state, nowMs) {
  return Boolean(state.lastLead && !state.lastLead.cancelled && nowMs - state.lastLead.at < CFG.secondChildWindowMs)
}

const ANOTHER_CHILD = /(доч|сын|ребён|ребен|ещё|еще|втор|тоже|брат|сестр|двоих|обоих)/i

const NOT_A_NAME = /^(да|нет|ок|окей|ага|угу|хорошо|ладно|хочу|давай(те)?|запис\S*|заявк\S*|курс\S*|не знаю|мама|папа|родитель|я|здесь|тут|[^a-zA-Zа-яА-ЯёЁ]+)[.!,)]*$/i

// "отмена", "отменить заявку", "передумал", "не надо"
const CANCEL_RE = /^(отмен|отказ|стоп\b|cancel|не надо|передумал)/i

function cancelLeadAsk(out, s) {
  if (!s.lastLead || s.lastLead.cancelled) {
    out.push(msg(s.chatId, 'Отменять нечего, активных заявок от вас нет 🐾', mainKeyboard()))
    return
  }
  out.push(msg(s.chatId, 'Отменить заявку на ' + esc(s.lastLead.name) + '? Администратор не будет звонить.', inline([[['❌ Да, отменить', 'mylead:cancel'], ['Нет, оставить', 'mylead:keep']]])))
}

// mode: 'auto' -- decide from context; 'extra' -- add a child to the open lead;
// 'new' -- a separate lead even though one is open
function startSignup(state, nowMs, mode, knowledge) {
  mode = mode || 'auto'
  if (mode === 'auto' && hasOpenLead(state, nowMs)) {
    // "а дочку тоже запишите" is clearly about the same family; a bare
    // "как записаться?" is not -- ask instead of guessing
    if (state.pendingExtra) mode = 'extra'
    // Asked once already and the person answered with words instead of tapping
    // ("давай заявку") -- repeating the same question is a loop, so take the
    // reading that actually starts a form.
    else if (state.askedMode) { state.askedMode = null; mode = 'new' }
    else {
      state.askedMode = nowMs
      return {
        msgs: [msg(state.chatId, 'У вас уже есть заявка на ' + esc(state.lastLead.name) + '. Добавить к ней ещё одного человека или оформить новую?', inline([[['➕ Ещё одного к заявке', 'signup:extra'], ['📝 Новая заявка', 'signup:new']]]))],
        effects: [],
      }
    }
  }
  state.pendingExtra = null
  // a second child goes into the same lead instead of asking name and phone
  // all over again
  if (mode === 'extra' && state.lastLead && !state.lastLead.cancelled) {
    const knownAge = state.pendingAge
    state.pendingAge = null
    if (knownAge) {
      return {
        msgs: [msg(state.chatId, 'Добавил к вашей заявке ещё ребёнка, ' + esc(knownAge) + ' лет. Администратор расскажет про всех за один звонок.', mainKeyboard())],
        effects: [addChildEffect(state, knownAge + ' лет', knowledge)],
      }
    }
    state.step = 'extra_age'
    state.stepAt = nowMs
    state.draft = { leadId: state.lastLead.id, questions: [] }
    return { msgs: [msg(state.chatId, 'Добавлю ещё одного ребёнка к вашей заявке, администратор расскажет про всех за один звонок.\n\nСколько лет ребёнку?', ageKeyboard())], effects: [] }
  }
  state.step = 'consent'
  state.stepAt = nowMs
  state.draft = { questions: state.pendingQuestions || [] }
  state.pendingQuestions = null
  state.pendingAge = null
  return { msgs: [msg(state.chatId, 'Оформлю заявку, это займёт полминуты. Администратор перезвонит и всё расскажет.\n\nНажимая «Согласен», вы соглашаетесь на обработку персональных данных для связи с вами по заявке.', inline([[['✅ Согласен', 'consent:yes'], ['Отмена', 'signup:cancel']]]))], effects: [] }
}

// ---------------------------------------------------------------- model calls

// Free tiers cap every key per model per day. With several keys the bot moves
// to the next one when a key is spent, and remembers until when it is spent,
// so later messages do not waste a minute of retries on it first.
function llmKeys(env) {
  const keys = [env.LLM_KEY]
  for (let n = 2; n <= 9; n++) keys.push(env['LLM_KEY_' + n])
  return keys.filter(Boolean)
}

function pickKey(keys, dead, model, nowMs) {
  for (let i = 0; i < keys.length; i++) if (!(dead[model + '#' + i] > nowMs)) return i
  return -1
}

// Groq says which limit it hit and for how long: "... on tokens per day (TPD)
// ... Please try again in 24m1.58s". A day limit means "use another key", a
// minute limit means "wait a few seconds with the same one".
function limitInfo(status, message) {
  if (status !== 429) return { kind: null, waitMs: 0 }
  const m = String(message || '')
  const t = m.match(/try again in\s*(?:(\d+)h)?\s*(?:(\d+)m(?!s))?\s*(?:([\d.]+)s)?/i)
  const waitMs = t ? (((Number(t[1]) || 0) * 3600) + ((Number(t[2]) || 0) * 60) + (Number(t[3]) || 0)) * 1000 + 500 : 10000
  if (/per day|TPD|RPD/i.test(m)) return { kind: 'day', waitMs: Math.max(waitMs, 60000) }
  return { kind: 'minute', waitMs }
}

// One chat completion, with key rotation. `helpers` is n8n's this.helpers.
async function callLlm(helpers, env, store, body, budgetMs) {
  store.deadKeys = store.deadKeys || {}
  const keys = llmKeys(env)
  const url = (env.LLM_BASE || 'https://llm.api.cloud.yandex.net/v1') + '/chat/completions'
  const started = Date.now()
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  let last = 'нет ключей'
  for (let attempt = 0; attempt < 10 && Date.now() - started < budgetMs; attempt++) {
    const i = pickKey(keys, store.deadKeys, body.model, Date.now())
    if (i < 0) { last = 'у всех ключей кончился дневной лимит: ' + last; break }
    const headers = { Authorization: (env.LLM_AUTH || 'Api-Key') + ' ' + keys[i], 'Content-Type': 'application/json' }
    if (env.YANDEX_FOLDER_ID) headers['x-folder-id'] = env.YANDEX_FOLDER_ID
    let r
    try {
      r = await helpers.httpRequest({ method: 'POST', url, headers, body, json: true, returnFullResponse: true, ignoreHttpStatusErrors: true, timeout: 30000 })
    } catch (e) {
      last = 'сеть: ' + String((e && e.message) || e).slice(0, 150)
      await sleep(2000)
      continue
    }
    if (r.statusCode >= 200 && r.statusCode < 300) return r.body
    const msg = (r.body && r.body.error && r.body.error.message) || JSON.stringify(r.body || '').slice(0, 200)
    last = 'ключ ' + (i + 1) + ', ' + r.statusCode + ': ' + String(msg).replace(/org_\w+/g, 'org').slice(0, 200)
    const lim = limitInfo(r.statusCode, msg)
    if (lim.kind === 'day') { store.deadKeys[body.model + '#' + i] = Date.now() + lim.waitMs; continue }
    if (lim.kind === 'minute') { await sleep(Math.min(lim.waitMs, Math.max(0, budgetMs - (Date.now() - started)))); continue }
    if (r.statusCode >= 500) { await sleep(2000); continue }
    break
  }
  throw new Error(last)
}

// The bot offered a signup a moment ago (a button, or its reply said
// "оформить заявку"). A short yes within this window means that offer.
const YES_TO_OFFER = /^(да|давай(те)?|ага|ок|окей|го|хочу|можно|конечно|оформля(й|йте)|записыва(й|йте)|запиши(те)?)[\s!.)]*$/i

function offerStillOpen(s, nowMs) {
  return Boolean(s.signupOfferedAt) && nowMs - s.signupOfferedAt < CFG.offerTtlMs && !s.step
}

function runSignupStart(res, s, nowMs, mode, knowledge) {
  const r = startSignup(s, nowMs, mode, knowledge)
  res.out.push(...r.msgs)
  res.effects.push(...r.effects)
}

function cancelSignup(state) {
  state.step = null
  state.draft = null
  return [msg(state.chatId, 'Хорошо, отменил. Если передумаете, кнопка «Записаться на курс» внизу.', mainKeyboard())]
}

// One step of the signup scenario. Returns { out, effects } and, when the
// person asked something instead of answering the step, needsModel + reprompt:
// the question goes to the model, the step is asked again afterwards.
function consentReminderText() {
  return 'Чтобы продолжить запись, нажмите «Согласен». Или напишите «отмена».'
}

function consentReminder(state) {
  return msg(state.chatId, consentReminderText(), inline([[['✅ Согласен', 'consent:yes'], ['Отмена', 'signup:cancel']]]))
}

function signupStep(state, ev, nowMs, knowledge, parsedIntent) {
  const out = []
  const effects = []
  const text = ev.kind === 'text' ? ev.text : ''

  // «забей», «нетуу», «проехали» -- the parser reads these as giving up, which
  // the keyword list never could. The list stays as the fallback for when the
  // parser is off or failed.
  if (text && (parsedIntent === 'cancel' || parsedIntent === 'decline' || CANCEL_RE.test(text))) return { out: cancelSignup(state), effects }
  if (ev.kind === 'callback' && ev.data === 'signup:cancel') return { out: cancelSignup(state), effects }

  if (state.step === 'consent') {
    // The tap is the same decision whichever way it arrives, and a second tap
    // on an already-consumed button must do nothing at all.
    const agreed = (ev.kind === 'callback' && ev.data === 'consent:yes') || parsedIntent === 'confirm'
    if (agreed) {
      state.step = 'name'; state.stepAt = nowMs; state.stepMiss = 0; state.reminded = 0
      out.push(msg(state.chatId, 'Как вас зовут?', { remove_keyboard: true }))
      return { out, effects }
    }
    if (parsedIntent === 'decline' || parsedIntent === 'cancel') return { out: cancelSignup(state), effects }
    if (text) {
      // Asking something is not failing to answer. The first version of this
      // counter cancelled a real person's form because his second message was
      // a question -- he got "Хорошо, отменил" in reply to "а заявки делаешь?".
      const asking = parsedIntent === 'question' || looksLikeQuestion(text)
      if (!asking) state.stepMiss = (state.stepMiss || 0) + 1
      // Remind twice, then let it go: seven turns of "нажмите «Согласен» выше"
      // is what a hostage situation looks like from the other side.
      // counted separately from misses: a question is not a miss, but a reminder
      // shown after every question is still nagging
      state.reminded = (state.reminded || 0) + 1
      const remind = state.reminded <= 2
      const chat = smallTalkReply(text, nowMs)
      if (chat) {
        out.push(msg(state.chatId, chat))
        if (remind) out.push(consentReminder(state))
        return { out, effects }
      }
      return { out, effects, needsModel: text, reprompt: remind ? consentReminderText() : null }
    }
    return { out, effects }
  }

  if (state.step === 'name') {
    if (!text) { out.push(msg(state.chatId, 'Напишите, пожалуйста, имя текстом.')); return { out, effects } }
    // "Марина. а родителям можно сидеть?" -- do not guess which part is the
    // name: answer the question, keep it for the administrator, ask again
    if (looksLikeQuestion(text) || text.length > 40 || /\d/.test(text)) {
      return { out, effects, needsModel: text, keepQuestion: true, reprompt: 'Напишите, пожалуйста, только имя: как к вам обращаться?' }
    }
    // "привет", "да", "ок", "хочу" typed at this step are replies to the bot,
    // not names -- one of them once landed in a real lead as the parent's name
    if (smallTalkReply(text, nowMs) || NOT_A_NAME.test(text)) {
      out.push(msg(state.chatId, 'Мяу, привет! 🐾 А как вас зовут? Напишите, пожалуйста, имя.'))
      return { out, effects }
    }
    state.draft.name = text.replace(/[.!,]+$/, '')
    state.step = 'age'; state.stepAt = nowMs
    out.push(msg(state.chatId, esc(state.draft.name) + ', сколько лет? Если записываете ребёнка, напишите его возраст, а если себя, то свой.', ageKeyboard()))
    return { out, effects }
  }

  if (state.step === 'age' || state.step === 'extra_age') {
    if (!text) { out.push(msg(state.chatId, 'Напишите возраст текстом или нажмите кнопку.', ageKeyboard())); return { out, effects } }
    const isAnswer = /\d/.test(text) || /взросл/i.test(text)
    if (/\?/.test(text)) {
      return { out, effects, needsModel: text, keepQuestion: true, reprompt: AGE_REPROMPT, repromptMarkup: ageKeyboard() }
    }
    if (!isAnswer) {
      // Anything with real words is a question, not a typo. Demanding a «?» or
      // six words swallowed «какие еще курсы есть» whole. And the form does not
      // cancel itself any more: it offers the button and lets the person decide.
      if (/[а-яё]{3,}/i.test(text)) {
        return { out, effects, needsModel: text, keepQuestion: true, reprompt: AGE_REPROMPT, repromptMarkup: ageKeyboard() }
      }
      out.push(msg(state.chatId, 'Напишите возраст цифрами (например, 7) или нажмите «Отмена».', ageKeyboard()))
      return { out, effects }
    }
    state.stepMiss = 0
    const age = text.slice(0, 60)
    // "92" went into a real lead as a child's age: any digit used to count as an
    // answer. Free wording still has to work ("7, в декабре 8" -> 7), so only the
    // first number is sanity-checked, and only against absurd values -- an adult
    // course has no upper bound worth guessing at.
    // Rejecting outright would be wrong -- an adult course has no upper age --
    // so an implausible number is queried once and accepted if repeated.
    const n = parseInt((text.match(/\d{1,3}/) || [])[0], 10)
    if (Number.isFinite(n) && (n < 3 || n > 75) && state.ageAsked !== n) {
      state.ageAsked = n
      out.push(msg(state.chatId, 'Уточню, чтобы не ошибиться: ' + esc(String(n)) + '? Если опечатка, напишите возраст ещё раз. Если всё верно, повторите то же число.', ageKeyboard()))
      return { out, effects }
    }
    state.ageAsked = null
    if (state.step === 'extra_age') {
      effects.push(addChildEffect(state, age, knowledge))
      state.step = null; state.draft = null
      out.push(msg(state.chatId, 'Добавил к вашей заявке: ' + esc(age) + '. Администратор расскажет про всех за один звонок.', mainKeyboard()))
      return { out, effects }
    }
    state.draft.age = age
    state.step = 'phone'; state.stepAt = nowMs
    // Show which group the age matches -- information, not a placement. It also
    // catches a typo ("8" for "18") while the lead can still be corrected.
    const fit = knowledge ? courseForAge(knowledge, age) : null
    if (fit) {
      out.push(msg(state.chatId, fit.sure
        ? 'По возрасту это группа «' + esc(fit.name) + '» (' + esc(fit.ageRange) + '): ' + esc(fit.desc)
        : 'По возрасту это ближе к группе «' + esc(fit.name) + '» (' + esc(fit.ageRange) + '), но возраст пограничный, так что точную группу подберёт педагог.'))
    }
    out.push(msg(state.chatId, 'Остался телефон. Нажмите кнопку ниже, номер подставится сам. Или напишите номер сообщением.', contactKeyboard()))
    return { out, effects }
  }

  if (state.step === 'phone') {
    let phone = null
    if (ev.kind === 'contact') phone = normPhone(ev.phone)
    else if (text) {
      phone = normPhone(text)
      if (!phone && looksLikeQuestion(text)) {
        return { out, effects, needsModel: text, keepQuestion: true, reprompt: 'И оставьте, пожалуйста, телефон, кнопкой или сообщением.', repromptMarkup: contactKeyboard() }
      }
    }
    if (!phone) {
      out.push(msg(state.chatId, 'Не получилось разобрать номер. Нажмите «Поделиться контактом» или напишите номер вида 8 900 123-45-67.', contactKeyboard()))
      return { out, effects }
    }
    state.draft.phone = phone
    state.step = 'confirm'; state.stepAt = nowMs
    out.push(msg(state.chatId, 'Проверьте, всё верно?\n\n👤 ' + esc(state.draft.name) + '\n' + personIcon(null, state.draft.age) + ' ' + esc(knowledge ? childLine(knowledge, state.draft.age) : state.draft.age) + '\n📞 ' + phone, inline([[['✅ Да, всё верно', 'confirm:yes'], ['✏️ Исправить', 'confirm:edit']]])))
    return { out, effects }
  }

  if (state.step === 'confirm') {
    if (ev.kind === 'callback' && ev.data === 'confirm:yes') {
      const lead = {
        id: 'L' + nowMs.toString(36).toUpperCase(),
        createdAt: new Date(nowMs).toISOString(),
        chatId: state.chatId,
        source: 'бот',
        name: state.draft.name,
        children: [knowledge ? childLine(knowledge, state.draft.age) : state.draft.age],
        phone: state.draft.phone,
        questions: state.draft.questions || [],
        status: 'новая',
      }
      effects.push({ type: 'leadSave', lead, isNew: true, notice: '🆕 Новая заявка' })
      state.lastLead = Object.assign({}, lead, { at: nowMs })
      state.step = null; state.draft = null
      out.push(msg(state.chatId, 'Готово, ' + esc(lead.name) + '! Заявка принята, администратор перезвонит на ' + lead.phone + ' в рабочее время (пн–пт, 15:00–21:00).', mainKeyboard()))
      return { out, effects }
    }
    if (ev.kind === 'callback' && ev.data === 'confirm:edit') {
      state.step = 'name'; state.stepAt = nowMs
      state.draft = { questions: state.draft.questions || [] }
      out.push(msg(state.chatId, 'Давайте заново. Как вас зовут?', { remove_keyboard: true }))
      return { out, effects }
    }
    if (text) return { out, effects, needsModel: text, keepQuestion: true, reprompt: 'Проверьте данные выше и нажмите «Да, всё верно» или «Исправить».' }
    return { out, effects }
  }

  state.step = null
  return { out, effects }
}

// ---------------------------------------------------------------- admin side

function adminLeadText(lead) {
  const many = (lead.children || []).length > 1
  const kids = (lead.children || []).map((c, i) => personIcon(null, c) + ' ' + (many ? (i + 1) + ') ' : '') + esc(c)).join('\n')
  const q = (lead.questions || []).length ? '\n❓ ' + lead.questions.map(esc).join('\n❓ ') : ''
  const nudge = lead.nudges ? '\n⏰ Напоминал(а) о себе: ' + lead.nudges + ' раз' : ''
  return '<b>Заявка на курс</b> · ' + esc(lead.source) + '\n👤 ' + esc(lead.name) + '\n' + kids + '\n📞 ' + esc(lead.phone) + q + nudge + (lead.status ? '\n\nСтатус: <b>' + esc(lead.status) + '</b>' : '')
}

// Rewrites the "Статус:" line of an admin notification in place, working on
// the plain text Telegram sends back along with the button press.
function withStatusLine(text, status, by) {
  const line = 'Статус: ' + status + (by ? ' (' + by + ')' : '')
  const lines = String(text || '').split('\n')
  const i = lines.findIndex((l) => l.indexOf('Статус:') === 0)
  if (i === -1) lines.push('', line)
  else lines[i] = line
  return lines.join('\n')
}

function adminLeadKeyboard(leadId) {
  return inline([
    [['📞 Позвонили', 'lead:' + leadId + ':позвонили'], ['🔕 Не дозвонились', 'lead:' + leadId + ':не дозвонились']],
    [['✅ Записан', 'lead:' + leadId + ':записан']],
  ])
}

// ---------------------------------------------------------------- router

// Decide what to do with one incoming event. Pure: takes state, returns the
// next state plus what n8n has to perform (messages, storage effects, and at
// most one model call). If res.model is set, n8n calls the model and passes
// the raw reply to afterModel(), which finishes the turn.
function decide(ev, stateIn, globalIn, knowledge, cfg) {
  const nowMs = cfg.nowMs
  const adminChatId = cfg.adminChatId ? String(cfg.adminChatId) : ''
  const res = { state: null, global: globalIn || null, out: [], effects: [], model: null, answerCallback: null }

  if (ev.kind === 'ignore') return res

  // Telegram resends an update when the webhook times out or errors. Without
  // this the resend is handled as a brand-new message: a second lead, a second
  // model call, a duplicate reply. Ids are kept per chat, a short ring is
  // enough because a resend follows within seconds.
  if (ev.updateId != null && stateIn && Array.isArray(stateIn.seen) && stateIn.seen.indexOf(ev.updateId) !== -1) {
    return res
  }

  // admin group: status buttons and a helper to find the chat id during setup
  if (ev.chatType === 'group' || ev.chatType === 'supergroup') {
    if (ev.kind === 'text' && /^\/id(@\w+)?$/.test(ev.text)) res.out.push(msg(ev.chatId, 'ID этого чата: <code>' + ev.chatId + '</code>'))
    if (ev.kind === 'callback' && ev.data.indexOf('lead:') === 0 && String(ev.chatId) === adminChatId) {
      const parts = ev.data.split(':')
      const status = parts.slice(2).join(':')
      res.effects.push({ type: 'leadStatus', leadId: parts[1], status, by: ev.firstName, adminChatId: ev.chatId, adminMessageId: ev.messageId, text: withStatusLine(ev.messageText, status, ev.firstName) })
      res.answerCallback = { callback_query_id: ev.callbackId, text: 'Статус: ' + parts.slice(2).join(':') }
    } else if (ev.kind === 'callback') {
      res.answerCallback = { callback_query_id: ev.callbackId }
    }
    return res
  }

  // Two-phase, exactly like the answering call: when the parser is switched on
  // and this turn has not been parsed yet, decide() stops here and hands the
  // request back. The workflow calls the model, then calls decide() again with
  // cfg.parsed filled in. Nothing is mutated on the first pass.
  if (cfg.useParser && cfg.parsed === undefined && ev.kind === 'text' && !isButtonLabel(ev.text)) {
    const prev = freshState(stateIn, ev.chatId, nowMs)
    res.parse = {
      messages: parserMessages(ev.text, prev.history, hasOpenLead(prev, nowMs), prev.step || null, prev.lastTopics || null),
      schema: parserSchema(),
      userText: ev.text,
    }
    res.state = null
    return res
  }

  const s = freshState(stateIn, ev.chatId, nowMs)
  res.state = s
  if (ev.updateId != null) s.seen = (Array.isArray(s.seen) ? s.seen : []).concat([ev.updateId]).slice(-10)
  if (ev.kind === 'callback') res.answerCallback = { callback_query_id: ev.callbackId }

  // mid-signup: the scenario owns the conversation
  if (s.step) {
    const r = signupStep(s, ev, nowMs, knowledge, cfg.parsed ? cfg.parsed.intent : null)
    res.out.push(...r.out)
    res.effects.push(...r.effects)
    if (r.needsModel) {
      if (r.keepQuestion && s.draft) s.draft.questions = (s.draft.questions || []).concat([r.needsModel.slice(0, 200)])
      return requestModel(res, s, knowledge, nowMs, r.needsModel, { reprompt: r.reprompt, repromptMarkup: r.repromptMarkup, inSignup: true }, cfg.topics)
    }
    return res
  }

  if (ev.kind === 'callback') {
    if (ev.data === 'signup:start') { runSignupStart(res, s, nowMs, null, knowledge); return res }
    if (ev.data === 'signup:extra') { runSignupStart(res, s, nowMs, 'extra', knowledge); return res }
    if (ev.data === 'signup:new') { runSignupStart(res, s, nowMs, 'new', knowledge); return res }
    if (ev.data === 'mylead:keep') { res.out.push(msg(s.chatId, 'Хорошо, заявка остаётся, администратор перезвонит 🐾', mainKeyboard())); return res }
    if (ev.data === 'mylead:cancel') {
      if (s.lastLead && !s.lastLead.cancelled) {
        s.lastLead.cancelled = true
        const copy = Object.assign({}, s.lastLead)
        delete copy.at
        delete copy.status
        res.effects.push({ type: 'leadCancel', lead: copy })
        res.out.push(msg(s.chatId, 'Заявку отменил. Передумаете, кнопка «Записаться на курс» внизу 🐾', mainKeyboard()))
      }
      return res
    }
    // a button from an old message, pressed after the signup it belonged to
    // was finished, cancelled or expired
    if (/^(consent|confirm):/.test(ev.data)) res.out.push(msg(s.chatId, 'Эта запись уже неактуальна. Чтобы оставить заявку, нажмите «Записаться на курс» внизу.', mainKeyboard()))
    return res
  }

  if (ev.kind === 'voice') { res.out.push(msg(s.chatId, 'Пока я понимаю только текст, напишите, пожалуйста, словами 🙏', mainKeyboard())); return res }
  if (ev.kind === 'other' || ev.kind === 'contact') { res.out.push(msg(s.chatId, 'Напишите вопрос текстом или выберите кнопку внизу 👇', mainKeyboard())); return res }

  const t = ev.text
  if (/^\/start/.test(t)) {
    res.out.push(msg(s.chatId, 'Мяу, привет! 🐾 Я кот молодёжного театра «Ключ», живу за кулисами и знаю тут всё.\n\nПодскажу афишу и билеты, расскажу про курсы и запишу на них. Жмите кнопки внизу или просто спросите.', mainKeyboard()))
    return res
  }
  const chat = smallTalkReply(t, nowMs)
  if (chat) { res.out.push(msg(s.chatId, chat, mainKeyboard())); return res }
  if (t === BTN.afisha || /^\/afisha/.test(t)) { res.out.push(msg(s.chatId, afishaText(knowledge, nowMs), mainKeyboard())); return res }
  if (t === BTN.tickets) { res.out.push(msg(s.chatId, ticketsText(knowledge, nowMs), mainKeyboard())); return res }
  if (t === BTN.courses) { res.out.push(msg(s.chatId, coursesText(knowledge), inline([[['✍️ Записаться', 'signup:start']]]))); return res }
  if (t === BTN.address) { res.out.push(msg(s.chatId, contactsText(), mainKeyboard())); return res }
  if (t === BTN.signup) { runSignupStart(res, s, nowMs, null, knowledge); return res }
  if (t === BTN.human) { humanRequest(res.out, res.effects, s); return res }

  // Clear intents are caught in code, before the model: free, instant, and
  // they never depend on the model remembering to put a marker. Anything with
  // a question in it still goes to the model, which answers first.
  // A parsed label replaces the pile of keyword regexps below. It is only acted
  // on when the current state allows that action -- the label is probabilistic,
  // the gate is not.
  const parsed = cfg.parsed || null
  if (parsed) {
    if (parsed.age != null) s.pendingAge = String(parsed.age)
    s.lastTopics = parsed.topics && parsed.topics.length ? parsed.topics : s.lastTopics
    // A label is a guess. Acting on a guess is only safe when the person asked
    // for the action outright -- «запишите меня». A question about the same
    // subject («а заявки делаешь?») gets an answer and a button, so a misread
    // costs an ignored button instead of hijacking the conversation.
    // «давай» right after the bot offered a signup is a yes to that offer. The
    // parser sees a bare confirmation, the model got the turn instead, and it
    // wrote "оформляю заявку, форма откроется" while nothing opened.
    if (offerStillOpen(s, nowMs) && (parsed.intent === 'confirm' || parsed.intent === 'signup')) {
      s.signupOfferedAt = 0
      s.pendingExtra = false
      runSignupStart(res, s, nowMs, null, knowledge)
      return res
    }
    const act = parsed.wantsAction && intentAllowed(parsed.intent, s, nowMs)
    if (act && parsed.intent === 'cancel') { cancelLeadAsk(res.out, s); return res }
    if (act && parsed.intent === 'add_child') { s.pendingExtra = true; runSignupStart(res, s, nowMs, 'extra', knowledge); return res }
    if (act && parsed.intent === 'signup') { s.pendingExtra = false; runSignupStart(res, s, nowMs, null, knowledge); return res }
    if (parsed.intent === 'complaint' || (parsed.intent === 'human' && parsed.wantsAction)) { humanRequest(res.out, res.effects, s); return res }
    // everything else is answered, with the button that matches what was asked
    const offer = parsed.intent === 'signup' || parsed.intent === 'add_child' ? (hasOpenLead(s, nowMs) ? 'extra' : 'signup') : null
    // Four pages fit in the prompt whole. Routing saved about a rouble a question
    // and cost the bot its memory of the festival, the camp and the lab when a
    // follow-up landed on the wrong topic -- a bad trade at this size. It comes
    // back on when the handbook outgrows the prompt, not before.
    const topics = CFG.routeKnowledge && parsed.topics && parsed.topics.length ? parsed.topics : null
    return requestModel(res, s, knowledge, nowMs, t, { offer, parserDecided: true }, topics)
  }

  const words = t.split(/\s+/).length
  // the same yes-to-the-offer when the parser is down
  if (offerStillOpen(s, nowMs) && words <= 3 && YES_TO_OFFER.test(t)) {
    s.signupOfferedAt = 0
    s.pendingExtra = false
    runSignupStart(res, s, nowMs, null, knowledge)
    return res
  }
  // checked before signup: "отмена заявки" contains "заявк" too
  if (CANCEL_RE.test(t)) { cancelLeadAsk(res.out, s); return res }
  // a short "как записаться?" is not a question worth a model call -- the
  // answer to it is the form itself
  if (SIGNUP_WORDS.test(t) && (words <= 5 || (!/\?/.test(t) && words <= 8))) {
    s.pendingAge = extractAge(t)
    s.pendingExtra = ANOTHER_CHILD.test(t)
    runSignupStart(res, s, nowMs, null, knowledge)
    return res
  }
  if (/(^|\s)(не|никто\s+не)\s+(по|пере)?звон/i.test(t) || /^(позовите|позвать|дайте)\s+(админ|человек|менеджер|оператор)/i.test(t)) {
    humanRequest(res.out, res.effects, s)
    return res
  }

  return requestModel(res, s, knowledge, nowMs, t, {}, cfg.topics)
}

function humanRequest(out, effects, s) {
  if (s.lastLead && !s.lastLead.cancelled) {
    s.lastLead.nudges = (s.lastLead.nudges || 0) + 1
    effects.push(leadSaveEffect(s.lastLead, '⏰ Напоминает о себе, ждёт звонка'))
    out.push(msg(s.chatId, 'Вижу вашу заявку и уже напомнил администратору, что вы ждёте звонка. Звонят в рабочее время: пн–пт, 15:00–21:00.\n\nЕсли не хотите ждать, позвоните сами: +7 906 120-22-62.', mainKeyboard()))
    return
  }
  out.push(msg(s.chatId, 'Администратор на связи по телефону: +7 906 120-22-62 (пн–пт, 15:00–21:00).\n\nИли оставьте заявку, и вам перезвонят.', inline([[['✍️ Оставить заявку', 'signup:start']]])))
}

function requestModel(res, s, knowledge, nowMs, text, ctx, topics) {
  const day = todayIso(nowMs)
  const g = Object.assign({ day, llm: 0, alerted: false }, res.global || {})
  if (g.day !== day) { g.day = day; g.llm = 0; g.alerted = false }
  res.global = g

  const globalHit = g.llm >= CFG.maxLlmGlobalPerDay
  if (globalHit || s.llmDay >= CFG.maxLlmPerChatPerDay || s.llmMinute.length >= CFG.maxLlmPerChatPerMinute) {
    if (globalHit && !g.alerted) {
      g.alerted = true
      res.effects.push({ type: 'devAlert', text: 'Бот «Ключ»: достигнут дневной лимит обращений к модели (' + CFG.maxLlmGlobalPerDay + '). Бот отвечает только кнопками до завтра.' })
    }
    res.out.push(msg(s.chatId, 'Столько вопросов за раз я уже не унесу, мяу. Кнопки внизу работают, а на всё остальное лучше ответит администратор: +7 906 120-22-62 (пн–пт, 15:00–21:00).', mainKeyboard()))
    if (ctx.reprompt) res.out.push(msg(s.chatId, ctx.reprompt, ctx.repromptMarkup))
    return res
  }

  s.llmDay += 1
  s.llmMinute.push(nowMs)
  g.llm += 1
  res.model = { messages: buildModelRequest(knowledge, nowMs, s.history, text, topics), userText: String(text).slice(0, CFG.maxInputChars), ctx }
  return res
}

// Second half of a turn that needed the model. Mutates res.state.
// "Без возрастных ограничений" about a show whose age the theatre has not sent
// is a legal claim nobody made. The prompt forbids it and the model still said
// it live, about «Бесконечный апрель». No show in the data is 0+, so the
// phrase is always wrong and is replaced outright.
function noInventedAllAges(text) {
  return String(text)
    .replace(/без\s+возрастн[а-яё]*\s+ограничени[а-яё]*/gi, 'возраст уточнит администратор')
    .replace(/для\s+(всех\s+возрастов|любого\s+возраста)/gi, 'возраст уточнит администратор')
}

// Model text -> Telegram HTML. Escaping comes first, so nothing the model
// writes can become markup; only what is added here can. Show titles go bold,
// taken from the data rather than from every «…», so «НУР» stays plain.
function prettyReply(text, knowledge) {
  // a lone emoji on its own line (the model ends a list with "\n\n🎭") joins
  // the line above instead of hanging there as a paragraph of its own
  const lines = []
  for (const line of String(text).replace(/^[ \t]*[-*][ \t]+/gm, '• ').split('\n')) {
    // ...and so does a lone "мяу 🐾", which read like a broken-off paragraph
    if (line.trim() && /^[\s\p{Extended_Pictographic}️‍]*((мяу|мур)[-\s]*)*[!.\s\p{Extended_Pictographic}️‍]*$/iu.test(line)) {
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
      if (lines.length) { lines[lines.length - 1] = lines[lines.length - 1].trimEnd() + ' ' + line.trim(); continue }
    }
    lines.push(line)
  }
  let html = esc(lines.join('\n'))
  const titles = new Set()
  for (const sh of (knowledge && knowledge.shows) || []) if (sh.title) titles.add(String(sh.title))
  for (const a of (knowledge && knowledge.afisha) || []) if (a.title) titles.add(String(a.title))
  for (const t of titles) {
    const safe = esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    html = html.replace(new RegExp('«' + safe + '»', 'gi'), (m) => '<b>' + m + '</b>')
  }
  return html
}

function afterModel(res, rawReply, nowMs, knowledge) {
  const s = res.state
  const parsed = parseModelReply(rawReply)
  // "27 сентября 2026" -> "27 сентября": nobody writes the current year, and it
  // reads like a document. Next year's dates keep theirs.
  const thisYear = todayIso(nowMs).slice(0, 4)
  const text = noInventedAllAges(parsed.text).replace(new RegExp('(\\d{1,2}[^\\S\\n]+(?:' + MONTHS_GEN.join('|') + '))[^\\S\\n]+' + thisYear + '(?:[^\\S\\n]*(?:г\\.|года))?', 'g'), '$1')
  const markers = parsed.markers
  const html = prettyReply(text, knowledge)
  const ctx = res.model.ctx || {}
  const out = []
  const effects = []

  pushHistory(s, 'user', res.model.userText)
  pushHistory(s, 'assistant', text)
  if (markers.unknown) effects.push({ type: 'unanswered', chatId: s.chatId, question: res.model.userText, at: new Date(nowMs).toISOString() })

  if (ctx.inSignup) {
    // One message, not two: a separate re-prompt could arrive after the next
    // turn had already been answered, and the person saw "И сколько лет?"
    // right below "Хорошо, отменил".
    const body = (html || 'Это уточнит администратор, когда перезвонит.') + (ctx.reprompt ? '\n\n' + ctx.reprompt : '')
    out.push(msg(s.chatId, body, ctx.repromptMarkup))
    return { out, effects }
  }
  // A reply that talks about filing a signup must come with the way to do it.
  // The model decides what to say, the code decides what happens, and the two
  // parted ways live: "форма откроется сразу в чате", and nothing opened.
  const promisesForm = /(оформ\S*|остав\S*|пода\S*)\s+(\S+\s+)?заявк|форм\S*\s+(\S+\s+)?(откро|появ)|запис\S*\s+можно\s+(прямо\s+)?(здесь|тут|в\s+чате)/i.test(text)
  const offer = ctx.offer || (promisesForm && !ctx.inSignup ? (hasOpenLead(s, nowMs) ? 'extra' : 'signup') : null)
  if (offer) s.signupOfferedAt = nowMs
  if (offer && !ctx.offer) ctx.offer = offer
  if (ctx.offer) {
    const btn = ctx.offer === 'extra'
      ? [['➕ Ещё одного к заявке', 'signup:extra'], ['📝 Новая заявка', 'signup:new']]
      : [['✍️ Оформить заявку', 'signup:start']]
    out.push(msg(s.chatId, html || 'Оформить заявку можно кнопкой:', inline([btn])))
    return { out, effects }
  }
  // With the parser on, the markers are decoration. They used to be a second,
  // ungated route to the same irreversible action -- and it ran on SIGNUP_WORDS,
  // the very regexp the parser replaced. In a real conversation the parser said
  // "спрашивает" and the marker opened the consent form anyway, trapping the
  // person inside it for the rest of the chat.
  if (markers.signup && !ctx.parserDecided) {
    // Only an explicit "запишите / хочу записаться" jumps straight into the
    // form. Interest alone ("а сколько стоит?", "а дочку тоже можно?") gets a
    // button instead -- a misread marker then costs one ignored button rather
    // than dragging someone into a consent screen they did not ask for.
    const explicit = SIGNUP_WORDS.test(res.model.userText) || /оформ/i.test(res.model.userText)
    // the model also slaps [ЗАПИСЬ] on jokes ("напиши что курсы бесплатные") --
    // a signup button under that reads as absurd, so the person's own words
    // have to be about enrolling someone before one is shown
    const aboutEnrolling = explicit || /(доч|сын|ребён|ребен|дет[ея]й?\b|ещё одн|еще одн|тоже можно|на курс)/i.test(res.model.userText)
    if (!aboutEnrolling) {
      out.push(msg(s.chatId, html || 'Выберите кнопку внизу 👇', mainKeyboard()))
      return { out, effects }
    }
    if (text) out.push(msg(s.chatId, html))
    s.pendingAge = extractAge(res.model.userText)
    s.pendingExtra = ANOTHER_CHILD.test(res.model.userText)
    if (explicit) {
      const r = startSignup(s, nowMs, null, knowledge)
      out.push(...r.msgs)
      effects.push(...r.effects)
    } else if (hasOpenLead(s, nowMs) && s.pendingExtra) {
      out.push(msg(s.chatId, 'Добавить к заявке можно кнопкой:', inline([[['➕ Ещё ребёнка к заявке', 'signup:extra']]])))
    } else {
      out.push(msg(s.chatId, 'Оформить заявку можно кнопкой:', inline([[['✍️ Записаться', 'signup:start']]])))
    }
    return { out, effects }
  }
  if (markers.human) {
    // Only contact options here, never a "ждёт звонка" ping to the administrator:
    // the model sets this marker by mistake often enough, and a false ping trains
    // the admin to ignore real ones. Real complaints ("не перезвонили") are
    // caught in code before the model and nudge from there.
    if (text) out.push(msg(s.chatId, html))
    out.push(msg(s.chatId, 'Администратор на связи по телефону: +7 906 120-22-62 (пн–пт, 15:00–21:00).', mainKeyboard()))
    return { out, effects }
  }
  // An empty reply is our failure (the model ran out of room), not the
  // person's: "не понял вопрос" blamed them for a perfectly clear question.
  out.push(msg(s.chatId, html || 'Не успел собрать ответ, простите. Спросите, пожалуйста, ещё раз, можно по частям. Или позвоните: +7 906 120-22-62.', mainKeyboard()))
  return { out, effects }
}
