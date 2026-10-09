import { VK_URL, socials } from '../../data/socials'
import { BTN } from './parts'

// "Follow the theatre on VK" instead of an email newsletter nobody would write:
// the theatre posts its afisha, premieres and open sign-ups there anyway.

const VK_PATH = socials.find((s) => s.key === 'VK')?.path ?? ''

export function VkFollow({
  label = 'Подписаться во ВКонтакте',
  className = 'bg-ink text-paper',
}: {
  label?: string
  className?: string
}) {
  if (!VK_URL) return null
  return (
    <a
      href={VK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BTN} ${className} gap-3 px-8 py-4 text-[16px]`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
        <path d={VK_PATH} />
      </svg>
      {label}
    </a>
  )
}
