import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { directionByType } from '../../data/directions'
import coursesContent from '../../content/courses.json'
import type { Course } from '../../types/content'
import { mediaUrl } from '../../lib/mediaUrl'
import { Modal } from '../ui/Modal'
import { FestivalSignupForm } from '../about/FestivalSignupForm'
import { Reveal } from '../ui/Reveal'
import { SwallowIcon } from '../ui/SwallowIcon'
import {
  BTN,
  Duotone,
  Ink,
  MoreLink,
  Portrait,
  RoughFrame,
  SectionHead,
  WRAP,
  type Tone,
} from './parts'
import { Grain, Torn } from './paper'
import { upcomingCards, shortDate, galleryPhoto, teamPhoto, showPath } from './homeData'
import boyFence from '../../../assets/el-boy-fence.svg'
import starSvg from '../../../assets/el-star.svg'
import ladderSvg from '../../../assets/el-ladder.svg'
import faceSvg from '../../../assets/el-face.svg'
import flowerSvg from '../../../assets/el-flower.svg'
import chairSvg from '../../../assets/el-chair.svg'

const courses = coursesContent.items as Course[]

/* ─────────────── festival strip ─────────────── */

export function FestivalStrip() {
  const festival = directionByType('festival')
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  if (!festival?.open) return null

  return (
    <section className="bg-brand-red text-paper relative">
      <Torn color="text-brand-red" seed={11} />
      <div
        className={`${WRAP} relative flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:gap-8 md:py-12`}
      >
        <div>
          <p className="font-heading text-[24px] leading-[1.05] font-bold uppercase sm:text-[28px] lg:text-[34px]">
            Приём заявок на фестиваль «Действующие лица» открыт
          </p>
          {festival.schedule && (
            <p className="mt-2 text-[17px] opacity-90 md:text-[19px]">{festival.schedule}</p>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className={`${BTN} bg-paper text-ink self-start px-9 py-4.5 text-[17px] sm:ml-auto sm:self-auto`}
        >
          Подать заявку
        </button>
        <img
          src={starSvg}
          alt=""
          aria-hidden="true"
          className="hidden h-20 w-20 flex-shrink-0 lg:block"
        />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        shakeKey={shakeKey}
        labelledBy="festival-signup-title"
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Закрыть"
          className="border-ink absolute top-4.5 right-4.5 h-9.5 w-9.5 rounded-lg border-2 text-base transition-transform duration-150 active:scale-90"
        >
          ✕
        </button>
        {sent ? (
          <div className="bg-brand-blue/8 text-brand-blue rounded-[10px] p-4.5 text-[14px] leading-[1.5] font-semibold">
            ✳ Спасибо! Заявка отправлена, мы свяжемся с вами.
          </div>
        ) : (
          <FestivalSignupForm
            onSuccess={() => setSent(true)}
            onInvalid={() => setShakeKey((k) => k + 1)}
          />
        )}
      </Modal>
    </section>
  )
}

/* ─────────────── nearest shows ─────────────── */

// Colours in the mockup's order. Each poster gets its own ink drawings.
const CARD_TONES: Tone[] = ['red', 'paper', 'blue', 'ink']
const EMPTY_ART = [faceSvg, flowerSvg, chairSvg, faceSvg]

function CardInk({ n, light }: { n: number; light: boolean }) {
  switch (n % 4) {
    case 0:
      return <Ink src={starSvg} className="top-[6%] right-[5%] h-[34%] w-[34%]" />
    case 1:
      return (
        <>
          <Ink src={ladderSvg} className="top-[4%] right-[24%] h-[62%] w-[14%]" />
          <SwallowIcon className="text-ink pointer-events-none absolute top-[22%] right-[4%] h-[16%] -rotate-12" />
        </>
      )
    case 2:
      return <Ink src={starSvg} className="top-[6%] right-[5%] h-[32%] w-[32%]" />
    default:
      return <Ink src={ladderSvg} light={light} className="top-[3%] right-[8%] h-[62%] w-[14%]" />
  }
}

export function UpcomingShows() {
  if (!upcomingCards.length) return null
  return (
    <section className="bg-paper relative">
      <Torn color="text-paper" seed={23} />
      <div className={`${WRAP} pt-16 pb-20 md:pt-24 md:pb-28`}>
        <SectionHead title="Ближайшие спектакли" to="/novaya/afisha" link="Вся афиша" />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-2 sm:gap-x-0 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {upcomingCards.map((h, n) => {
            const tone = CARD_TONES[n % 4] as Tone
            const light = tone === 'ink'
            return (
              <Reveal
                key={h.item.title}
                index={n}
                className="sm:border-ink/15 flex w-[78vw] max-w-[340px] flex-shrink-0 snap-start flex-col sm:w-auto sm:max-w-none sm:border-l sm:px-5 sm:pb-2 sm:odd:border-l-0 lg:[&:nth-child(3)]:border-l"
              >
                <Duotone
                  src={h.photo}
                  tone={tone}
                  alt={h.photo ? `«${h.item.title}»` : ''}
                  className="aspect-[1/1]"
                  position="50% 25%"
                >
                  {h.photo ? (
                    <CardInk n={n} light={light} />
                  ) : (
                    <Ink
                      src={EMPTY_ART[n % 4] as string}
                      light={light}
                      className="inset-0 m-auto h-3/5 w-3/5"
                    />
                  )}
                </Duotone>
                <h3 className="font-heading mt-5 min-h-[2em] max-w-[14ch] text-[28px] leading-[1.02] font-bold uppercase xl:text-[32px]">
                  <Link to={showPath(h.item.title)} className="hover:underline">
                    {h.item.title}
                  </Link>
                </h3>
                <div className="mt-3 flex min-h-[32px] items-center justify-between gap-2 text-[16px] font-medium uppercase">
                  <span>{shortDate(h.item)}</span>
                  {h.item.age && (
                    <span className="bg-brand-red font-heading text-paper rounded-[4px] px-2 py-1 text-[15px] font-semibold">
                      {h.item.age}
                    </span>
                  )}
                </div>
                {h.ticketUrl ? (
                  <a
                    href={h.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${BTN} bg-ink text-paper mt-4 py-4 text-[16px]`}
                  >
                    Купить
                  </a>
                ) : (
                  <Link
                    to={showPath(h.item.title)}
                    className={`${BTN} bg-ink text-paper mt-4 py-4 text-[16px]`}
                  >
                    Подробнее
                  </Link>
                )}
              </Reveal>
            )
          })}
        </div>
        <div className="mt-6 sm:hidden">
          <MoreLink to="/novaya/afisha">Вся афиша</MoreLink>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── courses ─────────────── */

export function CoursesBand() {
  return (
    <section className="bg-brand-yellow relative">
      <Torn color="text-brand-yellow" seed={37} />
      <div
        className={`${WRAP} grid gap-10 py-16 md:grid-cols-[1fr_1fr] md:items-center md:gap-16 md:py-24`}
      >
        <Reveal>
          <RoughFrame>
            <img
              src={galleryPhoto('simon-3')}
              alt="Сцена из спектакля «Симон»"
              loading="lazy"
              className="aspect-[5/4] w-full object-cover"
            />
          </RoughFrame>
        </Reveal>
        <Reveal index={1} className="relative">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-heading max-w-[16ch] text-[clamp(38px,4.4vw,68px)] leading-[.92] font-bold uppercase">
              Курсы для детей и взрослых
            </h2>
            <img
              src={boyFence}
              alt=""
              aria-hidden="true"
              className="-mt-4 hidden h-32 w-40 flex-shrink-0 object-contain sm:block"
            />
          </div>
          <ul className="divide-ink/60 border-ink/60 mt-7 divide-y border-b">
            {courses.map((c) => (
              <li key={c.key}>
                <Link to="/novaya/kursy" className="group block py-3.5">
                  <span className="font-heading block text-[24px] leading-tight font-bold uppercase group-hover:underline">
                    {c.name}
                  </span>
                  <span className="text-[16px]">
                    {c.ageRange} · {c.price.replace(' / мес', '/мес')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/novaya/kursy"
            className={`${BTN} bg-ink text-paper mt-7 w-full py-4.5 text-[16px]`}
          >
            Записаться на курс
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────── numbers, over the building ─────────────── */

const BUILDING = mediaUrl('/uploads/building/nur.jpg')

const NUMBERS: { value?: number; prefix?: string; text?: string; note: string }[] = [
  { value: 2003, note: 'год основания' },
  { value: 32, note: 'постановки' },
  { value: 5, note: 'стран гастролей' },
  { value: 2004, prefix: 'с ', note: 'свой фестиваль' },
  { text: 'Народный театр', note: 'звание с 2005 года' },
]

/** Counts up from 0 the first time it scrolls into view. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || !inView || reduce) return
    const controls = animate(0, to, {
      duration: to > 100 ? 1.8 : 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [inView, reduce, to])
  // the final number is in the markup, so it is right without scripts and for screen readers
  return <span ref={ref}>{to}</span>
}

export function NumbersBand() {
  return (
    <section className="bg-ink text-paper relative isolate">
      <Torn color="text-ink" seed={41} />
      <img
        src={BUILDING}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%] opacity-55 grayscale-[.3]"
      />
      <div className="from-ink/85 via-ink/50 to-ink/95 absolute inset-0 -z-10 bg-gradient-to-b" />
      <Grain opacity={0.55} />
      <div
        className={`${WRAP} relative z-[2] flex min-h-[640px] flex-col justify-between py-16 md:min-h-[min(92svh,860px)] md:py-24`}
      >
        <div className="relative">
          <Ink src={starSvg} light className="top-0 right-0 h-20 w-20 md:h-36 md:w-36" />
          <h2 className="font-heading text-[clamp(44px,8vw,120px)] leading-[.88] font-bold uppercase">
            Театр
            <br />в цифрах
          </h2>
          <p className="mt-5 max-w-md text-[16px] opacity-85 md:text-[18px]">
            Молодёжный центр «НУР», Набережные Челны. Здесь «Ключ» живёт, репетирует и играет.
          </p>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:flex md:justify-between md:gap-0">
          {NUMBERS.map((n) => (
            <div
              key={n.note}
              className="md:border-paper/40 md:border-l md:pl-[clamp(20px,2.4vw,44px)] md:first:border-l-0 md:first:pl-0 md:[&+&]:ml-[clamp(20px,2.4vw,44px)]"
            >
              <dt
                className={`font-heading font-bold uppercase ${n.text ? 'text-[32px] leading-[.95] md:text-[clamp(30px,2.8vw,50px)]' : 'text-[60px] leading-none whitespace-nowrap md:text-[clamp(52px,5.6vw,104px)]'}`}
              >
                {n.prefix && <span className="text-[.55em]">{n.prefix}</span>}
                {n.value !== undefined ? <CountUp to={n.value} /> : n.text}
              </dt>
              <dd className="mt-3 text-[14px] tracking-[.04em] uppercase opacity-85 md:text-[15px] md:whitespace-nowrap">
                {n.note}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ─────────────── people ─────────────── */

// The team's photos are holiday snaps, so each one gets its own crop on the face.
const PEOPLE = [
  {
    name: 'Софья Дивногорская',
    role: 'художественный руководитель, педагог',
    file: 'sofya-divnogorskaya.jpg',
    focus: '51% 48%',
    zoom: 1.25,
    block: 'bg-brand-red',
  },
  {
    name: 'Марина Степанова',
    role: 'режиссёр-педагог',
    file: 'marina-stepanova.jpg',
    focus: '50% 26%',
    zoom: 1.35,
    block: 'bg-brand-yellow',
  },
  {
    name: 'Иван Поляков',
    role: 'актёр, технический директор',
    file: 'ivan-polyakov.jpg',
    focus: '45% 40%',
    zoom: 1.15,
    block: 'bg-brand-blue',
  },
  {
    name: 'Галина Герасимова',
    role: 'главный администратор',
    file: 'galina-gerasimova.jpg',
    focus: '52% 44%',
    zoom: 1.7,
    block: 'bg-ink',
  },
]

export function PeopleSection() {
  // /#/novaya?p=duo shows the yellow two-tone version, to compare with colour
  const [params] = useSearchParams()
  const duo = params.get('p') === 'duo'
  const [lead, ...rest] = PEOPLE
  return (
    <section className="bg-paper relative">
      <Torn color="text-paper" seed={53} />
      <div className={`${WRAP} pt-16 pb-16 md:pt-24`}>
        <SectionHead title="Люди театра" to="/novaya/komanda" link="Вся команда" />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-[1.45fr_1fr_1fr_1fr] md:gap-x-8">
          {lead && (
            <Reveal className="col-span-2 md:col-span-1">
              <Portrait
                src={teamPhoto(lead.file)}
                alt={lead.name}
                focus={lead.focus}
                zoom={lead.zoom}
                block={lead.block}
                duo={duo}
                className="aspect-[1/1]"
              />
              <h3 className="font-heading mt-6 text-[26px] leading-tight font-bold uppercase xl:text-[30px]">
                {lead.name}
              </h3>
              <p className="text-ink/80 mt-1 text-[16px]">{lead.role}</p>
            </Reveal>
          )}
          {rest.map((p, n) => (
            <Reveal
              key={p.name}
              index={n + 1}
              className={`md:pt-10 ${n === 2 ? 'col-span-2 mx-auto w-[calc(50%-10px)] md:col-span-1 md:mx-0 md:w-auto' : ''}`}
            >
              <Portrait
                src={teamPhoto(p.file)}
                alt={p.name}
                focus={p.focus}
                zoom={p.zoom}
                block={p.block}
                duo={duo}
                className="aspect-[5/6]"
              />
              <h3 className="font-heading mt-6 text-[21px] leading-tight font-bold uppercase xl:text-[24px]">
                {p.name}
              </h3>
              <p className="text-ink/80 mt-1 text-[15px]">{p.role}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 sm:hidden">
          <MoreLink to="/novaya/komanda">Вся команда</MoreLink>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── not only shows ─────────────── */

// Live colour with a brand-colour block behind, like the people above.
const MORE = [
  {
    title: 'Фестиваль «Действующие лица»',
    note: 'всероссийский, с 2004 года',
    photo: 'nagrazhdenie-1',
    block: 'bg-brand-red',
    to: '/novaya/festival',
  },
  {
    title: 'Лаборатория «ЛСД»',
    note: 'современная драматургия, с 2012 года',
    photo: 'spektakl-1',
    block: 'bg-brand-yellow',
    to: '/novaya/o-teatre',
  },
  {
    title: 'Лагерь «Солнечная пыль»',
    note: 'летний театральный лагерь',
    photo: 'lager-1',
    block: 'bg-brand-blue',
    to: '/novaya/o-teatre',
  },
]

export function MoreThanShows() {
  return (
    <section className="bg-paper relative">
      <div className={`${WRAP} pb-12`}>
        <div className="border-ink/15 border-t pt-16 md:pt-24">
          <SectionHead title="Не только спектакли" />
          <div className="grid gap-14 md:grid-cols-3 md:gap-10 xl:gap-14">
            {MORE.map((m, n) => (
              <Reveal key={m.title} index={n}>
                <Portrait
                  src={galleryPhoto(m.photo)}
                  alt={m.title}
                  block={m.block}
                  focus="50% 45%"
                  className="aspect-[4/3]"
                />
                <h3 className="font-heading mt-7 text-[28px] leading-[1.02] font-bold uppercase xl:text-[32px]">
                  {m.title}
                </h3>
                <p className="text-ink/80 mt-3 text-[16px]">{m.note}</p>
                <MoreLink to={m.to} className="mt-5">
                  Подробнее
                </MoreLink>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="relative h-14">
          <SwallowIcon className="text-ink pointer-events-none absolute right-0 bottom-0 h-16 -rotate-12 md:h-20" />
        </div>
      </div>
    </section>
  )
}

/* ─────────────── black torn strip between sections ─────────────── */

export function InkStrip() {
  return (
    <div aria-hidden="true" className="bg-ink relative my-8 h-12 md:h-16">
      <Torn color="text-ink" seed={61} />
      <Torn color="text-ink" side="bottom" seed={67} />
    </div>
  )
}
