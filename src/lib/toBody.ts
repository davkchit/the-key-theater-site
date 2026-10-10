import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Overlays (dialogs, the chat, the ticket window) live at the end of <body>.
// While the build renders pages to HTML there is no body yet, and nothing of
// theirs is open anyway.
export const toBody = (node: ReactNode) =>
  typeof document === 'undefined' ? null : createPortal(node, document.body)
