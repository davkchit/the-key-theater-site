import { NavLink } from 'react-router-dom'
import elKey from '../../../assets/el-key-hanging.svg'
import elStar from '../../../assets/el-star.svg'

export function FestivalBand() {
  return (
    <section className="mx-auto mt-5.5 max-w-320 px-6.5">
      <NavLink
        to="/o-teatre"
        className="relative block overflow-hidden rounded-[18px] border-2 border-ink bg-brand-yellow p-7 text-ink transition-transform duration-200 hover:-translate-y-1 md:p-12"
      >
        <img src={elKey} alt="" className="pointer-events-none absolute top-1/2 right-10 h-52.5 w-auto -translate-y-1/2 -rotate-12 opacity-16" />
        <img src={elStar} alt="" className="pointer-events-none absolute bottom-[-18px] left-[42%] h-24 w-auto rotate-8 opacity-14" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-heading text-[13px] font-medium tracking-[.16em] uppercase">Всероссийский · Международный</div>
            <div className="mt-2 font-heading text-[clamp(34px,6vw,74px)] leading-[.9] font-bold uppercase">
              Фестиваль
              <br />
              «Действующие лица»
            </div>
          </div>
          <p className="m-0 max-w-75 text-[15px] leading-[1.5]">Проводим ежегодно — к нам приезжают театры со всей России. Мы любим дружить.</p>
        </div>
      </NavLink>
    </section>
  )
}
