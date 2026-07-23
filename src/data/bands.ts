import type { Band } from '../types/content'
import elLadder from '../../assets/el-ladder.png'
import elChair from '../../assets/el-chair.png'
import elLove from '../../assets/el-love.png'
import elKey from '../../assets/el-key.png'

export const bands: Band[] = [
  { num: '01', word: 'Свобода', note: 'жизнь без границ', color: 'yellow', icon: elLadder },
  { num: '02', word: 'Игра', note: 'каждый выход на сцену', color: 'red', icon: elChair },
  { num: '03', word: 'Дружба', note: 'мы любим дружить', color: 'blue', icon: elLove },
  { num: '04', word: 'Театр', note: 'это мы', color: 'ink', icon: elKey },
]
