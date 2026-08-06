import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { mascotMenu } from '../../data/mascotMenu'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import mascotImg from '../../../assets/mascot.png'

const GREETING = 'Мяу! Я котик-помощник театра «Ключ» 🐾 Лапой покажу, что тебя интересует:'

// bottom-edge positions (px from the right edge) the mascot occasionally
// wanders between -- a short walk along the footer strip, never into the
// middle of the page where it could sit on top of real content. These are
// desktop-scale distances; on a narrow phone screen `right: 420` alone would
// push the whole mascot past the left edge, so they get clamped against the
// live viewport width below rather than used as-is.
const BASE_WALK_SPOTS = [24, 200, 420, 90]
// mascot's own footprint (h-16.5/w-16.5 = 66px) plus a little breathing room
const MASCOT_FOOTPRINT = 90

const buttonClass =
  'w-full rounded-[10px] border-2 border-ink bg-paper px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-colors hover:bg-brand-yellow'

export function Mascot() {
  const [open, setOpen] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [spotIndex, setSpotIndex] = useState(0)
  const [viewportW, setViewportW] = useState(() => (typeof window === 'undefined' ? 1280 : window.innerWidth))
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

  const category = mascotMenu.find((c) => c.id === categoryId) ?? null
  const item = category?.items.find((i) => i.id === itemId) ?? null

  const reset = () => {
    setCategoryId(null)
    setItemId(null)
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
            className="absolute right-0 bottom-full mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[16px] border-2 border-ink bg-paper text-ink shadow-[0_14px_34px_rgba(0,0,0,.3)]"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.32 }}
          >
            <div className="flex items-start justify-between gap-3 border-b-2 border-ink bg-brand-yellow p-3.5">
              <p className="text-[13px] leading-[1.4] font-semibold">
                {item ? item.label : category ? category.label : GREETING}
              </p>
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
                  <button onClick={() => setItemId(null)} className={buttonClass}>
                    ⬅ Назад к темам
                  </button>
                </div>
              ) : category ? (
                <div className="flex flex-col gap-2">
                  {category.items.map((i) => (
                    <button key={i.id} onClick={() => setItemId(i.id)} className={buttonClass}>
                      {i.label}
                    </button>
                  ))}
                  <button onClick={reset} className={buttonClass}>
                    ⬅ Ко всем темам
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {mascotMenu.map((c) => (
                    <button key={c.id} onClick={() => setCategoryId(c.id)} className={buttonClass}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
