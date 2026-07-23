import { Reveal } from '../components/ui/Reveal'
import { gallery } from '../data/gallery'

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">
        Фото со спектаклей и репетиций
      </div>
      <h1 className="mt-2.5 font-heading text-[clamp(48px,8vw,116px)] leading-[.86] font-bold uppercase">Галерея</h1>

      <div className="mt-7 grid grid-cols-2 auto-rows-57.5 gap-3 md:grid-cols-3">
        {gallery.map((img, i) => (
          <Reveal
            key={i}
            index={i}
            className={['overflow-hidden rounded-xl bg-ink', img.span === 'wide' ? 'row-span-2' : 'row-span-1'].join(' ')}
          >
            <img src={img.src} alt="" className="h-full w-full object-cover" />
          </Reveal>
        ))}
      </div>
    </main>
  )
}
