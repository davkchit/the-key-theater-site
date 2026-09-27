import { Link, useParams } from 'react-router-dom'
import { showBySlug, shows } from '../data/shows'
import { upcomingAfisha } from '../data/afisha'
import {
  PrintFilters,
  BTN,
  H2,
  Portrait,
  RoughFrame,
  SectionHead,
  WRAP,
} from '../components/home2/parts'
import { GRAIN_URL, Grain, Torn } from '../components/home2/paper'
import { AgeBadge, PosterArt } from '../components/home2/ShowPoster'
import { TICKETS_URL, longDate, shortDate, showPath } from '../components/home2/homeData'
import { Reveal } from '../components/ui/Reveal'
import home from '../content/home.json'
import { mediaUrl } from '../lib/mediaUrl'

// One show: what it is, when it plays, and a ticket button on every date.
// Filled from the admin; blocks without data (photos, cast) simply stay away.

const PLACE = 'Молодёжный центр «НУР», второй вход'
const CAST_BLOCKS = ['bg-brand-red', 'bg-brand-yellow', 'bg-brand-blue', 'bg-ink']

function heroPhotoFor(title: string, fallback: string) {
  const pick = (
    (home as { hero?: { show: string; photo: string; focus?: string }[] }).hero ?? []
  ).find((h) => h.show.trim().toLowerCase() === title.toLowerCase() && h.photo)
  return pick
    ? { src: mediaUrl(pick.photo), focus: pick.focus || '60% 40%' }
    : { src: fallback, focus: '50% 25%' }
}

export default function ShowPageV2() {
  const { slug = '' } = useParams()
  const show = showBySlug(slug)

  if (!show) {
    return (
      <div className={`${WRAP} bg-paper py-24`}>
        <h1 className={H2}>Спектакль не найден</h1>
        <p className="mt-4 text-[17px]">
          Возможно, он уже не идёт. Посмотрите, что есть в репертуаре.
        </p>
        <Link to="/repertuar" className={`${BTN} bg-ink text-paper mt-8`}>
          Все спектакли
        </Link>
      </div>
    )
  }

  const dates = upcomingAfisha.filter((a) => a.title.toLowerCase() === show.title.toLowerCase())
  const next = dates[0]
  const ticket = show.ticketUrl || TICKETS_URL
  const hero = heroPhotoFor(show.title, show.photo)
  const others = shows
    .filter((s) => s.title !== show.title && upcomingAfisha.some((a) => a.title === s.title))
    .slice(0, 3)
  const facts: [string, string | undefined][] = [
    ['Жанр', show.genre],
    ['Возраст', show.age],
    ['Длительность', show.dur],
    ['Режиссёр', show.dir],
    ['Где', PLACE],
  ]

  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />

      {/* first screen: the show on stage, title on the dark side */}
      <section className="bg-ink text-paper relative isolate">
        <div className="relative min-h-[520px] overflow-hidden md:h-[min(72svh,720px)]">
          {hero.src && (
            <div className="absolute inset-0 md:left-[35%]">
              <img
                src={hero.src}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: hero.focus }}
              />
              <div className="from-ink absolute inset-y-0 left-0 hidden w-[40%] bg-gradient-to-r to-transparent md:block" />
            </div>
          )}
          <div className="from-ink via-ink/60 absolute inset-0 bg-gradient-to-t to-transparent md:hidden" />
          <Grain opacity={0.45} />
          <div
            className={`${WRAP} relative z-[3] flex h-full min-h-[520px] flex-col justify-end pt-40 pb-14 md:justify-center md:pt-0 md:pb-10`}
          >
            {show.genre && (
              <div className="font-heading text-[17px] tracking-[.06em] uppercase md:text-[20px]">
                {show.genre}
              </div>
            )}
            <h1 className="font-heading mt-2 max-w-[11ch] text-[clamp(48px,9vw,130px)] leading-[.88] font-bold uppercase">
              {show.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AgeBadge age={show.age} className="text-[17px]" />
              {show.based && <span className="text-[16px] md:text-[18px]">{show.based}</span>}
            </div>
            <div className="text-paper/85 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
              {show.dur && <span>{show.dur}</span>}
              {show.dir && <span>Режиссёр — {show.dir}</span>}
            </div>
            {ticket && (
              <a
                href={ticket}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN} bg-brand-red text-paper mt-8 self-start px-9 py-4.5 text-[17px]`}
              >
                Купить билет
              </a>
            )}
          </div>
        </div>
      </section>

      {/* nearest date */}
      <section className="bg-brand-red text-paper relative">
        <Torn color="text-brand-red" seed={151} />
        <div
          className={`${WRAP} flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between md:py-9`}
        >
          <p className="font-heading text-[22px] leading-tight font-semibold md:text-[28px]">
            {next ? `Ближайший показ — ${longDate(next)}` : 'Новые даты скоро появятся в афише'}
          </p>
          {next && ticket && (
            <a
              href={ticket}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN} bg-paper text-ink self-start py-3 sm:self-auto`}
            >
              Купить билет
            </a>
          )}
        </div>
        <Torn color="text-brand-red" side="bottom" seed={157} />
      </section>

      {/* about */}
      <section className={`${WRAP} pt-16 pb-12 md:pt-24`}>
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <Reveal>
            <h2 className={H2}>О спектакле</h2>
            {/* «по мотивам…» is already on the first screen: without a synopsis
                the block just says that the description is on its way */}
            <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.6] whitespace-pre-line md:text-[19px]">
              {show.synopsis || 'Описание спектакля скоро появится. А пока — даты и билеты ниже.'}
            </p>
          </Reveal>
          <Reveal index={1}>
            <dl className="divide-ink/20 border-ink/20 divide-y border-y md:mt-4">
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-[130px_1fr] gap-4 py-3.5 text-[15px] md:text-[16px]"
                  >
                    <dt className="text-ink/65">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* every upcoming date with its own ticket button */}
      {dates.length > 0 && (
        <section className={`${WRAP} pb-16 md:pb-20`}>
          <div className="border-ink/15 border-t pt-12 md:pt-16">
            <SectionHead title="Даты" to="/afisha" link="Вся афиша" />
            <ul className="divide-ink/20 border-ink/20 divide-y border-y">
              {dates.map((d) => (
                <li
                  key={d.day + d.mon + d.time}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 md:grid-cols-[110px_110px_1fr_auto_auto] md:gap-6"
                >
                  <div>
                    <div className="font-heading text-[44px] leading-none font-bold md:text-[52px]">
                      {Number(d.day)}
                    </div>
                    <div className="mt-1 text-[12px] tracking-[.05em] uppercase">
                      {shortDate(d)
                        .split(' · ')
                        .slice(0, 2)
                        .join(' · ')
                        .replace(/^\d+\s/, '')}
                    </div>
                  </div>
                  <div className="font-heading md:border-ink/20 text-[20px] font-semibold md:border-l md:pl-6">
                    {d.time}
                  </div>
                  <div className="hidden md:block" />
                  <AgeBadge age={d.age} className="hidden md:inline-block" />
                  {ticket ? (
                    <a
                      href={ticket}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${BTN} bg-ink text-paper px-6 py-3 text-[14px]`}
                    >
                      Купить
                    </a>
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* stage photos, only when the admin has some */}
      {(show.photos ?? []).length > 0 && (
        <section className={`${WRAP} pb-16 md:pb-20`}>
          <SectionHead title="Фото со спектакля" to="/galereya" link="Все фото" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:items-center">
            {(show.photos ?? []).slice(0, 4).map((p, i) => (
              <RoughFrame key={p} className={i === 1 ? 'md:scale-[1.08]' : ''}>
                <img src={p} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </RoughFrame>
            ))}
          </div>
        </section>
      )}

      {/* cast, only when the admin has it */}
      {(show.cast ?? []).length > 0 && (
        <section className={`${WRAP} pb-16 md:pb-20`}>
          <SectionHead title="В ролях" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {(show.cast ?? []).map((c, i) => (
              <div key={c.name}>
                {c.photo ? (
                  <Portrait
                    src={c.photo}
                    alt={c.name}
                    block={CAST_BLOCKS[i % 4] as string}
                    className="aspect-[4/5]"
                  />
                ) : (
                  <div className="bg-ink/10 aspect-[4/5]" />
                )}
                <div className="font-heading mt-5 text-[18px] leading-tight font-bold uppercase">
                  {c.name}
                </div>
                {c.role && <div className="text-ink/75 mt-1 text-[14px]">{c.role}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* more shows */}
      {others.length > 0 && (
        <section className={`${WRAP} pb-24`}>
          <div className="border-ink/15 border-t pt-12 md:pt-16">
            <SectionHead title="Ещё спектакли" to="/repertuar" link="Все спектакли" />
            <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
              {others.map((s) => {
                const d = upcomingAfisha.find((a) => a.title === s.title)
                const n = shows.indexOf(s)
                return (
                  <div key={s.title} className="flex flex-col">
                    <Link to={showPath(s.title)}>
                      <PosterArt photo={s.photo} n={n} className="aspect-[16/10]" />
                    </Link>
                    <h3 className="font-heading mt-4 text-[24px] leading-tight font-bold uppercase">
                      <Link to={showPath(s.title)} className="hover:underline">
                        {s.title}
                      </Link>
                    </h3>
                    {d && <div className="mt-2 text-[15px] uppercase">{shortDate(d)}</div>}
                    <Link to={showPath(s.title)} className={`${BTN} bg-ink text-paper mt-4 py-3`}>
                      Подробнее
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] opacity-[.22] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_URL }}
      />
    </div>
  )
}
