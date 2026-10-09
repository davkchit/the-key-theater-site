import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { REVIEW_LINKS } from '../../data/contacts'
import { BTN, WRAP } from '../home2/parts'
import { Torn } from '../home2/paper'
import { SPRING } from '../home2/motion'
import { SwallowIcon } from '../ui/SwallowIcon'
import { markReviewAsked, reviewDue, watchTicketClicks } from '../../lib/reviewNudge'
import yandexIcon from '../../../assets/icon-yandex-maps.svg'
import gisIcon from '../../../assets/icon-2gis.png'

const ICON = { yandex: yandexIcon, '2gis': gisIcon }

// «Были у нас на спектакле?»: links to the theatre's review pages on 2GIS and
// Yandex Maps. A yellow band on the show and afisha pages, and a small card
// in the bottom-left corner for someone who bought a ticket and came back
// after the show (bottom-right is the cat's).

function Buttons({ onPick, onRed = false }: { onPick?: () => void; onRed?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {REVIEW_LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onPick}
          className={`${BTN} bg-paper text-ink gap-3 border-2 px-5 py-3 text-[15px] ${onRed ? 'border-paper' : 'border-ink'}`}
        >
          <img src={ICON[l.key]} alt="" aria-hidden="true" className="h-6 w-6 rounded-md" />
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
const preview = () => REVIEW_LINKS.length > 0 && /[?&]otzyv/.test(window.location.href)

/** The once-only card, shown a few seconds after the page opens. */
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

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          role="dialog"
          aria-labelledby="review-invite-title"
          className="bg-brand-yellow fixed right-3 bottom-[150px] left-3 z-[65] shadow-[0_18px_44px_rgba(0,0,0,.28)] sm:right-auto sm:bottom-6 sm:left-6 sm:w-[400px]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          transition={SPRING}
        >
          <Torn color="text-brand-yellow" seed={337} />
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="hover:text-brand-red absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center transition-colors"
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
          <div className="relative px-6 pt-7 pb-6">
            <SwallowIcon className="text-ink absolute top-6 right-14 h-9 -rotate-6" />
            <h2
              id="review-invite-title"
              className="font-heading pr-16 text-[32px] leading-[.95] font-bold uppercase"
            >
              Были у нас на&nbsp;спектакле?
            </h2>
            <p className="mt-3 text-[16px] leading-snug">
              Оставьте отзыв — для нас это очень важно.
            </p>
            <div className="mt-5">
              <Buttons onPick={close} />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
