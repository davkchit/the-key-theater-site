// Leads to a file for Excel.
//
//   npm run leads                       all leads -> bot/data/заявки-ГГГГ-ММ-ДД.csv
//   npm run leads -- --from=2026-09-01  from a date
//   npm run leads -- --out=D:/заявки.csv
//
// Reads the bot's database directly, so it works whether the bot is running
// or not. The file is UTF-8 with ";" between columns: opens in Excel as is.

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { loadEnv, repoRoot } from '../scripts/env.mjs'
import { leadsCsv } from './csv.mjs'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const env = { ...loadEnv(), ...process.env }
const dataDir = path.resolve(env.BOT_DATA_DIR || path.join(repoRoot, 'bot/data'))
const dbFile = path.join(dataDir, 'kluch.sqlite')
if (!fs.existsSync(dbFile)) {
  console.error('базы заявок ещё нет: ' + dbFile)
  process.exit(1)
}

const from = args.from ? new Date(args.from + 'T00:00:00+03:00').toISOString() : ''
const db = new DatabaseSync(dbFile, { readOnly: true })
const csv = leadsCsv(db, from)
db.close()

const out = args.out || path.join(dataDir, 'заявки-' + new Date().toISOString().slice(0, 10) + '.csv')
fs.writeFileSync(out, csv.text)
console.log(`заявок: ${csv.count} → ${out}`)
