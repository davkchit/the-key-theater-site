import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { BTN, WRAP } from '../components/home2/parts'
import { GRAIN_URL } from '../components/home2/paper'
import { SwallowIcon } from '../components/ui/SwallowIcon'

// 404 of the new design: a dry yellow brush stroke behind a huge «404», two
// swallows and «Ключ не найден».

// The stroke: one curve painted by many bristles. The middle ones are thick
// and solid; towards the edges they get thinner, break up into dashes and
// fade, which is what a dry brush leaves on paper.
const CURVE =
  'M40,300 C270,215 430,120 720,125 C950,130 1080,215 1270,200 C1410,190 1500,125 1580,85'

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const BRISTLES = (() => {
  const r = rng(7)
  const out: { dy: number; w: number; dash: string; o: number; start: number }[] = []
  for (let i = 0; i < 34; i++) {
    const t = i / 33 // 0 top edge .. 1 bottom edge
    const edge = Math.abs(t - 0.5) * 2 // 0 middle .. 1 edge
    const gaps = edge > 0.55
    const dash = gaps
      ? Array.from(
          { length: 12 },
          () => `${Math.round(30 + r() * 220)} ${Math.round(10 + r() * 140 * edge)}`,
        ).join(' ')
      : 'none'
    out.push({
      dy: (t - 0.5) * 150 + (r() - 0.5) * 4,
      w: 2.5 + (1 - edge) * 5.5 + r() * 2.5,
      dash,
      o: 1 - edge * edge * 0.55,
      // bristles start and end at slightly different places along the stroke
      start: Math.round(r() * 120 * edge),
    })
  }
  return out
})()

// dry streaks: thin paper-coloured lines left inside the paint by the bristles
const STREAKS = (() => {
  const r = rng(21)
  return Array.from({ length: 9 }, () => ({
    dy: (r() - 0.5) * 110,
    w: 1 + r() * 2.2,
    dash: Array.from(
      { length: 6 },
      () => `${Math.round(80 + r() * 380)} ${Math.round(60 + r() * 260)}`,
    ).join(' '),
    start: Math.round(r() * 400),
  }))
})()

function BrushStroke() {
  return (
    <svg viewBox="0 0 1600 420" aria-hidden="true" className="block h-auto w-full overflow-visible">
      <defs>
        <path id="brush-curve" d={CURVE} />
        <filter id="dry-brush" x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.05"
            numOctaves="2"
            seed="4"
            result="wobble"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wobble"
            scale="16"
            xChannelSelector="R"
            yChannelSelector="G"
            result="w"
          />
          {/* dry specks eaten out of the paint */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="9"
            result="dust"
          />
          <feColorMatrix
            in="dust"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.3"
            result="dustA"
          />
          <feComposite in="w" in2="dustA" operator="in" />
        </filter>
        <linearGradient id="dry-ends" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".08" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".18" stopColor="#fff" />
          <stop offset=".86" stopColor="#fff" />
          <stop offset=".96" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="dry-mask" maskUnits="userSpaceOnUse" x="0" y="-100" width="1600" height="620">
          <rect x="0" y="-100" width="1600" height="620" fill="url(#dry-ends)" />
        </mask>
      </defs>
      <g mask="url(#dry-mask)">
        <g filter="url(#dry-brush)" fill="none" stroke="#ffd400" strokeLinecap="round">
          {BRISTLES.map((b, i) => (
            <use
              key={i}
              href="#brush-curve"
              transform={`translate(0 ${b.dy.toFixed(1)})`}
              strokeWidth={b.w.toFixed(1)}
              strokeDasharray={b.dash === 'none' ? undefined : b.dash}
              strokeDashoffset={-b.start}
              opacity={b.o.toFixed(2)}
            />
          ))}
        </g>
        <g fill="none" stroke="#f3ecdc" strokeLinecap="round" opacity=".85">
          {STREAKS.map((b, i) => (
            <use
              key={i}
              href="#brush-curve"
              transform={`translate(0 ${b.dy.toFixed(1)})`}
              strokeWidth={b.w.toFixed(1)}
              strokeDasharray={b.dash}
              strokeDashoffset={-b.start}
            />
          ))}
        </g>
      </g>
    </svg>
  )
}

export default function NotFoundPageV2() {
  const reduce = useReducedMotion()
  return (
    <div className="bg-paper relative overflow-x-clip">
      <section className="relative flex min-h-[calc(100svh-96px)] flex-col items-center justify-start pt-28 pb-20 text-center md:justify-center md:py-20">
        <div className={`${WRAP} relative`}>
          <div className="relative">
            {/* the stroke keeps its shape on any screen: never narrower than 900px */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 w-[max(100vw,900px)] -translate-x-1/2 -translate-y-[55%]"
              initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(-20% 0% -20% 0)' }}
              transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            >
              <BrushStroke />
            </motion.div>
            <SwallowIcon className="text-ink absolute top-[2%] left-[4%] h-12 -rotate-12 md:left-[12%] md:h-20" />
            <SwallowIcon className="text-ink absolute right-[2%] bottom-[8%] h-14 rotate-[18deg] md:right-[12%] md:h-24" />
            <h1 className="font-heading relative text-[clamp(140px,26vw,330px)] leading-[.8] font-semibold">
              404
            </h1>
          </div>
          <p className="font-heading relative mt-6 text-[clamp(38px,6vw,84px)] leading-none font-medium uppercase">
            Ключ не найден
          </p>
          <p className="relative mt-6 text-[17px] md:text-[19px]">
            Страница, которую вы ищете, не существует или переехала
          </p>
          <Link
            to="/novaya"
            className={`${BTN} bg-brand-yellow text-ink relative mt-8 w-full max-w-md py-5 text-[19px]`}
          >
            На главную
          </Link>
          <div className="relative mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[15px]">
            <Link to="/novaya/afisha" className="underline underline-offset-4">
              Афиша
            </Link>
            <Link to="/novaya/repertuar" className="underline underline-offset-4">
              Спектакли
            </Link>
            <Link to="/novaya/kursy" className="underline underline-offset-4">
              Курсы
            </Link>
          </div>
        </div>
      </section>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] opacity-[.22] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_URL }}
      />
    </div>
  )
}
