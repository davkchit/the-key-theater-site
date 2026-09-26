import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { type ChatMessage, freshChat, loadChat, messageId, saveChat, sendChat } from '../../data/chat'
import { RichText } from './RichText'
import { GRAIN_URL, Torn } from '../home2/paper'
import faceImg from '../../../assets/mascot-face.jpg'

// A chat with the theatre's cat: the same bot as in Telegram, the same answers,
// the same signup form. Buttons inside a message work like Telegram's inline
// buttons; the chips above the input are its keyboard (afisha, courses...).
// Looks like the site: a yellow band torn at the bottom, paper grain, bubbles
// with a hard offset shadow like the stickers on the homepage.

function Avatar({ hidden = false }: { hidden?: boolean }) {
  return (
    <img
      src={faceImg}
      alt=""
      className={`h-8 w-8 flex-shrink-0 self-start rounded-full border-2 border-ink object-cover ${hidden ? 'invisible' : ''}`}
    />
  )
}

function Paw() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink/70" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="5" ry="4.2" />
      <ellipse cx="5.5" cy="10.5" rx="2.1" ry="2.6" />
      <ellipse cx="9.5" cy="6.5" rx="2.1" ry="2.7" />
      <ellipse cx="14.5" cy="6.5" rx="2.1" ry="2.7" />
      <ellipse cx="18.5" cy="10.5" rx="2.1" ry="2.6" />
    </svg>
  )
}

interface ChatPanelProps {
  onClose: () => void
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [chat, setChat] = useState(loadChat)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const started = useRef(false)

  useEffect(() => saveChat(chat), [chat])

  // always show the latest message
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat.messages.length, busy])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const push = (messages: ChatMessage[], chips: string[] | null = null) =>
    setChat((c) => ({ ...c, messages: [...c.messages, ...messages], chips: chips ?? c.chips }))

  const exchange = async (body: { start: true } | { text: string } | { tap: string }, session = chat.session) => {
    setBusy(true)
    try {
      const r = await sendChat(session, body)
      push(r.messages, r.chips)
    } catch (e) {
      push([{ id: messageId(), from: 'system', html: (e as Error).message }])
    } finally {
      setBusy(false)
    }
  }

  // the greeting comes from the bot itself (no model involved), once per chat
  useEffect(() => {
    if (started.current || chat.messages.length) return
    started.current = true
    void exchange({ start: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const say = (value: string) => {
    const t = value.trim()
    if (!t || busy) return
    push([{ id: messageId(), from: 'me', html: t }])
    setText('')
    void exchange({ text: t })
  }

  const tap = (msg: ChatMessage, data: string, label: string) => {
    if (busy || msg.used) return
    setChat((c) => ({ ...c, messages: c.messages.map((m) => (m.id === msg.id ? { ...m, used: true } : m)) }))
    push([{ id: messageId(), from: 'me', html: label }])
    void exchange({ tap: data })
  }

  const restart = () => {
    const fresh = freshChat()
    setChat(fresh)
    void exchange({ start: true }, fresh.session)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    say(text)
  }

  // Enter sends, Shift+Enter is a new line
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      say(text)
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-paper text-ink">
      {/* paper grain over the whole window, faint, as on the site */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-[.16] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_URL }}
      />
      <div className="relative z-10 flex items-center gap-3 bg-brand-yellow px-3.5 pt-2.5 pb-2">
        <Torn color="text-brand-yellow" side="bottom" seed={5} rim={false} />
        <img src={faceImg} alt="" className="h-11 w-11 flex-shrink-0 rounded-full border-2 border-ink object-cover" />
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[15px] leading-tight font-bold uppercase">Кот театра «Ключ»</div>
          <div className="text-[12px] leading-tight text-ink/70">{busy ? 'печатает…' : 'расскажет про спектакли и запишет на курс'}</div>
        </div>
        <button
          onClick={restart}
          disabled={busy}
          title="Начать заново"
          aria-label="Начать разговор заново"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink text-[15px] transition-transform active:scale-90 disabled:opacity-40"
        >
          ↺
        </button>
        <button
          onClick={onClose}
          aria-label="Закрыть чат"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink text-sm transition-transform active:scale-90"
        >
          ✕
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3.5 pt-7 pb-4"
        aria-live="polite"
      >
        <div className="flex flex-col gap-2.5">
          {chat.messages.map((m, i) =>
            m.from === 'me' ? (
              <div key={m.id} className="max-w-[85%] self-end rounded-[14px] rounded-br-[4px] bg-ink px-3.5 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-wrap text-paper shadow-[3px_3px_0_rgba(26,26,26,.25)]">
                {m.html}
              </div>
            ) : m.from === 'system' ? (
              <div key={m.id} className="self-center rounded-[10px] bg-brand-red/10 px-3 py-2 text-center text-[13px] leading-[1.4] text-brand-red">
                {m.html}
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[92%] gap-2 self-start">
                <Avatar hidden={chat.messages[i - 1]?.from === 'bot'} />
                <div className="min-w-0 rounded-[14px] rounded-tl-[4px] border-2 border-ink bg-paper px-3.5 py-2.5 text-[15px] leading-[1.5] break-words whitespace-pre-wrap shadow-[3px_3px_0_#1a1a1a]">
                  <RichText html={m.html} />
                  {!m.used && (m.buttons ?? []).length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1.5 whitespace-normal">
                      {(m.buttons ?? []).map((row, ri) => (
                        <div key={ri} className="flex flex-wrap gap-1.5">
                          {row.map((b) => (
                            <button
                              key={b.data}
                              onClick={() => tap(m, b.data, b.text)}
                              disabled={busy}
                              className="min-h-10 flex-1 rounded-[8px] border-2 border-ink bg-brand-yellow px-3 py-1.5 text-[14px] font-semibold transition-transform duration-100 ease-out active:scale-[.97] disabled:opacity-50"
                            >
                              {b.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          {busy && (
            <div className="flex items-center gap-2 self-start" aria-label="Кот печатает">
              <Avatar hidden={chat.messages[chat.messages.length - 1]?.from === 'bot'} />
              <div className="rounded-[14px] rounded-tl-[4px] border-2 border-ink bg-paper px-3.5 py-2 text-[15px] text-ink/70 shadow-[3px_3px_0_#1a1a1a]">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">•</span>
                  <span className="animate-pulse [animation-delay:150ms]">•</span>
                  <span className="animate-pulse [animation-delay:300ms]">•</span>
                </span>
              </div>
              <Paw />
            </div>
          )}
        </div>
      </div>

      {chat.chips.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-t-2 border-ink/10 px-3.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chat.chips.map((c) => (
            <button
              key={c}
              onClick={() => say(c)}
              disabled={busy}
              className="flex-shrink-0 rounded-full border-2 border-ink px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors hover:bg-brand-yellow disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t-2 border-ink px-3 py-2.5">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={500}
          placeholder="Напишите вопрос…"
          aria-label="Сообщение коту"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-[10px] border-2 border-ink/25 bg-paper px-3 py-2.5 text-[16px] leading-[1.35] outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          aria-label="Отправить"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-red text-paper transition-transform duration-100 ease-out active:scale-[.94] disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  )
}
