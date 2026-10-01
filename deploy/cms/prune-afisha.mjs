// Shows long past pile up at the top of «Афиша» in the admin (it is one list
// in date order), and the theatre scrolls past them to every new date. This
// drops the ones older than three months; recent ones stay, the review card
// (src/lib/reviewNudge.ts) looks at them. Runs before each build (rebuild.sh);
// prints what it removed.
//
//   node deploy/cms/prune-afisha.mjs [path to afisha.json]
import fs from 'node:fs'

const file = process.argv[2] || 'src/content/afisha.json'
const KEEP_DAYS = 90

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString().slice(0, 10)
const old = data.items.filter((i) => typeof i.date === 'string' && i.date < cutoff)
if (old.length) {
  data.items = data.items.filter((i) => !old.includes(i))
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  for (const i of old) console.log(`${i.date} ${i.title}`)
}
