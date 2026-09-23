// Serves public/ on :4173 so the bot can fetch knowledge.json while everything
// runs on one machine. On a real deployment this is just the site itself.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { repoRoot } from './env.mjs'

const root = path.join(repoRoot, 'public')
const types = { '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' }

http.createServer((req, res) => {
  const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '')
  const file = path.join(root, rel)
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    return res.end('нет такого файла')
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(4173, '127.0.0.1', () => console.log('public/ на http://127.0.0.1:4173 (knowledge.json оттуда)'))
