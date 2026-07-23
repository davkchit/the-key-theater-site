import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { Reveal } from '../ui/Reveal'
import { colors } from '../../theme/tokens'
import { shows } from '../../data/shows'

interface AfishaCardProps {
  item: AfishaItem
  index?: number
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

export function AfishaCard({ item, index = 0, ticketTo }: AfishaCardProps) {
  const dateColor = item.band === 'paper' ? accentHex[item.accent] : colors.paper
  const based = shows.find((s) => s.title === item.title)?.based

  return (
    <Reveal
      index={index}
      className={[
        'relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl py-4 pr-4.5 pl-5.5',
        rowBgClass[item.band],
        rowTextClass[item.band],
      ].join(' ')}
    >
      {/* date + title stay paired and can shrink together; basis-full forces the
          ticket group below onto its own line once the row runs out of room */}
      <div className="flex min-w-0 basis-full items-center gap-4.5 sm:basis-0 sm:flex-1">
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

        <div className="min-w-0 flex-1">
          <div className="font-heading text-[clamp(20px,3vw,32px)] leading-[.98] font-bold uppercase">{item.title}</div>
          {based && <div className="mt-1 truncate text-[13px] opacity-75">{based}</div>}
          <div
            className={[
              'mt-1.5 inline-block rounded px-2 py-0.5 font-heading text-[11px] whitespace-nowrap tracking-[.04em] uppercase',
              item.band === 'paper' ? 'bg-ink/8' : 'bg-black/15',
            ].join(' ')}
          >
            {item.age} · {item.hall} · {item.time}
          </div>
        </div>
      </div>

      <div className="ml-auto flex flex-shrink-0 items-center gap-3">
        <div className="hidden h-14 w-11 flex-shrink-0 overflow-hidden rounded-md shadow-[0_1px_4px_rgba(0,0,0,.35)] ring-1 ring-inset ring-white/25 sm:block">
          <img src={item.thumb} alt="" className="h-full w-full object-cover" />
        </div>

        <NavLink
          to={ticketTo}
          className="flex-shrink-0 rounded-md bg-brand-yellow px-5.5 py-3 font-heading text-[13px] font-semibold tracking-[.06em] whitespace-nowrap text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
        >
          Купить билет
        </NavLink>
      </div>
    </Reveal>
  )
}
