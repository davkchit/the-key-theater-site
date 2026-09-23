import type { BrandColorKey } from '../theme/tokens'

export interface NavItem {
  key: string
  label: string
  to: string
}

export interface Band {
  num: string
  word: string
  note: string
  color: BrandColorKey
  icon: string
}

export interface AfishaItem {
  day: string
  mon: string
  wd: string
  title: string
  /** Russian age marking (18+, 16+...). Optional: the theatre's season plan
   *  lists several shows without one yet, and inventing a legal age marking
   *  is worse than showing none until they confirm it. */
  age?: string
  hall?: string
  time: string
  /** row background: 'paper' -> cream neutral card, else the brand color */
  band: 'paper' | 'red' | 'blue'
}

export interface Show {
  title: string
  /** see AfishaItem.age -- optional for the same reason */
  age?: string
  /** e.g. 'весёлые похороны', 'мистическая комедия' */
  genre?: string
  based: string
  dir?: string
  dur?: string
  /** full synopsis; the card falls back to the short 'based' line when missing */
  synopsis?: string
  /** empty string renders a branded placeholder tile instead of a broken image */
  photo: string
  /** page on Билетон / Яндекс Афиша for this show. Optional on purpose: until
   *  the theatre pastes one in, the bot and the site say where tickets are sold
   *  instead of linking to a guess. */
  ticketUrl?: string
  bg: BrandColorKey
}

export interface TeamMember {
  name: string
  role: string
  photo: string
  bg: BrandColorKey
  lead?: boolean
}

export interface Course {
  key: string
  name: string
  ageRange: string
  bg: BrandColorKey
  icon: string
  desc: string
  price: string
  start: string
  isChild: boolean
}

export type GallerySpan = 'wide' | 'normal'

export interface GalleryImage {
  src: string
  span: GallerySpan
}

export type Social = 'VK' | 'TG' | 'YT'
