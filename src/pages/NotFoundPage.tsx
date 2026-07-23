import { NavLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 py-26 text-center">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">404</div>
      <h1 className="mt-2.5 font-heading text-[clamp(48px,8vw,116px)] leading-[.86] font-bold uppercase">Страница не найдена</h1>
      <NavLink
        to="/"
        className="mt-7 inline-block rounded-md bg-ink px-7.5 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
      >
        На главную
      </NavLink>
    </main>
  )
}
