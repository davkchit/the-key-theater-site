import type { Course } from '../types/content'
import elStar from '../../assets/el-star.svg'
import elFlower from '../../assets/el-flower.svg'
import elLadder from '../../assets/el-ladder.svg'
import elKey from '../../assets/el-key-hanging.svg'
import coursesContent from '../content/courses.json'

// Icons are a fixed design-system asset per course key, not editorial
// content, so they stay code-side -- everything else in
// src/content/courses.json is Decap CMS-managed (see public/admin/config.yml).
const icons: Record<string, string> = { malyshi: elStar, deti: elFlower, podrostki: elLadder, vzroslye: elKey }

export const courses: Course[] = (coursesContent.items as Omit<Course, 'icon'>[]).map((c) => ({
  ...c,
  icon: icons[c.key] ?? elStar,
}))
