import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { mascotMenu, type MascotItem } from '../../data/mascotMenu'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { trackEvent } from '../../data/leads'
import { SketchyFrame } from '../ui/SketchyFrame'
import { StarIcon } from '../ui/StarIcon'
import { TicketIcon } from '../ui/TicketIcon'
import { CalendarIcon } from '../ui/CalendarIcon'
import { PinIcon } from '../ui/PinIcon'
import { InfoIcon } from '../ui/InfoIcon'
import mascotImg from '../../../assets/mascot.png'

// no personal data in these events, so no consent checkbox needed -- just
// which question got opened (or typed) to see what visitors actually look for
function trackMascot(fields: Record<string, string>) {
  trackEvent(fields)
}

// bottom-edge positions (px from the right edge) the mascot occasionally
// wanders between -- a short walk along the footer strip, never into the
// middle of the page where it could sit on top of real content. These are
// desktop-scale distances; on a narrow phone screen `right: 420` alone would
// push the whole mascot past the left edge, so they get clamped against the
// live viewport width below rather than used as-is.
const BASE_WALK_SPOTS = [24, 200, 420, 90]
// mascot's own footprint (h-16.5/w-16.5 = 66px) plus a little breathing room
const MASCOT_FOOTPRINT = 90

const CATEGORY_ICON: Record<string, ComponentType<{ className?: string }>> = {
  afisha: TicketIcon,
  courses: CalendarIcon,
  festival: StarIcon,
  about: InfoIcon,
  team: InfoIcon,
  contacts: PinIcon,
}

interface FlatItem extends MascotItem {
  key: string
  categoryLabel: string
  Icon: ComponentType<{ className?: string }>
}

// one flat, searchable list instead of a category/question drill-down --
// each mascotMenu item keeps its category only to pick an icon and to tag
// tracking events, the menu's grouping itself isn't shown anymore
const FLAT_ITEMS: FlatItem[] = mascotMenu.flatMap((c) =>
  c.items.map((i) => ({ ...i, key: `${c.id}:${i.id}`, categoryLabel: c.label, Icon: CATEGORY_ICON[c.id] ?? InfoIcon })),
)

const rowClass =
  'flex w-full items-center gap-3 rounded-[10px] border-2 border-ink bg-paper px-3.5 py-2.75 text-left text-[13.5px] font-semibold transition-colors hover:bg-brand-yellow'

export function Mascot() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [itemKey, setItemKey] = useState<string | null>(null)
  const [spotIndex, setSpotIndex] = useState(0)
  const [viewportW, setViewportW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
  const [ownQuestion, setOwnQuestion] = useState('')
  const [ownSent, setOwnSent] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const close = () => setOpen(false)
  useEscapeKey(open, close)
  useFocusTrap(panelRef, open)

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // occasional short walk along the bottom edge -- most of the time it just
  // idles in place (see the CSS kl-float bob on the inner wrapper below)
  useEffect(() => {
    if (prefersReducedMotion) return
    const id = setInterval(
      () => setSpotIndex((i) => (i + 1 + Math.floor(Math.random() * (BASE_WALK_SPOTS.length - 1))) % BASE_WALK_SPOTS.length),
      25000,
    )
    return () => clearInterval(id)
  }, [prefersReducedMotion])

  // below 640px the open panel (up to 100vw-32px wide) anchored off the
  // mascot's own position would overflow the left edge the moment the
  // mascot wanders anywhere left of the corner -- so on phones it just
  // parks in the corner and only bobs in place, no horizontal wandering
  const maxRight = Math.max(24, viewportW - MASCOT_FOOTPRINT)
  const walkSpots = viewportW < 640 ? [24] : BASE_WALK_SPOTS.map((s) => Math.min(s, maxRight))

  const item = FLAT_ITEMS.find((i) => i.key === itemKey) ?? null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FLAT_ITEMS.slice(0, 5)
    return FLAT_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 5)
  }, [query])

  const reset = () => {
    setQuery('')
    setItemKey(null)
    setOwnQuestion('')
    setOwnSent(false)
  }

  const selectItem = (i: FlatItem) => {
    trackMascot({ Категория: i.categoryLabel, Вопрос: i.label, Тип: 'вопрос' })
    setItemKey(i.key)
  }

  const sendOwnQuestion = () => {
    if (!ownQuestion.trim()) return
    trackMascot({ Категория: '', Вопрос: ownQuestion.trim(), Тип: 'свой вопрос' })
    setOwnSent(true)
  }

  return createPortal(
    <motion.div
      className="fixed bottom-4 z-60"
      initial={false}
      animate={{ right: walkSpots[spotIndex % walkSpots.length] }}
      transition={{ duration: 3.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Помощник театра"
            className="absolute right-0 bottom-full mb-3 w-80 max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
          >
            {/* speech-bubble tail down toward the mascot -- outside the
                inner box's overflow-hidden so it isn't clipped */}
            <svg viewBox="0 0 40 24" className="pointer-events-none absolute right-8 -bottom-5 h-6 w-10 text-ink" aria-hidden="true">
              <path d="M4,2 C10,1 16,3 20,10 C23,16 26,20 34,22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>

            <div className="relative overflow-hidden rounded-[16px] bg-paper text-ink shadow-[0_14px_34px_rgba(0,0,0,.3)]">
              <div className="flex items-start justify-between gap-3 border-b-2 border-ink bg-brand-yellow p-3.5">
                <p className="text-[13px] leading-[1.4] font-bold uppercase">{item ? item.label : 'Чем помочь?'}</p>
                <button
                  onClick={close}
                  aria-label="Закрыть"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink text-sm transition-transform active:scale-90"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-100 overflow-y-auto p-3.5">
                {item ? (
                  <div className="flex flex-col gap-3">
                    <div className="rounded-[10px] bg-brand-blue/10 p-3 text-[13.5px] leading-[1.5]">
                      {typeof item.answer === 'function' ? item.answer() : item.answer}
                    </div>
                    <button onClick={() => setItemKey(null)} className={rowClass}>
                      ⬅ Назад к поиску
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <svg
                        viewBox="0 0 24 24"
                        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink/45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <circle cx="10.5" cy="10.5" r="6.5" />
                        <line x1="15.5" y1="15.5" x2="21" y2="21" />
                      </svg>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Спроси что-нибудь..."
                        aria-label="Поиск по вопросам"
                        className="w-full rounded-[10px] border-2 border-ink bg-paper py-2.75 pr-3 pl-9.5 text-[13.5px] outline-none focus:border-brand-red"
                      />
                    </div>

                    {results.map((i) => (
                      <button key={i.key} onClick={() => selectItem(i)} className={rowClass}>
                        <i.Icon className="h-5 w-5 flex-shrink-0 text-brand-red" />
                        <span>{i.label}</span>
                      </button>
                    ))}

                    {query.trim() && results.length === 0 && (
                      <div className="mt-1 flex flex-col gap-2">
                        <p className="text-[12.5px] leading-[1.4] text-ink/70">Ничего не нашлось. Напишите вопрос — мы его учтём:</p>
                        {ownSent ? (
                          <div className="rounded-[10px] bg-brand-blue/10 p-3 text-[13px] leading-[1.45]">Спасибо, мы это запомнили 🐾</div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              value={ownQuestion || query}
                              onChange={(e) => setOwnQuestion(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendOwnQuestion()}
                              placeholder="Ваш вопрос"
                              className="min-w-0 flex-1 rounded-[8px] border-2 border-ink/20 bg-paper px-2.5 py-2 text-[13px] outline-none focus:border-brand-red"
                            />
                            <button
                              onClick={sendOwnQuestion}
                              className="flex-shrink-0 rounded-[8px] border-2 border-ink bg-brand-yellow px-3 text-[13px] font-semibold transition-transform active:scale-95"
                            >
                              Отправить
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <SketchyFrame className="pointer-events-none absolute inset-0 text-ink" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          setOpen((v) => !v)
          reset()
        }}
        aria-label="Открыть помощника театра"
        aria-expanded={open}
        className="block h-16.5 w-16.5 drop-shadow-[0_6px_14px_rgba(0,0,0,.35)] transition-transform active:scale-90"
      >
        <div className={prefersReducedMotion ? '' : 'animate-kl-float'}>
          <img src={mascotImg} alt="" className="pointer-events-none h-16.5 w-16.5 object-contain" />
        </div>
      </button>
    </motion.div>,
    document.body,
  )
}
