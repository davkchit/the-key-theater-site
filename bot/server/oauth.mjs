// Login to the site's admin (Decap CMS) without Netlify.
//
// Decap saves content to GitHub, and getting a GitHub token needs a client
// secret that cannot live in the browser. These two routes do that one
// exchange on our server:
//
//   GET /api/oauth/auth       sends the editor to GitHub's login page
//   GET /api/oauth/callback   GitHub comes back here; the token is handed to
//                             the admin window with postMessage, the protocol
//                             Decap's GitHub backend expects
//
// Setup, once: GitHub -> Settings -> Developer settings -> OAuth Apps -> New.
//   Homepage URL:           https://<site>
//   Authorization callback: https://<site>/api/oauth/callback
// Then in .env.bot: GITHUB_OAUTH_ID=<Client ID>, GITHUB_OAUTH_SECRET=<secret>,
// and in public/admin/config.yml: base_url: https://<site>, auth_endpoint: api/oauth/auth

import crypto from 'node:crypto'

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Decap's handshake: the popup says "authorizing:github", the admin window
// answers, and only then the popup sends the result to exactly that origin.
function finishPage(status, content) {
  const message = 'authorization:github:' + status + ':' + JSON.stringify(content)
  return `<!doctype html><meta charset="utf-8"><title>Вход в админку</title>
<p style="font:16px Arial,sans-serif">${status === 'success' ? 'Готово, окно закроется само.' : 'Не получилось войти: ' + esc(content.message || '')}</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  function receive(e) {
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  if (window.opener) window.opener.postMessage('authorizing:github', '*');
})();
</script>`
}

export function createOauth({ env, log, fetchImpl = fetch }) {
  const id = env.GITHUB_OAUTH_ID
  const secret = env.GITHUB_OAUTH_SECRET
  // state ties the callback to a login this server started (CSRF)
  const states = new Map()

  function send(res, status, headers, body) {
    res.writeHead(status, headers)
    res.end(body)
  }

  async function handle(req, res, url) {
    if (!id || !secret) return send(res, 503, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Вход в админку не настроен: нужны GITHUB_OAUTH_ID и GITHUB_OAUTH_SECRET')

    if (url === '/api/oauth/auth') {
      const state = crypto.randomBytes(16).toString('hex')
      states.set(state, Date.now())
      for (const [k, t] of states) if (Date.now() - t > 10 * 60e3) states.delete(k)
      const q = new URLSearchParams({ client_id: id, scope: 'repo,user', state })
      return send(res, 302, { Location: 'https://github.com/login/oauth/authorize?' + q }, '')
    }

    if (url === '/api/oauth/callback') {
      const q = new URL(req.url, 'http://x').searchParams
      const state = q.get('state') || ''
      const code = q.get('code') || ''
      const html = { 'Content-Type': 'text/html; charset=utf-8' }
      if (!states.has(state)) return send(res, 400, html, finishPage('error', { message: 'вход устарел, откройте админку заново' }))
      states.delete(state)
      try {
        const r = await fetchImpl('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id: id, client_secret: secret, code }),
          signal: AbortSignal.timeout(15000),
        })
        const j = await r.json()
        if (!j.access_token) throw new Error(j.error_description || j.error || 'GitHub не выдал токен')
        return send(res, 200, html, finishPage('success', { token: j.access_token, provider: 'github' }))
      } catch (e) {
        log('вход в админку не удался:', e.message)
        return send(res, 502, html, finishPage('error', { message: e.message }))
      }
    }

    send(res, 404, { 'Content-Type': 'text/plain' }, '')
  }

  return { handle }
}
