import { NavLink } from 'react-router-dom'
import type { Show } from '../../types/content'
import { Reveal } from '../ui/Reveal'

interface ShowCardProps {
  show: Show
  index?: number
}

const bgClass: Record<Show['bg'], string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

export function ShowCard({ show, index = 0 }: ShowCardProps) {
  return (
    <Reveal
      index={index}
      className="flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-paper transition-transform duration-260 ease-out hover:-translate-y-1.5"
    >
      <div className={['group relative aspect-[71/100] overflow-hidden', bgClass[show.bg]].join(' ')}>
        <img src={show.photo} alt={show.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        {!show.poster && (
          <div className="absolute top-3 left-3 rounded bg-paper px-2.5 py-1.25 font-heading text-xs font-semibold text-ink">{show.age}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="font-heading text-[27px] leading-[.98] font-bold uppercase">{show.title}</div>
        <div className="mt-2.5 flex-1 text-sm leading-[1.5] text-[#33302a]">{show.based}</div>
        <div className="mt-4 flex items-center justify-between font-heading text-xs tracking-[.04em] text-[#6B655A] uppercase">
          <span>реж. {show.dir}</span>
          <span>{show.dur}</span>
        </div>
        <NavLink
          to="/afisha"
          className="mt-4 rounded-md bg-ink py-3.25 text-center font-heading text-[13px] font-semibold tracking-[.08em] text-paper uppercase"
        >
          Расписание
        </NavLink>
      </div>
    </Reveal>
  )
}
