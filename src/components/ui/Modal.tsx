import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  /** change this value to replay a validation-error shake on the card */
  shakeKey?: number
}

/**
 * Portal + scrim + "materialize" card (opacity+scale+blur together, not a
 * plain fade) + focus trap + Escape-to-close. The scrim's click-to-close
 * handler only stops propagation from the card -- it never calls
 * preventDefault, so it can never interfere with a submit button's native
 * click -> form-submit activation (the bug class hit in the original build).
 */
export function Modal({ open, onClose, children, labelledBy, shakeKey }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const shakeControls = useAnimationControls()

  useEscapeKey(open, onClose)
  useFocusTrap(cardRef, open)
  useLockBodyScroll(open)

  useEffect(() => {
    if (shakeKey === undefined) return
    void shakeControls.start({ x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } })
  }, [shakeKey, shakeControls])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26 }}
          onClick={onClose}
        >
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className="no-scrollbar relative max-h-[90vh] w-full max-w-[460px] overflow-hidden overflow-y-auto rounded-[18px] border-2 border-ink bg-paper p-8"
            initial={{ opacity: 0, scale: 0.92, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 6, filter: 'blur(4px)' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div animate={shakeControls}>{children}</motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
