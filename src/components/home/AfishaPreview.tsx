import { NavLink } from 'react-router-dom'
import { AfishaBlock } from '../afisha/AfishaBlock'
import { afishaPreview } from '../../data/afisha'

export function AfishaPreview() {
  return (
    <section className="mx-auto mt-15 max-w-320 px-6.5">
      <AfishaBlock
        eyebrow="Ближайшие показы"
        heading="Афиша · сентябрь"
        headingAs="h2"
        headingClassName="mt-2 font-heading text-[clamp(38px,6vw,76px)] leading-[.84] font-bold uppercase"
        items={afishaPreview}
        ticketTo="/afisha"
        topRight={
          <NavLink to="/afisha" className="border-b-3 border-brand-yellow pb-1 font-heading text-sm font-medium text-paper uppercase">
            Вся афиша
          </NavLink>
        }
      />
    </section>
  )
}
