import type { GalleryImage } from '../types/content'
import photo1 from '../../assets/photo-1.jpg'
import photo2 from '../../assets/photo-2.jpg'
import photo3 from '../../assets/photo-3.jpg'

const P = [photo1, photo2, photo3]

export const gallery: GalleryImage[] = [0, 1, 2, 2, 0, 1, 1, 2, 0].map((n, i) => ({
  src: P[n]!,
  span: i === 0 || i === 5 ? 'wide' : 'normal',
}))
