import { NavLink } from 'react-router-dom'
import { AfishaBlock } from '../afisha/AfishaBlock'
import { afishaPreview } from '../../data/afisha'

export function AfishaPreview() {
  // background is the only thing that's full-bleed here -- it stretches to
  // the actual screen edges regardless of how wide the viewport is, while
  // the content inside stays in the same centred max-w-320 column as every
  // other section on the page (exactly the same split AfishaPage uses)
  return (
    <section className="relative left-1/2 mt-15 w-screen -translate-x-1/2 overflow-hidden rounded-[2px] bg-ink py-7.5">
      <div className="mx-auto max-w-320 px-6.5">
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
      </div>
    </section>
  )
}
