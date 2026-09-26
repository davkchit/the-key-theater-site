import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from 'motion/react'
import { gallery } from '../../data/gallery'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { SectionHead, WRAP } from './parts'
import { SPRING, SPRING_FLICK } from './motion'

// Gallery as a looping carousel: the photo in the middle is big, its
// neighbours step back. The photos follow a finger or the mouse 1:1, can be
// grabbed mid-flight, and a flick carries on at the finger's speed and lands
// where the throw was going (apple-design: direct manipulation, velocity
// handoff, momentum projection). Arrows and the keyboard move one photo. A click on the middle photo opens it
// full screen. All photos come from the admin's gallery, in its order.

const photos = gallery.map((g) => g.src)

// where the photos 0, 1, 2, 3 steps from the middle stand, and how they look
const X = [0, 92, 166, 226] // % of a slide's width
const SCALE = [1, 0.78, 0.6, 0.5]
const OPACITY = [1, 0.8, 0.5, 0]
const BRIGHT = [1, 0.62, 0.45, 0.4]

const AUTOPLAY_MS = 5000
const SWIPE_PX = 45 // lightbox swipe

const pad = (v: number) => String(v).padStart(2, '0')

function Arrow({
  dir,
  onClick,
  dark = false,
}: {
  dir: -1 | 1
  onClick: () => void
  dark?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={dir < 0 ? 'Предыдущее фото' : 'Следующее фото'}
      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-transform duration-150 ease-out hover:scale-105 active:scale-[.94] active:duration-100 ${dark ? 'border-paper text-paper' : 'border-ink bg-paper text-ink'}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={dir < 0 ? 'M20 12H5M11 6l-6 6 6 6' : 'M4 12h15M13 6l6 6-6 6'} />
      </svg>
    </button>
  )
}

/** Photos full screen with arrows, swipe and the keyboard. Used by the
 *  homepage carousel and the gallery page. */
export function Lightbox({
  index,
  onClose,
  onMove,
  list = photos,
}: {
  index: number
  onClose: () => void
  onMove: (dir: -1 | 1) => void
  list?: string[]
}) {
  useEscapeKey(true, onClose)
  useLockBodyScroll(true)
  const start = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onMove(-1)
      if (e.key === 'ArrowRight') onMove(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onMove])

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Фото театра"
      className="bg-ink/95 text-paper fixed inset-0 z-[80] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onPointerDown={(e) => (start.current = e.clientX)}
      onPointerUp={(e) => {
        if (start.current === null) return
        const dx = e.clientX - start.current
        start.current = null
        if (Math.abs(dx) > SWIPE_PX) onMove(dx < 0 ? 1 : -1)
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-heading text-[18px] tracking-[.08em]">
          {pad(index + 1)} / {pad(list.length)}
        </span>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="border-paper flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg active:scale-90"
        >
          ✕
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={list[index]}
            src={list[index]}
            alt={`Фото театра ${index + 1}`}
            draggable={false}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={SPRING}
            className="max-h-full max-w-full object-contain select-none"
          />
        </AnimatePresence>
        <div className="absolute inset-x-4 top-1/2 hidden -translate-y-1/2 justify-between md:flex">
          <Arrow dir={-1} onClick={() => onMove(-1)} dark />
          <Arrow dir={1} onClick={() => onMove(1)} dark />
        </div>
      </div>
    </motion.div>,
    document.body,
  )
}

// Momentum projection, as iOS scroll views do it: where a flick released at
// this speed (px/s) would come to rest. decelerationRate ~0.998 = normal feel.
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

const lerpTable = (table: number[], a: number) => {
  const i = Math.min(Math.floor(a), table.length - 2)
  const t = Math.min(a - i, 1)
  const from = table[i] as number
  return from + ((table[i + 1] as number) - from) * t
}

/** One photo. Its place is computed every frame from the carousel's position,
 *  so while dragging it follows the finger 1:1 instead of jumping between slots. */
function Slide({
  src,
  index,
  n,
  pos,
  onActivate,
  onKey,
}: {
  src: string
  index: number
  n: number
  pos: MotionValue<number>
  onActivate: (offset: number) => void
  onKey: (e: ReactKeyboardEvent<HTMLButtonElement>) => void
}) {
  const offset = useTransform(pos, (p) => {
    let o = (index - p) % n
    if (o > n / 2) o -= n
    if (o < -n / 2) o += n
    return o
  })
  const far = X.length - 1
  const a = useTransform(offset, (o) => Math.min(Math.abs(o), far))
  const x = useTransform(
    offset,
    (o) => `${Math.sign(o) * lerpTable(X, Math.min(Math.abs(o), far))}%`,
  )
  const scale = useTransform(a, (v) => lerpTable(SCALE, v))
  const opacity = useTransform(a, (v) => lerpTable(OPACITY, v))
  const filter = useTransform(a, (v) => `brightness(${lerpTable(BRIGHT, v)})`)
  const zIndex = useTransform(a, (v) => 10 - Math.round(v))
  const visibility = useTransform(a, (v) => (v >= far ? 'hidden' : 'visible'))
  const [middle, setMiddle] = useState(() => Math.abs(offset.get()) < 0.5)
  useMotionValueEvent(offset, 'change', (o) => setMiddle(Math.abs(o) < 0.5))

  return (
    <motion.button
      type="button"
      tabIndex={middle ? 0 : -1}
      aria-label={
        middle
          ? 'Открыть фото на весь экран. Стрелки влево и вправо листают.'
          : `Показать фото ${index + 1}`
      }
      onClick={() => onActivate(Math.round(offset.get()))}
      onKeyDown={onKey}
      style={{ x, scale, opacity, filter, zIndex, visibility }}
      className="focus-visible:ring-brand-yellow bg-ink absolute top-0 left-[13vw] h-full w-[74vw] overflow-hidden outline-none focus-visible:ring-4 min-[1740px]:left-[calc(50%-400px)] md:left-[27vw] md:w-[46vw] md:max-w-[800px]"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        loading="lazy"
        className="pointer-events-none h-full w-full object-cover"
      />
    </motion.button>
  )
}

interface Drag {
  id: number
  x0: number
  y0: number
  pos0: number
  /** px of pointer travel that moves the carousel by one photo */
  step: number
  active: boolean
  history: { x: number; t: number }[]
}

export function GalleryCarousel() {
  const n = photos.length
  // position in photos, not wrapped, so motion across the loop stays continuous
  const pos = useMotionValue(0)
  const [current, setCurrent] = useState(0)
  const [hover, setHover] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { amount: 0.4 })
  const anim = useRef<AnimationPlaybackControls | null>(null)
  const drag = useRef<Drag | null>(null)
  const dragged = useRef(false)

  useMotionValueEvent(pos, 'change', (p) => {
    const i = ((Math.round(p) % n) + n) % n
    setCurrent((c) => (c === i ? c : i))
  })

  // Always from the value on screen, never from the old target: a new move
  // interrupts one in flight without a jump.
  const goTo = useCallback(
    (target: number, velocity = 0, flick = false) => {
      anim.current?.stop()
      if (reduce) {
        pos.set(target)
        return
      }
      anim.current = animate(pos, target, { ...(flick ? SPRING_FLICK : SPRING), velocity })
    },
    [pos, reduce],
  )

  const move = useCallback((dir: -1 | 1) => goTo(Math.round(pos.get()) + dir), [goTo, pos])

  // slow autoplay: only while the gallery is on screen and nobody is using it
  useEffect(() => {
    if (reduce || hover || open || !inView || n < 2) return
    const t = setTimeout(() => move(1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [current, reduce, hover, open, inView, n, move])

  if (!n) return null

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const slide = e.currentTarget.querySelector('button')
    const width = slide?.offsetWidth ?? e.currentTarget.offsetWidth * 0.46
    anim.current?.stop() // grab it mid-flight
    dragged.current = false
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      pos0: pos.get(),
      step: (width * (X[1] ?? 92)) / 100,
      active: false,
      history: [{ x: e.clientX, t: e.timeStamp }],
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.x0
    if (!d.active) {
      // ~10 px before calling it a sideways drag, so taps and page scrolling still work
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(e.clientY - d.y0)) return
      d.active = true
      dragged.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    pos.set(d.pos0 - dx / d.step) // 1:1 with the pointer, from where it grabbed
    d.history.push({ x: e.clientX, t: e.timeStamp })
    if (d.history.length > 6) d.history.shift()
  }

  const release = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d || d.id !== e.pointerId) return
    if (!d.active) {
      // a tap that stopped a moving carousel: settle on the nearest photo
      if (Math.abs(pos.get() - Math.round(pos.get())) > 0.001) goTo(Math.round(pos.get()))
      return
    }
    const first = d.history[0] as { x: number; t: number }
    const last = d.history[d.history.length - 1] as { x: number; t: number }
    const dt = Math.max(last.t - first.t, 1)
    // a finger that stopped before lifting throws nothing
    const vPx = e.timeStamp - last.t > 80 ? 0 : ((last.x - first.x) / dt) * 1000
    // land where the throw is going, not on the photo nearest the release point
    const projected = pos.get() - project(vPx) / d.step
    const target = Math.max(
      Math.round(d.pos0) - 3,
      Math.min(Math.round(d.pos0) + 3, Math.round(projected)),
    )
    goTo(target, -vPx / d.step, Math.abs(vPx) > 300)
  }

  const activate = (offset: number) => {
    if (dragged.current) return
    if (offset === 0) setOpen(true)
    else goTo(Math.round(pos.get()) + offset)
  }

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') move(-1)
    if (e.key === 'ArrowRight') move(1)
  }

  return (
    <section className="bg-paper relative pt-10 pb-16 md:pt-14 md:pb-24">
      <div className={WRAP}>
        <SectionHead title="Галерея" to="/novaya/galereya" link="Все фото" />
      </div>

      <div
        ref={stageRef}
        role="region"
        aria-roledescription="карусель"
        aria-label="Фото театра"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        className="relative h-[calc(74vw*0.75)] cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing md:h-[min(calc(46vw*0.75),600px)]"
      >
        {photos.map((src, i) => (
          <Slide
            key={src}
            src={src}
            index={i}
            n={n}
            pos={pos}
            onActivate={activate}
            onKey={onKey}
          />
        ))}
      </div>

      <div className={`${WRAP} mt-7 flex items-center justify-between gap-4`}>
        <span className="font-heading text-[20px] tracking-[.08em]">
          {pad(current + 1)} <span className="opacity-50">/ {pad(n)}</span>
        </span>
        <div className="flex gap-3">
          <Arrow dir={-1} onClick={() => move(-1)} />
          <Arrow dir={1} onClick={() => move(1)} />
        </div>
      </div>

      <AnimatePresence>
        {open && <Lightbox index={current} onClose={() => setOpen(false)} onMove={move} />}
      </AnimatePresence>
    </section>
  )
}
