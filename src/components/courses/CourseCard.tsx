import type { Course } from '../../types/content'
import { Reveal } from '../ui/Reveal'
import { WavyUnderline } from '../ui/WavyUnderline'

interface CourseCardProps {
  course: Course
  index?: number
  onOpen: () => void
}

const bgClass: Record<Course['bg'], string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

export function CourseCard({ course, index = 0, onOpen }: CourseCardProps) {
  const fg = course.bg === 'yellow' ? 'text-ink' : 'text-paper'
  const descColor = course.bg === 'yellow' ? '#4a3f14' : '#E7E1D2'

  return (
    <Reveal
      index={index}
      className={[bgClass[course.bg], fg, 'relative flex min-h-52.5 flex-col overflow-hidden rounded-xl border-2 border-ink p-5.5 transition-transform duration-260 ease-out hover:-translate-y-1.5']
        .join(' ')}
    >
      <img
        src={course.icon}
        alt=""
        className={['pointer-events-none absolute -right-3.5 -bottom-2.5 h-26 w-auto -rotate-8 opacity-16', course.bg === 'ink' ? 'invert' : ''].join(' ')}
      />
      <div className="relative font-heading text-[28px] leading-none font-bold uppercase">{course.name}</div>
      <WavyUnderline className="relative mt-2 h-2.75 w-16.5" />
      <div className="relative mt-2 font-heading text-sm font-medium opacity-90">{course.ageRange}</div>
      <div className="relative mt-3.5 flex-1 text-[13px] leading-[1.5]" style={{ color: descColor }}>
        {course.desc}
      </div>
      <div className="relative mt-3.5 font-heading text-xs leading-[1.4] opacity-95" style={{ color: descColor }}>
        {course.price}
        <br />
        {course.start}
      </div>
      <button
        onClick={onOpen}
        className="relative mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-[7px] border-2 border-current px-4 py-2.25 font-heading text-xs font-semibold tracking-[.06em] uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
      >
        Подробнее <span aria-hidden="true">→</span>
      </button>
    </Reveal>
  )
}
