interface SwallowIconProps {
  className?: string
  style?: React.CSSProperties
}

/** The theatre's swallow-pair brand mark. */
export function SwallowIcon({ className, style }: SwallowIconProps) {
  return (
    <svg viewBox="0 0 210 150" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M100,78 C70,40 40,24 4,18 C44,44 66,66 96,92 Z" />
      <path d="M104,78 C140,36 172,20 206,8 C168,40 140,60 108,90 Z" />
      <path d="M96,84 C92,104 84,120 70,136 C82,116 86,100 88,86 Z" />
      <path d="M104,84 C108,102 116,116 130,130 C118,112 114,98 112,86 Z" />
      <ellipse cx="100" cy="82" rx="12" ry="9" />
    </svg>
  )
}
