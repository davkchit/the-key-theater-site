import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { Direction } from '../../types/content'
import { submitLead } from '../../data/leads'
import { DIRECTION_TYPE_LABEL } from '../../data/directions'

// The form is built from the direction's questions in the admin, the same list
// the bot asks in the chat, so a new kind of event needs no new form.
// react-hook-form without a zod schema here: the fields are only known at run
// time, and their rules are simple enough for register() options.

type Values = Record<string, string | boolean>

const inputClass =
  'rounded-[10px] border-2 border-[#D3CCBB] bg-paper px-4 py-3.75 font-body text-[15px] text-ink outline-none transition-colors placeholder:text-[#8b8474] focus:border-brand-red'
const errorClass = 'text-[12.5px] font-semibold text-brand-red'

interface DirectionFormProps {
  direction: Direction
  onSuccess: (name: string) => void
  onInvalid: () => void
}

export function DirectionForm({ direction, onSuccess, onInvalid }: DirectionFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { consent: false } })

  // field keys are f0, f1... -- labels are free text from the admin and would
  // make awkward object keys
  const submit = async (values: Values) => {
    const fields: Record<string, string> = { Имя: String(values.name ?? '').trim() }
    direction.fields.forEach((f, i) => {
      const v = String(values['f' + i] ?? '').trim()
      if (v) fields[f.label] = v
    })
    if (direction.askPhone) fields['Телефон'] = String(values.phone ?? '').trim()
    fields.website = String(values.website ?? '')
    try {
      await submitLead('direction', fields, { directionId: direction.id })
    } catch (e) {
      setError('root', { message: (e as Error).message })
      return
    }
    onSuccess(fields['Имя'] ?? '')
  }

  const err = (key: string) => {
    const e = errors[key]
    return e?.message ? <span className={errorClass}>{String(e.message)}</span> : null
  }

  return (
    <>
      <div className="inline-block rounded-md bg-ink px-3 py-1.5 font-heading text-xs font-semibold tracking-[.1em] text-paper uppercase">
        {DIRECTION_TYPE_LABEL[direction.type]}
      </div>
      <h2 id="direction-signup-title" className="mt-4 mb-1 font-heading text-[28px] font-bold uppercase">
        {direction.title}
      </h2>
      {(direction.prices ?? []).length > 0 && (
        <p className="mb-5 text-[13px] leading-[1.5] text-[#6B655A]">{(direction.prices ?? []).map((p) => `${p.name}: ${p.price}`).join(' · ')}</p>
      )}

      <form onSubmit={handleSubmit(submit, onInvalid)} className="relative flex flex-col gap-3">
        <input {...register('name', { validate: (v) => String(v ?? '').trim().length > 0 || 'Укажите ваше имя' })} placeholder="Ваше имя" className={inputClass} />
        {err('name')}

        {direction.fields.map((f, i) => {
          const key = 'f' + i
          const label = f.ask || f.label
          const required = { validate: (v: unknown) => String(v ?? '').trim().length > 0 || `Заполните: ${f.label}` }
          if (f.kind === 'choice' && (f.options ?? []).length) {
            return (
              <div key={key} className="flex flex-col gap-1.5">
                <span className="text-[14px] text-[#33302a]">{label}</span>
                <select {...register(key, required)} defaultValue="" className={inputClass}>
                  <option value="" disabled>
                    Выберите
                  </option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {err(key)}
              </div>
            )
          }
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <input
                {...register(key, {
                  ...required,
                  ...(f.kind === 'email' ? { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Некорректный email' } } : {}),
                })}
                type={f.kind === 'number' ? 'number' : f.kind === 'email' ? 'email' : 'text'}
                min={f.kind === 'number' ? 0 : undefined}
                placeholder={label}
                aria-label={label}
                className={inputClass}
              />
              {err(key)}
            </div>
          )
        })}

        {direction.askPhone && (
          <>
            <input {...register('phone', { validate: (v) => String(v ?? '').trim().length > 0 || 'Укажите телефон' })} type="tel" placeholder="Телефон для связи" className={inputClass} />
            {err('phone')}
          </>
        )}

        <label className="mt-0.5 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-[1.45] text-[#57503f]">
          <input {...register('consent', { validate: (v) => v === true || 'Подтвердите согласие' })} type="checkbox" className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 cursor-pointer accent-brand-red" />
          <span>
            Отправляя заявку, вы подтверждаете, что ознакомлены с{' '}
            <NavLink to="/politika" target="_blank" className="text-brand-red underline">
              согласием на обработку персональных данных
            </NavLink>
          </span>
        </label>
        {err('consent')}
        <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-red py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-60"
        >
          {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
        </button>
        {errors.root && <span className={errorClass}>{errors.root.message}</span>}
      </form>
    </>
  )
}
