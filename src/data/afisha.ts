import type { AfishaItem } from '../types/content'
import afishaContent from '../content/afisha.json'
import { mediaUrl } from '../lib/mediaUrl'

// Content lives in src/content/afisha.json (Decap CMS-managed) -- see
// public/admin/config.yml for the collection definition.
export const afishaFull: AfishaItem[] = (afishaContent.items as AfishaItem[]).map((i) => ({
  ...i,
  thumb: mediaUrl(i.thumb),
}))

export const afishaPreview: AfishaItem[] = afishaFull.slice(0, 4)
