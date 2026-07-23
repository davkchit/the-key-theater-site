import { StarIcon } from '../ui/StarIcon'
import { WavyUnderline } from '../ui/WavyUnderline'
import { bands } from '../../data/bands'

const bgClass: Record<(typeof bands)[number]['color'], string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

export function ManifestoBands() {
  return (
    <section className="mx-auto mt-6.5 max-w-320 px-6.5">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border-2 border-ink md:grid-cols-4">
        {bands.map((b) => {
          const fg = b.color === 'yellow' ? 'text-ink' : 'text-paper'
          return (
            <div
              key={b.num}
              className={[bgClass[b.color], fg, 'relative flex min-h-53.5 flex-col justify-end overflow-hidden border-r-2 border-ink p-6 last:border-r-0']
                .join(' ')}
            >
              <img src={b.icon} alt="" className={['pointer-events-none absolute top-10 -right-3 h-29.5 w-auto opacity-22', b.color !== 'yellow' ? 'invert' : ''].join(' ')} />
              <div className="absolute top-4.5 right-5 font-heading text-4xl leading-none font-bold opacity-30">{b.num}</div>
              <StarIcon className="absolute top-5 left-5.5 h-6.5 w-6.5" />
              <div className="relative font-heading text-[clamp(28px,3.2vw,42px)] leading-[.92] font-bold uppercase">{b.word}</div>
              <WavyUnderline className="relative mt-2.5 h-3 w-18" />
              <div className="relative mt-2 text-[13px] opacity-82">{b.note}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
