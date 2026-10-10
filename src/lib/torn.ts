import { useLayoutEffect, useRef, useState } from 'react'

// The torn-paper outline shared by the bands (components/home2/paper.tsx),
// the review card and the torn photos: drawn as a vector path, so the edge is
// smooth at any size, with no stray pixels along it.

// Small deterministic random, so an edge looks the same on every render and
// the server-side build matches the browser.
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

/** A torn sheet's outline in a w×h box, `m` px of room for the tear on each side. */
export function tornRectPath(w: number, h: number, seed: number, m: number, lift = 0): string {
  const r = rng(seed)
  const pts: string[] = []
  const a1 = r() * Math.PI * 2
  const a2 = r() * Math.PI * 2
  // how far in from the box edge the tear runs at distance t along the outline
  const depth = (t: number) => {
    const wave = Math.sin(t / 90 + a1) * 2.5 + Math.sin(t / 31 + a2) * 1.5
    return Math.max(0.5, Math.min(m - 0.5, m / 2 + wave + (r() - 0.5) * 5 - lift))
  }
  const side = (len: number, at: (x: number, d: number) => [number, number], t0: number) => {
    // corners are left to the two sides meeting there: no sliver to the box edge
    for (let x = m; x < len - m; x += 5 + r() * 9) {
      const [px, py] = at(x, depth(t0 + x))
      pts.push(`${px.toFixed(1)},${py.toFixed(1)}`)
    }
  }
  side(w, (x, d) => [x, d], 0)
  side(h, (y, d) => [w - d, y], w)
  side(w, (x, d) => [w - x, h - d], w + h)
  side(h, (y, d) => [d, h - y], 2 * w + h)
  return `M${pts.join(' L')} Z`
}

/** The box's size and its torn outline as a CSS mask ('' until measured). */
export function useTornMask(seed: number, m: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<[number, number] | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize([el.offsetWidth, el.offsetHeight]))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const [w, h] = size ?? [0, 0]
  const mask =
    w && h
      ? `url("data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${tornRectPath(w, h, seed, m)}'/></svg>`,
        )}")`
      : ''
  return { ref, w, h, mask }
}
