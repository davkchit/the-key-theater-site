import { useState } from 'react'
import { Link } from 'react-router-dom'
import { shows } from '../data/shows'
import { PrintFilters, BTN, H2, WRAP } from '../components/home2/parts'
import { InkFade, Torn } from '../components/home2/paper'
import { ShowPoster } from '../components/home2/ShowPoster'
import { heroShows, longDate, showPath, upcomingCards } from '../components/home2/homeData'
import { Reveal } from '../components/ui/Reveal'
import starSvg from '../../assets/el-star.svg'

// «Спектакли»: every show in the repertoire as a poster, with a filter by age,
// and the nearest show on a black band.

type Filter = 'all' | 'kids' | 'adults'
const FILTERS: [Filter, string][] = [
  ['all', 'Все'],
  ['kids', 'Для детей'],
  ['adults', 'Для взрослых'],
]

const ageOf = (age?: string) => (age ? parseInt(age, 10) : NaN)
// 12+ is for both: older children and adults
const fits = (f: Filter, age?: string) => {
  const a = ageOf(age)
  if (f === 'all') return true
  if (Number.isNaN(a)) return false
  return f === 'kids' ? a <= 12 : a >= 12
}

export default function RepertoirePageV2() {
  const [filter, setFilter] = useState<Filter>('all')
  const list = shows.filter((s) => fits(filter, s.age))
  // the very next show on the schedule, with its first-screen photo when the
  // admin picked one (heroShows only holds shows that have such a photo)
  const nearest = upcomingCards[0]
  const heroPick = nearest && heroShows.find((h) => h.item.title === nearest.item.title)
  const featured = nearest && {
    ...nearest,
    photo: heroPick?.photo || nearest.photo,
    focus: heroPick?.focus,
  }

  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />
      <section className={`${WRAP} pt-14 pb-16 md:pt-20 md:pb-24`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-[clamp(52px,9vw,120px)] leading-[.86] font-bold uppercase">
              Спектакли
            </h1>
            <p className="mt-4 text-[17px] md:text-[19px]">Спектакли, которые идут в этом сезоне</p>
          </div>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Фильтр по возрасту">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`rounded-md border-2 px-5 py-2.5 text-[15px] font-medium transition-colors duration-150 active:scale-[.97] ${
                  filter === key ? 'border-ink bg-ink text-paper' : 'border-ink/70 hover:bg-ink/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {list.length ? (
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 xl:gap-x-8">
            {list.map((s) => (
              <Reveal key={s.title} index={shows.indexOf(s) % 4} className="flex">
                <ShowPoster show={s} n={shows.indexOf(s)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-[17px]">
            В этой подборке пока нет спектаклей. Загляните во «Все».
          </p>
        )}
      </section>

      {featured && (
        <section className="bg-ink text-paper relative isolate">
          <Torn color="text-ink" seed={131} />
          {featured.photo && (
            <div className="absolute inset-0 -z-10 overflow-hidden md:left-[40%]">
              <img
                src={featured.photo}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-60 md:opacity-100"
                style={{ objectPosition: featured.focus ?? '60% 40%' }}
              />
              <div className="from-ink via-ink/60 absolute inset-0 bg-gradient-to-t to-transparent md:hidden" />
              <InkFade side="left" className="inset-y-0 left-0 hidden w-[45%] md:block" />
              <InkFade side="top" className="inset-x-0 top-0 h-20 md:h-28" />
              <InkFade side="bottom" className="inset-x-0 bottom-0 h-20 md:h-28" />
            </div>
          )}
          <div className={`${WRAP} relative z-[3] py-16 md:py-24`}>
            <div className="font-heading flex items-center gap-3 text-[18px] tracking-[.06em] uppercase md:text-[22px]">
              <img src={starSvg} alt="" aria-hidden="true" className="h-8 w-8 invert" />
              Ближайший спектакль
            </div>
            <h2 className={`${H2} mt-4 max-w-[12ch]`}>{featured.item.title}</h2>
            <p className="mt-4 text-[19px] md:text-[22px]">{longDate(featured.item)}</p>
            <div className="text-paper/85 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
              {featured.show?.dir && <span>Режиссёр — {featured.show.dir}</span>}
              {featured.show?.dur && <span>{featured.show.dur}</span>}
              {featured.item.age && <span>{featured.item.age}</span>}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              {featured.ticketUrl && (
                <a
                  href={featured.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN} bg-brand-red text-paper px-9 py-4.5 text-[17px]`}
                >
                  Купить билет
                </a>
              )}
              <Link
                to={showPath(featured.item.title)}
                className="group inline-flex items-center gap-2.5 text-[17px] font-medium"
              >
                <span className="border-paper/70 border-b pb-0.5">О спектакле</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
          <Torn color="text-ink" side="bottom" seed={137} />
        </section>
      )}
      <div className="h-16" />
    </div>
  )
}
