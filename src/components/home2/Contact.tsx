import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitLead } from '../../data/leads'
import { directionByType } from '../../data/directions'
import { SwallowIcon } from '../ui/SwallowIcon'
import { BTN, H2, RoughFrame, SectionHead, WRAP } from './parts'
import { Torn } from './paper'

/* ─────────────── newsletter ─────────────── */

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите имя'),
  email: z.string().trim().min(1, 'Укажите email').email('Проверьте email'),
  consent: z.literal(true, { message: 'Нужно согласие' }),
  website: z.string().optional(),
})
type Values = z.input<typeof schema>

const input =
  'h-14 w-full rounded-md border-2 border-ink/80 bg-transparent px-5 text-[16px] outline-none placeholder:text-ink/70 focus:border-ink focus:bg-paper/30'
const err = 'mt-1 block text-[13px] font-semibold text-brand-red'

export function NewsletterBand() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  // the newsletter is a "direction" too: closed in the admin means no band
  if (directionByType('newsletter')?.open === false) return null

  const onSubmit = async (v: Values) => {
    try {
      await submitLead('audience', { Имя: v.name, Email: v.email, website: v.website ?? '' })
      setSent(true)
    } catch (e) {
      setError('root', { message: (e as Error).message })
    }
  }

  return (
    <section className="bg-brand-yellow relative">
      <Torn color="text-brand-yellow" seed={71} />
      <div className={`${WRAP} relative py-14 md:py-20`}>
        <SwallowIcon className="text-ink pointer-events-none absolute top-8 right-4 h-16 -rotate-6 md:top-12 md:right-10 md:h-24" />
        <h2 className={`${H2} pr-20`}>Держите в курсе</h2>
        <p className="mt-3 text-[18px] md:text-[20px]">Афиша и новости театра раз в месяц</p>

        {sent ? (
          <p className="border-ink mt-7 max-w-xl rounded-md border-2 p-4 text-[16px] font-semibold">
            Готово! Первое письмо придёт с новой афишей.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="relative mt-7 grid gap-x-5 gap-y-4 md:grid-cols-2"
          >
            <label className="block">
              <span className="sr-only">Имя</span>
              <input
                {...register('name')}
                placeholder="Имя"
                autoComplete="given-name"
                className={input}
              />
              {errors.name && <span className={err}>{errors.name.message}</span>}
            </label>
            <label className="block">
              <span className="sr-only">Email</span>
              <input
                {...register('email')}
                type="email"
                placeholder="Email"
                autoComplete="email"
                className={input}
              />
              {errors.email && <span className={err}>{errors.email.message}</span>}
            </label>
            <label className="flex cursor-pointer items-start gap-3 self-center text-[14px]">
              <input
                {...register('consent')}
                type="checkbox"
                className="accent-ink mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer"
              />
              <span>
                Согласен на обработку{' '}
                <Link to="/politika" className="underline underline-offset-2">
                  персональных данных
                </Link>
                {errors.consent && (
                  <span className="text-brand-red ml-2 font-semibold">
                    {errors.consent.message}
                  </span>
                )}
              </span>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${BTN} bg-ink text-paper h-14 disabled:opacity-60`}
            >
              {isSubmitting ? 'Отправляем…' : 'Подписаться'}
            </button>
            <input
              {...register('website')}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            {errors.root && (
              <p className="text-brand-red text-[14px] font-semibold md:col-span-2">
                {errors.root.message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

/* ─────────────── how to find us ─────────────── */

const ADDRESS = 'Набережные Челны, Новый город, 1/02'
// the theatre's own card on Yandex Maps ("Ключ", 1-й комплекс, 2): searching the
// address finds only the district
const MAP_QUERY = encodeURIComponent('Набережные Челны, театр Ключ')
const MAP_SRC = `https://yandex.ru/map-widget/v1/?text=${MAP_QUERY}&z=16`
const MAP_LINK = `https://yandex.ru/maps/?text=${MAP_QUERY}`

// Photo of the entrance with the "второй вход" arrow, as in the mockup. Empty
// until the theatre sends one; then the map moves to the right-hand column.
const ENTRANCE_PHOTO = ''

function MapFrame({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-ink/5 relative overflow-hidden ${className}`}>
      <iframe
        src={MAP_SRC}
        title="Театр «Ключ» на карте"
        loading="lazy"
        className="absolute inset-0 h-full w-full grayscale-[.4] sepia-[.15]"
      />
    </div>
  )
}

export function FindUs() {
  return (
    <section className="bg-paper relative">
      <Torn color="text-paper" seed={79} />
      <div className={`${WRAP} pt-16 pb-24 md:pt-24 md:pb-28`}>
        <SectionHead title="Как нас найти" />
        <div className="grid gap-10 md:grid-cols-[1.1fr_1.4fr] md:gap-12">
          {ENTRANCE_PHOTO ? (
            <RoughFrame>
              <img
                src={ENTRANCE_PHOTO}
                alt="Вход в молодёжный центр «НУР»"
                className="aspect-[1/1] w-full object-cover"
              />
            </RoughFrame>
          ) : (
            <MapFrame className="aspect-[1/1] md:aspect-auto md:min-h-[440px]" />
          )}

          <div className="grid gap-8 md:grid-cols-[1fr_auto]">
            <div className="md:col-span-2">
              <p className="text-[17px]">{ADDRESS}</p>
              <p className="mt-2 text-[17px] font-semibold">Молодёжный центр «НУР», второй вход</p>
              <div className="border-ink/60 mt-6 border-t" />
            </div>
            <div>
              <div className="flex flex-col gap-1">
                <a
                  href="tel:+79061202262"
                  className="font-heading hover:text-brand-red text-[34px] leading-tight font-bold tracking-[.01em] md:text-[38px]"
                >
                  +7 906 120-22-62
                </a>
                <a
                  href="tel:+79625739219"
                  className="font-heading hover:text-brand-red text-[34px] leading-tight font-bold tracking-[.01em] md:text-[38px]"
                >
                  +7 962 573-92-19
                </a>
              </div>
              <p className="mt-6 text-[17px]">пн–пт, 15:00–21:00</p>
              <a
                href="mailto:kluchtheatre@mail.ru"
                className="mt-4 inline-block text-[17px] underline-offset-4 hover:underline"
              >
                kluchtheatre@mail.ru
              </a>
              <div className="mt-7">
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN} border-ink border-2`}
                >
                  Построить маршрут
                </a>
              </div>
            </div>
            {ENTRANCE_PHOTO && <MapFrame className="aspect-[3/4] w-full md:w-56" />}
          </div>
        </div>
      </div>
    </section>
  )
}
