import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { SPRING } from '../home2/motion'

// «Купить» that leads to a Bileton widget (a show's own, or one of its
// sessions) opens the widget over the site instead of taking people away.
// One listener for every such link on the site, so no button needs to know.
// Bileton allows its widget inside other sites; a click with Ctrl/Cmd or the
// middle button still opens a new tab, as people expect.

const WIDGET = /^https:\/\/bileton\.ru\/widget\//i

export function TicketOverlay() {
  const [url, setUrl] = useState<string | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const close = () => setUrl(null)
  useEscapeKey(url !== null, close)
  useFocusTrap(boxRef, url !== null)
  useLockBodyScroll(url !== null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
        return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || !WIDGET.test(a.href) || a.closest('[data-ticket-overlay]')) return
      e.preventDefault()
      setUrl(a.href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return createPortal(
    <AnimatePresence>
      {url && (
        <motion.div
          className="bg-ink/70 fixed inset-0 z-80 flex items-center justify-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          <motion.div
            ref={boxRef}
            role="dialog"
            aria-modal="true"
            aria-label="Покупка билета"
            data-ticket-overlay=""
            className="bg-paper md:border-ink flex h-[100dvh] w-full max-w-[980px] flex-col overflow-hidden md:h-[88dvh] md:rounded-[14px] md:border-2 md:shadow-[6px_6px_0_#1a1a1a]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={SPRING}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-ink text-paper flex items-center justify-between gap-4 px-4 py-3 md:px-5">
              <div className="font-heading text-[17px] font-semibold tracking-[.04em] uppercase">
                Покупка билета
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="hidden text-[14px] underline underline-offset-4 sm:inline"
                >
                  Открыть на Билетоне
                </a>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть"
                  className="hover:text-brand-yellow flex h-10 w-10 items-center justify-center transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <iframe
              src={url}
              title="Покупка билета на Билетоне"
              className="w-full flex-1 border-0 bg-white"
              allow="payment"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
