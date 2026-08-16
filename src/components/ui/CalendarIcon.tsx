interface CalendarIconProps {
  className?: string
}

/** Simple outline calendar glyph -- used next to курсы/расписание search results. */
export function CalendarIcon({ className }: CalendarIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="15" y="22" width="70" height="60" rx="8" />
      <line x1="15" y1="42" x2="85" y2="42" />
      <line x1="32" y1="12" x2="32" y2="28" />
      <line x1="68" y1="12" x2="68" y2="28" />
    </svg>
  )
}
