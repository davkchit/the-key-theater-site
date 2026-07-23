import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Course } from '../../types/content'

const contactFields = {
  phone: z.string().trim().min(1, 'Укажите телефон'),
  email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
  consent: z.boolean().refine((v) => v, { message: 'Подтвердите согласие' }),
}

// plain z.number() (not z.coerce) so the schema's input/output types match --
// the numeric conversion happens via register(name, { valueAsNumber: true })
// instead, which keeps useForm's single type parameter valid.
const childSchema = z.object({
  parentName: z.string().trim().min(1, 'Укажите ваше имя'),
  childName: z.string().trim().min(1, 'Укажите имя ребёнка'),
  childAge: z.number({ error: 'Укажите возраст' }).min(0, 'Некорректный возраст').max(17, 'Некорректный возраст'),
  ...contactFields,
})

const adultSchema = z.object({
  name: z.string().trim().min(1, 'Укажите ваше имя'),
  age: z.number({ error: 'Укажите возраст' }).min(14, 'Курс рассчитан на 14+'),
  ...contactFields,
})

type ChildValues = z.infer<typeof childSchema>
type AdultValues = z.infer<typeof adultSchema>

const inputClass =
  'rounded-[10px] border-2 border-[#D3CCBB] bg-paper px-4 py-3.75 font-body text-[15px] outline-none transition-colors focus:border-brand-red'
const errorClass = 'text-[12.5px] font-semibold text-brand-red'

const courseBgVar: Record<Course['bg'], string> = {
  yellow: 'var(--color-brand-yellow)',
  red: 'var(--color-brand-red)',
  blue: 'var(--color-brand-blue)',
  ink: 'var(--color-ink)',
}

interface SignupFormProps {
  course: Course
  onSuccess: () => void
  onInvalid: () => void
}

export function SignupForm({ course, onSuccess, onInvalid }: SignupFormProps) {
  return (
    <>
      <div
        className="inline-block rounded-md px-3 py-1.5 font-heading text-xs font-semibold tracking-[.1em] text-paper uppercase"
        style={{ background: courseBgVar[course.bg] }}
      >
        {course.name} · {course.ageRange}
      </div>
      <h2 id="signup-title" className="mt-4 mb-1 font-heading text-[28px] font-bold uppercase">
        Заявка на курс
      </h2>
      <p className="mb-5 text-[13px] leading-[1.5] text-[#6B655A]">
        {course.price} · {course.start}
      </p>
      {course.isChild ? (
        <ChildForm onSuccess={onSuccess} onInvalid={onInvalid} />
      ) : (
        <AdultForm onSuccess={onSuccess} onInvalid={onInvalid} />
      )}
    </>
  )
}

function ChildForm({ onSuccess, onInvalid }: { onSuccess: () => void; onInvalid: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildValues>({ resolver: zodResolver(childSchema), defaultValues: { consent: false } })

  return (
    <form onSubmit={handleSubmit(onSuccess, onInvalid)} className="relative flex flex-col gap-3">
      <input {...register('parentName')} placeholder="Ваше имя" className={inputClass} />
      <FieldError message={errors.parentName?.message} />
      <input {...register('childName')} placeholder="Имя ребёнка" className={inputClass} />
      <FieldError message={errors.childName?.message} />
      <input {...register('childAge', { valueAsNumber: true })} type="number" min={0} max={17} placeholder="Возраст ребёнка" className={inputClass} />
      <FieldError message={errors.childAge?.message} />
      <input {...register('phone')} type="tel" placeholder="Телефон для связи" className={inputClass} />
      <FieldError message={errors.phone?.message} />
      <input {...register('email')} type="email" placeholder="Email для рассылок" className={inputClass} />
      <FieldError message={errors.email?.message} />
      <ConsentField register={register('consent')} message={errors.consent?.message} />
      <SubmitButton />
    </form>
  )
}

function AdultForm({ onSuccess, onInvalid }: { onSuccess: () => void; onInvalid: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdultValues>({ resolver: zodResolver(adultSchema), defaultValues: { consent: false } })

  return (
    <form onSubmit={handleSubmit(onSuccess, onInvalid)} className="relative flex flex-col gap-3">
      <input {...register('name')} placeholder="Ваше имя" className={inputClass} />
      <FieldError message={errors.name?.message} />
      <input {...register('age', { valueAsNumber: true })} type="number" min={14} placeholder="Ваш возраст" className={inputClass} />
      <FieldError message={errors.age?.message} />
      <input {...register('phone')} type="tel" placeholder="Телефон для связи" className={inputClass} />
      <FieldError message={errors.phone?.message} />
      <input {...register('email')} type="email" placeholder="Email для рассылок" className={inputClass} />
      <FieldError message={errors.email?.message} />
      <ConsentField register={register('consent')} message={errors.consent?.message} />
      <SubmitButton />
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <span className={errorClass}>{message}</span>
}

function ConsentField({
  register,
  message,
}: {
  register: ReturnType<ReturnType<typeof useForm<ChildValues>>['register']>
  message?: string
}) {
  return (
    <>
      <label className="mt-0.5 flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-[1.45] text-[#57503f]">
        <input {...register} type="checkbox" className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 cursor-pointer accent-brand-red" />
        <span>
          Отправляя заявку, вы подтверждаете, что ознакомлены с{' '}
          {/* placeholder until a real policy page exists -- a <button> here, not an <a href="#">,
              since it doesn't navigate anywhere yet (jsx-a11y/anchor-is-valid) */}
          <button type="button" className="text-brand-red underline">
            согласием на обработку персональных данных
          </button>
        </span>
      </label>
      <FieldError message={message} />
    </>
  )
}

function SubmitButton(): ReactNode {
  return (
    <button
      type="submit"
      className="rounded-lg bg-brand-red py-4 font-heading text-[15px] font-semibold tracking-[.08em] text-paper uppercase transition-transform duration-180 hover:-translate-y-0.5 active:scale-[.96]"
    >
      Отправить заявку
    </button>
  )
}
