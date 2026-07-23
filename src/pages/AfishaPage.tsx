import { NavLink } from 'react-router-dom'
import { AfishaBlock } from '../components/afisha/AfishaBlock'
import { afishaFull } from '../data/afisha'

const months = [
  { label: 'Сентябрь', active: true },
  { label: 'Октябрь', active: false },
  { label: 'Ноябрь', active: false },
]

export default function AfishaPage() {
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
          items={afishaFull}
          ticketTo="/kursy"
          topRight={
            <div className="flex gap-5.5 pb-2 font-heading text-base tracking-[.06em] uppercase">
              {months.map((m) => (
                <span
                  key={m.label}
                  className={m.active ? 'border-b-3 border-brand-yellow pb-1.5 font-bold text-brand-yellow' : 'text-[#6B655A]'}
                >
                  {m.label}
                </span>
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
          Даты и составы могут меняться. Билеты — на сайте kluchtheatre.ru и в кассе театра.
        </p>
      </main>
    </div>
  )
}
