import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Burger } from '../layout/Burger'
import { MobileMenu } from '../layout/MobileMenu'
import { WRAP } from './parts'
import { HeaderEdge } from './paper'
import logoWordmark from '../../../assets/logo-wordmark.png'

// Menu of the approved mockup: wordmark, six sections, red "Купить билет",
// the full width of the screen, with a torn bottom edge over the first screen.

const ITEMS = [
  { label: 'Афиша', to: '/novaya/afisha' },
  { label: 'Спектакли', to: '/novaya/repertuar' },
  { label: 'Курсы', to: '/novaya/kursy' },
  { label: 'Фестиваль', to: '/novaya/festival' },
  { label: 'О театре', to: '/novaya/o-teatre' },
  { label: 'Контакты', to: '/novaya/kontakty' },
]

export function HeaderV2() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <header className="text-paper sticky top-0 z-40 bg-[#121212]">
        <HeaderEdge />
        <div className={`flex h-[72px] items-center gap-8 md:h-[96px] ${WRAP}`}>
          <Link to="/novaya" className="flex-shrink-0" aria-label="Театр «Ключ», на главную">
            <img src={logoWordmark} alt="Театр Ключ" className="h-11 w-auto md:h-15" />
          </Link>

          <nav className="ml-auto hidden items-center gap-9 lg:flex">
            {ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className="font-heading hover:text-brand-yellow text-[17px] font-medium tracking-[.03em] uppercase transition-colors duration-200"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/novaya/afisha"
            className="bg-brand-red font-heading ml-auto hidden flex-shrink-0 rounded-md px-7 py-3.5 text-[18px] font-semibold tracking-[.04em] uppercase transition-transform duration-180 hover:-translate-y-0.5 sm:inline-flex lg:ml-4"
          >
            Купить билет
          </Link>

          <div className="ml-auto sm:ml-0">
            <Burger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
