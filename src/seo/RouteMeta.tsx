import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { METRIKA_ID, SITE_URL, imageOf, metaFor } from './meta'

// The tab title, description and link-preview tags follow the page as the
// visitor moves around; the first page already has them from its own HTML.
function setTag(selector: string, attr: string, value: string) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    const [, k, v] = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/) ?? []
    if (k && v) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

export function RouteMeta() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    setTag('meta[name="description"]', 'content', m.description)
    setTag('meta[property="og:title"]', 'content', m.title)
    setTag('meta[property="og:description"]', 'content', m.description)
    setTag('meta[property="og:image"]', 'content', imageOf(m))
    if (SITE_URL) {
      setTag('link[rel="canonical"]', 'href', SITE_URL + m.path)
      setTag('meta[property="og:url"]', 'content', SITE_URL + m.path)
    }
    // Metrica counts the first page by itself; the moves inside the site are told to it
    const ym = (window as { ym?: (...a: unknown[]) => void }).ym
    if (!first.current && METRIKA_ID && ym)
      ym(Number(METRIKA_ID), 'hit', window.location.href, { title: m.title })
    first.current = false
  }, [pathname])
  return null
}
