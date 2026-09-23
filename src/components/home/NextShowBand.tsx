import { NavLink } from 'react-router-dom'
import type { AfishaItem } from '../../types/content'
import { TornEdge } from '../ui/TornEdge'

interface NextShowBandProps {
  show: AfishaItem
}

/** Sits right under Hero so the nearest date/ticket link is visible without
 *  scrolling. Torn top and bottom edges rather than a rounded card -- the
 *  brand book is printed/collage, and a clean rounded rectangle here was the
 *  single most "web template" thing on the page.
 *
 *  Caller must handle `nextShow === null` (off-season) -- there's no "nothing
 *  scheduled yet" copy here on purpose, that's a real content decision for
 *  whoever's around when summer comes, not something to guess at now (see
 *  PROJECT_CONTEXT.md). */
export function NextShowBand({ show }: NextShowBandProps) {
  return (
    <div className="mx-auto mt-5 max-w-320 px-6.5">
      <NavLink to="/kontakty" className="group relative block">
        <TornEdge className="absolute -top-2.75 left-0 h-3 w-full text-ink" />

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 bg-ink px-6 py-5 text-paper transition-transform duration-200 group-hover:-translate-y-0.5 md:px-9 md:py-6">
          <div>
            <div className="font-heading text-[11px] font-semibold tracking-[.2em] text-brand-yellow uppercase">Ближайший показ</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="font-heading text-[clamp(22px,2.6vw,30px)] leading-none font-bold uppercase">
                {show.day} {show.mon}
              </span>
              <span className="font-heading text-lg leading-none font-medium text-[#C9C2B2]">{show.time}</span>
              <span className="hidden h-5 w-px bg-paper/30 md:block" />
              <span className="font-heading text-[clamp(18px,2.2vw,26px)] leading-none font-bold uppercase">{show.title}</span>
              {show.age && (
                <span className="rounded-full border border-paper/40 px-2.5 py-1 font-heading text-[11px] font-semibold text-[#C9C2B2]">
                  {show.age}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-[4px] bg-brand-yellow px-6.5 py-3.5 font-heading text-[13px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 group-hover:-translate-y-0.5">
            Купить билет <span aria-hidden="true">→</span>
          </span>
        </div>

        <TornEdge className="absolute -bottom-2.75 left-0 h-3 w-full rotate-180 text-ink" />
      </NavLink>
    </div>
  )
}
