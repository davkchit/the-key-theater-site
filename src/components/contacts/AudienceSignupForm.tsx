import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitToSheet } from '../../data/sheetsForms'

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите ваше имя'),
  phone: z.string().trim().min(1, 'Укажите телефон'),
  email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
  consent: z.boolean().refine((v) => v, { message: 'Подтвердите согласие' }),
})

type Values = z.infer<typeof schema>

const inputClass =
  'rounded-[10px] border-2 border-[#D3CCBB] bg-paper px-4 py-3.75 font-body text-[15px] outline-none transition-colors focus:border-brand-red'
const errorClass = 'text-[12.5px] font-semibold text-brand-red'

export function AudienceSignupForm() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { consent: false } })

  const submit = async (values: Values) => {
    await submitToSheet('audience', { Имя: values.name, Телефон: values.phone, Email: values.email, Согласие: 'да' })
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 rounded-lg bg-brand-yellow py-3.5 font-heading text-[14px] font-semibold tracking-[.08em] text-ink uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.96] disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100"
      >
        {isSubmitting ? 'Отправляем…' : 'Держите в курсе'}
      </button>
    </form>
  )
}
