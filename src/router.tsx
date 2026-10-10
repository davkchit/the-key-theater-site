import { createBrowserRouter, createHashRouter } from 'react-router-dom'
import { routes } from './routes'

// Real addresses (/afisha, /spektakl/simon) wherever the site sits at the
// domain root: the server sends every unknown path to index.html, and each
// page has its own file for search engines. GitHub Pages (a sub-folder, no
// rewrites) keeps the old /#/afisha form.
const atRoot = import.meta.env.BASE_URL === '/'

// links shared in the hash days (/#/afisha) open the same page at its real address
if (atRoot && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

export const router = atRoot ? createBrowserRouter(routes) : createHashRouter(routes)
