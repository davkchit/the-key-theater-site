// Writes public/knowledge.json so the bot's knowledge ships with the site.
//
//   node bot/scripts/publish-knowledge.mjs
//
// Runs as part of `npm run build`, which is the point: the file is produced by
// the same build that produces the pages, so the bot cannot know anything the
// site does not show. The bot fetches it periodically instead of carrying a
// snapshot baked in at deploy time -- that snapshot was the reason a show added
// by the theatre would appear on the site and stay invisible to the bot.

import fs from 'node:fs'
import path from 'node:path'
import { buildKnowledge } from '../core/knowledge.mjs'
import { repoRoot } from './env.mjs'

const out = path.join(repoRoot, 'public/knowledge.json')
const knowledge = buildKnowledge(repoRoot)
fs.writeFileSync(out, JSON.stringify(knowledge))

const kb = (fs.statSync(out).size / 1024).toFixed(1)
console.log(`public/knowledge.json: ${knowledge.afisha.length} показов, ${knowledge.shows.length} спектаклей, ${knowledge.courses.length} курса, ${knowledge.faq.length} разделов справки · ${kb} КБ`)
console.log(`версия: ${knowledge.builtAt}`)
if (knowledge.source === 'docs') {
  const r = knowledge.docsReport
  console.log(`источник: документы театра в bot/docs (афиша из плана: ${r.shows} показов, занятий групп: ${r.classes})`)
  // a line the parser could not place is shown, never silently dropped
  if (r.unknown.length) console.log('⚠ строки плана, которые не удалось разобрать:\n  ' + r.unknown.join('\n  '))
} else {
  console.log('источник: сайт (CMS)')
}
