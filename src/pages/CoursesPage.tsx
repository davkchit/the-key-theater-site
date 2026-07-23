import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CourseCard } from '../components/courses/CourseCard'
import { SignupForm } from '../components/courses/SignupForm'
import { Modal } from '../components/ui/Modal'
import { Reveal } from '../components/ui/Reveal'
import { SwallowIcon } from '../components/ui/SwallowIcon'
import { courses } from '../data/courses'
import logoKeymark from '../../assets/logo-keymark.png'
import elKey from '../../assets/el-key-hanging.svg'

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sent, setSent] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  const courseKey = searchParams.get('course')
  const course = courses.find((c) => c.key === courseKey) ?? null

  const openCourse = useCallback(
    (key: string) => {
      setSent(false)
      setSearchParams({ course: key })
    },
    [setSearchParams],
  )
  const close = useCallback(() => {
    setSearchParams({}, { replace: true })
    setSent(false)
  }, [setSearchParams])

  return (
    <main className="mx-auto max-w-320 px-6.5 pt-13">
      <div className="font-heading text-[13px] font-medium tracking-[.18em] text-[#6B655A] uppercase">
        Актёрские курсы · набор продолжается
      </div>
      <h1 className="mt-2.5 font-heading text-[clamp(44px,7.4vw,108px)] leading-[.86] font-bold uppercase">
        Записаться
        <br />в театр
      </h1>
      <p className="mt-3.5 max-w-155 text-[17px] leading-[1.55] text-[#33302a]">
        Мы изучаем себя на актёрских курсах — приходите пробовать. Театр для каждого свой, а научиться быть на сцене
        может каждый.
      </p>

      <div className="mt-7.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((c, i) => (
          <CourseCard key={c.key} course={c} index={i} onOpen={() => openCourse(c.key)} />
        ))}
      </div>

      <p className="mt-3.5 text-[13px] text-[#6B655A]">
        Цены и даты старта — ориентировочные, точную стоимость и расписание уточним при записи.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5.5 md:grid-cols-2">
        <Reveal className="overflow-hidden rounded-[16px] border-2 border-ink p-7.5">
          <h2 className="mb-4.5 font-heading text-2xl font-bold uppercase">Как записаться</h2>
          <div className="flex flex-col gap-4">
            {['Выберите поток выше — по возрасту ребёнка или для взрослых.', 'Нажмите «Подробнее» на карточке потока и заполните короткую форму.', 'Мы перезвоним и расскажем про расписание и ближайшую дату старта.'].map(
              (text, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <span className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-full bg-brand-red font-heading text-sm font-bold text-paper">
                    {i + 1}
                  </span>
                  <div className="text-[15px] leading-[1.5]">{text}</div>
                </div>
              ),
            )}
          </div>
        </Reveal>

        <Reveal index={1} className="relative flex flex-col justify-center overflow-hidden rounded-[16px] bg-ink p-7.5 text-paper">
          <img src={logoKeymark} alt="" className="pointer-events-none absolute -top-7.5 -right-7.5 h-37.5 w-37.5 rotate-10 opacity-50" />
          <SwallowIcon className="pointer-events-none absolute right-6 bottom-5 h-17.5 rotate-9 text-brand-yellow opacity-50" />
          <div className="relative font-script text-2xl text-brand-yellow">Позвоните нам</div>
          <a href="tel:+79061202262" className="relative mt-2 block font-heading text-[clamp(26px,4vw,40px)] font-bold">
            +7 906 120-22-62
          </a>
          <a href="tel:+79625739219" className="relative mt-1 block font-heading text-[clamp(26px,4vw,40px)] font-bold">
            +7 962 573-92-19
          </a>
          <p className="relative mt-4.5 text-sm leading-[1.6] text-[#9B9484]">
            Расскажем про расписание занятий, группы и ближайший набор. Ждём вас в театре «Ключ», Набережные Челны.
          </p>
        </Reveal>
      </div>

      <Modal open={!!course} onClose={close} shakeKey={shakeKey} labelledBy="signup-title">
        <img src={elKey} alt="" className="pointer-events-none absolute -right-7.5 -bottom-7.5 h-50 w-auto -rotate-8 opacity-7" />
        <button
          onClick={close}
          aria-label="Закрыть"
          className="absolute top-4.5 right-4.5 h-9.5 w-9.5 rounded-lg border-2 border-ink text-base transition-transform duration-150 active:scale-90"
        >
          ✕
        </button>
        {course &&
          (sent ? (
            <div className="rounded-[10px] bg-brand-blue/8 p-4.5 text-[14px] leading-[1.5] font-semibold text-brand-blue">
              ✳ Спасибо! Заявка на поток «{course.name}» отправлена — мы свяжемся с вами.
            </div>
          ) : (
            <SignupForm course={course} onSuccess={() => setSent(true)} onInvalid={() => setShakeKey((k) => k + 1)} />
          ))}
      </Modal>
    </main>
  )
}
