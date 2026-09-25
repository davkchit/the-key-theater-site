import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { ChatPanel } from './ChatPanel'
import mascotImg from '../../../assets/mascot.png'

// The theatre's cat in the corner of every page. A tap opens a chat with it:
// the same bot as in Telegram (answers, signup, leads), see ChatPanel.

// bottom-edge positions (px from the right edge) the mascot occasionally
// wanders between -- a short walk along the footer strip, never into the
// middle of the page where it could sit on top of real content. These are
// desktop-scale distances; on a narrow phone screen `right: 420` alone would
// push the whole mascot past the left edge, so they get clamped against the
// live viewport width below rather than used as-is.
const BASE_WALK_SPOTS = [24, 200, 420, 90]
// mascot's own footprint (h-16.5/w-16.5 = 66px) plus a little breathing room
const MASCOT_FOOTPRINT = 90

export function Mascot() {
  const [open, setOpen] = useState(false)
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
  // idles in place (see the CSS kl-float bob on the inner wrapper below);
  // it stays put while the chat is open, next to its window
  useEffect(() => {
    if (prefersReducedMotion || open) return
    const id = setInterval(
      () => setSpotIndex((i) => (i + 1 + Math.floor(Math.random() * (BASE_WALK_SPOTS.length - 1))) % BASE_WALK_SPOTS.length),
      25000,
    )
    return () => clearInterval(id)
  }, [prefersReducedMotion, open])

  const maxRight = Math.max(24, viewportW - MASCOT_FOOTPRINT)
  const walkSpots = viewportW < 640 ? [24] : BASE_WALK_SPOTS.map((s) => Math.min(s, maxRight))
  const right = open ? 24 : walkSpots[spotIndex % walkSpots.length]

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Чат с котом театра"
            // phones: the whole screen, like a messenger; larger screens: a
            // window in the corner above the cat
            className="fixed inset-0 z-70 sm:inset-auto sm:right-6 sm:bottom-26 sm:h-[min(620px,calc(100dvh-8rem))] sm:w-[390px] sm:overflow-hidden sm:rounded-[16px] sm:border-2 sm:border-ink sm:shadow-[0_18px_44px_rgba(0,0,0,.35)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0, duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <ChatPanel onClose={close} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={['fixed bottom-4 z-60', open ? 'max-sm:hidden' : ''].join(' ')}
        initial={false}
        animate={{ right }}
        transition={{ duration: 3.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть чат с котом' : 'Открыть чат с котом театра'}
          aria-expanded={open}
          className="block h-16.5 w-16.5 drop-shadow-[0_6px_14px_rgba(0,0,0,.35)] transition-transform active:scale-90"
        >
          <div className={prefersReducedMotion ? '' : 'animate-kl-float'}>
            <img src={mascotImg} alt="" className="pointer-events-none h-16.5 w-16.5 object-contain" />
          </div>
        </button>
      </motion.div>
    </>,
    document.body,
  )
}
