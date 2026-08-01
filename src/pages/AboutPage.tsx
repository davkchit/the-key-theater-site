import { NavLink } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import { StarIcon } from '../components/ui/StarIcon'
import { SwallowIcon } from '../components/ui/SwallowIcon'
import { awards } from '../data/awards'
import photo2 from '../../assets/photo-2.jpg'
import elFace from '../../assets/el-face.svg'

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">О театре</div>
      <h1 className="mt-2.5 font-heading text-[clamp(46px,8vw,116px)] leading-[.86] font-bold uppercase">Театр свободы</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_.65fr]">
        <div className="text-[clamp(17px,1.9vw,21px)] leading-[1.65] text-[#2b2822]">
          <p className="mb-4.5 font-script text-[30px] leading-[1.1] text-brand-blue">
            Нам нравится жить по правилам, которые мы сами придумываем.
          </p>
          <p className="mb-4.5">
            Мы родились в 2003 году — компания молодых неформалов начала делать свою театральную студию при Центре
            детского творчества «Огниво». Уже в 2004-м провели первый Всероссийский театральный фестиваль
            «Действующие лица», а в 2005-м получили звание «Народного театра» от Министерства Республики Татарстан.
          </p>
          <p className="mb-4.5">
            В 2008 году стали театральной студией при Набережночелнинском педагогическом институте, а в 2012-м
            запустили первую театральную лабораторию «ЛСД» — Лабораторию современной драматургии. В 2018-м театр
            стал частной организацией (АНО) и переехал в молодёжный центр «Нур». В 2020-м открыли студию для детей
            и подростков и курсы для взрослых, а в 2022-м — летний театральный лагерь «Солнечная пыль».
          </p>
          <p className="mb-4.5">
            За эти годы мы поставили больше 30 спектаклей и съездили на гастроли в Сербию, Литву, Латвию, Беларусь и
            Армению.
          </p>
          <p className="mb-4.5">
            Театр для каждого свой. Для нас он — территория полёта и жизни без границ. Мы изучаем себя на
            актёрских курсах, проводим театральную лабораторию для молодых режиссёров и организуем летний
            театральный лагерь.
          </p>
          <p>У нас много наград и регалий — и каждой мы гордимся так же, как гордимся каждым человеком, который был в нашем театре.</p>
        </div>

        <Reveal className="relative self-start overflow-hidden rounded-3.5 bg-brand-blue p-6.5 text-paper">
          <img src={elFace} alt="" className="pointer-events-none absolute -top-2 -right-4 h-40 w-auto opacity-16 invert" />
          <div className="relative font-script text-2xl">Ваша</div>
          <div className="mt-0.5 font-heading text-2xl leading-[.98] font-bold uppercase">
            Софья
            <br />
            Дивногорская
          </div>
          <div className="mt-2.5 text-[13px] leading-[1.5] opacity-85">
            Художественный руководитель и педагог театра «Ключ», директор фестиваля «Действующие лица»
          </div>
          <div className="mt-4.5 aspect-4/3 overflow-hidden rounded-[10px] bg-ink">
            <img src={photo2} alt="Софья Дивногорская" className="h-full w-full object-cover" />
          </div>
        </Reveal>
      </div>

      <div className="mt-13 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-3.5 border-2 border-ink p-7.5">
          <StarIcon className="pointer-events-none absolute -right-5 -bottom-5 h-37.5 -rotate-6 opacity-9" />
          <h2 className="relative mb-4.5 font-heading text-3xl font-bold uppercase">Награды и регалии</h2>
          <div className="relative flex flex-col gap-3">
            {awards.map((a) => (
              <div key={a} className="flex items-start gap-3 text-base leading-[1.45]">
                <span className="font-extrabold text-brand-red">✳</span>
                {a}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal index={1} className="relative overflow-hidden rounded-3.5 bg-brand-yellow p-7.5">
          <SwallowIcon className="pointer-events-none absolute top-1/2 right-10 h-52.5 -translate-y-1/2 -rotate-12 opacity-16" />
          <div className="relative font-heading text-xs font-medium tracking-[.14em] uppercase">Всероссийский · Международный</div>
          <h2 className="relative mt-2 mb-3.5 font-heading text-[clamp(28px,3.4vw,44px)] leading-[.94] font-bold uppercase">
            Фестиваль «Действующие лица»
          </h2>
          <p className="relative text-base leading-[1.55]">
            Проводим с 2004 года — к нам приезжают театральные коллективы со всей России. В программе — показы и
            мастерские для участников.
          </p>
          <NavLink
            to="/kontakty"
            className="relative mt-5 inline-block rounded-md bg-ink px-6.5 py-3.25 font-heading text-[13px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
          >
            Стать участником
          </NavLink>
        </Reveal>
      </div>

      <Reveal className="relative mt-4 grid grid-cols-1 gap-6 overflow-hidden rounded-3.5 bg-brand-blue p-7.5 text-paper md:grid-cols-2">
        <div>
          <div className="font-heading text-xs font-medium tracking-[.14em] text-brand-yellow uppercase">С 2012 года</div>
          <h3 className="mt-2 font-heading text-2xl font-bold uppercase">Театральная лаборатория</h3>
          <p className="mt-2.5 text-sm leading-[1.5] text-[#E7E1D2]">
            Молодые режиссёры вместе с актёрами «Ключа» за три дня готовят эскизы спектаклей и показывают их зрителям.
          </p>
        </div>
        <div>
          <div className="font-heading text-xs font-medium tracking-[.14em] text-brand-yellow uppercase">Каждое лето</div>
          <h3 className="mt-2 font-heading text-2xl font-bold uppercase">Летний театральный лагерь</h3>
          <p className="mt-2.5 text-sm leading-[1.5] text-[#E7E1D2]">
            Занятия с педагогами, игры, экскурсии в другие театры и итоговая постановка с приглашением родителей.
          </p>
        </div>
      </Reveal>
    </main>
  )
}
