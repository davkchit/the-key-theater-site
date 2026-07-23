import type { AfishaItem } from '../types/content'
import posterSimon from '../../assets/poster-simon.png'
import posterPosledstviy from '../../assets/poster-posledstviy.png'
import posterEva from '../../assets/poster-eva.png'
import posterSkazki from '../../assets/poster-skazki.png'
import photo1 from '../../assets/photo-1.jpg'
import photo3 from '../../assets/photo-3.jpg'

// Real September 2026 schedule, transcribed from the season 2026/2027 afisha
// spread in the brand book (Brendbuk_pechat-1.pdf) -- replaces the earlier
// 4-show-repeated-twice placeholder schedule from the design mockup.
export const afishaFull: AfishaItem[] = [
  { day: '05', mon: 'сентября', wd: 'суббота', title: 'Симон', age: '16+', hall: 'Большой зал', time: '18:00', band: 'paper', accent: 'red', thumb: posterSimon },
  { day: '06', mon: 'сентября', wd: 'воскресенье', title: 'Никаких последствий', age: '16+', hall: 'Большой зал', time: '18:00', band: 'red', accent: 'paper', thumb: posterPosledstviy },
  { day: '12', mon: 'сентября', wd: 'суббота', title: 'Ева Кюн', age: '12+', hall: 'Большой зал', time: '18:00', band: 'blue', accent: 'paper', thumb: posterEva },
  { day: '13', mon: 'сентября', wd: 'воскресенье', title: 'Тратить деньги и хихикать', age: '12+', hall: 'Большой зал', time: '18:00', band: 'paper', accent: 'blue', thumb: photo3 },
  { day: '19', mon: 'сентября', wd: 'суббота', title: 'Сказки на гранях', age: '2+', hall: 'Малая сцена', time: '15:00', band: 'blue', accent: 'paper', thumb: posterSkazki },
  { day: '20', mon: 'сентября', wd: 'воскресенье', title: 'Эмиль из Леннеберги', age: '6+', hall: 'Большой зал', time: '17:00', band: 'paper', accent: 'red', thumb: photo1 },
  { day: '26', mon: 'сентября', wd: 'суббота', title: 'Симон', age: '16+', hall: 'Большой зал', time: '18:00', band: 'red', accent: 'paper', thumb: posterSimon },
  { day: '27', mon: 'сентября', wd: 'воскресенье', title: 'Никаких последствий', age: '16+', hall: 'Большой зал', time: '18:00', band: 'blue', accent: 'paper', thumb: posterPosledstviy },
]

export const afishaPreview: AfishaItem[] = afishaFull.slice(0, 4)
