import { Reveal } from '../ui/Reveal'
import { bands } from '../../data/bands'

type BandColor = (typeof bands)[number]['color']

const bgClass: Record<BandColor, string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

// The brand elements are black brush drawings. They are printed black on the
// light and red tiles and knocked out to white on the dark ones -- never
// faded down: running them as pale watermarks was what made these tiles read
// as unfinished next to the brand book.
const artClass: Record<BandColor, string> = {
  yellow: '',
  red: '',
  blue: 'invert',
  ink: 'invert',
}

export function ManifestoBands() {
  return (
    <section className="mx-auto mt-9 max-w-320 px-6.5">
      {/* four separate tiles with air between them, not one strip cut up by
          dividers. No outline and barely any corner rounding -- these are
          printed colour fields, and the 2px frame made them read as UI cards */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {bands.map((b, i) => {
          const fg = b.color === 'yellow' ? 'text-ink' : 'text-paper'
          // the ladder is tall and upright, so it is the one drawing that
          // climbs out over the top of its tile instead of sitting inside it
          const bleeds = b.color === 'yellow'
          return (
            <Reveal
              key={b.num}
              index={i}
              className={[bgClass[b.color], fg, 'relative flex min-h-46 flex-col justify-end rounded-[5px] p-6'].join(' ')}
            >
              <img
                src={b.icon}
                alt=""
                className={[
                  // on the two-column phone grid a vertically-centred drawing
                  // lands straight on top of the word, so pin it to the corner
                  // there and only centre it once the tiles are wide
                  'pointer-events-none absolute top-3 right-3 h-[30%] max-w-[30%] w-auto object-contain object-right',
                  bleeds
                    ? 'md:top-auto md:bottom-4 md:h-[104%] md:max-w-[34%] md:translate-y-0'
                    : 'md:top-1/2 md:h-[64%] md:max-w-[34%] md:-translate-y-1/2',
                  artClass[b.color],
                ].join(' ')}
              />
              <div className="relative font-heading text-[clamp(22px,2.4vw,32px)] leading-[.95] font-bold uppercase">{b.word}</div>
              {/* on a phone the drawing sits in the top corner, so the
                  handwriting under it can run wide instead of being squeezed
                  into four one-word lines */}
              <div className="relative mt-2 max-w-[82%] font-script text-[18px] leading-[1.2] opacity-90 md:max-w-[55%]">{b.note}</div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
