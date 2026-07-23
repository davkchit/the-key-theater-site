import { NavLink } from 'react-router-dom'
import { AfishaCard } from '../afisha/AfishaCard'
import { StarIcon } from '../ui/StarIcon'
import { afishaPreview } from '../../data/afisha'

export function AfishaPreview() {
  return (
    <section className="mx-auto mt-15 max-w-320 px-6.5">
      <div className="relative overflow-hidden rounded-[20px] bg-ink p-6.5 text-paper md:p-12">
        <StarIcon className="pointer-events-none absolute top-11 right-15 h-29.5 opacity-13 invert" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">Ближайшие показы</div>
            <h2 className="mt-2 font-heading text-[clamp(38px,6vw,76px)] leading-[.84] font-bold uppercase">Афиша · сентябрь</h2>
          </div>
          <NavLink to="/afisha" className="border-b-3 border-brand-yellow pb-1 font-heading text-sm font-medium text-paper uppercase">
            Вся афиша
          </NavLink>
        </div>
        <div className="relative mt-7 flex flex-col gap-3">
          {afishaPreview.map((item, i) => (
            <AfishaCard key={`${item.day}-${item.title}`} item={item} index={i} ticketTo="/afisha" />
          ))}
        </div>
      </div>
    </section>
  )
}
