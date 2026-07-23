import type { Show } from '../types/content'
import posterSimon from '../../assets/poster-simon.png'
import posterPosledstviy from '../../assets/poster-posledstviy.png'
import posterEva from '../../assets/poster-eva.png'
import posterSkazki from '../../assets/poster-skazki.png'
import photo1 from '../../assets/photo-1.jpg'
import photo3 from '../../assets/photo-3.jpg'

// Corrected against the real afisha posters in the brand book: author name
// spelling (Наринэ, not Нарине), "Никаких последствий" is Тургенев's
// «Вешние воды» (not Ерофеев -- the design mockup had this wrong), and
// "Ева Кюн" is rated 12+ / "Сказки на гранях" 2+ (mockup had 16+ / 0+).
export const shows: Show[] = [
  { title: 'Симон', age: '16+', based: 'по мотивам произведения Наринэ Абгарян', dir: 'Софья Дивногорская', dur: '1 ч 40 мин', photo: posterSimon, poster: true, bg: 'red' },
  { title: 'Никаких последствий', age: '16+', based: 'по мотивам повести Тургенева «Вешние воды»', dir: 'Софья Дивногорская', dur: '1 ч 50 мин', photo: posterPosledstviy, poster: true, bg: 'yellow' },
  { title: 'Ева Кюн', age: '12+', based: 'по повести Ларса Соби Кристенсена', dir: 'Софья Дивногорская', dur: '2 ч', photo: posterEva, poster: true, bg: 'blue' },
  { title: 'Сказки на гранях', age: '2+', based: 'бэби-спектакль для самых маленьких', dir: 'Алмаз Садриев', dur: '45 мин', photo: posterSkazki, poster: true, bg: 'blue' },
  { title: 'Эмиль из Леннеберги', age: '6+', based: 'весёлые истории по мотивам повести Астрид Линдгрен', dir: 'Софья Дивногорская', dur: '1 ч 20 мин', photo: photo1, poster: false, bg: 'ink' },
  { title: 'Тратить деньги и хихикать', age: '12+', based: 'весёлая история о свободе и выборе', dir: 'Софья Дивногорская', dur: '1 ч', photo: photo3, poster: false, bg: 'red' },
]

export const showsPreview: Show[] = shows.slice(0, 3)
