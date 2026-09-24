import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitLead } from '../../data/leads'

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите ваше имя'),
  phone: z.string().trim().min(1, 'Укажите телефон'),
  email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
  consent: z.boolean().refine((v) => v, { message: 'Подтвердите согласие' }),
  website: z.string().optional(),
})

type Values = z.infer<typeof schema>

const inputClass =
  'rounded-[10px] border-2 border-[#D3CCBB] bg-paper px-4 py-3.75 font-body text-[15px] text-ink outline-none transition-colors placeholder:text-[#8b8474] focus:border-brand-red'
const errorClass = 'text-[12.5px] font-semibold text-brand-red'

export function AudienceSignupForm() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { consent: false } })

  const submit = async (values: Values) => {
    try {
      await submitLead('audience', { Имя: values.name, Телефон: values.phone, Email: values.email, website: values.website ?? '' })
    } catch (e) {
      setError('root', { message: (e as Error).message })
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-[10px] bg-brand-blue/8 p-4.5 text-[14px] leading-[1.5] font-semibold text-brand-blue">
        ✳ Спасибо! Как только будет что рассказать — напишем.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <input {...register('name')} placeholder="Ваше имя" className={inputClass} />
      {errors.name && <span className={errorClass}>{errors.name.message}</span>}
      <input {...register('phone')} type="tel" placeholder="Телефон" className={inputClass} />
      {errors.phone && <span className={errorClass}>{errors.phone.message}</span>}
      <input {...register('email')} type="email" placeholder="Email" className={inputClass} />
      {errors.email && <span className={errorClass}>{errors.email.message}</span>}

      <label className="mt-0.5 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-[1.45] text-paper/75">
        <input {...register('consent')} type="checkbox" className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 cursor-pointer accent-brand-yellow" />
        <span>
          Согласен(на) на{' '}
          <NavLink to="/politika" target="_blank" className="text-brand-yellow underline">
            обработку персональных данных
          </NavLink>{' '}
          для получения новостей театра
        </span>
      </label>
      {errors.consent && <span className={errorClass}>{errors.consent.message}</span>}
      <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 rounded-lg bg-brand-yellow py-3.5 font-heading text-[14px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.96] disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100"
      >
        {isSubmitting ? 'Отправляем…' : 'Держите в курсе'}
      </button>
      {errors.root && <span className={errorClass}>{errors.root.message}</span>}
    </form>
  )
}
