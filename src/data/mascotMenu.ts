import { afishaFull } from './afisha'
import { shows } from './shows'
import { courses } from './courses'
import { team } from './team'
import { awards } from './awards'

export interface MascotItem {
  id: string
  label: string
  answer: string | (() => string)
}

export interface MascotCategory {
  id: string
  label: string
  items: MascotItem[]
}

// every answer below is either a fixed line someone here actually wrote, or
// computed from the site's own data files (afisha/shows/courses/team/awards)
// -- nothing is invented, and the data-driven ones can't go stale on their
// own since they read whatever's currently in those files

function afishaThisMonth(): string {
  const list = afishaFull.map((it) => `${it.day} ${it.mon} — «${it.title}» (${it.time}, ${it.hall})`).join('; ')
  return `Мяу, вот что у нас идёт: ${list}. Полное расписание и билеты — на странице «Афиша».`
}

function showDurations(): string {
  const list = shows.map((s) => `«${s.title}» — ${s.dur}`).join('; ')
  return `Тут я решил не спать и всё измерил хвостом: ${list}.`
}

function forKids(): string {
  const kids = shows.filter((s) => parseInt(s.age, 10) <= 12)
  const list = kids.map((s) => `«${s.title}» (${s.age})`).join(', ')
  return `Для юных зрителей у нас есть: ${list}. Смотри точные даты на странице «Афиша».`
}

function coursesList(): string {
  const list = courses.map((c) => `${c.name} (${c.ageRange}) — ${c.price}, ${c.start}`).join('; ')
  return `Мур, курсы у нас такие: ${list}. Подробности и запись — на странице «Курсы».`
}

function adultCourse(): string {
  const c = courses.find((x) => !x.isChild)
  return c
    ? `Конечно! «${c.name}» (${c.ageRange}) — ${c.desc} ${c.price}, ${c.start}.`
    : 'Пока такого потока нет, но лучше уточнить по телефону.'
}

function artDirector(): string {
  const lead = team.find((m) => m.lead)
  return lead ? `Это ${lead.name} — ${lead.role}.` : 'Софья Дивногорская.'
}

function teamCount(): string {
  const actors = team.filter((m) => /актёр|актрис/i.test(m.role)).length
  return `Нас ${team.length} человек в команде, из них ${actors} — актёры и актрисы на сцене. Все — на странице «Команда».`
}

function awardsList(): string {
  return `Мяу, есть чем гордиться: ${awards.join('; ')}.`
}

export const mascotMenu: MascotCategory[] = [
  {
    id: 'afisha',
    label: '🎭 Афиша и билеты',
    items: [
      { id: 'schedule', label: 'Что идёт сейчас?', answer: afishaThisMonth },
      {
        id: 'tickets',
        label: 'Как купить билет?',
        answer: 'Прямо на странице «Афиша» — жми «Купить билет» под нужным спектаклем. Или звони: +7 906 120-22-62.',
      },
      { id: 'durations', label: 'Сколько идёт спектакль?', answer: showDurations },
      { id: 'kids', label: 'Что-то для детей есть?', answer: forKids },
    ],
  },
  {
    id: 'courses',
    label: '🎓 Курсы и запись',
    items: [
      { id: 'list', label: 'Какие есть курсы?', answer: coursesList },
      {
        id: 'how',
        label: 'Как записаться?',
        answer:
          'Выбираешь поток на странице «Курсы», жмёшь «Подробнее» и заполняешь короткую форму — мы перезвоним, мяу-обещаю.',
      },
      { id: 'adult', label: 'А для взрослых?', answer: adultCourse },
    ],
  },
  {
    id: 'festival',
    label: '🎪 Фестиваль «Действующие лица»',
    items: [
      {
        id: 'what',
        label: 'Что это за фестиваль?',
        answer: 'Наш всероссийский театральный фестиваль — проводим с 2004 года, приезжают коллективы со всей страны, в программе показы и мастерские.',
      },
      {
        id: 'join',
        label: 'Как стать участником?',
        answer:
          'Подробности скоро появятся прямо здесь — а пока лучше всего написать нам напрямую: kluchtheatre@mail.ru или в ВКонтакте vk.com/teatr_kluch.',
      },
    ],
  },
  {
    id: 'about',
    label: '🏛 О театре',
    items: [
      {
        id: 'history',
        label: 'Когда всё началось?',
        answer: 'В 2003 году — студия при ЦДТ «Огниво». С 2018-го мы частный театр (АНО). Вся история — на странице «О театре».',
      },
      {
        id: 'lab',
        label: 'Есть лаборатория для режиссёров?',
        answer: 'Да, театральная лаборатория «ЛСД» — молодые режиссёры вместе с актёрами «Ключа» за три дня готовят эскизы спектаклей.',
      },
      {
        id: 'camp',
        label: 'А летний лагерь?',
        answer: 'Летний театральный лагерь «Солнечная пыль» — с 2022 года, занятия, игры и итоговая постановка для детей и подростков.',
      },
      { id: 'awards', label: 'Какие у вас награды?', answer: awardsList },
    ],
  },
  {
    id: 'team',
    label: '👥 Команда',
    items: [
      { id: 'lead', label: 'Кто художественный руководитель?', answer: artDirector },
      { id: 'count', label: 'Сколько вас вообще?', answer: teamCount },
    ],
  },
  {
    id: 'contacts',
    label: '📍 Как нас найти',
    items: [
      { id: 'address', label: 'Адрес?', answer: 'Набережные Челны, ул. Академика Рубаненко, 2.' },
      { id: 'phone', label: 'Телефон?', answer: '+7 906 120-22-62 и +7 962 573-92-19, почта kluchtheatre@mail.ru.' },
      { id: 'social', label: 'Соцсети?', answer: 'Мы во ВКонтакте: vk.com/teatr_kluch и в Telegram: t.me/teatr_kluch.' },
    ],
  },
]
