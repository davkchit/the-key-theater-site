// After `vite build`: one HTML file per page (dist/afisha.html,
// dist/spektakl/simon.html…) with the page's own title, description, link
// preview, schema.org card and its text already in place, plus sitemap.xml
// and robots.txt. Yandex barely runs scripts, so without this every address
// would look to it like the same empty page.
//
// The server serves /afisha from afisha.html (Caddy: try_files {path}
// {path}.html /index.html). Skipped for a build into a sub-folder (GitHub
// Pages), which keeps the /#/ addresses.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const base = process.env.VITE_BASE ?? '/the-key-theater-site/'
if (base !== '/') {
  console.log('prerender: сайт не в корне домена, страницы не пререндерю')
  process.exit(0)
}

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

// the pages built once more for Node: the same code, and pictures under the
// same hashed names as in dist/assets
const out = path.resolve('node_modules/.prerender')
await build({
  logLevel: 'error',
  build: { ssr: 'src/seo/build.ts', outDir: out, emptyOutDir: true, copyPublicDir: false },
})
try {
  const { renderPage, seoPages, SITE_URL, imageOf, settings } = await import(
    pathToFileURL(path.join(out, 'build.js')).href
  )
  const esc = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  const ld = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

  // the same for every page: site verification and Yandex Metrica, from «Настройки сайта»
  const common = []
  if (!SITE_URL) common.push('<meta name="robots" content="noindex, nofollow" />')
  if (settings.yandexVerification)
    common.push(`<meta name="yandex-verification" content="${esc(settings.yandexVerification)}" />`)
  if (settings.googleVerification)
    common.push(
      `<meta name="google-site-verification" content="${esc(settings.googleVerification)}" />`,
    )
  const metrika = String(settings.metrikaId ?? '').trim()
  if (/^\d+$/.test(metrika)) {
    common.push(
      `<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${metrika},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>` +
        `<noscript><div><img src="https://mc.yandex.ru/watch/${metrika}" style="position:absolute;left:-9999px" alt="" /></div></noscript>`,
    )
  }

  const pages = seoPages()
  for (const m of pages) {
    let body = ''
    try {
      body = await renderPage(m.path)
    } catch (e) {
      // the page still gets its title and description; the script draws the rest
      console.error(`prerender: ${m.path} не отрисовалась: ${e.message}`)
    }
    const url = SITE_URL + m.path
    const head = [
      ...common,
      SITE_URL && `<link rel="canonical" href="${esc(url)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Театр «Ключ»" />`,
      `<meta property="og:locale" content="ru_RU" />`,
      `<meta property="og:title" content="${esc(m.title)}" />`,
      `<meta property="og:description" content="${esc(m.description)}" />`,
      SITE_URL && `<meta property="og:url" content="${esc(url)}" />`,
      `<meta property="og:image" content="${esc(imageOf(m))}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      ...(m.jsonLd?.length
        ? [
            `<script type="application/ld+json">${ld({ '@context': 'https://schema.org', '@graph': m.jsonLd })}</script>`,
          ]
        : []),
    ].filter(Boolean)

    const html = template
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(m.description)}$2`)
      .replace('<!--seo-->', head.join('\n    '))
      // what scrolls into view fades in; without scripts it simply stays visible
      .replace(
        '<div id="root"></div>',
        () => `<div id="root">${body.replace(/opacity:0;?/g, '')}</div>`,
      )

    const file = m.path === '/' ? 'index.html' : m.path.slice(1) + '.html'
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
    fs.writeFileSync(path.join(dist, file), html)
  }

  // pages to index, and what to leave alone; without a domain the site asks not to be indexed at all
  if (SITE_URL) {
    fs.writeFileSync(
      path.join(dist, 'sitemap.xml'),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        pages
          .map((m) => {
            const pr =
              m.path === '/' ? '1.0' : /^\/(afisha|repertuar|kursy)$/.test(m.path) ? '0.9' : '0.7'
            return `  <url><loc>${esc(SITE_URL + m.path)}</loc><priority>${pr}</priority></url>`
          })
          .join('\n') +
        '\n</urlset>\n',
    )
    fs.writeFileSync(
      path.join(dist, 'robots.txt'),
      [
        'User-agent: *',
        'Disallow: /admin',
        'Disallow: /api/',
        'Disallow: /staryi',
        'Disallow: /novaya',
        'Disallow: /*?otzyv',
        'Allow: /',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        '',
      ].join('\n'),
    )
  } else {
    fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  }
  console.log(
    `prerender: ${pages.length} страниц${SITE_URL ? '' : ' (домен не задан — индексация закрыта)'}`,
  )
} finally {
  fs.rmSync(out, { recursive: true, force: true })
}
