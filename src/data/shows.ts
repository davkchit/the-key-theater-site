import type { Show } from '../types/content'
import showsContent from '../content/shows.json'
import { mediaUrl } from '../lib/mediaUrl'

// Content lives in src/content/shows.json (Decap CMS-managed) so the theatre
// can add/remove/edit repertoire entries without touching code -- see
// public/admin/config.yml for the collection definition.
export const shows: Show[] = (showsContent.shows as Show[]).map((s) => ({ ...s, photo: mediaUrl(s.photo) }))

export const showsPreview: Show[] = shows.slice(0, 3)
