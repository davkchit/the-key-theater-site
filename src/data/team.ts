import type { TeamMember } from '../types/content'
import sofyaDivnogorskaya from '../../assets/team/sofya-divnogorskaya.jpg'
import ivanPolyakov from '../../assets/team/ivan-polyakov.jpg'
import arturBataev from '../../assets/team/artur-bataev.jpg'
import yoldyzHangaraeva from '../../assets/team/yoldyz-hangaraeva.jpg'
import tatyanaNizamova from '../../assets/team/tatyana-nizamova.jpg'
import svetlanaKruglaya from '../../assets/team/svetlana-kruglaya.jpg'
import lilyaRavilova from '../../assets/team/lilya-ravilova.jpg'
import elyaSharova from '../../assets/team/elya-sharova.jpg'
import maratSufiyarov from '../../assets/team/marat-sufiyarov.jpg'
import maratMinhaerov from '../../assets/team/marat-minhaerov.jpg'
import daniilZimukov from '../../assets/team/daniil-zimukov.jpg'
import galinaGerasimova from '../../assets/team/galina-gerasimova.jpg'

export const team: TeamMember[] = [
  {
    name: 'Софья Дивногорская',
    role: 'Художественный руководитель и педагог театра «Ключ», директор фестиваля «Действующие лица»',
    photo: sofyaDivnogorskaya,
    bg: 'red',
    lead: true,
  },
  { name: 'Иван Поляков', role: 'Технический директор, актёр театра', photo: ivanPolyakov, bg: 'blue' },
  { name: 'Артур Батаев', role: 'Актёр театра', photo: arturBataev, bg: 'yellow' },
  { name: 'Йолдыз Хангараева', role: 'Актриса театра', photo: yoldyzHangaraeva, bg: 'ink' },
  { name: 'Татьяна Низамова', role: 'Актриса театра', photo: tatyanaNizamova, bg: 'blue' },
  { name: 'Римма Якупова', role: 'Актриса театра, модератор', photo: '', bg: 'red' },
  { name: 'Светлана Круглая', role: 'Актриса театра', photo: svetlanaKruglaya, bg: 'yellow' },
  { name: 'Лиля Равилова', role: 'Актриса театра, педагог', photo: lilyaRavilova, bg: 'ink' },
  { name: 'Эля Шарова', role: 'Актриса театра, педагог', photo: elyaSharova, bg: 'blue' },
  { name: 'Марат Суфияров', role: 'Актёр театра', photo: maratSufiyarov, bg: 'red' },
  { name: 'Марат Минхаеров', role: 'Актёр театра', photo: maratMinhaerov, bg: 'yellow' },
  { name: 'Даниил Зимуков', role: 'Актёр театра', photo: daniilZimukov, bg: 'ink' },
  { name: 'Разиль Фахретдинов', role: 'Педагог', photo: '', bg: 'blue' },
  { name: 'Лиля Макарова', role: 'SMM', photo: '', bg: 'red' },
  { name: 'Гузель Рустамовна', role: 'Бухгалтер', photo: '', bg: 'yellow' },
  { name: 'Галина Герасимова', role: 'Главный администратор театра «Ключ»', photo: galinaGerasimova, bg: 'ink' },
]

// Римма Якупова, Разиль Фахретдинов, Лиля Макарова и Гузель Рустамовна --
// фото ещё не прислали, photo: '' рендерит пустой белый блок вместо карточки
// (см. TeamCard) до реальных фото.
