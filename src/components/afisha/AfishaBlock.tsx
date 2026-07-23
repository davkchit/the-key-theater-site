import type { ReactNode } from 'react'
import type { AfishaItem } from '../../types/content'
import { StarIcon } from '../ui/StarIcon'
import { AfishaRow, ROW_HEIGHT } from './AfishaRow'
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
 * and the /afisha page, so the row styling only has to be right in one place.
 * Rows render flush (no gaps/per-row rounding); each show's brand line-art
 * is layered on top afterwards, sized taller than a row so it can bleed
 * into the row below, matching the brand-book mockup.
 */
export function AfishaBlock({ eyebrow, heading, headingAs, headingClassName, topRight, items, ticketTo, footer }: AfishaBlockProps) {
  const Heading = headingAs
  // modest bleed -- tall enough to visibly spill into the next row without
  // reaching far enough to collide with that row's own illustration, no
  // matter how many rows the list ends up with
  const artHeight = ROW_HEIGHT * 1.28

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-ink p-6.5 text-paper md:p-12">
      <StarIcon className="pointer-events-none absolute top-11 right-15 h-29.5 opacity-13 invert" />

      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-heading text-[13px] font-medium tracking-[.18em] text-brand-yellow uppercase">{eyebrow}</div>
          <Heading className={headingClassName}>{heading}</Heading>
        </div>
        {topRight}
      </div>

      {/* partial breakout, not a full one: keeps a thin black margin on both
          sides so a paper-colored row doesn't fuse into the page's own
          paper background right at the card's edge */}
      <div className="relative mt-7 -mx-3.5 md:-mx-9">
        <div className="flex flex-col">
          {items.map((item, i) => (
            <AfishaRow key={`${item.day}-${item.title}-${i}`} item={item} ticketTo={ticketTo} />
          ))}
        </div>

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
