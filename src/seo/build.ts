// Everything scripts/prerender.mjs needs from the site, loaded through Vite
// so the pages, the content and the meta are the very same as in the browser.
export { renderPage } from './render'
export { SITE_URL, imageOf, seoPages } from './meta'
export { default as settings } from '../content/settings.json'
