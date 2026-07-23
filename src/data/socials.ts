import type { Social } from '../types/content'

export interface SocialLink {
  key: Social
  label: string
  href: string
  /** SVG path `d` attribute, 24x24 viewBox */
  path: string
}

export const socials: SocialLink[] = [
  {
    key: 'VK',
    label: 'ВКонтакте',
    href: '#',
    path: 'M13.2 18.3c-6 0-9.9-4.3-10-11.3h3c.1 5.2 2.5 7.4 4.3 7.9V7h2.9v4.4c1.8-.2 3.7-2.3 4.3-4.4h2.9c-.5 2.6-2.5 4.6-3.9 5.4 1.4.7 3.7 2.5 4.6 5.9h-3.2c-.7-2.2-2.4-3.9-4.7-4.2v4.2z',
  },
  {
    key: 'TG',
    label: 'Telegram',
    href: '#',
    path: 'M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.9 13 2.4 11.6c-1-.3-1-1 .2-1.4l17-6.6c.8-.3 1.5.2 1.3 1.3z',
  },
  {
    key: 'YT',
    label: 'YouTube',
    href: '#',
    path: 'M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.4 12 31 31 0 0 0 23 7.5zM9.8 15.3V8.7l5.7 3.3z',
  },
]
