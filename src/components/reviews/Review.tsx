import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { REVIEW_LINKS } from '../../data/contacts'
import { BTN, WRAP } from '../home2/parts'
import { Torn, TornSheet } from '../home2/paper'
import { SPRING } from '../home2/motion'
import { SwallowIcon } from '../ui/SwallowIcon'
import { markReviewAsked, reviewDue, watchTicketClicks } from '../../lib/reviewNudge'
import yandexIcon from '../../../assets/icon-yandex-maps.svg'
import gisIcon from '../../../assets/icon-2gis.png'

const ICON = { yandex: yandexIcon, '2gis': gisIcon }

// «Были у нас на спектакле?»: links to the theatre's review pages on 2GIS and
// Yandex Maps. A yellow band on the show and afisha pages, and a small card
// over the whole page for someone who bought a ticket and came back after
// the show.

function Buttons({
  onPick,
  onRed = false,
  big = false,
}: {
  onPick?: () => void
  onRed?: boolean
  big?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {REVIEW_LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPick}
          className={`${BTN} bg-paper text-ink gap-3 border-2 ${big ? 'px-7 py-4 text-[17px]' : 'px-5 py-3 text-[15px]'} ${onRed ? 'border-paper' : 'border-ink'}`}
        >
          <img
            src={ICON[l.key]}
            alt=""
            aria-hidden="true"
            className={`${big ? 'h-7 w-7' : 'h-6 w-6'} rounded-md`}
          />
          {l.label}
        </a>
      ))}
    </div>
  )
}

/** The band at the bottom of the show and afisha pages; red where a yellow band is next to it. */
export function ReviewBand({ red = false }: { red?: boolean }) {
  if (!REVIEW_LINKS.length) return null
  return (
    <section className={`relative ${red ? 'bg-brand-red text-paper' : 'bg-brand-yellow'}`}>
      <Torn color={red ? 'text-brand-red' : 'text-brand-yellow'} seed={331} />
      <div
        className={`${WRAP} relative flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between md:py-14`}
      >
        <div>
          <h2 className="font-heading text-[clamp(32px,4.4vw,56px)] leading-[.95] font-bold uppercase">
            Были у нас на спектакле?
          </h2>
          <p className="mt-3 max-w-lg text-[16px] md:text-[18px]">
            Оставьте отзыв — для нас это очень важно.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Buttons onRed={red} />
          <SwallowIcon
            className={`hidden h-12 -rotate-6 lg:block ${red ? 'text-paper' : 'text-ink'}`}
          />
        </div>
      </div>
    </section>
  )
}

// "?otzyv" in the address shows the card at once, to see how it looks
const preview = () =>
  REVIEW_LINKS.length > 0 && typeof window !== 'undefined' && /[?&]otzyv/.test(window.location.href)

/** The once-only invitation over the blurred page, a few seconds after it opens. */
export function ReviewInvite() {
  const [show, setShow] = useState(preview)
  const reduce = useReducedMotion()

  useEffect(() => watchTicketClicks(), [])
  // a few seconds in, and only once the first screen is scrolled past: on
  // the homepage it would otherwise sit right on the hero's ticket button
  useEffect(() => {
    if (!REVIEW_LINKS.length || preview() || !reviewDue()) return
    let waited = false
    let scrolled = false
    const maybe = () => waited && scrolled && setShow(true)
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        scrolled = true
        maybe()
      }
    }
    const t = setTimeout(() => {
      waited = true
      maybe()
    }, 5000)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const close = () => {
    markReviewAsked()
    setShow(false)
  }

  // Esc closes it, like any dialog
  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markReviewAsked()
        setShow(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="bg-ink/45 fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-invite-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-[calc(100%-44px)] max-w-[780px] drop-shadow-[0_30px_50px_rgba(0,0,0,.45)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
            transition={SPRING}
          >
            <TornSheet color="text-brand-yellow" seed={337} className="absolute -inset-4" />
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="hover:text-brand-red absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
              </svg>
            </button>
            <div className="relative px-6 pt-12 pb-10 md:px-16 md:pt-16 md:pb-14">
              <SwallowIcon className="text-ink absolute top-10 right-20 hidden h-16 -rotate-6 sm:block" />
              <h2
                id="review-invite-title"
                className="font-heading pr-16 text-[40px] leading-[.92] font-bold uppercase md:pr-24 md:text-[76px]"
              >
                Были у нас на&nbsp;спектакле?
              </h2>
              <p className="mt-5 max-w-lg text-[17px] leading-snug md:mt-6 md:text-[22px]">
                Оставьте отзыв — для нас это очень важно. Это пара минут, а театру помогает
                найти новых зрителей.
              </p>
              <div className="mt-8 md:mt-10">
                <Buttons onPick={close} big />
              </div>
              <button
                type="button"
                onClick={close}
                className="text-ink/70 hover:text-ink mt-6 text-[15px] underline underline-offset-4"
              >
                Не сейчас
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
