// Russian typesetting rules, applied to whatever text ends up on the page —
// including what the theatre types in the admin and what the chat bot writes.
//
//  - a preposition, conjunction or particle never hangs at the end of a line:
//    «в конце» / «и театр» stay together (non-breaking space after it);
//  - a dash never starts a line (non-breaking space before it);
//  - a short name in «…» is not split: «Солнечная пыль» moves as one.

const NBSP = ' '

// short words that must stick to the next one
const SHORT =
  'а|без|в|во|вне|для|до|же|за|и|из|изо|или|к|ко|ли|на|над|не|ни|но|о|об|обо|от|ото|по|под|при|про|с|со|у|через|это|мы|вы|он|она|они|я|—|–'
const AFTER_SHORT = new RegExp(`(^|[\\s(«„"${NBSP}])(${SHORT}) +`, 'gi')
const BEFORE_DASH = / +([—–])/g
const SHORT_QUOTE = /«([^«»]{1,28})»/g

export function typograph(text: string): string {
  if (!text || text.length < 3) return text
  let t = text.replace(BEFORE_DASH, `${NBSP}$1`)
  // twice: «и в театр» — the second short word only gets its turn after the first
  t = t.replace(AFTER_SHORT, `$1$2${NBSP}`).replace(AFTER_SHORT, `$1$2${NBSP}`)
  t = t.replace(SHORT_QUOTE, (m, inner: string) =>
    inner.split(' ').length <= 3 ? `«${inner.replace(/ /g, NBSP)}»` : m,
  )
  return t
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG'])

function fixNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const v = node.nodeValue ?? ''
    const t = typograph(v)
    if (t !== v) node.nodeValue = t
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  if (SKIP.has((node as Element).tagName.toUpperCase()) || (node as HTMLElement).isContentEditable)
    return
  node.childNodes.forEach(fixNode)
}

/** Keep every text on the page typeset, including what appears later. */
export function watchTypography(root: HTMLElement): () => void {
  fixNode(root)
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') fixNode(r.target)
      else r.addedNodes.forEach(fixNode)
    }
  })
  observer.observe(root, { childList: true, subtree: true, characterData: true })
  return () => observer.disconnect()
}
