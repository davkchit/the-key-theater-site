import { useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import type { Direction } from '../../types/content'
import { DIRECTION_TYPE_LABEL, visibleDirections } from '../../data/directions'
import { DirectionForm } from './DirectionForm'
import { Modal } from '../ui/Modal'
import { Reveal } from '../ui/Reveal'

// Everything besides the courses that people can sign up for, straight from
// the admin. The festival and the newsletter keep their own places on the
// site (About, Contacts), so they are not repeated here.
const HERE: Direction['type'][] = ['prep', 'quest', 'carnival', 'other']

export function DirectionsSection() {
  const list = visibleDirections().filter((d) => HERE.includes(d.type))
  const [searchParams, setSearchParams] = useSearchParams()
  const [sentName, setSentName] = useState('')
  const [shakeKey, setShakeKey] = useState(0)

  const openId = searchParams.get('direction')
  const direction = list.find((d) => d.id === openId && d.open) ?? null

  const [prevId, setPrevId] = useState(openId)
  if (openId !== prevId) {
    setPrevId(openId)
    setSentName('')
  }

  // a plain function: React Compiler memoizes it, and the manual useCallback
  // it replaced tripped react-hooks/preserve-manual-memoization
  const close = () => {
    setSearchParams({}, { replace: true })
    setSentName('')
  }

  if (!list.length) return null

  return (
    <section className="mt-12">
      <h2 className="font-heading text-[clamp(28px,4vw,44px)] leading-[.95] font-bold uppercase">Ещё можно записаться</h2>
      <div className="mt-5.5 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((d, i) => (
          <Reveal key={d.id} index={i} className="flex flex-col rounded-xl border-2 border-ink bg-paper p-6.5">
            <div className="font-heading text-xs font-semibold tracking-[.12em] text-[#6B655A] uppercase">{DIRECTION_TYPE_LABEL[d.type]}</div>
            <div className="mt-1.5 font-heading text-[22px] leading-tight font-bold uppercase">{d.title}</div>
            {(d.age || d.schedule) && <div className="mt-2 font-heading text-sm font-medium">{[d.age, d.schedule].filter(Boolean).join(' · ')}</div>}
            {d.desc && <p className="mt-3 flex-1 text-[14px] leading-[1.55] text-[#33302a]">{d.desc}</p>}
            {(d.prices ?? []).length > 0 && (
              <div className="mt-3 text-[14px] font-semibold">{(d.prices ?? []).map((p) => `${p.name}: ${p.price}`).join(' · ')}</div>
            )}
            <div className="mt-4.5">
              {d.open ? (
                <NavLink
                  to={`/staryi/kursy?direction=${encodeURIComponent(d.id)}`}
                  className="inline-flex items-center rounded-[7px] bg-brand-red px-4 py-2.25 font-heading text-xs font-semibold tracking-[.06em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-95"
                >
                  Записаться
                </NavLink>
              ) : (
                <span className="text-[13px] font-semibold text-[#6B655A]">Приём заявок пока закрыт</span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Modal open={!!direction} onClose={close} shakeKey={shakeKey} labelledBy="direction-signup-title">
        <button
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-4.5 right-4.5 h-9.5 w-9.5 rounded-lg border-2 border-ink text-base transition-transform duration-150 active:scale-90"
        >
          ✕
        </button>
        {direction &&
          (sentName ? (
            <div className="rounded-[10px] bg-brand-blue/8 p-4.5 text-[14px] leading-[1.5] font-semibold text-brand-blue">
              ✳ Здравствуйте, {sentName}! Заявка «{direction.title}» принята, мы свяжемся с вами в ближайшее время.
            </div>
          ) : (
            <DirectionForm direction={direction} onSuccess={setSentName} onInvalid={() => setShakeKey((k) => k + 1)} />
          ))}
      </Modal>
    </section>
  )
}
