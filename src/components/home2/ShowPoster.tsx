import { Link } from 'react-router-dom'
import type { Show } from '../../types/content'
import { BTN, Duotone, Ink, type Tone } from './parts'
import { showPath } from './homeData'
import chairSvg from '../../../assets/el-chair.svg'
import faceSvg from '../../../assets/el-face.svg'
import flowerSvg from '../../../assets/el-flower.svg'

// A show's card, the same on the homepage, the repertoire and a show's own
// page. A show without a photo gets a big ink drawing instead of an empty
// frame, so it still looks like a poster.

const POSTER_TONES: Tone[] = ['red', 'paper', 'blue', 'ink']
const EMPTY_ART = [faceSvg, flowerSvg, chairSvg, faceSvg]

/**
 * A show's picture, the same everywhere: the photo in live colour, or in two
 * colours when the theatre picked one in the admin («Цвет поверх фото»). A show
 * without a photo gets a drawn poster instead of an empty frame.
 */
export function PosterArt({
  photo,
  n,
  tint,
  alt = '',
  className = '',
}: {
  photo: string
  n: number
  tint?: Show['tint']
  alt?: string
  className?: string
}) {
  if (photo && !tint) {
    return (
      <div className={`bg-ink relative overflow-hidden ${className}`}>
        <img
          src={photo}
          alt={alt}
          loading="lazy"
          style={{ objectPosition: '50% 25%' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    )
  }
  if (photo && tint) {
    return (
      <Duotone src={photo} tone={tint as Tone} alt={alt} className={className} position="50% 25%" />
    )
  }
  // the same colour for a show everywhere: its tint if picked, else by its
  // place in the repertoire (callers pass that, not the card's position)
  const tone = (tint || POSTER_TONES[n % 4]) as Tone
  const light = tone === 'ink' || tone === 'blue'
  return (
    <Duotone src="" tone={tone} alt={alt} className={className}>
      <Ink src={EMPTY_ART[n % 4] as string} light={light} className="inset-0 m-auto h-3/5 w-3/5" />
    </Duotone>
  )
}

export function AgeBadge({ age, className = '' }: { age?: string; className?: string }) {
  if (!age) return null
  return (
    <span
      className={`bg-brand-red font-heading text-paper rounded-[4px] px-2 py-1 text-[14px] font-semibold ${className}`}
    >
      {age}
    </span>
  )
}

/** The repertoire card: poster, genre, title, source, director, length, age, «Подробнее». */
export function ShowPoster({ show, n }: { show: Show; n: number }) {
  const to = showPath(show.title)
  return (
    <div className="flex h-full w-full flex-col">
      <Link to={to} className="block" aria-label={`«${show.title}» — подробнее`}>
        <PosterArt
          photo={show.photo}
          tint={show.tint}
          n={n}
          alt={show.photo ? `«${show.title}»` : ''}
          className="aspect-[1/1]"
        />
      </Link>
      {show.genre && (
        <div className="font-heading text-brand-red mt-5 text-[14px] font-semibold tracking-[.06em] uppercase">
          {show.genre}
        </div>
      )}
      <h3
        className={`font-heading text-[26px] leading-[1.02] font-bold uppercase xl:text-[30px] ${show.genre ? 'mt-1' : 'mt-5'}`}
      >
        <Link to={to} className="hover:underline">
          {show.title}
        </Link>
      </h3>
      {show.based && <p className="text-ink/75 mt-2 text-[14px] leading-snug">{show.based}</p>}
      <div className="mt-auto pt-4">
        {show.dir && (
          <div className="text-[13px] font-medium tracking-[.03em] uppercase">Реж. {show.dir}</div>
        )}
        <div className="mt-1.5 flex min-h-[30px] items-center justify-between gap-2 text-[14px]">
          <span>{show.dur ?? ''}</span>
          <AgeBadge age={show.age} />
        </div>
        <Link to={to} className={`${BTN} bg-ink text-paper mt-4 w-full py-3.5 text-[15px]`}>
          Подробнее
        </Link>
      </div>
    </div>
  )
}
