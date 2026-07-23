import { useEffect } from 'react'

/** Locks page scroll while `active` is true (for full-screen menu / modal overlays). */
export function useLockBodyScroll(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}
