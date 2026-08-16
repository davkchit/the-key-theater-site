import type { GalleryImage } from '../types/content'
import galleryContent from '../content/gallery.json'
import { mediaUrl } from '../lib/mediaUrl'

// Content lives in src/content/gallery.json (Decap CMS-managed) so the
// theatre can add/remove photos without touching code -- see
// public/admin/config.yml for the collection definition.
export const gallery: GalleryImage[] = (galleryContent.images as GalleryImage[]).map((g) => ({
  ...g,
  src: mediaUrl(g.src),
}))
