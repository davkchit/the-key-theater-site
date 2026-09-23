interface HandArrowProps {
  className?: string
}

/** Hand-drawn curved arrow used to point handwritten notes at things.
 *  Keeps its aspect ratio on purpose -- it is stroked, and stretching a
 *  stroked path breaks it. */
export function HandArrow({ className }: HandArrowProps) {
  return (
    <svg viewBox="0 0 120 96" fill="none" className={className} aria-hidden="true">
      <path d="M8,8 C50,6 92,26 102,66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M86,56 L103,72 L112,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
