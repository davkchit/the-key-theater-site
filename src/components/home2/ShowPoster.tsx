import { Link } from 'react-router-dom'
import type { Show } from '../../types/content'
import { SwallowIcon } from '../ui/SwallowIcon'
import { BTN, Duotone, Ink, type Tone } from './parts'
import { showPath } from './homeData'
import starSvg from '../../../assets/el-star.svg'
import ladderSvg from '../../../assets/el-ladder.svg'
import chairSvg from '../../../assets/el-chair.svg'
import faceSvg from '../../../assets/el-face.svg'
import flowerSvg from '../../../assets/el-flower.svg'

// A show as a two-colour poster, the same on the homepage, the repertoire and
// a show's own page. A show without a photo gets a big ink drawing instead of
// an empty frame, so it still looks like a poster.

const POSTER_TONES: Tone[] = ['red', 'paper', 'blue', 'ink']
const EMPTY_ART = [faceSvg, flowerSvg, chairSvg, faceSvg]

function PosterInk({ n, light }: { n: number; light: boolean }) {
  switch (n % 4) {
    case 0:
      return <Ink src={starSvg} className="top-[6%] right-[5%] h-[34%] w-[34%]" />
    case 1:
      return (
        <>
          <Ink src={ladderSvg} className="top-[4%] right-[24%] h-[62%] w-[14%]" />
          <SwallowIcon className="text-ink pointer-events-none absolute top-[22%] right-[4%] h-[16%] -rotate-12" />
        </>
      )
    case 2:
      return <Ink src={chairSvg} className="top-[6%] right-[6%] h-[30%] w-[22%]" light />
    default:
      return <Ink src={ladderSvg} light={light} className="top-[3%] right-[8%] h-[62%] w-[14%]" />
  }
}

/** Just the picture part of a poster. */
export function PosterArt({
  photo,
  n,
  alt = '',
  className = '',
}: {
  photo: string
  n: number
  alt?: string
  className?: string
}) {
  const tone = POSTER_TONES[n % 4] as Tone
  const light = tone === 'ink' || tone === 'blue'
  return (
    <Duotone src={photo} tone={tone} alt={alt} className={className} position="50% 25%">
      {photo ? (
        <PosterInk n={n} light={light} />
      ) : (
        <Ink
          src={EMPTY_ART[n % 4] as string}
          light={light}
          className="inset-0 m-auto h-3/5 w-3/5"
        />
      )}
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
