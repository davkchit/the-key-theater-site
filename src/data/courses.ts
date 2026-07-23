import type { Course } from '../types/content'
import elStar from '../../assets/el-star.svg'
import elFlower from '../../assets/el-flower.svg'
import elLadder from '../../assets/el-ladder.svg'
import elKey from '../../assets/el-key-hanging.svg'

export const courses: Course[] = [
  { key: 'malyshi', name: 'Малыши', ageRange: '5–7 лет', bg: 'yellow', icon: elStar, desc: 'Игра, воображение и первые выходы на сцену через сказку и движение.', price: 'от 2 500 ₽ / мес', start: 'старт группы — с 1 октября', isChild: true },
  { key: 'deti', name: 'Дети', ageRange: '8–12 лет', bg: 'red', icon: elFlower, desc: 'Актёрское мастерство, речь, пластика и участие в спектаклях театра.', price: 'от 3 000 ₽ / мес', start: 'старт группы — с 1 октября', isChild: true },
  { key: 'podrostki', name: 'Подростки', ageRange: '13–17 лет', bg: 'blue', icon: elLadder, desc: 'Работа над ролью, этюды и самостоятельные постановки.', price: 'от 3 000 ₽ / мес', start: 'старт группы — с 1 октября', isChild: true },
  { key: 'vzroslye', name: 'Взрослые', ageRange: '18+', bg: 'ink', icon: elKey, desc: 'Курс актёрского мастерства для всех, кто мечтал о сцене.', price: 'от 3 500 ₽ / мес', start: 'старт группы — с 15 октября', isChild: false },
]
