import type { TeamMember } from '../../types/content'
import { SwallowIcon } from '../ui/SwallowIcon'
import { WavyUnderline } from '../ui/WavyUnderline'

interface TeamCardProps {
  member: TeamMember
  className?: string
}

const bgClass: Record<TeamMember['bg'], string> = {
  yellow: 'bg-brand-yellow',
  red: 'bg-brand-red',
  blue: 'bg-brand-blue',
  ink: 'bg-ink',
}

export function TeamCard({ member, className }: TeamCardProps) {
  const fg = member.bg === 'yellow' ? 'text-ink' : 'text-paper'
  const roleColor = member.bg === 'yellow' ? '#4a3f14' : '#D8D2C4'

  return (
    <div
      className={[
        bgClass[member.bg],
        fg,
        'overflow-hidden rounded-xl border-2 border-ink transition-transform duration-260 ease-out hover:-translate-y-1.5',
        className,
      ].join(' ')}
    >
      <div className="group relative aspect-3/4 overflow-hidden bg-ink">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            className="h-full w-full object-cover opacity-82 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-paper" />
        )}
      </div>
      <div className="relative overflow-hidden p-4">
        <SwallowIcon className="pointer-events-none absolute -right-4.5 -bottom-3.5 h-23 -rotate-10 opacity-12" />
        <div className="relative font-heading text-xl leading-none font-bold uppercase">{member.name}</div>
        <WavyUnderline className="relative mt-1.5 h-2.5 w-13.5" />
        <div className="relative mt-1.5 text-[13px]" style={{ color: roleColor }}>
          {member.role}
        </div>
      </div>
    </div>
  )
}
