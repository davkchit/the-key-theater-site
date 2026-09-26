import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { gallery } from '../data/gallery'
import { PrintFilters, WRAP } from '../components/home2/parts'
import { GRAIN_URL } from '../components/home2/paper'
import { Lightbox } from '../components/home2/Gallery'
import { Reveal } from '../components/ui/Reveal'
import { SwallowIcon } from '../components/ui/SwallowIcon'

// «Галерея»: every photo from the admin in free columns, live colour; a tap
// opens it full screen with the same viewer as the homepage carousel.

const list = gallery.map((g) => g.src)

export default function GalleryPageV2() {
  const [open, setOpen] = useState<number | null>(null)
  const move = (dir: -1 | 1) =>
    setOpen((i) => (i === null ? i : (i + dir + list.length) % list.length))

  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />
      <section className={`${WRAP} relative pt-14 pb-24 md:pt-20`}>
        <h1 className="font-heading text-[clamp(56px,10vw,140px)] leading-[.9] font-bold uppercase">
          Галерея
        </h1>
        <p className="mt-4 text-[17px] md:text-[19px]">Спектакли, репетиции, фестиваль и лагерь</p>
        <SwallowIcon className="text-ink absolute top-20 right-12 hidden h-24 -rotate-12 md:block" />

        <div className="mt-10 columns-2 gap-3 md:mt-14 md:columns-3 md:gap-4 xl:columns-4">
          {list.map((src, i) => (
            <Reveal key={src} index={i % 4} className="mb-3 break-inside-avoid md:mb-4">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Открыть фото ${i + 1} на весь экран`}
                className="group bg-ink focus-visible:ring-brand-yellow block w-full overflow-hidden outline-none focus-visible:ring-4"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="block w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {open !== null && (
          <Lightbox index={open} list={list} onClose={() => setOpen(null)} onMove={move} />
        )}
      </AnimatePresence>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] opacity-[.22] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_URL }}
      />
    </div>
  )
}
