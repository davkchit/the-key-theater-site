import { Fragment, type ReactNode } from 'react'

// The bot writes Telegram HTML: <b>, <i>, <a href>, <code>, line breaks. Only
// those become markup here; anything else is shown as its text, so nothing the
// model or a visitor typed can turn into a script or a hidden link.

const SAFE_HREF = /^(https?:|tel:|mailto:)/i

// Telegram turns a bare address in a message into a link by itself; the bot
// relies on that ("🎟 Билеты: https://..."), so the window does the same.
const URL_RE = /(https?:\/\/[^\s<>«»"]+[^\s<>«»".,;:!?)])/g

function linkify(text: string, key: number): ReactNode {
  const parts = text.split(URL_RE)
  if (parts.length === 1) return text
  return (
    <Fragment key={key}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="font-semibold break-all text-brand-red underline">
            {p.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          p
        ),
      )}
    </Fragment>
  )
}

function render(node: Node, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return linkify(node.textContent ?? '', key)
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as Element
  const children = Array.from(el.childNodes).map((c, i) => render(c, i))
  switch (el.tagName.toLowerCase()) {
    case 'b':
    case 'strong':
      return <strong key={key}>{children}</strong>
    case 'i':
    case 'em':
      return <em key={key}>{children}</em>
    case 'code':
      return <code key={key}>{children}</code>
    case 'br':
      return <br key={key} />
    case 'a': {
      const href = el.getAttribute('href') ?? ''
      if (!SAFE_HREF.test(href)) return <Fragment key={key}>{children}</Fragment>
      return (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-red underline">
          {children}
        </a>
      )
    }
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

export function RichText({ html }: { html: string }) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  return <>{Array.from(doc.body.childNodes).map((n, i) => render(n, i))}</>
}
