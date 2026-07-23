import type { TeamMember } from '../../types/content'
import { TeamCard } from './TeamCard'

interface TeamCarouselProps {
  members: TeamMember[]
}

/**
 * < md: horizontal scroll-snap carousel. This is the one place a JS/CSS
 * responsive split is legitimate (the layout genuinely changes shape,
 * unlike the old build's `window.innerWidth`-driven grid columns).
 */
export function TeamCarousel({ members }: TeamCarouselProps) {
  return (
    <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 [scroll-padding-left:26px] md:hidden">
      {members.map((m) => (
        <TeamCard key={m.name} member={m} className="w-[74%] flex-none snap-center" />
      ))}
    </div>
  )
}
