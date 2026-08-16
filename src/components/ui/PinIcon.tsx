interface PinIconProps {
  className?: string
}

/** Simple outline map-pin glyph -- used next to контакты search results. */
export function PinIcon({ className }: PinIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M50,15 C68,15 82,29 82,47 C82,68 50,88 50,88 C50,88 18,68 18,47 C18,29 32,15 50,15 Z" />
      <circle cx="50" cy="46" r="11" />
    </svg>
  )
}
