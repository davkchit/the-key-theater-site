import type { Direction } from '../types/content'
import content from '../content/directions.json'

const all = (content.items as Partial<Direction>[]).map(
  (d): Direction => ({
    id: String(d.id ?? ''),
    type: d.type ?? 'other',
    title: String(d.title ?? ''),
    desc: d.desc,
    age: d.age,
    schedule: d.schedule,
    prices: d.prices ?? [],
    showFrom: d.showFrom,
    showTo: d.showTo,
    open: d.open !== false,
    askPhone: d.askPhone !== false,
    fields: d.fields ?? [],
  }),
)

// today in Moscow, so a winter quest appears on the right morning wherever
// the visitor is
function todayMsk(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

/** Directions to show today: seasonal ones (quests, carnival nights) come and
 *  go by their dates without anyone touching the admin. */
export function visibleDirections(): Direction[] {
  const today = todayMsk()
  return all.filter((d) => d.id && d.title && (!d.showFrom || d.showFrom <= today) && (!d.showTo || d.showTo >= today))
}

export function directionByType(type: Direction['type']): Direction | undefined {
  return visibleDirections().find((d) => d.type === type)
}

export const DIRECTION_TYPE_LABEL: Record<Direction['type'], string> = {
  prep: 'Подготовительная группа',
  festival: 'Фестиваль',
  quest: 'Квест',
  carnival: 'Карнавальная ночь',
  newsletter: 'Рассылка',
  other: 'Событие',
}
