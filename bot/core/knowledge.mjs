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
  }))

  const courses = read('src/content/courses.json').items.map((c) => ({
    name: c.name,
    ageRange: c.ageRange,
    desc: c.desc,
    ...(c.price ? { price: c.price } : {}),
  }))

  const faq = parseFaq(fs.readFileSync(path.join(repoRoot, 'bot/core/faq.md'), 'utf8'))

  const base = { builtAt: new Date().toISOString(), afisha, shows, courses, faq, source: 'site' }
  // Temporary: while the theatre decides between keeping the CMS up to date and
  // sending Word files, the files in bot/docs win. KNOWLEDGE_SOURCE=site brings
  // the site back without deleting anything.
  if (process.env.KNOWLEDGE_SOURCE !== 'site' && docsPresent(repoRoot)) {
    const { knowledge, report } = knowledgeFromDocs(repoRoot, base, nowMs)
    return { ...knowledge, docsReport: report }
  }
  return base
}

// faq.md is split into labelled sections ("## [tickets] Билеты") so a turn can
// carry only the sections it needs instead of the whole file. Sending everything
// is paid for on every single call, and the file only grows as the theatre
// confirms more facts.
//
// A label starting with "!" marks a section that is not a fact but a limit on
// what the bot may say -- those always go into the prompt, whatever the topic.
// A section without a label would silently glue itself onto the previous one
// and start being served under the wrong topic; a section that grows past a
// page defeats the point of splitting at all. Both fail the build instead,
// because neither is visible in the bot's behaviour until someone complains.
const MAX_SECTION_CHARS = 1800

function checkFaq(md, sections) {
  const problems = []
  if (!sections.length) problems.push('в faq.md нет ни одного помеченного раздела «## [id] Заголовок»')
  const unlabelled = md.split('\n').filter((l) => /^## /.test(l) && !/^## \[/.test(l))
  for (const l of unlabelled) problems.push(`раздел без метки: «${l.trim()}» — добавьте «## [id] ...»`)
  const seen = new Set()
  for (const s of sections) {
    if (seen.has(s.id)) problems.push(`метка «${s.id}» встречается дважды`)
    seen.add(s.id)
    if (!/^[a-z0-9_-]+$/.test(s.id)) problems.push(`метка «${s.id}» должна быть латиницей в нижнем регистре`)
    if (s.body.length > MAX_SECTION_CHARS) problems.push(`раздел «${s.id}» разросся до ${s.body.length} знаков (предел ${MAX_SECTION_CHARS}) — разрежьте на две темы`)
  }
  if (!sections.some((s) => s.always)) problems.push('нет раздела с меткой «!» — список запретов обязателен')
  if (problems.length) throw new Error('faq.md:\n  - ' + problems.join('\n  - '))
}

export function parseFaq(md) {
  const sections = parseFaqSections(md)
  checkFaq(md, sections)
  return sections
}

function parseFaqSections(md) {
  return md.split(/^## \[/m).slice(1).map((part) => {
    const nl = part.indexOf('\n')
    const head = nl === -1 ? part : part.slice(0, nl)
    const close = head.indexOf(']')
    const raw = head.slice(0, close).trim()
    return {
      id: raw.replace(/^!/, ''),
      always: raw.startsWith('!'),
      title: head.slice(close + 1).trim(),
      body: (nl === -1 ? '' : part.slice(nl + 1)).trim(),
    }
  })
}
