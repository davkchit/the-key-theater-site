import { PRIVACY_SECTIONS } from '../data/privacy'
import { WRAP } from '../components/home2/parts'

// The privacy policy in the new design: plain readable text, nothing else.

export default function PrivacyPageV2() {
  return (
    <div className="bg-paper">
      <section className={`${WRAP} pt-14 pb-24 md:pt-20`}>
        <div className="text-ink/65 text-[14px] tracking-[.06em] uppercase">Документы</div>
        <h1 className="font-heading mt-3 text-[clamp(40px,6vw,80px)] leading-[1] font-bold uppercase">
          Политика обработки
          <br />
          персональных данных
        </h1>
        <div className="mt-12 flex max-w-3xl flex-col gap-10 text-[16px] leading-[1.7] md:text-[17px]">
          {PRIVACY_SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-heading text-[22px] leading-tight font-bold uppercase md:text-[26px]">
                {s.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
