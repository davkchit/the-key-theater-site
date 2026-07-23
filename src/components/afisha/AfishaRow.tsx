import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { colors } from '../../theme/tokens'
import { shows } from '../../data/shows'

export const ROW_HEIGHT = 108
/** Date-block width at sm+ (matches the `sm:w-32` class below) -- the single
 *  continuous divider line in AfishaBlock is positioned off this constant so
 *  the two can never drift out of alignment. */
export const DATE_COL_WIDTH = 128

export type AfishaVariant = 'card' | 'flat'

interface AfishaRowProps {
  item: AfishaItem
  ticketTo: string
  variant: AfishaVariant
}

const accentHex: Record<AfishaItem['accent'], string> = {
  red: colors.red,
  blue: colors.blue,
  paper: colors.paper,
}

/** Row background/text for a given band, aware of the block's variant --
 *  'card' (home preview, floating black card) renders the neutral band as
 *  black instead of cream, since the card itself is already black and a
 *  cream row there needs its own border to read as distinct. 'flat' (the
 *  /afisha page, which is black end-to-end already) keeps the neutral band
 *  cream, since there's a full black page around it instead of a nested card. */
function rowStyle(band: AfishaItem['band'], variant: AfishaVariant) {
  if (band === 'red') return { bg: 'bg-brand-red', text: 'text-paper', dark: true }
  if (band === 'blue') return { bg: 'bg-brand-blue', text: 'text-paper', dark: true }
  return variant === 'card' ? { bg: 'bg-ink', text: 'text-paper', dark: true } : { bg: 'bg-paper', text: 'text-ink', dark: false }
}

/** One flush row of the afisha strip -- background + date/time + title only.
 *  The per-show illustration and the column divider are rendered separately
 *  by AfishaBlock: the illustration so it can overlap into the row below
 *  instead of being clipped to its own row, and the divider so it's one
 *  genuine line down the whole list instead of per-row borders that break
 *  visual continuity wherever the row colour changes.
 *  Height is fixed only from md up (where the illustration overlay and the
 *  divider need a predictable row height to align against) -- below md the
 *  row grows to fit a wrapping title instead of the ticket link overlapping
 *  it, and the ticket link drops to its own line since the date+title group
 *  takes the full row width there. */
export function AfishaRow({ item, ticketTo, variant }: AfishaRowProps) {
  const { bg, text, dark } = rowStyle(item.band, variant)
  // the neutral band's date number always takes the item's accent colour for
  // a pop of red/blue, whether that row itself renders cream (flat) or black
  // (card) -- only red/blue rows force the number to plain paper for contrast
  const dateColor = item.band === 'paper' ? accentHex[item.accent] : colors.paper
  const based = shows.find((s) => s.title === item.title)?.based

  return (
    <div className={['relative flex flex-wrap items-center gap-y-1 py-3 pr-5 md:h-27 md:flex-nowrap md:py-0 md:pr-9', bg, text].join(' ')}>
      <span className="absolute top-2 left-2 font-heading text-[9px] font-semibold opacity-50" style={{ color: dark ? colors.paper : colors.ink }}>
        {item.age}
      </span>

      <div className="flex min-w-0 basis-full items-center md:basis-0 md:flex-1">
        <div className="flex w-20 flex-shrink-0 items-baseline gap-3 pl-3.5 sm:w-32 md:pl-6">
          <div className="text-center leading-none">
            <div className="font-heading text-[38px] font-bold" style={{ color: dateColor }}>
              {item.day}
            </div>
            <div className="mt-1 font-heading text-[10px] tracking-[.05em] uppercase opacity-70">{item.mon}</div>
          </div>
          <div className="hidden border-l border-current/20 pl-3 text-center leading-none opacity-80 sm:block">
            <div className="font-heading text-sm font-bold">{item.time}</div>
            <div className="mt-1 font-heading text-[9px] tracking-[.05em] uppercase">{item.wd}</div>
          </div>
        </div>

        <div className="min-w-0 flex-1 pl-3.5 md:pl-6">
          <div className="font-heading text-[clamp(19px,2.6vw,28px)] leading-[1.05] font-bold uppercase">{item.title}</div>
          {based && <div className="mt-0.5 truncate text-[12px] opacity-70">{based}</div>}
        </div>
      </div>

      <NavLink
        to={ticketTo}
        className="ml-3.5 flex-shrink-0 font-heading text-[13px] font-semibold tracking-[.06em] whitespace-nowrap uppercase underline-offset-4 hover:underline md:ml-5"
      >
        Купить билет
      </NavLink>
    </div>
  )
}
