// Telegram Bot API over fetch. Two things beyond a plain call, both learned
// from the live bot: every call has a hard timeout (a hung long poll froze the
// old bridge with messages piling up unseen), and a message Telegram refuses to
// parse as HTML is sent again as plain text instead of being lost.

export function createTelegram(token, redact, log) {
  const base = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'
  const url = (method) => `${base}/bot${token}/${method}`

  async function call(method, body, timeoutMs = 15000) {
    const r = await fetch(url(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(timeoutMs),
    })
    return r.json()
  }

  const plain = (html) =>
    String(html || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

  // Sends one item of a turn's plan. Never throws: a failed send is logged and
  // the rest of the turn still goes out.
  async function send(item) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let r = await call(item.method, item.payload)
        if (r.ok) return true
        if (r.error_code === 429) {
          await new Promise((res) => setTimeout(res, ((r.parameters && r.parameters.retry_after) || 2) * 1000 + 200))
          continue
        }
        if (r.error_code === 400 && /parse entities/i.test(r.description || '') && item.payload.parse_mode) {
          const p = { ...item.payload, text: plain(item.payload.text) }
          delete p.parse_mode
          r = await call(item.method, p)
          if (r.ok) return true
        }
        // "message is not modified" and "chat not found" are not worth a retry
        log('Telegram отказал:', item.method, r.error_code, redact(r.description || ''))
        return false
      } catch (e) {
        log('Telegram недоступен:', redact(e.cause?.code ?? e.message))
        await new Promise((res) => setTimeout(res, 1500))
      }
    }
    return false
  }

  return { call, send }
}
