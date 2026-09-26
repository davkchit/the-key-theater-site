import { NavLink } from 'react-router-dom'
import { BrushHighlight } from '../ui/BrushHighlight'
import { HandArrow } from '../ui/HandArrow'
import { SwallowIcon } from '../ui/SwallowIcon'
import elScribble from '../../../assets/el-scribble-x.svg'
import photo1 from '../../../assets/photo-1.jpg'

// ripped-out-of-a-magazine edge, uneven on all four sides. Percentages, so it
// holds at any size the photo ends up.
// second, slightly different tear for the photo inside the cream margin --
// reusing the same outline for both would read as a machine-cut shape
const TORN_INNER =
  'polygon(1.4% 1.1%, 13% 0.2%, 25% 1.6%, 38% 0.4%, 51% 1.4%, 64% 0.2%, 77% 1.7%, 90% 0.5%, 98.8% 1.1%, 100% 13%, 98.4% 25%, 100% 37%, 98.8% 49%, 100% 61%, 98.5% 73%, 100% 85%, 98.6% 97%, 87% 98.9%, 75% 97.5%, 63% 99.4%, 51% 97.9%, 39% 99.5%, 27% 97.8%, 15% 99.2%, 4% 98.2%, 1.1% 87%, 0% 75%, 1.6% 63%, 0% 51%, 1.2% 39%, 0% 27%, 1.5% 15%)'

const TORN_PHOTO =
  'polygon(1.6% 0.9%, 11% 0%, 23% 1.5%, 36% 0.3%, 49% 1.7%, 62% 0.4%, 75% 1.6%, 88% 0.4%, 98.6% 1.3%, 100% 12%, 98.5% 24%, 100% 36%, 98.6% 48%, 100% 60%, 98.4% 72%, 100% 84%, 98.7% 96%, 88% 99.1%, 76% 97.6%, 64% 99.5%, 52% 97.8%, 40% 99.6%, 28% 97.7%, 16% 99.3%, 4.5% 98%, 1.3% 88%, 0% 76%, 1.5% 64%, 0% 52%, 1.4% 40%, 0% 28%, 1.6% 16%)'

export function Hero() {
  return (
    <section className="relative mx-auto max-w-320 px-6.5 pt-14.5 pb-8.5">
      <svg
        viewBox="0 0 620 140"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-10 right-6.5 h-30 w-[46%] text-brand-red opacity-50"
        aria-hidden="true"
      >
        <path d="M0,80 C90,10 170,120 260,70 C350,20 430,120 520,60 C570,28 600,60 620,52" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
      <SwallowIcon className="pointer-events-none absolute top-14.5 right-[33%] z-3 h-20.5 -rotate-12 text-ink" />
      <SwallowIcon className="pointer-events-none absolute top-37.5 right-[22%] z-3 h-11.5 rotate-8 animate-kl-float text-brand-red" />

      <div className="flex flex-wrap items-center gap-2.5 font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">
        <span>Молодёжный театр «Ключ»</span>
        <span className="text-brand-red">✳</span>
        <span>Набережные Челны</span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-end gap-8.5 lg:grid-cols-[1.28fr_.72fr]">
        <div>
          <h1 className="font-heading text-[clamp(52px,8.4vw,128px)] leading-[.86] font-bold tracking-[-.01em] uppercase">
            Театр,
            <br />
            который сочиняет
            <br />
            <span className="relative inline-block -rotate-1 px-[.06em]">
              <BrushHighlight className="absolute top-[7%] -left-[4%] -z-1 h-[88%] w-[108%] text-brand-yellow" />
              жизнь
            </span>{' '}
            заново
          </h1>
          <p className="mt-5.5 font-script text-[clamp(22px,2.9vw,34px)] leading-[1.1] text-ink">
            территория полёта и жизни без границ
          </p>
          <p className="mt-4 max-w-125 text-[17px] leading-[1.6] text-[#33302a]">
            Мы придумываем правила, а потом приходят новые люди — и мы придумываем их заново. Всё это о любви,
            дружбе и человеческом взаимопонимании.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <NavLink
              to="/staryi/afisha"
              className="rounded-[5px] bg-ink px-7.5 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.75 active:scale-[.96]"
            >
              Афиша сезона
            </NavLink>
            <span className="relative inline-flex items-center gap-3.5">
              <NavLink
                to="/staryi/kursy"
                className="inline-block rounded-[5px] bg-brand-yellow px-7.5 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.75 active:scale-[.96]"
              >
                Записаться на курс
              </NavLink>
              <span className="-rotate-4 font-script text-xl whitespace-nowrap text-brand-red">это бесплатно!</span>
            </span>
          </div>
        </div>

        <div className="relative">
          {/* handwritten aside pointing down into the photo -- the right
              column is bottom-aligned, so the empty cream above the photo is
              where this lives (there is no room outside the container edge) */}
          <div className="pointer-events-none absolute -top-27 right-0 hidden w-60 lg:block">
            <span className="block text-right font-script text-[26px] leading-[1.15] text-ink">
              Театр начинается
              <br />
              здесь
            </span>
            <HandArrow className="ml-auto mt-1 h-13 w-auto -scale-x-100 text-ink" />
          </div>

          <div className="relative rotate-2 drop-shadow-[0_14px_30px_rgba(26,26,26,.16)]">
            {/* cream margin with its own ragged outline, so the photo reads as
                something cut out and pasted down rather than an <img> with a
                mask on it */}
            <div className="bg-paper p-2.5" style={{ clipPath: TORN_PHOTO }}>
              <div className="aspect-3/4 bg-brand-blue" style={{ clipPath: TORN_INNER }}>
                <img src={photo1} alt="Спектакль театра Ключ" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* the brand book's red ink splatter, thrown across the corner of
                the photo. It's a flat-fill SVG, so an <img> can't recolour it
                -- paint a red box masked to its silhouette instead (same
                technique the afisha list uses for the yellow star) */}
            <div
              aria-hidden="true"
              // scaled down on phones: at full size it hangs 26px past the screen
                // edge and only survives because <html> hides the overflow
                className="pointer-events-none absolute -top-7 -left-6 z-3 h-32 w-26 bg-brand-red md:-top-11 md:-left-13 md:h-49 md:w-40"
              style={{
                WebkitMaskImage: `url(${elScribble})`,
                maskImage: `url(${elScribble})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
              }}
            />

            <div className="absolute bottom-7 left-7 z-3 rounded-[3px] bg-paper px-3.25 py-1.75 font-heading text-xs font-semibold tracking-[.1em] text-ink uppercase">
              Сезон 2026 / 2027
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
