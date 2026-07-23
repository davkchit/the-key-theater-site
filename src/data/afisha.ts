import type { AfishaItem } from '../types/content'
import posterSimon from '../../assets/poster-simon.png'
import posterPosledstviy from '../../assets/poster-posledstviy.png'
import posterEva from '../../assets/poster-eva.png'
import posterSkazki from '../../assets/poster-skazki.png'

export const afishaFull: AfishaItem[] = [
  { day: '05', mon: 'сентября', wd: 'суббота', title: 'Симон', age: '16+', hall: 'Большой зал', time: '18:00', band: 'dark', accent: 'red', thumb: posterSimon },
  { day: '06', mon: 'сентября', wd: 'воскресенье', title: 'Никаких последствий', age: '16+', hall: 'Большой зал', time: '18:00', band: 'red', accent: 'paper', thumb: posterPosledstviy },
  { day: '12', mon: 'сентября', wd: 'суббота', title: 'Ева Кюн', age: '16+', hall: 'Большой зал', time: '18:00', band: 'blue', accent: 'paper', thumb: posterEva },
  { day: '13', mon: 'сентября', wd: 'воскресенье', title: 'Сказки на гранях', age: '0+', hall: 'Малая сцена', time: '15:00', band: 'dark', accent: 'blue', thumb: posterSkazki },
  { day: '19', mon: 'сентября', wd: 'суббота', title: 'Симон', age: '16+', hall: 'Большой зал', time: '18:00', band: 'red', accent: 'paper', thumb: posterSimon },
  { day: '20', mon: 'сентября', wd: 'воскресенье', title: 'Ева Кюн', age: '16+', hall: 'Большой зал', time: '18:00', band: 'dark', accent: 'blue', thumb: posterEva },
  { day: '26', mon: 'сентября', wd: 'суббота', title: 'Никаких последствий', age: '16+', hall: 'Большой зал', time: '18:00', band: 'blue', accent: 'paper', thumb: posterPosledstviy },
  { day: '27', mon: 'сентября', wd: 'воскресенье', title: 'Сказки на гранях', age: '0+', hall: 'Малая сцена', time: '15:00', band: 'dark', accent: 'blue', thumb: posterSkazki },
]

export const afishaPreview: AfishaItem[] = afishaFull.slice(0, 4)
