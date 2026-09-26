import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GRAIN_URL } from './paper'

// Small pieces the new homepage repeats: the two-tone photo, section headings,
// "Вся афиша →" links.

export type Tone = 'red' | 'paper' | 'blue' | 'ink' | 'yellow'

const TONE_BG: Record<Tone, string> = {
  red: 'bg-brand-red',
  paper: 'bg-paper',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
  yellow: 'bg-brand-yellow',
}

// Colour pairs for the two-tone photos: shadows -> ink, lights -> the tone.
const RGB: Record<Tone, [number, number, number]> = {
  ink: [0.102, 0.102, 0.102],
  red: [0.89, 0.137, 0.141],
  paper: [0.965, 0.941, 0.878],
  blue: [0.043, 0.329, 0.627],
  yellow: [1, 0.843, 0],
}
// Stage photos are mostly dark, so the curve lifts the mid-greys hard and
// clips the top: flat ink areas and flat paper areas, like a cheap print.
const CURVE = [0, 0.08, 0.45, 0.85, 1, 1, 1]
const table = (from: number, to: number) =>
  CURVE.map((t) => (from + (to - from) * t).toFixed(3)).join(' ')

const LUMA = '0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0'

/** SVG filters used by <Duotone> and <RoughFrame>; render once per page. */
export function PrintFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      {(Object.keys(TONE_BG) as Tone[]).map((tone) => {
        const lo = RGB.ink
        const hi = tone === 'ink' ? RGB.paper : RGB[tone]
        return (
          <filter
            key={tone}
            id={`duo-${tone}`}
            colorInterpolationFilters="sRGB"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <feColorMatrix in="SourceGraphic" type="matrix" values={LUMA} result="grey" />
            {/* grain is mixed into the greys before the ink curve, so it
                breaks up into specks exactly where a print would */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"
              result="gnoise"
            />
            <feComposite
              in="grey"
              in2="gnoise"
              operator="arithmetic"
              k1="0"
              k2="1.1"
              k3="0.5"
              k4="-0.2"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={table(lo[0], hi[0])} />
              <feFuncG type="table" tableValues={table(lo[1], hi[1])} />
              <feFuncB type="table" tableValues={table(lo[2], hi[2])} />
            </feComponentTransfer>
          </filter>
        )
      })}
      {/* ragged edge for the black frame behind live photos */}
      {/* a photo torn out of a print: the tear eats into the picture itself
          (only its outline is displaced, the image is not distorted), and it
          casts a soft shadow like paper lying on the page */}
      <filter
        id="torn-photo"
        x="-4%"
        y="-4%"
        width="108%"
        height="112%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.022"
          numOctaves="4"
          seed="3"
          result="noise"
        />
        <feDisplacementMap
          in="SourceAlpha"
          in2="noise"
          scale="26"
          xChannelSelector="R"
          yChannelSelector="G"
          result="edge"
        />
        <feComposite in="SourceGraphic" in2="edge" operator="in" />
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity=".35" />
      </filter>
    </svg>
  )
}

/** A photo printed in two colours (on the black card: ink and paper). */
export function Duotone({
  src,
  tone,
  alt = '',
  className = '',
  position = 'center',
  children,
}: {
  src: string
  tone: Tone
  alt?: string
  className?: string
  /** CSS object-position, e.g. '50% 20%' to keep a face in a portrait */
  position?: string
  children?: ReactNode
}) {
  return (
    <div className={`relative overflow-hidden ${TONE_BG[tone]} ${className}`}>
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ filter: `url(#duo-${tone})`, objectPosition: position }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {children}
    </div>
  )
}

/**
 * A person's photo in live colour: a slight warm grade and grain so the four
 * portraits read as one set, a flat brand-colour block behind it like a
 * sticker, and a crop on the face (the photos are holiday snaps, not portraits).
 */
export function Portrait({
  src,
  alt,
  block,
  focus = '50% 35%',
  zoom = 1,
  duo = false,
  className = '',
}: {
  src: string
  alt: string
  /** Tailwind bg class of the block behind the photo */
  block: string
  /** face position in the photo, as CSS "x% y%" */
  focus?: string
  /** how much to enlarge towards the face */
  zoom?: number
  /** yellow two-tone print instead of colour (to compare with Kamilla) */
  duo?: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute inset-0 translate-x-2.5 translate-y-2.5 md:translate-x-3.5 md:translate-y-3.5 ${block}`}
      />
      <div className="bg-ink relative h-full w-full overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            objectPosition: focus,
            transformOrigin: focus,
            transform: `scale(${zoom})`,
            filter: duo
              ? 'url(#duo-yellow)'
              : 'sepia(.16) saturate(1.08) contrast(1.06) brightness(1.02)',
          }}
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
          style={{ backgroundImage: GRAIN_URL }}
        />
      </div>
    </div>
  )
}

/** A live photo torn out of a print, with a soft paper shadow. */
export function RoughFrame({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`relative ${className}`} style={{ filter: 'url(#torn-photo)' }}>
      {children}
    </div>
  )
}

/** An ink drawing laid over a photo or a band. */
export function Ink({
  src,
  className = '',
  light = false,
}: {
  src: string
  className?: string
  light?: boolean
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute object-contain ${light ? 'invert' : ''} ${className}`}
    />
  )
}

export const H2 =
  'font-heading text-[clamp(40px,6.4vw,92px)] leading-[1] font-bold tracking-[-.005em] uppercase'

export function SectionHead({
  title,
  to,
  link,
  dark = false,
}: {
  title: string
  to?: string
  link?: string
  dark?: boolean
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
      <h2 className={`${H2} ${dark ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {to && link && (
        <span className="mb-2 hidden flex-shrink-0 sm:block">
          <MoreLink to={to}>{link}</MoreLink>
        </span>
      )}
    </div>
  )
}

export function MoreLink({
  to,
  children,
  className = '',
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2.5 text-[15px] font-medium ${className}`}
    >
      <span className="border-b border-current pb-0.5">{children}</span>
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  )
}

// One grid for the whole page: the menu's logo, the first screen's title and
// every heading below stand on the same line. Wider than the rest of the site,
// so on a big monitor the page is not a narrow strip in the middle.
export const WRAP = 'mx-auto w-full max-w-[1760px] px-4 sm:px-6.5 lg:px-12'

// Buttons answer on press, not on release: they sink the moment a finger or
// the mouse goes down (and do not rise on hover while pressed).
export const BTN =
  'inline-flex items-center justify-center rounded-md px-7 py-3.5 font-heading text-[15px] font-semibold tracking-[.06em] uppercase transition-transform duration-180 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[.97] active:duration-100'
