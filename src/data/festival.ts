import { directionByType } from './directions'

// Whether the "Действующие лица" festival takes applications right now. The
// switch is the festival's entry in the admin's "Направления" ("Заявки
// открыты"), the same one the bot and the server read -- one switch, so the
// site, the chat and the lead endpoint can never disagree. No festival entry
// at all means nothing was closed: the form stays open.
export const festivalApplicationsOpen: boolean = directionByType('festival')?.open ?? true
