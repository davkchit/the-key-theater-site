import type { GalleryImage } from '../types/content'
import spektakl1 from '../../assets/gallery/spektakl-1.jpg'
import spektakl2 from '../../assets/gallery/spektakl-2.jpg'
import spektakl3 from '../../assets/gallery/spektakl-3.jpg'
import lager1 from '../../assets/gallery/lager-1.jpg'
import lager2 from '../../assets/gallery/lager-2.jpg'
import lager3 from '../../assets/gallery/lager-3.jpg'
import nagrazhdenie1 from '../../assets/gallery/nagrazhdenie-1.jpg'
import nagrazhdenie2 from '../../assets/gallery/nagrazhdenie-2.jpg'

// Real photos pulled from the theatre's own public Telegram channel
// (t.me/teatr_kluch) -- replaces the earlier 3-stock-photo placeholder.
const P = [spektakl1, spektakl2, spektakl3, lager1, lager2, lager3, nagrazhdenie1, nagrazhdenie2]

export const gallery: GalleryImage[] = P.map((src, i) => ({
  src,
  span: i === 0 || i === 5 ? 'wide' : 'normal',
}))
