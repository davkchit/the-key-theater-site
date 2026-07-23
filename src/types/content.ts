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
  age: string
  hall: string
  time: string
  /** row background: 'paper' -> cream neutral card, else the brand color */
  band: 'paper' | 'red' | 'blue'
  thumb: string
}

export interface Show {
  title: string
  age: string
  based: string
  dir: string
  dur: string
  photo: string
  poster: boolean
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
