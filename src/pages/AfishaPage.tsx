import { NavLink } from 'react-router-dom'
import { AfishaCard } from '../components/afisha/AfishaCard'
import { StarIcon } from '../components/ui/StarIcon'
import { afishaFull } from '../data/afisha'

const months = [
  { label: 'Сентябрь', active: true },
  { label: 'Октябрь', active: false },
  { label: 'Ноябрь', active: false },
]

export default function AfishaPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-7.5">
      <div className="relative overflow-hidden rounded-[20px] bg-ink p-6.5 text-paper md:p-12">
        <StarIcon className="pointer-events-none absolute top-11 right-15 h-29.5 opacity-13 invert" />

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">Сезон 2026 / 2027</div>
            <h1 className="mt-2 font-heading text-[clamp(46px,8vw,104px)] leading-[.84] font-bold uppercase">Афиша</h1>
          </div>
          <div className="flex gap-5.5 pb-2 font-heading text-base tracking-[.06em] uppercase">
            {months.map((m) => (
              <span key={m.label} className={m.active ? 'border-b-3 border-brand-yellow pb-1.5 font-semibold text-paper' : 'text-[#6B655A]'}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-7 flex flex-col gap-3">
          {afishaFull.map((item, i) => (
            <AfishaCard key={`${item.day}-${item.title}`} item={item} index={i} ticketTo="/kursy" />
          ))}
        </div>

        <div className="relative mt-6.5 flex justify-center">
          <NavLink
            to="/repertuar"
            className="border-b-2 border-brand-yellow pb-1 font-heading text-sm font-medium tracking-[.1em] text-paper uppercase"
          >
            Весь репертуар
          </NavLink>
        </div>
      </div>
      <p className="mt-4.5 text-[13px] text-[#6B655A]">
        Даты и составы могут меняться. Билеты — на сайте kluchtheatre.ru и в кассе театра.
      </p>
    </main>
  )
}
