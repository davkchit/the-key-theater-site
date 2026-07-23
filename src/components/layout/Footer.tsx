import { NavLink } from 'react-router-dom'
import { navItems } from '../../data/nav'
import { socials } from '../../data/socials'
import { SocialIcon } from '../ui/SocialIcon'
import { SwallowIcon } from '../ui/SwallowIcon'
import logoWordmark from '../../../assets/logo-wordmark.png'

export function Footer() {
  return (
    <footer className="relative mt-17.5 overflow-hidden bg-ink text-[#B7B0A0]">
      <svg
        viewBox="0 0 900 120"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-7 left-0 h-27.5 w-full text-brand-red opacity-35"
        aria-hidden="true"
      >
        <path
          d="M0,70 C120,10 240,120 360,60 C480,10 600,120 720,60 C820,20 880,60 900,50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <SwallowIcon className="pointer-events-none absolute top-4 right-[32%] h-15.5 -rotate-9 text-paper" />
      <SwallowIcon className="pointer-events-none absolute top-14 right-[24%] h-9.5 rotate-9 text-brand-red" />

      <div className="relative mx-auto grid max-w-320 grid-cols-1 gap-10 px-6.5 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <img src={logoWordmark} alt="Театр Ключ" className="h-15.5 w-auto object-contain" />
          <p className="mt-4.5 max-w-80 text-sm leading-relaxed text-[#8F887A]">
            Молодёжный театр «Ключ» — территория полёта и жизни без границ. Набережные Челны.
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map((s) => (
              <SocialIcon
                key={s.key}
                social={s}
                className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#3a352d] text-[#B7B0A0] transition-all duration-200 hover:border-brand-yellow hover:bg-brand-yellow hover:text-ink active:scale-90"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="font-heading text-xs font-medium tracking-[.14em] text-[#6B655A] uppercase">Разделы</div>
          <div className="mt-4 flex flex-col gap-2.75">
            {navItems.map((item) => (
              <NavLink key={item.key} to={item.to} className="text-[15px] transition-colors duration-200 hover:text-paper">
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="font-heading text-xs font-medium tracking-[.14em] text-[#6B655A] uppercase">Контакты</div>
          <div className="mt-4 flex flex-col gap-3 text-[15px]">
            <a href="tel:+79061202262" className="font-bold text-paper">
              +7 906 120-22-62
            </a>
            <a href="tel:+79625739219" className="font-bold text-paper">
              +7 962 573-92-19
            </a>
            <span className="text-[#8F887A]">ул. Академика Рубаненко, 2</span>
            <span className="text-[#8F887A]">Набережные Челны</span>
            {/* demo content, not a real domain -- plain text, not a link (jsx-a11y/anchor-is-valid) */}
            <span className="font-semibold text-brand-yellow">kluchtheatre.ru</span>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#2a2620]">
        <div className="mx-auto flex max-w-320 flex-wrap justify-between gap-3 px-6.5 py-4.5 text-xs text-[#6B655A]">
          <span>© 2026 АНО «Театр Ключ». Все права защищены.</span>
          <span>Сайт разработан на Vite + React + TypeScript</span>
        </div>
      </div>
    </footer>
  )
}
