import type { ReactNode } from 'react'
import type { AfishaItem } from '../../types/content'
import { StarIcon } from '../ui/StarIcon'
import { AfishaRow, ROW_HEIGHT, DATE_COL_WIDTH } from './AfishaRow'
import elFace from '../../../assets/el-face.svg'
import elChair from '../../../assets/el-chair.svg'
import elStar from '../../../assets/el-star.svg'
import elBoyFence from '../../../assets/el-boy-fence.svg'
import elFlower from '../../../assets/el-flower.svg'

interface AfishaBlockProps {
  eyebrow: string
  heading: ReactNode
  headingAs: 'h1' | 'h2'
  headingClassName: string
  topRight: ReactNode
  items: AfishaItem[]
  ticketTo: string
  footer?: ReactNode
}

// One of the brand book's hand-drawn line-art elements per show, not a
// poster crop -- matches how the mockup illustrates each row. No brand
// asset exists yet for "Никаких последствий" specifically, so it borrows
// the flower (closest in tone to a romance-driven story). "Тратить деньги и
// хихикать" deliberately has no entry -- one fewer illustration reads less
// cramped than covering every single show.
const rowArt: Record<string, string> = {
  Симон: elFace,
  'Никаких последствий': elFlower,
  'Ева Кюн': elChair,
  'Сказки на гранях': elStar,
  'Эмиль из Леннеберги': elBoyFence,
}

/**
 * Shared shell for the afisha strip -- used by both the home page preview
 * and the /afisha page. It has no background or side padding of its own: the
 * caller wraps it in a full-bleed black section plus a centred content
 * column (see AfishaPreview / AfishaPage), and the shell just fills that.
 * Rows render flush (no gaps/per-row rounding); each show's brand line-art
 * is layered on top afterwards, sized taller than a row so it can bleed
 * into the row below; a single absolutely-positioned rule -- not a per-row
 * border -- divides the date column from the title column down the whole
 * list, so it stays one continuous line regardless of how the row colour
 * underneath it changes.
 */
export function AfishaBlock({ eyebrow, heading, headingAs, headingClassName, topRight, items, ticketTo, footer }: AfishaBlockProps) {
  const Heading = headingAs
  // generous bleed -- tall enough to read as real presence (per the brand
  // reference), but every row now carries its own art, so this also has to
  // stay short enough that consecutive rows' bleed never overlaps into a
  // tangle -- paired with the wide left/right swing below, not on its own
  const artHeight = ROW_HEIGHT * 1.3
  const listHeight = items.length * ROW_HEIGHT

  // one illustration per SHOW, not per row -- a rerun (same title showing up
  // again later in the month) reuses the same art, so drawing it again just
  // added visual noise without telling the reader anything new. Always
  // anchoring on the *first* occurrence bunched every illustration into the
  // first half of the list and left the tail bare, so whichever illustrated
  // title reruns last in the month uses its *last* occurrence instead --
  // one illustration ends up anchoring the bottom of the list too.
  const titles = items.map((it) => it.title)
  const lastIndexByTitle = new Map(titles.map((t) => [t, titles.lastIndexOf(t)]))
  const illustratedTitlesInOrder = [...new Set(titles)].filter((t) => rowArt[t])
  const repeatingTitles = illustratedTitlesInOrder.filter((t) => titles.indexOf(t) !== lastIndexByTitle.get(t))
  const tailAnchorTitle = repeatingTitles[repeatingTitles.length - 1]

  const seenTitles = new Set<string>()
  const artRows = items
    .map((item, i) => ({ item, i }))
    .filter(({ item, i }) => {
      if (!rowArt[item.title]) return false
      if (item.title === tailAnchorTitle) return i === lastIndexByTitle.get(item.title)
      if (seenTitles.has(item.title)) return false
      seenTitles.add(item.title)
      return true
    })

  return (
    <div className="relative text-paper">
      <StarIcon className="pointer-events-none absolute top-11 right-15 h-29.5 opacity-13 invert" />

      {/* matches the date column's own inset (AfishaRow's pl-3.5/md:pl-6)
          and the ticket link's own inset (pr-5/md:pr-9) exactly, so the
          heading and the month tabs line up with the list under them */}
      <div className="relative flex flex-wrap items-end justify-between gap-5 pl-3.5 pr-5 md:pl-6 md:pr-9">
        <div>
          <div className="font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">{eyebrow}</div>
          <Heading className={headingClassName}>{heading}</Heading>
        </div>
        {topRight}
      </div>

      <div className="relative mt-7">
        <div className="flex flex-col border-t border-paper/25">
          {items.map((item, i) => (
            <AfishaRow key={`${item.day}-${item.title}-${i}`} item={item} ticketTo={ticketTo} />
          ))}
        </div>

        {/* the one continuous divider -- solid and dark on every row colour
            (cream/red/blue), only from md up, where row height is fixed and
            this pixel math is valid */}
        <div
          className="pointer-events-none absolute top-0 hidden w-px bg-black/80 md:block"
          style={{ left: DATE_COL_WIDTH, height: listHeight }}
        />

        {/* right offset cycle so the run of illustrations reads as a loose
            column rather than a straight repeating grid -- 5 distinct,
            irregularly-spaced positions spanning a wide 160-340px range,
            all pulled well clear of the ticket link's text, and rows that
            are actually adjacent (nothing in between to separate their
            bleed) always land >=100px apart. Upright, no rotation -- the
            brand-book mockup runs every illustration dead straight, not
            hand-tilted. */}
        {artRows.map(({ item, i }, artIdx) => {
          const art = rowArt[item.title]
          const isLast = i === items.length - 1
          const h = isLast ? ROW_HEIGHT : artHeight
          const rightPx = [160, 340, 200, 320, 260][artIdx % 5]
          const key = `art-${item.day}-${item.title}-${i}`
          const baseStyle = { top: i * ROW_HEIGHT, height: h, right: rightPx }

          // "Сказки на гранях" carries the brand star in yellow, not black --
          // a plain <img> can't recolour a flat-fill SVG, so paint it as a
          // solid-colour div masked to the star's silhouette instead
          if (item.title === 'Сказки на гранях') {
            const starAspect = 165 / 141
            return (
              <div
                key={key}
                aria-hidden
                className="pointer-events-none absolute hidden bg-brand-yellow md:block"
                style={{
                  ...baseStyle,
                  width: h * starAspect,
                  WebkitMaskImage: `url(${art})`,
                  maskImage: `url(${art})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'top',
                  maskPosition: 'top',
                }}
              />
            )
          }

          // the rest of the line art is plain black -- every row it can land
          // on (cream/red/blue) is light or saturated enough for it to read
          return (
            <img
              key={key}
              src={art}
              alt=""
              className="pointer-events-none absolute hidden object-contain object-top md:block"
              style={baseStyle}
            />
          )
        })}
      </div>

      {/* solid cream bar, flush against the last row -- always sits directly
          on the page's black, matching how the reference closes the list off */}
      {footer && <div className="relative border-t border-black/10 bg-paper py-4.5 text-center text-ink">{footer}</div>}
    </div>
  )
}
