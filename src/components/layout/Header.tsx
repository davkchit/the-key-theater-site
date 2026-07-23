import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/nav'
import { useScrolled } from '../../hooks/useScrolled'
import { Burger } from './Burger'
import { MobileMenu } from './MobileMenu'
import logoWordmark from '../../../assets/logo-wordmark.png'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(30)

  return (
    <>
      <header
        className={[
          'sticky top-0 z-40 text-paper transition-[background-color,box-shadow] duration-350',
          scrolled ? 'bg-ink/70 shadow-[0_10px_30px_rgba(0,0,0,.28)] backdrop-blur-lg backdrop-saturate-180' : 'bg-ink',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-320 items-center gap-5.5 px-6.5 py-4">
          <NavLink to="/" className="flex flex-shrink-0 items-center text-paper">
            <img src={logoWordmark} alt="Театр Ключ" className="h-13 w-auto object-contain" />
          </NavLink>

          <nav className="ml-auto hidden items-center gap-6.5 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'border-b-2 py-1.5 font-heading text-sm font-medium tracking-[.1em] uppercase transition-colors duration-200 hover:text-brand-yellow',
                    isActive ? 'border-brand-yellow text-brand-yellow' : 'border-transparent text-paper',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/afisha"
            className="hidden flex-shrink-0 rounded bg-brand-yellow px-5 py-3 font-heading text-[13px] font-semibold tracking-[.1em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95 md:block"
          >
            Купить билет
          </NavLink>

          <Burger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
