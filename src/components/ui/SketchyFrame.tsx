interface SketchyFrameProps {
  className?: string
}

// Four independent wobbly strips (one per edge) instead of one path
// stretched over the whole box -- stretching a stroked path on both axes at
// once (preserveAspectRatio="none" on a 2D shape) corrupts the stroke
// geometry in Chromium once the box isn't roughly square. Each strip here
// only stretches along its own length (exactly how WavyUnderline does it
// elsewhere on the site), which doesn't have that problem. Corners are left
// to the card's own CSS border-radius rather than joined by hand -- simpler
// and doesn't fight the wobble.
const H_PATH = 'M2,5 C15,2 25,8 40,4 C55,1 65,8 78,5 C88,3 94,6 98,5'
const V_PATH = 'M5,2 C2,15 8,25 4,40 C1,55 8,65 5,78 C3,88 6,94 5,98'

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const }

/** Hand-drawn-looking wobbly border, one edge at a time -- see note above on why. */
export function SketchyFrame({ className }: SketchyFrameProps) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute top-0 right-4 left-4 h-2.5 w-[calc(100%-2rem)]">
        <path d={H_PATH} {...STROKE} />
      </svg>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute right-4 bottom-0 left-4 h-2.5 w-[calc(100%-2rem)] -scale-y-100">
        <path d={H_PATH} {...STROKE} />
      </svg>
      <svg viewBox="0 0 10 100" preserveAspectRatio="none" className="absolute top-4 bottom-4 left-0 h-[calc(100%-2rem)] w-2.5">
        <path d={V_PATH} {...STROKE} />
      </svg>
      <svg viewBox="0 0 10 100" preserveAspectRatio="none" className="absolute top-4 right-0 bottom-4 h-[calc(100%-2rem)] w-2.5 -scale-x-100">
        <path d={V_PATH} {...STROKE} />
      </svg>
    </div>
  )
}
