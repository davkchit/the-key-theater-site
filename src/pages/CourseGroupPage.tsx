import { NavLink, Navigate, useNavigate, useParams } from 'react-router-dom'
import { CourseCard } from '../components/courses/CourseCard'
import { Reveal } from '../components/ui/Reveal'
import { TeamCard } from '../components/team/TeamCard'
import { courseGroups } from '../data/courseGroups'
import { courses } from '../data/courses'
import { team } from '../data/team'

export default function CourseGroupPage() {
  const { groupKey } = useParams()
  const navigate = useNavigate()
  const group = courseGroups.find((g) => g.key === groupKey)
  if (!group) return <Navigate to="/kursy" replace />

  const groupCourses = courses.filter((c) => group.courseKeys.includes(c.key))
  const teachers = team.filter((m) => m.role.includes('едагог'))

  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <NavLink to="/kursy" className="text-[13px] font-semibold text-[#6B655A] underline">
        ← Все курсы
      </NavLink>

      <div className="mt-4 font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">{group.ageRange}</div>
      <h1 className="mt-2.5 font-heading text-[clamp(38px,6.4vw,80px)] leading-[.92] font-bold uppercase">{group.title}</h1>
      <p className="mt-3.5 max-w-155 text-[17px] leading-[1.55] text-[#33302a]">{group.shortDesc}</p>

      <Reveal className="mt-9">
        <h2 className="mb-3.5 font-heading text-2xl font-bold uppercase">Галерея</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-[10px] border-2 border-dashed border-[#D3CCBB] p-3 text-center text-[12px] leading-[1.4] text-[#9B9484]"
            >
              Фото скоро появится
            </div>
          ))}
        </div>
      </Reveal>

      {teachers.length > 0 && (
        <Reveal index={1} className="mt-9">
          <h2 className="mb-3.5 font-heading text-2xl font-bold uppercase">Преподаватели</h2>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {teachers.map((t) => (
              <TeamCard key={t.name} member={t} />
            ))}
          </div>
        </Reveal>
      )}

      <Reveal index={2} className="mt-9">
        <h2 className="mb-3.5 font-heading text-2xl font-bold uppercase">Потоки</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {groupCourses.map((c, i) => (
            <CourseCard key={c.key} course={c} index={i} onOpen={() => navigate(`/kursy?course=${c.key}`)} />
          ))}
        </div>
      </Reveal>

      <div className="mt-9 flex justify-center">
        <NavLink
          to={`/kursy?course=${group.courseKeys[0]}`}
          className="inline-flex items-center rounded-lg bg-brand-red px-8 py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.96]"
        >
          Записаться на курс
        </NavLink>
      </div>
    </main>
  )
}
