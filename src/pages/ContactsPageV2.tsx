import { socials } from '../data/socials'
import { PrintFilters, WRAP } from '../components/home2/parts'
import { FindUs, NewsletterBand } from '../components/home2/Contact'
import { SocialIcon } from '../components/ui/SocialIcon'
import { EMAIL } from '../data/contacts'

// «Контакты»: the ways to reach the theatre at a glance, then the map block
// and the newsletter from the homepage.

export default function ContactsPageV2() {
  return (
    <div className="bg-paper relative overflow-x-clip">
      <PrintFilters />
      <section className={`${WRAP} pt-14 pb-4 md:pt-20`}>
        <h1 className="font-heading text-[clamp(56px,10vw,140px)] leading-[.9] font-bold uppercase">
          Контакты
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-10">
          <div>
            <div className="text-ink/65 text-[14px] tracking-[.05em] uppercase">Написать</div>
            <a
              href={'mailto:' + EMAIL}
              className="mt-2 block text-[22px] font-medium hover:underline md:text-[24px]"
            >
              {EMAIL}
            </a>
            <p className="mt-2 text-[15px]">или спросите кота театра в углу страницы</p>
          </div>
          <div>
            <div className="text-ink/65 text-[14px] tracking-[.05em] uppercase">Мы в соцсетях</div>
            <div className="mt-3 flex gap-3">
              {socials.map((s) => (
                <SocialIcon
                  key={s.key}
                  social={s}
                  className="bg-ink text-paper flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 [&_svg]:h-6 [&_svg]:w-6"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* paper right above: no torn edge, it read as a stray line */}
      <FindUs torn={false} />
      <NewsletterBand />
      <div className="h-10" />
    </div>
  )
}
