import { NavLink } from 'react-router-dom'
import { StarIcon } from '../ui/StarIcon'
import { SwallowIcon } from '../ui/SwallowIcon'

export function ManifestoDirector() {
  return (
    <section className="mt-16.5">
      <div className="mx-auto max-w-320 px-6.5">
        <div className="relative overflow-hidden rounded-[18px] bg-ink p-7.5 text-paper md:p-16.5">
          <StarIcon spin className="pointer-events-none absolute top-6.5 right-10 h-15 w-15 text-brand-yellow" />
          <svg
            viewBox="0 0 640 130"
            preserveAspectRatio="none"
            className="pointer-events-none absolute right-0 bottom-5.5 h-24 w-[54%] text-brand-red opacity-50"
            aria-hidden="true"
          >
            <path d="M20,64 C150,12 250,112 370,62 C470,20 560,86 620,52" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <SwallowIcon className="pointer-events-none absolute right-[15%] bottom-8.5 h-18.5 -rotate-8 animate-kl-float text-paper" />
          <SwallowIcon className="pointer-events-none absolute right-[5%] bottom-18.5 h-11 rotate-11 animate-kl-float text-brand-red" />

          <div className="relative font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">Манифест</div>
          <div className="relative mt-1.5 font-script text-[clamp(46px,8vw,104px)] leading-[.95] text-brand-red">
            любовь — это театр
          </div>
          <p className="relative mt-5.5 max-w-165 text-[clamp(18px,2.2vw,24px)] leading-[1.5] text-[#E7E1D2]">
            Театр для каждого свой. Для нас он — территория полёта. Мы любим дружить. Мы любим любить. Мы любим
            ТЕАТР.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center gap-3.5">
            <span className="font-script text-2xl text-paper">Софья Дивногорская</span>
            <span className="text-[13px] text-[#9B9484]">— режиссёр, педагог и художественный руководитель</span>
          </div>
          <NavLink
            to="/o-teatre"
            className="relative mt-6.5 inline-block rounded-[5px] bg-paper px-6.5 py-3.5 font-heading text-sm font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
          >
            О театре
          </NavLink>
        </div>
      </div>
    </section>
  )
}
