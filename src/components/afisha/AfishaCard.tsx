import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { Reveal } from '../ui/Reveal'
import { colors } from '../../theme/tokens'

interface AfishaCardProps {
  item: AfishaItem
  index?: number
  ticketTo: string
}

const rowBgClass: Record<AfishaItem['band'], string> = {
  dark: 'bg-[#242424]',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
}

const accentHex: Record<AfishaItem['accent'], string> = {
  red: colors.red,
  blue: colors.blue,
  paper: colors.paper,
}

export function AfishaCard({ item, index = 0, ticketTo }: AfishaCardProps) {
  const dateColor = item.band === 'dark' ? accentHex[item.accent] : colors.paper

  return (
    <Reveal index={index} className={['relative flex items-stretch gap-4.5 overflow-hidden rounded-xl py-4 pr-4.5 pl-5.5 text-paper', rowBgClass[item.band]].join(' ')}>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-4.5">
          <div className="flex-shrink-0 text-center leading-[.92]">
            <div className="font-heading text-[44px] font-bold" style={{ color: dateColor }}>
              {item.day}
            </div>
            <div className="mt-2 font-heading text-[10px] tracking-[.06em] uppercase opacity-80">
              {item.mon}
              <br />
              {item.wd}
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-heading text-[clamp(20px,3vw,32px)] leading-[.98] font-bold uppercase">{item.title}</div>
            <div className="mt-1.5 text-[13px] opacity-82">
              {item.age} · {item.hall} · {item.time}
            </div>
          </div>
        </div>
        <NavLink
          to={ticketTo}
          className="self-start rounded-md bg-brand-yellow px-5.5 py-3 font-heading text-[13px] font-semibold tracking-[.06em] whitespace-nowrap text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
        >
          Купить билет
        </NavLink>
      </div>
      <div className="w-22.5 flex-shrink-0 overflow-hidden rounded-lg bg-black/25">
        <img src={item.thumb} alt="" className="h-full w-full object-cover" />
      </div>
    </Reveal>
  )
}
