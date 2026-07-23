import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { colors } from '../../theme/tokens'
import { shows } from '../../data/shows'

export const ROW_HEIGHT = 108
/** Date-block width at sm+ (matches the `sm:w-44` class below) -- the single
 *  continuous divider line in AfishaBlock is positioned off this constant so
 *  the two can never drift out of alignment. Wide enough for the 44px date
 *  digits plus the time and the full weekday word (e.g. "воскресенье") next
 *  to them without either one crowding into the divider. */
export const DATE_COL_WIDTH = 176

interface AfishaRowProps {
  item: AfishaItem
  ticketTo: string
}

/** Row background/text for a given band -- same on every page the strip
 *  appears on: red/blue are always their brand colour with paper text, the
 *  neutral band is always cream with ink text. */
function rowStyle(band: AfishaItem['band']) {
  if (band === 'red') return { bg: 'bg-brand-red', text: 'text-paper', dark: true }
  if (band === 'blue') return { bg: 'bg-brand-blue', text: 'text-paper', dark: true }
  return { bg: 'bg-paper', text: 'text-ink', dark: false }
}

// date number is always pure white or pure black, never a brand colour --
// white only reads on the blue band, black is legible on both cream and red
function dateColorFor(band: AfishaItem['band']) {
  return band === 'blue' ? colors.paper : colors.ink
}

/** One flush row of the afisha strip -- background + date/time + title only.
 *  The per-show illustration and the column divider are rendered separately
 *  by AfishaBlock: the illustration so it can overlap into the row below
 *  instead of being clipped to its own row, and the divider so it's one
 *  genuine line down the whole list instead of per-row borders that break
 *  visual continuity wherever the row colour changes.
 *  Date column and content sit in one non-wrapping row at every width --
 *  below md the content itself (title/subtitle/ticket link) stacks into a
 *  column instead, so the date is always centred against the row's real
 *  height (ticket link included), not just against the title block. */
export function AfishaRow({ item, ticketTo }: AfishaRowProps) {
  const { bg, text, dark } = rowStyle(item.band)
  const dateColor = dateColorFor(item.band)
  const based = shows.find((s) => s.title === item.title)?.based

  return (
    <div
      className={[
        // no z-index bump here -- the divider/illustration overlay above this
        // row relies on plain DOM order to stay on top; giving the row its
        // own stacking context on hover pulled it above that overlay instead
        // and made the artwork vanish under the row on hover
        'group relative flex items-center py-3 pr-5 transition-[filter,box-shadow] duration-200 md:h-27 md:py-0 md:pr-9',
        'hover:shadow-[0_10px_24px_rgba(0,0,0,.35)] hover:brightness-[1.06]',
        dark ? 'border-b border-paper/10' : 'border-b border-black/10',
        bg,
        text,
      ].join(' ')}
    >
      <span className="absolute top-2 left-2 font-heading text-[9px] font-semibold opacity-50" style={{ color: dark ? colors.paper : colors.ink }}>
        {item.age}
      </span>

      <div className="flex w-20 flex-shrink-0 items-baseline gap-2.5 overflow-hidden pl-3.5 sm:w-44 md:pl-6">
        <div className="text-center leading-none">
          {/* 44px was sized for the desktop 176px-wide date column -- on
              mobile's much narrower 80px column that same size dominated
              the row, making the date block the tallest thing on its line
              and everything else read as crammed underneath it */}
          <div className="font-heading text-[32px] font-bold sm:text-[44px]" style={{ color: dateColor }}>
            {item.day}
          </div>
          <div className="mt-1 font-heading text-[11px] tracking-[.05em] uppercase opacity-70">{item.mon}</div>
        </div>
        {/* no separator line between date and time -- it read as a stray
            mark sitting in the middle of the date block for no reason */}
        <div className="hidden text-center leading-none opacity-80 sm:block">
          <div className="font-heading text-sm font-bold">{item.time}</div>
          <div className="mt-1 font-heading text-[9px] tracking-[.05em] uppercase">{item.wd}</div>
        </div>
      </div>

      {/* title/subtitle and the ticket link now share one flex container so
          the date column above is centred against their combined height --
          stacked below md, side by side from md up */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pl-5 md:flex-row md:items-center md:gap-0 md:pl-9">
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[clamp(19px,2.6vw,28px)] leading-[1.05] font-bold uppercase">{item.title}</div>
          {based && <div className="mt-1.5 truncate text-[12px] leading-[1.6] opacity-85">{based}</div>}
        </div>

        {/* mobile: a real filled brand-yellow button (same shape/padding as
            the header's own CTA, not a pill) -- self-start against this
            container's own pl-5/pl-9 keeps its left edge flush with the
            title/subtitle above it. From md up it reverts to the existing
            plain-text link flush at the row's end. */}
        <NavLink
          to={ticketTo}
          className="self-start rounded bg-brand-yellow px-3.5 py-[7px] font-heading text-[9px] font-semibold tracking-[.1em] whitespace-nowrap text-ink uppercase underline-offset-4 transition-[filter] duration-150 hover:brightness-95 md:ml-5 md:self-auto md:rounded-none md:bg-transparent md:px-0 md:py-0 md:text-[13px] md:tracking-[.06em] md:text-current md:transition-[opacity,background-color] md:hover:brightness-100 md:hover:bg-transparent md:hover:underline"
        >
          Купить билет
        </NavLink>
      </div>

      {/* below md, the single absolutely-positioned divider in AfishaBlock is
          hidden -- it's placed by multiplying a fixed ROW_HEIGHT, which only
          holds once row height is fixed (md:h-27); below that, rows grow
          with wrapping titles, so a per-row divider stands in instead,
          stretched to match however tall this row's content actually turns
          out to be -- title wrap and all -- with no pixel math needed.
          bottom is -1px, not 0: `inset` offsets stop at the row's padding
          edge, which sits *inside* its own border-b, so 0 left a 1px sliver
          of that border showing at the very bottom of the line every time. */}
      <div className="pointer-events-none absolute top-0 -bottom-px left-20 w-px bg-black/70 sm:left-44 md:hidden" />
    </div>
  )
}
