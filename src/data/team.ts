import type { TeamMember } from '../types/content'
import teamContent from '../content/team.json'
import { mediaUrl } from '../lib/mediaUrl'

// Content lives in src/content/team.json (Decap CMS-managed) so the theatre
// can update the roster (new hires, photos, roles) without touching code --
// see public/admin/config.yml for the collection definition.
export const team: TeamMember[] = (teamContent.members as TeamMember[]).map((m) => ({ ...m, photo: mediaUrl(m.photo) }))
