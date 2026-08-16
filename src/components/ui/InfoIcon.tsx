interface InfoIconProps {
  className?: string
}

/** Simple outline info-circle glyph -- used next to о театре/команда search results. */
export function InfoIcon({ className }: InfoIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="50" cy="50" r="38" />
      <line x1="50" y1="46" x2="50" y2="70" />
      <circle cx="50" cy="30" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}
