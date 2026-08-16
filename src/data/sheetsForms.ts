// Google Apps Script Web App -- appends form submissions as rows into the
// theatre's own Google Sheet (see the `SHEETS` map in that script for the
// sheet/column layout each formType maps to). No auth, no server of our
// own -- deliberate for a small non-profit's traffic and budget.
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwZCo7Na2ZaR8ZFeEqghhzU5RcmcdiD1SFuLlkEyqxNaCO691EGv5EPTD7NiLbPY3hH/exec'

// 'mascot' is a new formType -- the Apps Script's SHEETS map needs a matching
// sheet/column entry added on the theatre's side before these rows have
// anywhere to land (fire-and-forget + no-cors means a missing route fails silently).
export type SheetFormType = 'courses' | 'audience' | 'festival' | 'mascot'

/**
 * Fire-and-forget submit to the Sheet. `mode: 'no-cors'` plus a `text/plain`
 * body are required together here -- Apps Script's doPost doesn't answer
 * CORS preflight requests, so a `Content-Type: application/json` fetch
 * (which triggers a preflight) fails outright. `text/plain` keeps this a
 * "simple request" (no preflight); Apps Script parses the raw body as JSON
 * regardless of the declared content type. The trade-off is `no-cors` makes
 * the response opaque -- we can't read success/failure back, so this
 * resolves optimistically once the request leaves the browser.
 */
export async function submitToSheet(formType: SheetFormType, fields: Record<string, string>): Promise<void> {
  await fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ formType, fields }),
  })
}
