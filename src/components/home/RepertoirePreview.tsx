import { NavLink } from 'react-router-dom'
import { ShowCard } from '../repertoire/ShowCard'
import { showsPreview } from '../../data/shows'

export function RepertoirePreview() {
  return (
    <section className="mx-auto mt-15.5 max-w-320 px-6.5">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-heading text-[clamp(34px,5vw,62px)] font-bold uppercase">Репертуар</h2>
        <NavLink to="/repertuar" className="border-b-3 border-brand-blue pb-0.5 font-heading text-[15px] font-medium text-ink uppercase">
          Все спектакли
        </NavLink>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
        {showsPreview.map((show, i) => (
          <ShowCard key={show.title} show={show} index={i} />
        ))}
      </div>
    </section>
  )
}
