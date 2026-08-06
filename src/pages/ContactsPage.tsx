import { Reveal } from '../components/ui/Reveal'
import { SocialIcon } from '../components/ui/SocialIcon'
import { StarIcon } from '../components/ui/StarIcon'
import { SwallowIcon } from '../components/ui/SwallowIcon'
import { WavyUnderline } from '../components/ui/WavyUnderline'
import { AudienceSignupForm } from '../components/contacts/AudienceSignupForm'
import { socials } from '../data/socials'
import photo3 from '../../assets/photo-3.jpg'

export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">Как нас найти</div>
      <h1 className="mt-2.5 font-heading text-[clamp(48px,8vw,116px)] leading-[.86] font-bold uppercase">Контакты</h1>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Reveal className="rounded-3.5 border-2 border-ink p-6.5">
            <div className="font-heading text-xs font-medium tracking-[.14em] text-[#6B655A] uppercase">Телефоны</div>
            <a href="tel:+79061202262" className="mt-2.5 block font-heading text-[clamp(24px,3.4vw,36px)] font-bold text-ink">
              +7 906 120-22-62
            </a>
            <a href="tel:+79625739219" className="mt-1 block font-heading text-[clamp(24px,3.4vw,36px)] font-bold text-ink">
              +7 962 573-92-19
            </a>
            <div className="mt-3 text-sm text-[#6B655A]">Пн–пт, 15:00–21:00</div>
          </Reveal>

          <Reveal index={1} className="relative overflow-hidden rounded-3.5 bg-brand-red p-6.5 text-paper">
            <SwallowIcon className="pointer-events-none absolute -right-6 -bottom-2.5 h-37.5 -rotate-10 text-paper opacity-12" />
            <div className="font-heading text-xs font-medium tracking-[.14em] uppercase opacity-90">Адрес</div>
            <div className="mt-2.5 font-heading text-2xl leading-[1.15] font-semibold uppercase">
              ул. Академика
              <br />
              Рубаненко, 2
            </div>
            <WavyUnderline className="mt-3 h-3 w-30" />
            <div className="mt-2.5 text-sm opacity-92">Набережные Челны, Республика Татарстан</div>
          </Reveal>

          <Reveal index={2} className="rounded-3.5 border-2 border-ink p-6.5">
            <div className="font-heading text-xs font-medium tracking-[.14em] text-[#6B655A] uppercase">Почта и сеть</div>
            <a href="mailto:kluchtheatre@mail.ru" className="mt-2.5 block font-bold text-ink">
              kluchtheatre@mail.ru
            </a>
            <div className="mt-3.5 flex gap-2.5">
              {socials.map((s) => (
                <SocialIcon
                  key={s.key}
                  social={s}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink text-ink transition-[background,color] duration-200 hover:bg-ink hover:text-paper active:scale-90"
                />
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal index={1} className="relative min-h-110 overflow-hidden rounded-3.5 bg-brand-blue">
          <img src={photo3} alt="" className="h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-paper">
            <StarIcon spin className="h-16.5 w-16.5 text-brand-yellow" />
            <div className="mt-3 font-script text-[30px]">Ждём вас в театре «Ключ»</div>
            <div className="mt-1.5 text-sm opacity-82">Здесь будет карта проезда</div>
          </div>
        </Reveal>
      </div>

      <Reveal index={2} className="relative mt-5 overflow-hidden rounded-3.5 bg-ink p-7.5 text-paper md:p-9">
        <StarIcon spin className="pointer-events-none absolute top-7 right-7 h-14 w-14 text-brand-yellow opacity-70" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_.9fr] md:items-center">
          <div>
            <div className="font-script text-2xl text-brand-yellow">Не пропустите</div>
            <h2 className="mt-1 font-heading text-[clamp(26px,3.4vw,38px)] leading-[1.02] font-bold uppercase">
              Премьеры, фестиваль и новости театра
            </h2>
            <p className="mt-2.5 max-w-110 text-sm leading-[1.55] text-[#D8D2C4]">
              Оставьте контакты — напишем, когда выйдет новый спектакль, откроется набор на курс или начнётся приём
              заявок на фестиваль «Действующие лица».
            </p>
          </div>
          <div className="max-w-100">
            <AudienceSignupForm />
          </div>
        </div>
      </Reveal>
    </main>
  )
}
