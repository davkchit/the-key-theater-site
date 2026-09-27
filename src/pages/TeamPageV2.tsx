import { Link } from 'react-router-dom'
import teamContent from '../content/team.json'
import { awards } from '../data/awards'
import { mediaUrl } from '../lib/mediaUrl'
import { PrintFilters, BTN, H2, Portrait, SectionHead, WRAP } from '../components/home2/parts'
import { GRAIN_URL, Torn } from '../components/home2/paper'
import { Reveal } from '../components/ui/Reveal'
import { SwallowIcon } from '../components/ui/SwallowIcon'

// «Команда»: the artistic director first, then the people who run the theatre
// and teach, then the actors on a black band. Everyone from the admin's team
// list; live-colour portraits on a brand-colour block, like on the homepage.

interface Member {
  name: string
  role: string
  photo: string
  lead?: boolean
}

// The team's photos are holiday snaps of every kind: the face is somewhere
// else in each. Where it is and how much to enlarge, by file name; someone
// added in the admin later gets a sensible default.
const FRAME: Record<string, [string, number]> = {
  'sofya-divnogorskaya': ['51% 48%', 1.25],
  'marina-stepanova': ['50% 26%', 1.35],
  'ivan-polyakov': ['45% 40%', 1.15],
  'galina-gerasimova': ['52% 44%', 1.7],
  'lilya-tutlykova': ['50% 40%', 1.3],
  'artur-bataev': ['22% 18%', 1.5],
  'yoldyz-hangaraeva': ['45% 35%', 1.6],
  'tatyana-nizamova': ['50% 30%', 1.1],
  'rimma-yakupova': ['55% 24%', 1.9],
  'svetlana-kruglaya': ['45% 45%', 1.6],
  'lilya-ravilova': ['45% 35%', 1.6],
  'elya-sharova': ['65% 40%', 1.2],
  'svetochka-malova': ['58% 68%', 2.2],
  'marat-minhaerov': ['70% 92%', 2.4],
  'daniil-zimukov': ['45% 25%', 1.3],
}
const frameOf = (photo: string): [string, number] => {
  const key =
    photo
      .split('/')
      .pop()
      ?.replace(/\.\w+$/, '') ?? ''
  return FRAME[key] ?? ['50% 30%', 1]
}

const BLOCKS = ['bg-brand-red', 'bg-brand-yellow', 'bg-brand-blue', 'bg-ink']
// on the black band a black block would vanish
const BLOCKS_DARK = ['bg-brand-red', 'bg-brand-yellow', 'bg-brand-blue', 'bg-paper']

const members = (teamContent.members as Member[]).filter((m) => m.name)
const lead = members.find((m) => m.lead)
const isActor = (m: Member) => /^акт(ёр|ер|риса)/i.test(m.role.trim())
const staff = members.filter((m) => m !== lead && !isActor(m))
const actors = members.filter((m) => m !== lead && isActor(m))

function Person({
  m,
  i,
  dark = false,
  big = false,
}: {
  m: Member
  i: number
  dark?: boolean
  big?: boolean
}) {
  const [focus, zoom] = frameOf(m.photo)
  const blocks = dark ? BLOCKS_DARK : BLOCKS
  return (
    <Reveal index={i % 4}>
      {m.photo ? (
        <Portrait
          src={mediaUrl(m.photo)}
          alt={m.name}
          focus={focus}
          zoom={zoom}
          block={blocks[i % 4] as string}
          className="aspect-[4/5]"
        />
      ) : (
        <div className={`aspect-[4/5] ${dark ? 'bg-paper/10' : 'bg-ink/10'}`} />
      )}
      <h3
        className={`font-heading mt-6 leading-tight font-bold uppercase ${big ? 'text-[24px] xl:text-[28px]' : 'text-[20px] xl:text-[24px]'}`}
      >
        {m.name}
      </h3>
      <p
        className={`mt-1 text-[14px] leading-snug md:text-[15px] ${dark ? 'text-paper/75' : 'text-ink/75'}`}
      >
        {m.role}
      </p>
    </Reveal>
  )
}

export default function TeamPageV2() {
  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />

      {/* heading */}
      <section className={`${WRAP} relative pt-14 pb-12 md:pt-20 md:pb-16`}>
        <h1 className="font-heading text-[clamp(56px,10vw,140px)] leading-[.88] font-bold uppercase">
          Команда
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-[1.55] md:text-[19px]">
          Люди, которые делают «Ключ»: режиссёры, педагоги, актёры и те, кто работает за сценой.
        </p>
        <SwallowIcon className="text-ink absolute top-24 right-12 hidden h-24 -rotate-12 md:block" />
      </section>

      {/* the artistic director */}
      {lead && (
        <section className={`${WRAP} pb-20 md:pb-24`}>
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <Reveal>
              <Portrait
                src={mediaUrl(lead.photo)}
                alt={lead.name}
                focus={frameOf(lead.photo)[0]}
                zoom={frameOf(lead.photo)[1]}
                block="bg-brand-red"
                className="aspect-[4/5] md:aspect-[1/1]"
              />
            </Reveal>
            <Reveal index={1}>
              <div className="font-heading text-brand-red text-[16px] tracking-[.06em] uppercase md:text-[18px]">
                Художественный руководитель
              </div>
              <h2 className={`${H2} mt-3`}>{lead.name}</h2>
              <p className="mt-5 text-[17px] leading-[1.6] md:text-[19px]">{lead.role}</p>
              <ul className="mt-7 space-y-3">
                {awards
                  .filter((a) => a.startsWith(lead.name))
                  .map((a) => (
                    <li key={a} className="border-ink/20 border-t pt-3 text-[16px] leading-[1.5]">
                      {a.slice(lead.name.length).replace(/^\s*—\s*/, '')}
                    </li>
                  ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* the people who run the theatre and teach */}
      {staff.length > 0 && (
        <section className={`${WRAP} pb-24`}>
          <div className="border-ink/15 border-t pt-14 md:pt-20">
            <SectionHead title="Руководство и педагоги" />
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
              {staff.map((m, i) => (
                <Person key={m.name} m={m} i={i + 1} big />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* actors */}
      {actors.length > 0 && (
        <section className="bg-ink text-paper relative">
          <Torn color="text-ink" seed={271} />
          <div className={`${WRAP} py-20 md:py-28`}>
            <SectionHead title="Актёры" dark />
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4">
              {actors.map((m, i) => (
                <Person key={m.name} m={m} i={i} dark />
              ))}
            </div>
          </div>
          <Torn color="text-ink" side="bottom" seed={277} />
        </section>
      )}

      {/* want to join */}
      <section className="bg-brand-yellow relative mt-8">
        <Torn color="text-brand-yellow" seed={281} />
        <div
          className={`${WRAP} flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20`}
        >
          <div>
            <h2 className={H2}>Хотите на сцену?</h2>
            <p className="mt-4 max-w-lg text-[17px] md:text-[19px]">
              Многие актёры «Ключа» начинали с наших курсов. Приходите, для детей и взрослых.
            </p>
          </div>
          <Link
            to="/kursy"
            className={`${BTN} bg-ink text-paper self-start px-9 py-4.5 text-[17px] md:self-auto`}
          >
            Записаться на курс
          </Link>
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
