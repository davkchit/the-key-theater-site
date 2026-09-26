import { NavLink } from 'react-router-dom'
import { afishaPreview } from '../../data/afisha'
import { shortMon } from '../../lib/ruDate'
import elFace from '../../../assets/el-face.svg'
import elChair from '../../../assets/el-chair.svg'
import elStar from '../../../assets/el-star.svg'
import elBoyFence from '../../../assets/el-boy-fence.svg'
import elFlower from '../../../assets/el-flower.svg'
import elLadder from '../../../assets/el-ladder.svg'
import hallPhoto from '../../../assets/photo-2.jpg'

// One hand-drawn brand element per show, same mapping the /afisha list uses.
// Shows with no entry simply get no drawing -- a fallback for every title
// would fill the column with noise.
const rowArt: Record<string, string> = {
  Симон: elFace,
  'Никаких последствий': elFlower,
  'Ева Кюн': elChair,
  'Сказки на гранях': elStar,
  'Эмиль из Леннеберги': elBoyFence,
  Лариса: elLadder,
}

/**
 * Home page's "ближайшие показы" strip. Deliberately NOT the same component
 * as the full /afisha list (AfishaBlock): that one is a month-by-month table
 * with coloured rows, this is a short teaser -- heading on the left, four
 * upcoming dates on the right, over a darkened hall photo.
 */
export function AfishaPreview() {
  // off-season (nothing scheduled yet): a heading with no rows under it looks
  // broken, so the whole section drops out instead
  if (afishaPreview.length === 0) return null

  return (
    <section className="relative left-1/2 mt-15 w-screen -translate-x-1/2 overflow-hidden bg-ink py-13 md:py-16">
      <img src={hallPhoto} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-12" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,14,.95)_0%,rgba(20,18,14,.82)_45%,rgba(20,18,14,.94)_100%)]" />

      <div className="relative mx-auto grid max-w-320 grid-cols-1 gap-8 px-6.5 lg:grid-cols-[minmax(0,.36fr)_minmax(0,.64fr)] lg:gap-12">
        <div className="text-paper">
          <h2 className="font-heading text-[clamp(38px,5.4vw,72px)] leading-[.86] font-bold uppercase">
            Ближайшие
            <br />
            показы
          </h2>
          <NavLink to="/staryi/afisha" className="mt-4 inline-flex items-center gap-2.5 font-script text-[26px] text-paper">
            вся афиша <span aria-hidden="true">→</span>
          </NavLink>
        </div>

        <ul className="m-0 list-none p-0">
          {afishaPreview.map((item, i) => {
            const art = rowArt[item.title]
            return (
              <li
                key={`${item.day}-${item.mon}-${item.title}-${i}`}
                className="relative flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-paper/18 py-5 text-paper last:border-b last:border-b-paper/18"
              >
                <div className="w-14 shrink-0 text-center">
                  <div className="font-heading text-[34px] leading-none font-bold">{item.day}</div>
                  <div className="mt-1 font-heading text-[11px] font-semibold tracking-[.14em] text-brand-yellow uppercase">
                    {shortMon(item.mon)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-heading text-[clamp(18px,2vw,24px)] leading-tight font-bold uppercase">{item.title}</div>
                  <div className="mt-1.5 flex items-center gap-2.5 font-heading text-[13px] text-[#A8A192]">
                    <span>{item.time}</span>
                    {item.age && (
                      <span className="rounded-full border border-paper/30 px-2 py-0.5 text-[10px] font-semibold">{item.age}</span>
                    )}
                  </div>
                </div>

                {art && (
                  <img src={art} alt="" className="pointer-events-none hidden h-15 w-auto opacity-85 invert lg:block" />
                )}

                <NavLink
                  to="/staryi/afisha"
                  className="inline-flex items-center gap-1.5 rounded-[5px] bg-brand-yellow px-4.5 py-2.5 font-heading text-[12px] font-semibold tracking-[.06em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5"
                >
                  Купить билет <span aria-hidden="true">→</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
