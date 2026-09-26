import { NavLink } from 'react-router-dom'
import { StarIcon } from '../ui/StarIcon'
import { courseGroups } from '../../data/courseGroups'
import { mediaUrl } from '../../lib/mediaUrl'

const campPhoto = mediaUrl('/uploads/gallery/lager-1.jpg')

/**
 * Courses run year-round and are what the theatre actually sells every month,
 * unlike the seasonal shows -- but the home page used to mention them only via
 * one button in Hero. Rendered as a plain list rather than the big cards from
 * /kursy: this block sits next to the summer camp, and three heavy cards here
 * would outweigh everything around them.
 */
export function CoursesPreview() {
  return (
    <section className="mx-auto mt-15.5 max-w-320 px-6.5">
      <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,.3fr)_minmax(0,.42fr)_minmax(0,.28fr)] lg:gap-14">
        <div>
          <h2 className="font-heading text-[clamp(30px,3.8vw,50px)] leading-[.9] font-bold uppercase">
            Театр — это
            <br />
            не только
            <br />
            сцена
          </h2>
          <p className="mt-3.5 font-script text-[24px] leading-[1.15] text-brand-red">
            здесь можно
            <br />
            стать частью театра
          </p>
        </div>

        <ul className="m-0 list-none p-0">
          {courseGroups.map((g) => (
            <li key={g.key} className="border-t border-ink/15 first:border-t-0">
              <NavLink
                to={`/staryi/kursy/${g.key}`}
                className="group flex items-center justify-between gap-4 py-5.5 transition-colors hover:text-brand-red"
              >
                <span className="font-heading text-[clamp(19px,2.1vw,26px)] leading-tight font-bold uppercase">{g.title}</span>
                <span className="flex shrink-0 items-center gap-3 text-[13px] whitespace-nowrap text-[#6B655A]">
                  {g.ageRange}
                  <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </NavLink>
            </li>
          ))}
          <li className="border-t border-ink/15 pt-5">
            <NavLink
              to="/staryi/kursy"
              className="inline-flex items-center gap-2 rounded-[5px] bg-brand-yellow px-6 py-3.25 font-heading text-[13px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5"
            >
              Записаться на курс <span aria-hidden="true">→</span>
            </NavLink>
          </li>
        </ul>

        {/* the camp is a separate paid product of the theatre's, running since
            2022 -- it has no page of its own yet, so this points at the
            section of /o-teatre that describes it */}
        <NavLink to="/staryi/o-teatre" className="group relative flex min-h-62 flex-col justify-end overflow-hidden rounded-[5px] p-6 text-paper">
          <img
            src={campPhoto}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,14,.1)_0%,rgba(20,18,14,.74)_72%)]" />
          <StarIcon spin className="pointer-events-none absolute top-5 right-5 h-12 w-12 text-brand-yellow" />
          <div className="relative font-heading text-[clamp(22px,2.6vw,30px)] leading-[.95] font-bold uppercase">
            Солнечная
            <br />
            пыль
          </div>
          <div className="relative mt-2 text-[13px] text-[#E7E1D2]">летний театральный лагерь</div>
          <div className="relative mt-1 font-script text-[22px] text-brand-yellow">с 2022 года</div>
        </NavLink>
      </div>
    </section>
  )
}
