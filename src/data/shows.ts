import type { Show } from '../types/content'
import posterSimon from '../../assets/poster-simon.png'
import posterPosledstviy from '../../assets/poster-posledstviy.png'
import posterEva from '../../assets/poster-eva.png'
import posterSkazki from '../../assets/poster-skazki.png'
import photo1 from '../../assets/photo-1.jpg'
import photo3 from '../../assets/photo-3.jpg'

export const shows: Show[] = [
  { title: 'Симон', age: '16+', based: 'по мотивам произведения Нарине Абгарян', dir: 'Софья Дивногорская', dur: '1 ч 40 мин', photo: posterSimon, poster: true, bg: 'red' },
  { title: 'Никаких последствий', age: '16+', based: 'по мотивам повести Венедикта Ерофеева', dir: 'Софья Дивногорская', dur: '1 ч 50 мин', photo: posterPosledstviy, poster: true, bg: 'yellow' },
  { title: 'Ева Кюн', age: '16+', based: 'по повести Ларса Соби Кристенсена', dir: 'Софья Дивногорская', dur: '2 ч', photo: posterEva, poster: true, bg: 'blue' },
  { title: 'Сказки на гранях', age: '0+', based: 'бэби-спектакль для самых маленьких', dir: 'Алмаз Садриев', dur: '45 мин', photo: posterSkazki, poster: true, bg: 'blue' },
  { title: 'Эмиль из Леннеберги', age: '6+', based: 'по повести Астрид Линдгрен', dir: 'Софья Дивногорская', dur: '1 ч 20 мин', photo: photo1, poster: false, bg: 'ink' },
  { title: 'Тратить деньги и хихикать', age: '12+', based: 'весёлая история о свободе и выборе', dir: 'Софья Дивногорская', dur: '1 ч', photo: photo3, poster: false, bg: 'red' },
]

export const showsPreview: Show[] = shows.slice(0, 3)
