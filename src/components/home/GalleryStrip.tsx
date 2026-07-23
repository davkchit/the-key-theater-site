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
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-heading text-[clamp(34px,5vw,62px)] font-bold uppercase">Атмосфера</h2>
        <NavLink to="/galereya" className="border-b-3 border-brand-yellow pb-0.5 font-heading text-[15px] font-medium text-ink uppercase">
          Вся галерея
        </NavLink>
      </div>
      <div className="mt-5.5 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr]">
        {items.map((item, i) => (
          <Reveal key={i} index={i} className={['min-h-70 overflow-hidden rounded-xl', item.bg].join(' ')}>
            <img src={item.src} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.06]" />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
