import { Reveal } from '../components/ui/Reveal'
import { PRIVACY_SECTIONS as SECTIONS } from '../data/privacy'

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13 pb-20">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">
        Документы
      </div>
      <h1 className="font-heading mt-2.5 text-[clamp(38px,6vw,72px)] leading-[.92] font-bold uppercase">
        Политика обработки
        <br />
        персональных данных
      </h1>

      <Reveal className="rounded-3.5 border-ink mt-8 max-w-185 border-2 p-7.5 md:p-9">
        <div className="flex flex-col gap-7 text-[15px] leading-[1.65] text-[#2b2822]">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-heading mb-2.5 text-lg font-bold uppercase">{s.title}</h2>
              <div className="flex flex-col gap-2">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </main>
  )
}
