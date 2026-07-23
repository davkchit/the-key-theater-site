import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { colors } from '../../theme/tokens'
import { shows } from '../../data/shows'

export const ROW_HEIGHT = 108

interface AfishaRowProps {
  item: AfishaItem
  ticketTo: string
}

const rowBgClass: Record<AfishaItem['band'], string> = {
  paper: 'bg-paper',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
}

const rowTextClass: Record<AfishaItem['band'], string> = {
  paper: 'text-ink',
  red: 'text-paper',
  blue: 'text-paper',
}

const accentHex: Record<AfishaItem['accent'], string> = {
  red: colors.red,
  blue: colors.blue,
  paper: colors.paper,
}

/** One flush row of the afisha strip -- background + date/time + title only.
 *  The per-show illustration is rendered separately by AfishaBlock so it can
 *  overlap into neighbouring rows instead of being clipped to this one. */
export function AfishaRow({ item, ticketTo }: AfishaRowProps) {
  const dateColor = item.band === 'paper' ? accentHex[item.accent] : colors.paper
  const based = shows.find((s) => s.title === item.title)?.based

  return (
    <div
      className={['relative flex items-center gap-5 px-6.5 md:px-12', rowBgClass[item.band], rowTextClass[item.band]].join(' ')}
      style={{ height: ROW_HEIGHT }}
    >
      <span
        className="absolute top-2 left-2 font-heading text-[9px] font-semibold opacity-50"
        style={{ color: item.band === 'paper' ? colors.ink : colors.paper }}
      >
        {item.age}
      </span>

      <div className="flex flex-shrink-0 items-baseline gap-3.5">
        <div className="text-center leading-none">
          <div className="font-heading text-[32px] font-bold" style={{ color: dateColor }}>
            {item.day}
          </div>
          <div className="mt-1 font-heading text-[9px] tracking-[.05em] uppercase opacity-70">{item.mon}</div>
        </div>
        <div className="hidden border-l border-current/20 pl-3.5 text-center leading-none opacity-80 sm:block">
          <div className="font-heading text-sm font-bold">{item.time}</div>
          <div className="mt-1 font-heading text-[9px] tracking-[.05em] uppercase">{item.wd}</div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-heading text-[clamp(19px,2.6vw,28px)] leading-[1.05] font-bold uppercase">{item.title}</div>
        {based && <div className="mt-0.5 truncate text-[12px] opacity-70">{based}</div>}
      </div>

      <NavLink
        to={ticketTo}
        className="flex-shrink-0 font-heading text-[13px] font-semibold tracking-[.06em] whitespace-nowrap uppercase underline-offset-4 hover:underline"
      >
        Купить билет
      </NavLink>
    </div>
  )
}
