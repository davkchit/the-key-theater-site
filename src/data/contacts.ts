import settings from '../content/settings.json'

// The theatre's phone, hours and email from «Настройки сайта» in the admin.
// The bot names the same ones (bot/core/knowledge.mjs), so a new number is
// changed in one place and shows up everywhere.

const s = settings as { phone?: string; phone2?: string; hours?: string; email?: string }

export const PHONE = s.phone ?? ''
export const PHONE2 = s.phone2 ?? ''
export const HOURS = s.hours ?? ''
export const EMAIL = s.email ?? ''

/** "+7 906 120-22-62" -> "tel:+79061202262" */
export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '')
