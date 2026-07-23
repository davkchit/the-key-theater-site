interface StarIconProps {
  className?: string
  style?: React.CSSProperties
  spin?: boolean
  /** ring color around the star (used as a "badge" over a photo, e.g. team cards) */
  stroke?: string
  strokeWidth?: number
}

const PATH =
  'M 46.04 12.20 C 47.28 8.36 52.72 8.36 53.96 12.20 L 60.29 31.67 C 60.85 33.39 62.45 34.55 64.25 34.55 L 84.73 34.55 C 88.77 34.55 90.44 39.71 87.18 42.09 L 70.61 54.12 C 69.15 55.18 68.54 57.06 69.10 58.78 L 75.43 78.25 C 76.68 82.09 72.28 85.29 69.02 82.91 L 52.45 70.88 C 50.99 69.82 49.01 69.82 47.55 70.88 L 30.98 82.91 C 27.72 85.29 23.33 82.09 24.57 78.25 L 30.90 58.78 C 31.46 57.06 30.85 55.18 29.39 54.12 L 12.82 42.09 C 9.56 39.71 11.23 34.55 15.27 34.55 L 35.75 34.55 C 37.55 34.55 39.15 33.39 39.71 31.67 L 46.04 12.20 Z'

/** The theatre's four-point "star/key-flower" mark, optionally slow-spinning. */
export function StarIcon({ className, style, spin, stroke, strokeWidth }: StarIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={[className, spin && 'animate-kl-spin'].filter(Boolean).join(' ')}
      style={style}
      fill="currentColor"
      stroke={stroke}
      strokeWidth={strokeWidth}
      aria-hidden="true"
    >
      <path d={PATH} />
    </svg>
  )
}
