import type { Social } from '../types/content'
import settings from '../content/settings.json'

export interface SocialLink {
  key: Social
  label: string
  href: string
  /** SVG path `d` attribute, 24x24 viewBox */
  path: string
}

// The links come from «Настройки сайта» in the admin; an empty one hides its
// icon rather than shipping a dead "#" link.
const links = settings as Partial<Record<string, string>>

const all: SocialLink[] = [
  {
    key: 'VK',
    label: 'ВКонтакте',
    href: links.vk ?? '',
    path: 'M13.2 18.3c-6 0-9.9-4.3-10-11.3h3c.1 5.2 2.5 7.4 4.3 7.9V7h2.9v4.4c1.8-.2 3.7-2.3 4.3-4.4h2.9c-.5 2.6-2.5 4.6-3.9 5.4 1.4.7 3.7 2.5 4.6 5.9h-3.2c-.7-2.2-2.4-3.9-4.7-4.2v4.2z',
  },
  {
    key: 'TG',
    label: 'Telegram',
    href: links.telegram ?? '',
    path: 'M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.9 13 2.4 11.6c-1-.3-1-1 .2-1.4l17-6.6c.8-.3 1.5.2 1.3 1.3z',
  },
]

export const socials: SocialLink[] = all.filter((l) => l.href)

/** the theatre's VK group, '' when not set */
export const VK_URL = links.vk ?? ''
