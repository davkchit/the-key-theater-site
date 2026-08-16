import type { Course } from '../types/content'
import courseGroupsContent from '../content/courseGroups.json'

export interface CourseGroup {
  key: string
  title: string
  ageRange: string
  shortDesc: string
  bg: Course['bg']
  /** keys into courses.ts, in display order -- first is the one opened by the top-level "Записаться" shortcut */
  courseKeys: string[]
}

// Content lives in src/content/courseGroups.json (Decap CMS-managed) -- see
// public/admin/config.yml for the collection definition.
export const courseGroups: CourseGroup[] = courseGroupsContent.items as CourseGroup[]
