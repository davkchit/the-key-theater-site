import { NavLink } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import elChair from '../../../assets/el-chair.svg'
import elBoyFence from '../../../assets/el-boy-fence.svg'

/**
 * The lab and the artistic director's line, side by side. Replaces the old
 * full-width black manifesto block: the quote is the part that carried the
 * page, and "ЛСД" -- a real strand of the theatre's work since 2012 -- had no
 * mention on the home page at all. Neither has a page of its own yet, so both
 * point at /o-teatre, which describes them.
 */
export function LabBand() {
  return (
    <section className="mx-auto mt-15.5 max-w-320 px-6.5">
      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[minmax(0,.42fr)_minmax(0,.58fr)]">
        <Reveal>
          <NavLink
            to="/o-teatre"
            className="relative flex min-h-52 flex-col justify-center overflow-hidden rounded-[5px] bg-brand-red p-7 text-paper transition-transform duration-200 hover:-translate-y-1 md:p-9"
          >
            <img src={elChair} alt="" className="pointer-events-none absolute top-1/2 right-4 h-[72%] max-w-[38%] w-auto -translate-y-1/2 object-contain object-right" />
            <div className="relative font-heading text-[clamp(40px,6vw,72px)] leading-[.86] font-bold uppercase">ЛСД</div>
            <p className="relative mt-3 max-w-[52%] text-[15px] leading-[1.45]">
              театральная лаборатория для молодых режиссёров
            </p>
          </NavLink>
        </Reveal>

        <Reveal index={1}>
          <div className="relative flex min-h-52 flex-col justify-center overflow-hidden rounded-[5px] bg-paper p-7 md:p-9">
            <img src={elBoyFence} alt="" className="pointer-events-none absolute right-4 bottom-0 h-[88%] w-auto opacity-35" />
            <blockquote className="relative m-0 max-w-125 font-script text-[clamp(24px,3vw,38px)] leading-[1.15] text-ink">
              «Мы придумываем правила, а потом приходят новые люди — и мы придумываем их заново».
            </blockquote>
            <div className="relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-heading text-sm font-semibold tracking-[.06em] uppercase">Софья Дивногорская</span>
              <span className="text-[13px] text-[#6B655A]">— художественный руководитель</span>
            </div>
            <NavLink
              to="/o-teatre"
              className="relative mt-5 inline-flex w-fit items-center gap-2 border-b-3 border-brand-red pb-0.5 font-heading text-[14px] font-medium text-ink uppercase"
            >
              О театре <span aria-hidden="true">→</span>
            </NavLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
