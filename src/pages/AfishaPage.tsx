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
    <div className="bg-ink">
      <main className="mx-auto max-w-320 px-6.5 pt-7.5 pb-13 text-paper">
        <AfishaBlock
          variant="flat"
          eyebrow="Сезон 2026 / 2027"
          heading="Афиша"
          headingAs="h1"
          headingClassName="mt-2 font-heading text-[clamp(46px,8vw,104px)] leading-[.84] font-bold uppercase"
          items={afishaFull}
          ticketTo="/kursy"
          topRight={
            <div className="flex gap-5.5 pb-2 font-heading text-base tracking-[.06em] uppercase">
              {months.map((m) => (
                <span key={m.label} className={m.active ? 'border-b-3 border-brand-yellow pb-1.5 font-semibold text-paper' : 'text-[#6B655A]'}>
                  {m.label}
                </span>
              ))}
            </div>
          }
          footer={
            <div className="relative mt-6.5 flex justify-center">
              <NavLink
                to="/repertuar"
                className="border-b-2 border-brand-yellow pb-1 font-heading text-sm font-medium tracking-[.1em] text-paper uppercase"
              >
                Весь репертуар
              </NavLink>
            </div>
          }
        />
        <p className="mt-4.5 text-[13px] text-paper/45">
          Даты и составы могут меняться. Билеты — на сайте kluchtheatre.ru и в кассе театра.
        </p>
      </main>
    </div>
  )
}
