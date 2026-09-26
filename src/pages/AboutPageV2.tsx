import { Link } from 'react-router-dom'
import { awards } from '../data/awards'
import { productions } from '../data/productions'
import { mediaUrl } from '../lib/mediaUrl'
import {
  PrintFilters,
  BTN,
  Ink,
  MoreLink,
  Portrait,
  RoughFrame,
  SectionHead,
  WRAP,
} from '../components/home2/parts'
import { GRAIN_URL, Grain, Torn } from '../components/home2/paper'
import { galleryPhoto } from '../components/home2/homeData'
import { Reveal } from '../components/ui/Reveal'
import { SwallowIcon } from '../components/ui/SwallowIcon'
import starSvg from '../../assets/el-star.svg'

// «О театре»: who we are, the history year by year, the numbers over the
// building, what else the theatre does, awards and every production.

const HISTORY: [string, string][] = [
  [
    '2003',
    'Компания молодых неформалов начинает театральную студию при Центре детского творчества «Огниво»',
  ],
  ['2004', 'Первый Всероссийский театральный фестиваль «Действующие лица»'],
  ['2005', 'Звание «Народный театр» от Министерства культуры Республики Татарстан'],
  ['2008', 'Студия при Набережночелнинском педагогическом институте'],
  ['2012', 'Первая лаборатория «ЛСД» — Лаборатория современной драматургии'],
  ['2018', 'Театр становится АНО и переезжает в молодёжный центр «НУР»'],
  ['2020', 'Открываются студия для детей и подростков и курсы для взрослых'],
  ['2022', 'Первый летний театральный лагерь «Солнечная пыль»'],
]

const TOURS = 'Сербия, Литва, Латвия, Беларусь, Армения'

const DIRECTIONS = [
  {
    title: 'Фестиваль «Действующие лица»',
    note: 'Всероссийский, с 2004 года. К нам приезжают театральные коллективы со всей России: показы, мастерские, обсуждения.',
    photo: 'nagrazhdenie-1',
    block: 'bg-brand-red',
    to: '/festival',
  },
  {
    title: 'Лаборатория «ЛСД»',
    note: 'Молодые режиссёры вместе с актёрами «Ключа» за три дня готовят эскизы спектаклей и показывают их зрителям.',
    photo: 'spektakl-1',
    block: 'bg-brand-yellow',
  },
  {
    title: 'Лагерь «Солнечная пыль»',
    note: 'Каждое лето: занятия с педагогами, игры, экскурсии в другие театры и итоговая постановка для родителей.',
    photo: 'lager-1',
    block: 'bg-brand-blue',
  },
]

export default function AboutPageV2() {
  const years = new Date().getFullYear() - 2003

  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />

      {/* first screen */}
      <section
        className={`${WRAP} grid items-center gap-12 pt-14 pb-20 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pt-20 md:pb-28`}
      >
        <div>
          <div className="font-heading text-[15px] tracking-[.08em] uppercase md:text-[17px]">
            О театре
          </div>
          <h1 className="font-heading mt-3 text-[clamp(56px,9vw,132px)] leading-[.9] font-bold uppercase">
            Театр
            <br />
            свободы
          </h1>
          <p className="font-script text-brand-red mt-6 max-w-md text-[28px] leading-[1.15] md:text-[34px]">
            Нам нравится жить по правилам, которые мы сами придумываем.
          </p>
          <p className="mt-6 max-w-lg text-[17px] leading-[1.6] md:text-[18px]">
            Молодёжный театр «Ключ» в Набережных Челнах с 2003 года. Театр для каждого свой. Для нас
            он — территория полёта и жизни без границ.
          </p>
        </div>
        <Reveal className="relative">
          <RoughFrame>
            <img
              src={galleryPhoto('posledstviy-3')}
              alt="Актёры театра «Ключ» на сцене"
              className="aspect-[4/3] w-full object-cover"
            />
          </RoughFrame>
          <SwallowIcon className="text-ink absolute -top-10 -left-6 h-14 -rotate-12 md:h-20" />
        </Reveal>
      </section>

      {/* quote */}
      <section className="bg-ink text-paper relative">
        <Torn color="text-ink" seed={241} />
        <div className={`${WRAP} relative py-16 md:py-24`}>
          <Ink src={starSvg} light className="top-10 right-10 hidden h-24 w-24 md:block" />
          <blockquote className="max-w-5xl">
            <p className="font-heading text-[clamp(30px,4.6vw,64px)] leading-[1.05] font-medium uppercase">
              «Необходимо создавать места, где можно остановить время и там ждать отставшую душу»
            </p>
            <footer className="text-paper/75 mt-6 text-[16px] md:text-[18px]">
              Тонино Гуэрра — это о нашем театре
            </footer>
          </blockquote>
        </div>
        <Torn color="text-ink" side="bottom" seed={247} />
      </section>

      {/* history */}
      <section className={`${WRAP} pt-20 pb-16 md:pt-28`}>
        <SectionHead title="История" />
        <ol className="relative grid grid-cols-2 gap-x-5 gap-y-8 md:gap-x-8 md:gap-y-10 lg:grid-cols-4">
          {HISTORY.map(([year, text], i) => (
            <Reveal key={year} index={i % 4} className="border-ink border-t-2 pt-4">
              <div className="font-heading text-[40px] leading-none font-bold md:text-[64px]">
                {year}
              </div>
              <p className="mt-3 text-[14px] leading-[1.45] md:text-[16px] md:leading-[1.5]">
                {text}
              </p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* numbers over the building */}
      <section className="bg-ink text-paper relative isolate">
        <Torn color="text-ink" seed={251} />
        <img
          src={mediaUrl('/uploads/building/nur.jpg')}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%] opacity-45"
        />
        <div className="from-ink/85 via-ink/50 to-ink/90 absolute inset-0 -z-10 bg-gradient-to-b" />
        <Grain opacity={0.5} />
        <div className={`${WRAP} relative z-[2] py-20 md:py-28`}>
          <SectionHead title="Театр в цифрах" dark />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {[
              [String(productions.length), 'постановки'],
              ['5', 'стран гастролей'],
              [`${years}`, 'лет театру'],
              ['с 2004', 'свой фестиваль'],
            ].map(([big, note]) => (
              <div key={note}>
                <dt className="font-heading text-[56px] leading-none font-bold whitespace-nowrap md:text-[88px]">
                  {big}
                </dt>
                <dd className="mt-3 text-[14px] tracking-[.04em] uppercase opacity-85">{note}</dd>
              </div>
            ))}
          </dl>
          <p className="text-paper/80 mt-10 text-[16px]">Гастроли: {TOURS}</p>
        </div>
        <Torn color="text-ink" side="bottom" seed={257} />
      </section>

      {/* what else we do */}
      <section className={`${WRAP} pt-20 pb-16 md:pt-28`}>
        <SectionHead title="Не только спектакли" />
        <div className="grid gap-14 md:grid-cols-3 md:gap-10 xl:gap-14">
          {DIRECTIONS.map((d, i) => (
            <Reveal key={d.title} index={i}>
              <Portrait
                src={galleryPhoto(d.photo)}
                alt={d.title}
                block={d.block}
                focus="50% 45%"
                className="aspect-[4/3]"
              />
              <h3 className="font-heading mt-7 text-[28px] leading-[1.02] font-bold uppercase xl:text-[32px]">
                {d.title}
              </h3>
              <p className="text-ink/80 mt-3 text-[16px] leading-[1.55]">{d.note}</p>
              {d.to && (
                <MoreLink to={d.to} className="mt-5">
                  Подробнее
                </MoreLink>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* awards */}
      <section className={`${WRAP} pb-16`}>
        <div className="border-ink/15 border-t pt-14 md:pt-20">
          <SectionHead title="Награды и регалии" />
          <ul className="grid gap-x-12 gap-y-5 md:grid-cols-2">
            {awards.map((a) => (
              <li key={a} className="flex items-start gap-4 text-[17px] leading-[1.5]">
                <img
                  src={starSvg}
                  alt=""
                  aria-hidden="true"
                  className="mt-0.5 h-6 w-6 flex-shrink-0"
                />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* every production, like the back page of a playbill */}
      <section className={`${WRAP} pb-24`}>
        <div className="border-ink/15 border-t pt-14 md:pt-20">
          <SectionHead title="Все постановки" />
          <ul className="columns-1 gap-x-12 sm:columns-2 lg:columns-3">
            {productions.map((p) => (
              <li
                key={p.year + p.title}
                className="mb-3 flex break-inside-avoid items-baseline gap-4 text-[16px] leading-[1.4]"
              >
                <span className="font-heading text-brand-red w-12 flex-shrink-0 text-[15px] font-semibold">
                  {p.year}
                </span>
                <span>«{p.title}»</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/repertuar" className={`${BTN} bg-ink text-paper`}>
              Что идёт сейчас
            </Link>
            <Link to="/komanda" className={`${BTN} border-ink border-2`}>
              Команда театра
            </Link>
          </div>
        </div>
      </section>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] opacity-[.22] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_URL }}
      />
    </div>
  )
}
