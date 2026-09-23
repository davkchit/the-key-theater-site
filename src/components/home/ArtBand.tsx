import { PinIcon } from '../ui/PinIcon'
import { SocialIcon } from '../ui/SocialIcon'
import { SwallowIcon } from '../ui/SwallowIcon'
import { socials } from '../../data/socials'
import elLadder from '../../../assets/el-ladder.svg'

// Opens a route to the venue in Yandex Maps -- the button promises a route,
// so it has to actually build one. Plain search query, no API key, no embed.
const ROUTE_URL = 'https://yandex.ru/maps/?text=' + encodeURIComponent('Набережные Челны, Новый город, 1/02, молодёжный центр НУР')

/** Closing band of the home page: the address, the phone and a way to get
 *  there, in the brand blue. The site-wide footer below it repeats the same
 *  details in small print, but that sits below the fold on every screen -- a
 *  visitor who reaches the end of the home page should not have to keep
 *  scrolling to find out where the theatre is. */
export function ArtBand() {
  return (
    <section className="relative left-1/2 mt-15.5 w-screen -translate-x-1/2 overflow-hidden bg-brand-blue py-12 text-paper md:py-16">
      <img src={elLadder} alt="" className="pointer-events-none absolute -right-4 -bottom-8 hidden h-62 w-auto opacity-50 invert lg:block" />

      <div className="relative mx-auto flex max-w-320 flex-wrap items-center justify-between gap-x-10 gap-y-8 px-6.5">
        <div className="relative">
          <SwallowIcon className="pointer-events-none absolute -top-8 left-32 h-11 -rotate-12 animate-kl-float text-paper/70" />
          <h2 className="font-heading text-[clamp(34px,5vw,64px)] leading-[.88] font-bold uppercase">
            Навстречу
            <br />
            свободе
          </h2>
        </div>

        <div className="flex flex-wrap items-start gap-x-12 gap-y-7">
          <div className="flex gap-3">
            <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" />
            <div className="text-[15px] leading-[1.5]">
              Набережные Челны
              <br />
              Новый город, 1/02
              <br />
              молодёжный центр «НУР»
            </div>
          </div>

          <div>
            <a href="tel:+79061202262" className="block font-heading text-[19px] font-bold">
              +7 906 120-22-62
            </a>
            <a href="tel:+79625739219" className="mt-1 block font-heading text-[19px] font-bold">
              +7 962 573-92-19
            </a>
            <div className="mt-3 flex gap-3">
              {socials.map((s) => (
                <SocialIcon key={s.key} social={s} className="text-paper/75 transition-colors hover:text-brand-yellow" />
              ))}
            </div>
          </div>
        </div>

        <a
          href={ROUTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[5px] bg-brand-yellow px-7 py-4 font-heading text-[14px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.75 active:scale-[.96]"
        >
          Построить маршрут <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
