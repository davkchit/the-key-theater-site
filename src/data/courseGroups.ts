import type { Course } from '../types/content'

export interface CourseGroup {
  key: string
  title: string
  ageRange: string
  shortDesc: string
  bg: Course['bg']
  /** keys into courses.ts, in display order -- first is the one opened by the top-level "Записаться" shortcut */
  courseKeys: string[]
}

// Group boundaries and copy follow the CRM ТЗ (3 возрастных блока). shortDesc
// is placeholder copy until real per-group text is supplied -- structure is
// final, wording is not.
export const courseGroups: CourseGroup[] = [
  {
    key: 'doshkolniki',
    title: 'Дети дошкольного возраста',
    ageRange: '5–7 лет',
    shortDesc: 'Игра, сказка и первые шаги на сцене. Полное описание курса скоро появится здесь.',
    bg: 'yellow',
    courseKeys: ['malyshi'],
  },
  {
    key: 'deti-podrostki',
    title: 'Дети и подростки',
    ageRange: '8–17 лет',
    shortDesc: 'Актёрское мастерство, речь и пластика для школьников. Полное описание скоро появится здесь.',
    bg: 'red',
    courseKeys: ['deti', 'podrostki'],
  },
  {
    key: 'vzroslye',
    title: 'Взрослый курс',
    ageRange: '18+',
    shortDesc: 'Курс для всех, кто мечтал о сцене. Полное описание скоро появится здесь.',
    bg: 'ink',
    courseKeys: ['vzroslye'],
  },
]
