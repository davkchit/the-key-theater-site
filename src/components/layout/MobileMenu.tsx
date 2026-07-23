import { AnimatePresence, motion } from 'motion/react'
import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/nav'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import logoWordmark from '../../../assets/logo-wordmark.png'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEscapeKey(open, onClose)
  useLockBodyScroll(open)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex flex-col bg-ink p-6.5 text-paper"
          initial={{ opacity: 0, scale: 0.98, y: -18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -18 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between">
            <img src={logoWordmark} alt="Театр Ключ" className="h-[46px] w-auto object-contain" />
            <button
              onClick={onClose}
              aria-label="Закрыть меню"
              className="h-[46px] w-[46px] rounded-lg border-2 border-paper text-xl transition-transform duration-150 active:scale-90"
            >
              ✕
            </button>
          </div>

          <nav className="mt-11 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    'border-b border-[#34302a] py-3 font-heading text-[30px] font-medium tracking-[.04em] uppercase transition-transform duration-150 active:translate-x-1 active:scale-[.96]',
                    isActive ? 'text-brand-yellow' : 'text-paper',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/afisha"
            onClick={onClose}
            className="mt-7 self-start rounded-md bg-brand-yellow px-6.5 py-[15px] font-heading text-[15px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-150 active:scale-95"
          >
            Купить билет
          </NavLink>

          <div className="mt-auto font-script text-[30px] text-brand-red">любовь — это театр</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
