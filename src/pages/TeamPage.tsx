import { TeamCarousel } from '../components/team/TeamCarousel'
import { TeamGrid } from '../components/team/TeamGrid'
import { team } from '../data/team'

export default function TeamPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">Люди театра</div>
      <h1 className="mt-2.5 font-heading text-[clamp(48px,8vw,116px)] leading-[.86] font-bold uppercase">Команда</h1>
      <p className="mt-3.5 max-w-155 text-[17px] leading-[1.55] text-[#33302a]">
        Мы гордимся каждым человеком, который был в нашем театре. Вот те, кто ведёт «Ключ» сегодня.
      </p>

      <div className="mt-7.5">
        <TeamGrid members={team} />
        <TeamCarousel members={team} />
      </div>
    </main>
  )
}
