import type { SocialLink } from '../../data/socials'

interface SocialIconProps {
  social: SocialLink
  className?: string
}

export function SocialIcon({ social, className }: SocialIconProps) {
  return (
    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className={className}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d={social.path} />
      </svg>
    </a>
  )
}
