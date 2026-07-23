import { NavLink } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import artBlue from '../../../assets/art-blue.jpg'

export function ArtBand() {
  return (
    <section className="mx-auto mt-10 max-w-320 px-6.5">
      <Reveal className="relative flex min-h-85 items-center overflow-hidden rounded-[18px] border-2 border-ink">
        <img src={artBlue} alt="Фирменная графика театра «Ключ» — ласточки" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,19,14,.82)_0%,rgba(22,19,14,.55)_42%,rgba(22,19,14,0)_72%)]" />
        <div className="relative max-w-140 p-7 text-paper md:p-14">
          <div className="font-script text-[clamp(30px,5vw,48px)] leading-none text-brand-yellow">навстречу свободе</div>
          <p className="mt-4 text-[clamp(16px,2vw,19px)] leading-[1.55] text-[#E7E1D2]">
            Ласточки, звёзды и красная нить — наши спутники. Мы летим туда, где жизнь без границ, и берём с собой
            каждого, кто хочет играть.
          </p>
          <NavLink
            to="/repertuar"
            className="mt-6 inline-block rounded-[5px] bg-brand-yellow px-6.5 py-3.5 font-heading text-sm font-semibold tracking-[.08em] text-ink uppercase"
          >
            Смотреть спектакли
          </NavLink>
        </div>
      </Reveal>
    </section>
  )
}
