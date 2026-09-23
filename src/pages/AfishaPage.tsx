import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AfishaBlock } from '../components/afisha/AfishaBlock'
import { afishaFull, nextShow } from '../data/afisha'

// The schedule stores months in the genitive form used inside a date
// ("12 сентября"); the tab strip needs the nominative headline form.
const NOMINATIVE: Record<string, string> = {
  января: 'Январь',
  февраля: 'Февраль',
  марта: 'Март',
  апреля: 'Апрель',
  мая: 'Май',
  июня: 'Июнь',
  июля: 'Июль',
  августа: 'Август',
  сентября: 'Сентябрь',
  октября: 'Октябрь',
  ноября: 'Ноябрь',
  декабря: 'Декабрь',
}

// derived from the schedule itself rather than hardcoded -- the season plan
// spans September through January, and a hardcoded list silently stops
// matching the rows underneath it the moment the theatre edits a date
const monthKeys = [...new Set(afishaFull.map((i) => i.mon))]

export default function AfishaPage() {
  // the tabs used to be decorative; with a full season in the list (40+
  // showings across five months) they read as a filter, so they are one.
  // Default to the *upcoming* month, not just the first one in the file --
  // otherwise this opens on a month that's already over the moment the
  // season rolls past September.
  const [activeMonth, setActiveMonth] = useState(nextShow?.mon ?? monthKeys[0] ?? '')
  const items = afishaFull.filter((i) => i.mon === activeMonth)

  return (
    // -mb-17.5 cancels the global Footer's own mt-17.5 -- that margin exists
    // to give the black footer breathing room against a *cream* page below
    // it, but this page is already black right down to its own bottom edge,
    // so the same margin was showing up as a stray cream sliver between the
    // two black areas instead
    <div className="-mb-17.5 overflow-hidden rounded-[2px] bg-ink">
      <main className="mx-auto max-w-320 px-6.5 pt-7.5 pb-20 text-paper">
        <AfishaBlock
          eyebrow="Сезон 2026 / 2027"
          heading="Афиша"
          headingAs="h1"
          headingClassName="mt-2 font-heading text-[clamp(46px,8vw,104px)] leading-[.84] font-bold uppercase"
          items={items}
          ticketTo="/kontakty"
          topRight={
            <div className="flex flex-wrap gap-5.5 pb-2 font-heading text-base tracking-[.06em] uppercase">
              {monthKeys.map((mon) => (
                <button
                  key={mon}
                  onClick={() => setActiveMonth(mon)}
                  className={
                    mon === activeMonth
                      ? 'border-b-3 border-brand-yellow pb-1.5 font-bold text-brand-yellow'
                      : 'border-b-3 border-transparent pb-1.5 text-[#6B655A] transition-colors hover:text-paper'
                  }
                >
                  {NOMINATIVE[mon] ?? mon}
                </button>
              ))}
            </div>
          }
          footer={
            <NavLink to="/repertuar" className="font-heading text-sm font-semibold tracking-[.12em] uppercase hover:underline">
              Весь репертуар
            </NavLink>
          }
        />
        <p className="mt-4.5 text-[13px] text-paper/45">
          Даты и составы могут меняться. Билеты — на Билетоне, Яндекс Афише и в кассе театра.
        </p>
      </main>
    </div>
  )
}
