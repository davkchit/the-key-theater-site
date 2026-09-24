import { NavLink } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitLead } from '../../data/leads'

const schema = z.object({
  collective: z.string().trim().min(1, 'Укажите название коллектива'),
  contact: z.string().trim().min(1, 'Укажите контактное лицо'),
  city: z.string().trim().min(1, 'Укажите город'),
  phone: z.string().trim().min(1, 'Укажите телефон'),
  email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
  consent: z.boolean().refine((v) => v, { message: 'Подтвердите согласие' }),
  website: z.string().optional(),
})

type Values = z.infer<typeof schema>

const inputClass =
  'rounded-[10px] border-2 border-[#D3CCBB] bg-paper px-4 py-3.75 font-body text-[15px] text-ink outline-none transition-colors placeholder:text-[#8b8474] focus:border-brand-red'
const errorClass = 'text-[12.5px] font-semibold text-brand-red'

interface FestivalSignupFormProps {
  onSuccess: () => void
  onInvalid: () => void
}

export function FestivalSignupForm({ onSuccess, onInvalid }: FestivalSignupFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { consent: false } })

  const submit = async (values: Values) => {
    try {
      await submitLead('festival', {
        Коллектив: values.collective,
        'Контактное лицо': values.contact,
        Телефон: values.phone,
        Email: values.email,
        Город: values.city,
        website: values.website ?? '',
      })
    } catch (e) {
      setError('root', { message: (e as Error).message })
      return
    }
    onSuccess()
  }

  return (
    <>
      <h2 id="festival-signup-title" className="mt-1 mb-1 font-heading text-[26px] font-bold uppercase">
        Заявка на фестиваль
      </h2>
      <p className="mb-5 text-[13px] leading-[1.5] text-[#6B655A]">
        «Действующие лица» — оставьте контакты, мы запомним ваш коллектив и напишем, когда откроется приём заявок.
      </p>

      <form onSubmit={handleSubmit(submit, onInvalid)} className="relative flex flex-col gap-3">
        <input {...register('collective')} placeholder="Название коллектива" className={inputClass} />
        {errors.collective && <span className={errorClass}>{errors.collective.message}</span>}
        <input {...register('contact')} placeholder="Контактное лицо" className={inputClass} />
        {errors.contact && <span className={errorClass}>{errors.contact.message}</span>}
        <input {...register('city')} placeholder="Город" className={inputClass} />
        {errors.city && <span className={errorClass}>{errors.city.message}</span>}
        <input {...register('phone')} type="tel" placeholder="Телефон" className={inputClass} />
        {errors.phone && <span className={errorClass}>{errors.phone.message}</span>}
        <input {...register('email')} type="email" placeholder="Email" className={inputClass} />
        {errors.email && <span className={errorClass}>{errors.email.message}</span>}

        <label className="mt-0.5 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-[1.45] text-[#57503f]">
          <input {...register('consent')} type="checkbox" className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 cursor-pointer accent-brand-red" />
          <span>
            Отправляя заявку, вы подтверждаете, что ознакомлены с{' '}
            <NavLink to="/politika" target="_blank" className="text-brand-red underline">
              согласием на обработку персональных данных
            </NavLink>
          </span>
        </label>
        {errors.consent && <span className={errorClass}>{errors.consent.message}</span>}
        <input {...register('website')} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-red py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.96] disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100"
        >
          {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
        </button>
        {errors.root && <span className={errorClass}>{errors.root.message}</span>}
      </form>
    </>
  )
}
