import type { MouseEvent } from 'react'

// On GitHub Pages the site uses hash routing (/#/kursy), where a plain
// href="#zapis" would be read as a route and open a 404. In-page jumps scroll
// by hand instead, the same on every host.
export function scrollToId(id: string) {
  return (e: MouseEvent) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
