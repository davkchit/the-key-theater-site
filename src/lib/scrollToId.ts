import type { MouseEvent } from 'react'

// The site uses hash routing (/#/kursy), so a plain href="#zapis" would be read
// as a route and open a 404. In-page jumps scroll by hand instead.
export function scrollToId(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
