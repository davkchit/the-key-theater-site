import { NavLink } from 'react-router-dom'
import type { CourseGroup } from '../../data/courseGroups'
import { Reveal } from '../ui/Reveal'
import { WavyUnderline } from '../ui/WavyUnderline'

interface CourseGroupCardProps {
  group: CourseGroup
  index?: number
}

const bgClass: Record<CourseGroup['bg'], string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

export function CourseGroupCard({ group, index = 0 }: CourseGroupCardProps) {
  const fg = group.bg === 'yellow' ? 'text-ink' : 'text-paper'
  const descColor = group.bg === 'yellow' ? '#4a3f14' : '#E7E1D2'

  return (
    <Reveal index={index} className={[bgClass[group.bg], fg, 'flex flex-col rounded-xl border-2 border-ink p-6.5'].join(' ')}>
      <div className="font-heading text-[24px] leading-tight font-bold uppercase">{group.title}</div>
      <WavyUnderline className="mt-2 h-2.75 w-16.5" />
      <div className="mt-2 font-heading text-sm font-medium opacity-90">{group.ageRange}</div>
      <p className="mt-3.5 flex-1 text-[14px] leading-[1.55]" style={{ color: descColor }}>
        {group.shortDesc}
      </p>
      <div className="mt-4.5 flex flex-wrap gap-2.5">
        <NavLink
          to={`/kursy/${group.key}`}
          className="inline-flex items-center gap-1.5 rounded-[7px] border-2 border-current px-4 py-2.25 font-heading text-xs font-semibold tracking-[.06em] uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
        >
          Подробнее <span aria-hidden="true">→</span>
        </NavLink>
        <NavLink
          to={`/kursy?course=${group.courseKeys[0]}`}
          className={[
            'inline-flex items-center rounded-[7px] px-4 py-2.25 font-heading text-xs font-semibold tracking-[.06em] uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95',
            group.bg === 'yellow' ? 'bg-ink text-paper' : 'bg-brand-yellow text-ink',
          ].join(' ')}
        >
          Записаться на курс
        </NavLink>
      </div>
    </Reveal>
  )
}
