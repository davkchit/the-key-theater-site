import { NavLink } from 'react-router-dom'
import { StarIcon } from '../ui/StarIcon'
import { SwallowIcon } from '../ui/SwallowIcon'
import photo1 from '../../../assets/photo-1.jpg'

export function Hero() {
  return (
    <section className="relative mx-auto max-w-320 px-6.5 pt-14.5 pb-8.5">
      <svg
        viewBox="0 0 620 140"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-10 right-6.5 h-30 w-[46%] text-brand-red opacity-50"
        aria-hidden="true"
      >
        <path d="M0,80 C90,10 170,120 260,70 C350,20 430,120 520,60 C570,28 600,60 620,52" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
      <SwallowIcon className="pointer-events-none absolute top-14.5 right-[33%] z-3 h-20.5 -rotate-12 text-ink" />
      <SwallowIcon className="pointer-events-none absolute top-37.5 right-[22%] z-3 h-11.5 rotate-8 animate-kl-float text-brand-red" />

      <div className="flex flex-wrap items-center gap-2.5 font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">
        <span>Молодёжный театр «Ключ»</span>
        <span className="text-brand-red">✳</span>
        <span>Набережные Челны</span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-end gap-8.5 lg:grid-cols-[1.28fr_.72fr]">
        <div>
          <h1 className="font-heading text-[clamp(52px,8.4vw,128px)] leading-[.86] font-bold tracking-[-.01em] uppercase">
            Театр,
            <br />
            который сочиняет
            <br />
            <span className="inline-block -rotate-1 bg-brand-red px-[.1em] text-paper">жизнь</span> заново
          </h1>
          <p className="mt-5.5 font-script text-[clamp(24px,3.2vw,38px)] leading-[1.1] text-brand-blue">
            территория полёта и жизни без границ
          </p>
          <p className="mt-4 max-w-125 text-[17px] leading-[1.6] text-[#33302a]">
            Мы придумываем правила, а потом приходят новые люди — и мы придумываем их заново. Всё это о любви,
            дружбе и человеческом взаимопонимании.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <NavLink
              to="/afisha"
              className="rounded-[5px] bg-ink px-7.5 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.75 active:scale-[.96]"
            >
              Афиша сезона
            </NavLink>
            <span className="relative inline-flex items-center gap-3.5">
              <NavLink
                to="/kursy"
                className="inline-block rounded-[5px] bg-brand-yellow px-7.5 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.75 active:scale-[.96]"
              >
                Записаться на курс
              </NavLink>
              <span className="-rotate-4 font-script text-xl whitespace-nowrap text-brand-red">это бесплатно!</span>
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-brand-blue">
            <img src={photo1} alt="Спектакль театра Ключ" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute bottom-3.5 left-3.5 rounded bg-paper px-3.25 py-1.75 font-heading text-xs font-semibold tracking-[.1em] text-ink uppercase">
              Сезон 2026 / 2027
            </div>
          </div>
          <StarIcon spin className="absolute -top-6 -left-4.5 h-19.5 w-19.5 text-brand-yellow" />
        </div>
      </div>
    </section>
  )
}
