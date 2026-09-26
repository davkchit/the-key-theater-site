import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { heroShows, longDate, galleryPhoto, showPath } from './homeData'
import { BTN, WRAP } from './parts'

import { SPRING } from './motion'
import { Grain } from './paper'

// First screen: the nearest shows as a slider over a live stage photo across
// the whole screen, as in the mockup; the title lies on the dark side of it. Big title, age, date, one red "Купить билет".
// Slides change every 7 s and stop under the pointer or with reduced motion.

const SLIDE_MS = 7000

export function Hero() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = heroShows.length

  useEffect(() => {
    if (reduce || paused || count < 2) return
    const t = setTimeout(() => setI((v) => (v + 1) % count), SLIDE_MS)
    return () => clearTimeout(t)
  }, [i, reduce, paused, count])

  const slide = heroShows[i]

  return (
    <section
      className="bg-ink text-paper relative isolate"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="карусель"
      aria-label="Ближайшие спектакли"
    >
      <div className="relative h-[calc(100svh-72px)] max-h-[1000px] min-h-[560px] overflow-hidden md:h-[calc(100svh-96px)]">
        <div className="absolute inset-0 md:left-[30%]">
          <AnimatePresence initial={false}>
            <motion.img
              key={slide?.photo ?? 'stage'}
              src={slide?.photo ?? galleryPhoto('simon-3')}
              alt=""
              initial={{ opacity: 0, scale: reduce ? 1 : 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.2 : 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ objectPosition: slide?.focus ?? '60% 40%' }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>
        {/* the text side is black, the actors' side stays alive */}
        <div className="from-ink via-ink/60 to-ink/0 absolute inset-0 bg-gradient-to-t md:hidden" />
        {/* the photo fades into black on its left, so faces never sit under the title */}
        <div className="from-ink via-ink/70 absolute inset-y-0 left-[30%] hidden w-[40%] bg-gradient-to-r to-transparent md:block" />
        <div className="from-ink/80 absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
        <Grain opacity={0.5} />

        <div
          className={`${WRAP} relative z-[3] flex h-full flex-col justify-end pb-20 md:justify-center md:pb-10`}
        >
          {slide ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.item.title}
                initial={{ opacity: 0, y: reduce ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -12 }}
                transition={reduce ? { duration: 0.15 } : SPRING}
                aria-live="polite"
              >
                <div className="relative inline-block">
                  {/* sized by the longest word, so «Последствий» fits whole and «Симон» gets huge */}
                  <h1
                    style={
                      {
                        '--L': Math.max(5, ...slide.item.title.split(/\s+/).map((w) => w.length)),
                      } as CSSProperties
                    }
                    className="font-heading w-min text-[min(170px,calc(84vw/(var(--L)*0.56)))] leading-[.92] font-bold tracking-[-.01em] uppercase md:text-[min(170px,calc(min(44vw,700px)/(var(--L)*0.52)))]"
                  >
                    {slide.item.title}
                  </h1>
                </div>
                {slide.item.age && (
                  <div className="font-heading mt-5 text-[30px] leading-none font-semibold md:text-[40px]">
                    {slide.item.age}
                  </div>
                )}
                <div className="mt-3 text-[20px] font-semibold md:text-[26px]">
                  {longDate(slide.item)}
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {slide.ticketUrl && (
                    <a
                      href={slide.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${BTN} bg-brand-red text-paper px-9 py-4.5 text-[17px]`}
                    >
                      Купить билет
                    </a>
                  )}
                  <Link
                    to={showPath(slide.item.title)}
                    className="group inline-flex items-center gap-2.5 text-[17px] font-medium"
                  >
                    <span className="border-paper/70 border-b pb-0.5">О спектакле</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            // off-season: nothing on the schedule yet
            <div>
              <h1 className="font-heading text-[clamp(56px,11vw,150px)] leading-[.85] font-bold uppercase">
                Театр «Ключ»
              </h1>
              <p className="mt-4 max-w-md text-[18px]">
                Молодёжный театр в Набережных Челнах. Новый сезон скоро в афише.
              </p>
              <Link to="/novaya/afisha" className={`${BTN} bg-brand-red text-paper mt-6`}>
                Афиша
              </Link>
            </div>
          )}

          {count > 1 && (
            <div className="absolute bottom-10 left-4 flex gap-3 sm:left-6.5 lg:left-12">
              {heroShows.map((h, n) => (
                <button
                  key={h.item.title}
                  onClick={() => setI(n)}
                  aria-label={`Показать «${h.item.title}»`}
                  aria-current={n === i}
                  className={`border-paper h-3 w-3 rounded-full border-2 transition-colors ${n === i ? 'bg-paper' : 'bg-transparent'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
