interface TicketIconProps {
  className?: string
}

/** Simple outline ticket glyph -- used next to афиша/tickets search results. */
export function TicketIcon({ className }: TicketIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="15" y="28" width="70" height="44" rx="10" />
      <line x1="50" y1="28" x2="50" y2="72" strokeDasharray="1 12" />
      <circle cx="50" cy="28" r="3" fill="currentColor" stroke="none" />
      <circle cx="50" cy="72" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
}
