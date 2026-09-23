import { NavLink } from 'react-router-dom'
import { SwallowIcon } from '../ui/SwallowIcon'
import { mediaUrl } from '../../lib/mediaUrl'
import elStar from '../../../assets/el-star.svg'

const festivalPhoto = mediaUrl('/uploads/gallery/nagrazhdenie-2.jpg')

// torn paper edge for the photo -- irregular on all four sides so it reads as
// something ripped out and pasted on, the way the brand book does it
const TORN =
  'polygon(2% 3%, 13% 0%, 27% 4%, 42% 1%, 58% 5%, 73% 1%, 88% 4%, 100% 2%, 98% 18%, 100% 35%, 97% 52%, 100% 69%, 98% 86%, 100% 98%, 86% 96%, 70% 100%, 54% 96%, 38% 100%, 22% 96%, 8% 99%, 0% 96%, 2% 78%, 0% 60%, 3% 42%, 0% 24%)'

/**
 * Wide, low band -- not a card. The yellow is a painted shape with rough
 * edges rather than a bordered rectangle, so it's an SVG fill behind the
 * content (filled path only, no stroke, which is why stretching it with
 * `preserveAspectRatio="none"` is safe here).
 */
export function FestivalBand() {
  return (
    <section className="mx-auto mt-16.5 max-w-320 px-6.5">
      <div className="relative">
        <SwallowIcon className="pointer-events-none absolute -top-7 left-1 z-2 hidden h-13 -rotate-12 text-ink md:block" />

        <svg
          viewBox="0 0 1200 300"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-brand-yellow"
          aria-hidden="true"
        >
          <path
            d="M4,16 C120,6 200,22 320,10 C440,0 520,20 640,8 C760,-2 840,18 960,8 C1060,0 1140,16 1196,8 L1192,286 C1080,296 1000,278 880,290 C760,300 680,280 560,292 C440,302 360,282 240,292 C140,300 60,284 6,290 Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative flex flex-wrap items-center gap-x-10 gap-y-7 px-6 py-11 md:flex-nowrap md:px-9 md:py-12">
          <h2 className="-ml-1 shrink-0 font-heading text-[clamp(38px,5.6vw,76px)] leading-[.84] font-bold uppercase">
            Действующие
            <br />
            лица
          </h2>

          <div className="w-full min-w-0 md:w-auto md:flex-1">
            <div className="font-heading text-[clamp(15px,1.5vw,19px)] leading-[1.15] font-bold tracking-[.04em] uppercase">
              Всероссийский
              <br />
              фестиваль
              <br />
              с 2004 года
            </div>
            <p className="mt-3 max-w-85 text-[14px] leading-[1.5]">
              спектакли, режиссёры и театры со всей страны в Набережных Челнах
            </p>
            <NavLink
              to="/o-teatre"
              className="mt-5 inline-flex items-center gap-2 rounded-[4px] bg-ink px-6 py-3.25 font-heading text-[13px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5"
            >
              О фестивале <span aria-hidden="true">→</span>
            </NavLink>
          </div>

          <div className="relative hidden shrink-0 items-center lg:flex">
            <img src={elStar} alt="" className="pointer-events-none relative z-2 -mr-4 h-33 w-auto" />
            <img
              src={festivalPhoto}
              alt="Фестиваль «Действующие лица»"
              className="h-40 w-62 rotate-1 object-cover grayscale"
              style={{ clipPath: TORN }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
