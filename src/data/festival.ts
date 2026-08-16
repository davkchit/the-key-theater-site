import settings from '../content/settings.json'

// Toggle for the "Действующие лица" festival application window -- the
// theatre doesn't accept applications year-round, so this flips the signup
// button on AboutPage between "Стать участником" and a closed-notice.
// Content lives in src/content/settings.json (Decap CMS-managed) so the
// theatre can flip it themselves -- see public/admin/config.yml.
export const festivalApplicationsOpen: boolean = settings.festivalApplicationsOpen
