// The site's chat window talks to the same bot as Telegram (bot/server/webchat.mjs).
// The conversation itself lives on the server; the browser keeps a copy of
// what was shown, so a page change or a reload does not wipe it.

const API = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
const STORE_KEY = 'kluch-chat-v1'
const KEEP_MESSAGES = 60

export interface ChatButton {
  text: string
  data: string
}

export interface ChatMessage {
  id: string
  from: 'bot' | 'me' | 'system'
  /** bot messages: limited HTML (b, i, a); others: plain text */
  html: string
  buttons?: ChatButton[][]
  /** a button under it was pressed: the rest are no longer offered */
  used?: boolean
}

interface Saved {
  session: string
  messages: ChatMessage[]
  chips: string[]
}

interface ServerMessage {
  html: string
  buttons: ChatButton[][]
  chips: string[] | null
}

export const CHAT_FAILED = 'Не получилось отправить. Проверьте интернет и попробуйте ещё раз или позвоните: +7 906 120-22-62.'

function newSession(): string {
  const bytes = new Uint8Array(15)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('') + Date.now().toString(36).slice(-5)
}

// storage can be missing (private mode, blocked site data): the chat still
// works, it just does not survive a reload
export function loadChat(): Saved {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Saved
      if (s && typeof s.session === 'string' && Array.isArray(s.messages)) return { session: s.session, messages: s.messages, chips: s.chips ?? [] }
    }
  } catch {
    // fall through to a fresh chat
  }
  return { session: newSession(), messages: [], chips: [] }
}

export function saveChat(s: Saved): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...s, messages: s.messages.slice(-KEEP_MESSAGES) }))
  } catch {
    // not saved: harmless
  }
}

export function freshChat(): Saved {
  return { session: newSession(), messages: [], chips: [] }
}

let counter = 0
export const messageId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`

/** One exchange with the bot. Returns its messages and the new quick-reply chips
 *  (null: keep the current ones). Throws with a human message on failure. */
export async function sendChat(
  session: string,
  body: { start: true } | { text: string } | { tap: string },
): Promise<{ messages: ChatMessage[]; chips: string[] | null }> {
  let res: Response
  try {
    res = await fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, ...body }),
      // the bot may wait out a model's rate limit; a person waits too
      signal: AbortSignal.timeout(70000),
    })
  } catch {
    throw new Error(CHAT_FAILED)
  }
  const json = (await res.json().catch(() => null)) as { messages?: ServerMessage[]; error?: string } | null
  if (!res.ok || !json?.messages) {
    throw new Error(res.status === 429 && json?.error ? `Кот не успевает: ${json.error}.` : CHAT_FAILED)
  }
  let chips: string[] | null = null
  for (const m of json.messages) if (m.chips) chips = m.chips
  return {
    messages: json.messages.map((m) => ({ id: messageId(), from: 'bot', html: m.html, buttons: m.buttons })),
    chips,
  }
}
