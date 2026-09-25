import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { type ChatMessage, freshChat, loadChat, messageId, saveChat, sendChat } from '../../data/chat'
import { RichText } from './RichText'
import mascotImg from '../../../assets/mascot.png'

// A chat with the theatre's cat: the same bot as in Telegram, the same answers,
// the same signup form. Buttons under a message work like Telegram's inline
// buttons; the chips above the input are its keyboard (afisha, courses...).

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
    <div className="flex h-full flex-col overflow-hidden bg-paper text-ink">
      <div className="flex items-center gap-3 border-b-2 border-ink bg-brand-yellow px-3.5 py-2.5">
        <img src={mascotImg} alt="" className="h-10 w-10 flex-shrink-0 object-contain" />
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

      <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-4" aria-live="polite">
        <div className="flex flex-col gap-2.5">
          {chat.messages.map((m) =>
            m.from === 'me' ? (
              <div key={m.id} className="max-w-[85%] self-end rounded-[14px] rounded-br-[4px] bg-ink px-3.5 py-2.5 text-[15px] leading-[1.45] break-words whitespace-pre-wrap text-paper">
                {m.html}
              </div>
            ) : m.from === 'system' ? (
              <div key={m.id} className="self-center rounded-[10px] bg-brand-red/10 px-3 py-2 text-center text-[13px] leading-[1.4] text-brand-red">
                {m.html}
              </div>
            ) : (
              <div key={m.id} className="flex max-w-[90%] flex-col gap-1.5 self-start">
                <div className="rounded-[14px] rounded-bl-[4px] border-2 border-ink bg-paper px-3.5 py-2.5 text-[15px] leading-[1.5] break-words whitespace-pre-wrap">
                  <RichText html={m.html} />
                </div>
                {!m.used &&
                  (m.buttons ?? []).map((row, ri) => (
                    <div key={ri} className="flex flex-wrap gap-1.5">
                      {row.map((b) => (
                        <button
                          key={b.data}
                          onClick={() => tap(m, b.data, b.text)}
                          disabled={busy}
                          className="rounded-[10px] border-2 border-ink bg-brand-yellow px-3 py-2 text-left text-[14px] font-semibold transition-transform active:scale-95 disabled:opacity-50"
                        >
                          {b.text}
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            ),
          )}
          {busy && (
            <div className="self-start rounded-[14px] border-2 border-ink/30 px-3.5 py-2.5 text-[15px] text-ink/60" aria-label="Кот печатает">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse [animation-delay:150ms]">•</span>
                <span className="animate-pulse [animation-delay:300ms]">•</span>
              </span>
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
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-red text-paper transition-transform active:scale-95 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  )
}
