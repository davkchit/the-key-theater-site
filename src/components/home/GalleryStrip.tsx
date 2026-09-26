import { NavLink } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import photo1 from '../../../assets/photo-1.jpg'
import photo2 from '../../../assets/photo-2.jpg'
import photo3 from '../../../assets/photo-3.jpg'

const items = [
  { src: photo2, bg: 'bg-brand-blue' },
  { src: photo3, bg: 'bg-brand-red' },
  { src: photo1, bg: 'bg-ink' },
]

export function GalleryStrip() {
  return (
    <section className="mx-auto mt-15.5 max-w-320 px-6.5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-[clamp(30px,4.2vw,58px)] leading-[.9] font-bold uppercase">
            Так выглядит
            <br />
            «Ключ»
          </h2>
        </div>
        <NavLink to="/staryi/galereya" className="inline-flex items-center gap-2.5 font-script text-[26px] text-ink">
          атмосфера <span aria-hidden="true">→</span>
        </NavLink>
      </div>
      <div className="mt-5.5 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
        {items.map((item, i) => (
          <Reveal key={i} index={i} className={['min-h-70 overflow-hidden rounded-[5px]', item.bg].join(' ')}>
            <img src={item.src} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.06]" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
