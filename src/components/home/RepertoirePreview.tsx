import { NavLink } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import { SwallowIcon } from '../ui/SwallowIcon'
import { showsPreview } from '../../data/shows'
import elFace from '../../../assets/el-face.svg'
import elFlower from '../../../assets/el-flower.svg'
import elLadder from '../../../assets/el-ladder.svg'
import elStar from '../../../assets/el-star.svg'

const bgClass = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
} as const

const showArt: Record<string, string> = {
  Симон: elFace,
  'Никаких последствий': elFlower,
  Лариса: elLadder,
}

/**
 * Home page teaser -- a photo, a title and the two facts that decide whether
 * someone clicks (age marking + genre). The full cards with synopsis, director
 * and running time live on /repertuar.
 *
 * There are seven shows in the whole repertoire, not a catalogue of hundreds,
 * so the three tiles are deliberately given real size here.
 */
export function RepertoirePreview() {
  return (
    <section className="relative mx-auto mt-16.5 max-w-320 px-6.5">
      {/* one element crossing the seam between the black afisha block above
          and the cream here -- red, so it reads on both sides. Deliberately
          the only one on the page: the trick works because it is rare */}
      <SwallowIcon className="pointer-events-none absolute -top-12 left-[46%] z-2 hidden h-17 -rotate-[18deg] text-brand-red lg:block" />

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,.28fr)_minmax(0,.72fr)] lg:gap-9">
        <div>
          <h2 className="font-heading text-[clamp(32px,3.6vw,50px)] leading-[.88] font-bold uppercase">Спектакли</h2>
          <NavLink to="/staryi/repertuar" className="mt-3 inline-flex items-center gap-2.5 font-script text-[26px] text-ink">
            наш репертуар <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-3">
          {showsPreview.map((show, i) => {
            const art = showArt[show.title] ?? elStar
            return (
              <Reveal key={show.title} index={i}>
                <NavLink to="/staryi/repertuar" className="group block">
                  <div className={['relative aspect-4/3 overflow-hidden rounded-[5px]', bgClass[show.bg]].join(' ')}>
                    {show.photo ? (
                      <img
                        src={show.photo}
                        alt={show.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    ) : (
                      // no production photo yet -- instead of a lone star that
                      // reads as a missing image, the tile becomes a printed
                      // colour field carrying the show's own line about itself
                      <div className="relative flex h-full w-full flex-col justify-end p-5">
                        <img
                          src={art}
                          alt=""
                          className={[
                            'pointer-events-none absolute top-4 right-4 h-[58%] w-auto object-contain object-right',
                            show.bg === 'yellow' ? '' : 'invert',
                          ].join(' ')}
                        />
                        <div
                          className={[
                            'relative font-heading text-[clamp(15px,1.5vw,19px)] leading-[1.1] font-bold uppercase',
                            show.bg === 'yellow' ? 'text-ink' : 'text-paper',
                          ].join(' ')}
                        >
                          {show.based}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3.5 font-heading text-[clamp(20px,1.9vw,24px)] leading-tight font-bold uppercase">{show.title}</div>
                  <div className="mt-2 flex items-center gap-2.5 text-[13px] text-[#6B655A]">
                    {show.age && (
                      <span className="rounded-[3px] bg-ink px-1.5 py-0.5 font-heading text-[11px] font-semibold text-paper">{show.age}</span>
                    )}
                    {show.genre && <span className="truncate">{show.genre}</span>}
                    <span className="ml-auto shrink-0 text-ink transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  </div>
                </NavLink>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
