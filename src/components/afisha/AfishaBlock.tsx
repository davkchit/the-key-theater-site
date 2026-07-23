import type { ReactNode } from 'react'
import type { AfishaItem } from '../../types/content'
import { StarIcon } from '../ui/StarIcon'
import { AfishaRow, ROW_HEIGHT } from './AfishaRow'

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

/**
 * Shared shell for the afisha strip -- used by both the home page preview
 * and the /afisha page, so the row styling only has to be right in one place.
 * Rows render flush (no gaps/per-row rounding); each show's poster/photo is
 * layered on top afterwards, absolutely positioned taller than a row so it
 * can bleed into the row below, matching the brand-book mockup.
 */
export function AfishaBlock({ eyebrow, heading, headingAs, headingClassName, topRight, items, ticketTo, footer }: AfishaBlockProps) {
  const Heading = headingAs
  const bleed = 44

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

      <div className="relative mt-7 -mx-6.5 md:-mx-12">
        <div className="flex flex-col">
          {items.map((item, i) => (
            <AfishaRow key={`${item.day}-${item.title}-${i}`} item={item} ticketTo={ticketTo} />
          ))}
        </div>

        {items.map((item, i) => {
          const isLast = i === items.length - 1
          const h = ROW_HEIGHT + (isLast ? 0 : bleed)
          return (
            <img
              key={`art-${item.day}-${item.title}-${i}`}
              src={item.thumb}
              alt=""
              className="pointer-events-none absolute right-35 hidden object-cover md:right-45 md:block"
              style={{ top: i * ROW_HEIGHT, height: h, width: h * 0.71 }}
            />
          )
        })}
      </div>

      {footer}
    </div>
  )
}
