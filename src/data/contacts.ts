import settings from '../content/settings.json'

// The theatre's contacts and place from «Настройки сайта» in the admin. The
// bot names the same ones (bot/core/knowledge.mjs), so a change is made in one
// place and shows up everywhere.

const s = settings as Partial<Record<string, string>>

export const PHONE = s.phone ?? ''
export const PHONE2 = s.phone2 ?? ''
export const HOURS = s.hours ?? ''
export const EMAIL = s.email ?? ''
/** "Набережные Челны, Новый город, 1/02" */
export const ADDRESS = s.address ?? ''
/** the first part of the address */
export const CITY = ADDRESS.split(',')[0]?.trim() ?? ''
/** "Молодёжный центр «НУР»" */
export const VENUE = s.venue ?? ''
/** "второй вход", may be empty */
export const ENTRANCE = s.entrance ?? ''
/** "Молодёжный центр «НУР», второй вход" */
export const PLACE = [VENUE, ENTRANCE].filter(Boolean).join(', ')
/** continues «Билеты продаются …» */
export const TICKETS_WHERE = s.ticketsWhere ?? ''

/** the theatre's review pages on the maps; an empty one hides its button */
export const REVIEW_LINKS = [
  { label: '2ГИС', href: s.review2gis ?? '' },
  { label: 'Яндекс Карты', href: s.reviewYandex ?? '' },
].filter((l) => l.href)

// The map in «Как нас найти»: 2GIS's widget with the theatre's own card,
// found by the firm number in the 2GIS review link, centred on mapPoint.
const gis = (s.review2gis ?? '').match(/2gis\.ru\/([a-z_]+)\/firm\/(\d+)/)
const [lat, lon] = (s.mapPoint ?? '').split(',').map((x) => Number(x.trim()))
/** the theatre's page on 2GIS, with "Проехать" on it */
export const MAP_LINK = gis ? `https://2gis.ru/${gis[1]}/firm/${gis[2]}` : ''
/** the embeddable map, '' when the link or the point is missing */
export const MAP_EMBED =
  gis && Number.isFinite(lat) && Number.isFinite(lon)
    ? 'https://widgets.2gis.com/widget?type=firmsonmap&options=' +
      encodeURIComponent(
        JSON.stringify({ pos: { lat, lon, zoom: 16 }, opt: { city: gis[1] }, org: gis[2] }),
      )
    : ''

/** "+7 906 120-22-62" -> "tel:+79061202262" */
export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '')
