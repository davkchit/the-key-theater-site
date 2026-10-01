import afishaContent from '../content/afisha.json'
import { shows } from '../data/shows'
import { TICKETS_URL } from '../components/home2/homeData'

// "Были у нас на спектакле?" is asked only of someone who clicked a ticket
// link and came back after a show had taken place, and only once. Everything
// lives in this browser's storage; nothing is sent anywhere.

const CLICKED = 'kluch-ticket-click'
const ASKED = 'kluch-review-asked'
const DAY = 86_400_000
const afishaDates = (afishaContent.items as { date: string }[]).map((i) => i.date)

const read = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    // private mode: the invite then simply never shows
  }
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// where the theatre sells tickets: its shop page, each show's own link, and
// the big Russian ticket sites in case a link points straight at one
const TICKET_HOSTS = new Set(
  [TICKETS_URL, ...shows.map((s) => s.ticketUrl ?? '')]
    .map(hostOf)
    .filter(Boolean)
    .concat(['bileton.ru', 'afisha.yandex.ru', 'radario.ru', 'ticketland.ru', 'kassir.ru']),
)

/** Remembers a click on any ticket link on the page (one listener for all buttons). */
export function watchTicketClicks(): () => void {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href]')
    if (!a) return
    const host = hostOf((a as HTMLAnchorElement).href)
    if (host && TICKET_HOSTS.has(host)) write(CLICKED, String(Date.now()))
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}

/**
 * True when a show has been played since the person clicked "Купить": some
 * afisha date falls between the click and yesterday. Without dates in the
 * afisha, two days after the click. Never more than two months later.
 */
export function reviewDue(now = Date.now()): boolean {
  if (read(ASKED)) return false
  const clicked = Number(read(CLICKED))
  if (!clicked || now - clicked > 60 * DAY) return false
  const from = new Date(clicked).toISOString().slice(0, 10)
  const today = new Date(now).toISOString().slice(0, 10)
  if (afishaDates.length) return afishaDates.some((d) => d >= from && d < today)
  return now - clicked > 2 * DAY
}

export function markReviewAsked() {
  write(ASKED, String(Date.now()))
}
