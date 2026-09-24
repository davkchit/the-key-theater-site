// Everything the bot remembers, in one SQLite file on the server (Russia, so
// the applicants' names and phones stay inside the country: 152-FZ).
//
// The tables mirror the four n8n data tables the bot used before, column for
// column, so moving over is copying rows and nothing else.

import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export function openStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true })
  const db = new DatabaseSync(path.join(dataDir, 'kluch.sqlite'))
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS chats (
      chat_id TEXT PRIMARY KEY, state TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS leads (
      lead_id TEXT PRIMARY KEY, created_at TEXT, updated_at TEXT,
      status TEXT DEFAULT 'новая', status_by TEXT DEFAULT '',
      chat_id TEXT, source TEXT, name TEXT, phone TEXT,
      children TEXT, questions TEXT, nudges TEXT, direction TEXT, answers TEXT
    );
    CREATE TABLE IF NOT EXISTS unanswered (
      id INTEGER PRIMARY KEY AUTOINCREMENT, asked_at TEXT, chat_id TEXT, question TEXT
    );
    CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
  `)

  // a database made before directions existed has no such columns
  const have = db.prepare('PRAGMA table_info(leads)').all().map((c) => c.name)
  for (const col of ['direction', 'answers']) if (!have.includes(col)) db.exec('ALTER TABLE leads ADD COLUMN ' + col + ' TEXT')

  const q = {
    getChat: db.prepare('SELECT state FROM chats WHERE chat_id = ?'),
    putChat: db.prepare(
      'INSERT INTO chats (chat_id, state, updated_at) VALUES (?, ?, ?) ON CONFLICT(chat_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at',
    ),
    getKv: db.prepare('SELECT v FROM kv WHERE k = ?'),
    putKv: db.prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v'),
    status: db.prepare('UPDATE leads SET status = ?, status_by = ?, updated_at = ? WHERE lead_id = ?'),
    unanswered: db.prepare('INSERT INTO unanswered (asked_at, chat_id, question) VALUES (?, ?, ?)'),
  }

  // A saved lead row carries only the columns the turn touched: a re-save of an
  // existing lead must not reset its status back to "новая".
  const KEEP_ON_UPDATE = new Set(['lead_id', 'created_at', 'status', 'status_by'])
  function saveLead(row) {
    const cols = Object.keys(row)
    const updates = cols.filter((c) => !KEEP_ON_UPDATE.has(c)).map((c) => `${c} = excluded.${c}`)
    const sql =
      `INSERT INTO leads (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')}) ` +
      `ON CONFLICT(lead_id) DO UPDATE SET ${updates.join(', ')}`
    db.prepare(sql).run(...cols.map((c) => row[c]))
  }

  return {
    db,
    getChat(chatId) {
      const r = q.getChat.get(String(chatId))
      if (!r) return null
      try { return JSON.parse(r.state) } catch { return null }
    },
    getKv(k) {
      const r = q.getKv.get(k)
      if (!r) return null
      try { return JSON.parse(r.v) } catch { return null }
    },
    putKv(k, v) { q.putKv.run(k, JSON.stringify(v)) },
    // one turn's writes go in together or not at all: a half-saved turn would
    // leave a lead without its chat state (or the reverse)
    commit(plan) {
      db.exec('BEGIN')
      try {
        for (const c of plan.chats) q.putChat.run(c.chat_id, c.state, c.updated_at)
        for (const l of plan.leads) saveLead(l)
        for (const s of plan.statuses) q.status.run(s.status, s.status_by, s.updated_at, s.lead_id)
        for (const u of plan.unanswered) q.unanswered.run(u.asked_at, u.chat_id, u.question)
        db.exec('COMMIT')
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
    close() { db.close() },
  }
}
