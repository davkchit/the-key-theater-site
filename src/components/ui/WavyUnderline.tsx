interface WavyUnderlineProps {
  className?: string
}

/** The small hand-drawn squiggle used as a decorative underline under headings/labels. */
export function WavyUnderline({ className }: WavyUnderlineProps) {
  return (
    <svg viewBox="0 0 160 14" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M2,8 C24,1 40,13 62,7 C84,1 100,13 122,7 C138,3 150,8 158,6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
