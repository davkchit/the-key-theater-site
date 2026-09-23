interface BrushHighlightProps {
  className?: string
}

/** Rough marker swipe that sits behind a word instead of a clean rectangle.
 *  Filled only -- no stroke -- so `preserveAspectRatio="none"` is safe here
 *  (stretching a *stroked* path on a non-square box corrupts its geometry in
 *  Chromium; see SketchyFrame for what that looked like). */
export function BrushHighlight({ className }: BrushHighlightProps) {
  return (
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M3,24 C48,9 96,21 150,12 C198,4 248,18 297,7 L298,82 C252,95 200,80 148,88 C96,96 46,84 2,92 Z"
        fill="currentColor"
      />
    </svg>
  )
}
