import type { TeamMember } from '../../types/content'
import { TeamCard } from './TeamCard'

interface TeamGridProps {
  members: TeamMember[]
}

/** ≥ md: plain responsive grid. */
export function TeamGrid({ members }: TeamGridProps) {
  return (
    <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
      {members.map((m) => (
        <TeamCard key={m.name} member={m} />
      ))}
    </div>
  )
}
