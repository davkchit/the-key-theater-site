import type { ReactNode } from 'react'
import type { AfishaItem } from '../../types/content'
import { StarIcon } from '../ui/StarIcon'
import { AfishaRow, ROW_HEIGHT, DATE_COL_WIDTH, type AfishaVariant } from './AfishaRow'
import elFace from '../../../assets/el-face.svg'
import elChair from '../../../assets/el-chair.svg'
import elStar from '../../../assets/el-star.svg'
import elBoyFence from '../../../assets/el-boy-fence.svg'
import elFlower from '../../../assets/el-flower.svg'
import elScribbleX from '../../../assets/el-scribble-x.svg'

interface AfishaBlockProps {
  eyebrow: string
  heading: ReactNode
  headingAs: 'h1' | 'h2'
  headingClassName: string
  topRight: ReactNode
  items: AfishaItem[]
  ticketTo: string
  footer?: ReactNode
  /** 'card' (default): floating rounded black card, used on the home page
   *  preview -- neutral rows render black, list breaks fully out of the
   *  card's own padding since there's no colour clash to guard against.
   *  'flat': no card shell at all, used on the /afisha page where the whole
   *  page is already black -- neutral rows stay cream, list uses the page's
   *  own padding instead of breaking out of anything. */
  variant?: AfishaVariant
}

// One of the brand book's hand-drawn line-art elements per show, not a
// poster crop -- matches how the mockup illustrates each row. No brand
// asset exists yet for "Никаких последствий" specifically, so it borrows
// the flower (closest in tone to a romance-driven story).
const rowArt: Record<string, string> = {
  Симон: elFace,
  'Никаких последствий': elFlower,
  'Ева Кюн': elChair,
  'Тратить деньги и хихикать': elScribbleX,
  'Сказки на гранях': elStar,
  'Эмиль из Леннеберги': elBoyFence,
}

/**
 * Shared shell for the afisha strip -- used by both the home page preview
 * and the /afisha page, so the row styling only has to be right in one place
 * even though the two now look different (see `variant`).
 * Rows render flush (no gaps/per-row rounding); each show's brand line-art
 * is layered on top afterwards, sized taller than a row so it can bleed
 * into the row below; a single absolutely-positioned rule -- not a per-row
 * border -- divides the date column from the title column down the whole
 * list, so it stays one continuous line regardless of how the row colour
 * underneath it changes.
 */
export function AfishaBlock({
  eyebrow,
  heading,
  headingAs,
  headingClassName,
  topRight,
  items,
  ticketTo,
  footer,
  variant = 'card',
}: AfishaBlockProps) {
  const Heading = headingAs
  const isCard = variant === 'card'
  // modest bleed -- tall enough to visibly spill into the next row without
  // reaching far enough to collide with that row's own illustration, no
  // matter how many rows the list ends up with
  const artHeight = ROW_HEIGHT * 1.28
  const listHeight = items.length * ROW_HEIGHT

  return (
    <div className={isCard ? 'relative overflow-hidden rounded-[20px] bg-ink p-6.5 text-paper md:p-12' : 'relative text-paper'}>
      <StarIcon className="pointer-events-none absolute top-11 right-15 h-29.5 opacity-13 invert" />

      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">{eyebrow}</div>
          <Heading className={headingClassName}>{heading}</Heading>
        </div>
        {topRight}
      </div>

      {/* card: breaks fully out of the shell's own padding (neutral rows are
          black now, so there's nothing left for a side margin to protect
          against). flat: no shell padding to break out of in the first
          place -- the page itself already supplies the margin. */}
      <div className={['relative mt-7', isCard ? '-mx-6.5 md:-mx-12' : ''].join(' ')}>
        <div className="flex flex-col">
          {items.map((item, i) => (
            <AfishaRow key={`${item.day}-${item.title}-${i}`} item={item} ticketTo={ticketTo} variant={variant} />
          ))}
        </div>

        {/* the one continuous divider -- light on the all-dark 'card' rows,
            dark on 'flat's cream/red/blue mix -- only from md up, where row
            height is fixed and this pixel math is valid */}
        <div
          className={['pointer-events-none absolute top-0 hidden w-px md:block', isCard ? 'bg-paper/25' : 'bg-black/70'].join(' ')}
          style={{ left: DATE_COL_WIDTH, height: listHeight }}
        />

        {items.map((item, i) => {
          const art = rowArt[item.title]
          if (!art) return null
          const isLast = i === items.length - 1
          const h = isLast ? ROW_HEIGHT * 0.8 : artHeight
          return (
            <img
              key={`art-${item.day}-${item.title}-${i}`}
              src={art}
              alt=""
              className="pointer-events-none absolute right-40 hidden object-contain object-top md:right-52 md:block"
              style={{ top: i * ROW_HEIGHT, height: h }}
            />
          )
        })}
      </div>

      {footer}
    </div>
  )
}
