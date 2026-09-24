// Form submissions go to the theatre's own server (the bot's service, see
// bot/server/site.mjs): one database in Russia for the site's and the bot's
// leads, a letter to the theatre's mailbox, a card in the admin chat.
//
// Unlike the Google Sheet this replaced, the answer is read: a lead that did
// not arrive shows the person an error with the phone number instead of a
// "thank you" for nothing.
//
// VITE_API_BASE: where the server is. Empty (the default) means the same site
// ("/api/lead"), which is how it runs on the VPS; in development Vite forwards
// /api to the local bot (vite.config.ts).
const API = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export type LeadForm = 'course' | 'festival' | 'audience' | 'direction'

export const LEAD_FAILED =
  'Не получилось отправить заявку. Проверьте интернет и попробуйте ещё раз или позвоните: +7 906 120-22-62.'

export async function submitLead(
  form: LeadForm,
  fields: Record<string, string>,
  extra: { directionId?: string } = {},
): Promise<void> {
  let res: Response
  try {
    res = await fetch(`${API}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form, fields, consent: true, ...extra }),
    })
  } catch {
    throw new Error(LEAD_FAILED)
  }
  if (res.ok) return
  const body = (await res.json().catch(() => null)) as { error?: string } | null
  // the server's own words for the fixable cases ("приём заявок закрыт",
  // "слишком много заявок подряд"), the generic message otherwise
  throw new Error(
    res.status === 409 || res.status === 429
      ? `${body?.error ?? 'Сейчас заявку не принять'}. Телефон: +7 906 120-22-62.`
      : LEAD_FAILED,
  )
}

// What people open in the site's cat. No personal data, and nobody waits for
// it: a lost event costs nothing.
export function trackEvent(data: Record<string, string>): void {
  try {
    void fetch(`${API}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'mascot', data }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // an old browser without keepalive: skip the event
  }
}
