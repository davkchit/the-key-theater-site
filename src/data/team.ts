import type { TeamMember } from '../types/content'
import photo1 from '../../assets/photo-1.jpg'
import photo2 from '../../assets/photo-2.jpg'
import photo3 from '../../assets/photo-3.jpg'

export const team: TeamMember[] = [
  { name: 'Софья Дивногорская', role: 'Художественный руководитель, режиссёр, педагог', photo: photo2, bg: 'red', lead: true },
  { name: 'Алмаз Садриев', role: 'Режиссёр', photo: photo1, bg: 'blue' },
  { name: 'Иван Поляков', role: 'Технический директор', photo: photo3, bg: 'ink' },
  { name: 'Артур Батаев', role: 'Исполнительный директор', photo: photo2, bg: 'yellow' },
  { name: 'Педагог по речи', role: 'Сценическая речь', photo: photo3, bg: 'ink' },
  { name: 'Педагог по движению', role: 'Пластика и танец', photo: photo1, bg: 'blue' },
  { name: 'Художник-постановщик', role: 'Сценография и костюм', photo: photo2, bg: 'red' },
  { name: 'Художник по свету', role: 'Свет и атмосфера', photo: photo3, bg: 'ink' },
]
