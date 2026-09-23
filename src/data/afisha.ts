import type { AfishaItem } from '../types/content'
import afishaContent from '../content/afisha.json'
import { formatRuDate, startOfToday } from '../lib/ruDate'

interface RawAfishaItem {
  date: string
  title: string
  age?: string
  hall?: string
  time: string
  band: 'paper' | 'red' | 'blue'
}

const raw = afishaContent.items as RawAfishaItem[]

// Content lives in src/content/afisha.json (Decap CMS-managed) -- see
// public/admin/config.yml for the collection definition. day/mon/wd are
// derived from the stored ISO date, not typed separately -- see ruDate.ts.
export const afishaFull: AfishaItem[] = raw.map((i) => ({ ...i, ...formatRuDate(i.date) }))

// Real dates (not just "first 4 rows") mean this is never accidentally a
// preview of shows that already happened -- e.g. the homepage in December no
// longer shows September's schedule just because those rows come first in
// the file.
const today = startOfToday()
export const upcomingAfisha: AfishaItem[] = raw
  .filter((i) => new Date(i.date + 'T00:00:00') >= today)
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((i) => ({ ...i, ...formatRuDate(i.date) }))

/** The next show still to come, or null in the off-season (e.g. summer) when
 *  nothing is scheduled yet -- callers must handle that case explicitly
 *  rather than assume there's always something upcoming. */
export const nextShow: AfishaItem | null = upcomingAfisha[0] ?? null

export const afishaPreview: AfishaItem[] = upcomingAfisha.slice(0, 4)
