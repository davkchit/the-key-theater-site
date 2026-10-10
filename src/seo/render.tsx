import { renderToString } from 'react-dom/server'
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router-dom'
import { routes } from '../routes'

// One page of the site as HTML, for scripts/prerender.mjs. The browser then
// draws the page anew over it (createRoot, not hydration), so dates and
// anything the visitor did never have to match the build.
export async function renderPage(path: string): Promise<string> {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request('http://localhost' + path))
  if (context instanceof Response) throw new Error(`${path}: redirect`)
  const router = createStaticRouter(handler.dataRoutes, context)
  return renderToString(<StaticRouterProvider router={router} context={context} hydrate={false} />)
}
