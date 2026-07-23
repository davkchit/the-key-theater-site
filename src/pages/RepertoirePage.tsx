import { ShowCard } from '../components/repertoire/ShowCard'
import { shows } from '../data/shows'

export default function RepertoirePage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">Мы создаём новые спектакли</div>
      <h1 className="mt-2.5 font-heading text-[clamp(48px,8vw,116px)] leading-[.86] font-bold uppercase">Репертуар</h1>
      <div className="mt-7.5 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {shows.map((show, i) => (
          <ShowCard key={show.title} show={show} index={i} />
        ))}
      </div>
    </main>
  )
}
