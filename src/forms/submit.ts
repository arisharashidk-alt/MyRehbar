import en from '../i18n/en'
import { FORM_ENDPOINT, isFormEndpointSet } from '../config/forms'
import type { FormDef } from './schema'
import type { Values } from './validate'

export type SubmitResult = 'ok' | 'busy' | 'error' | 'not_configured'

/**
 * Send one form response to the Google Apps Script, which adds a row to the private sheet.
 *
 * Privacy:
 * - Sent over HTTPS only, and only to script.google.com (checked in isFormEndpointSet).
 * - Nothing is stored in the browser, logged to the console, or sent anywhere else.
 * - Only the questions defined in the form are sent.
 */
export async function submitForm(
  def: FormDef,
  values: Values,
  meta: { lang: string; startedAt: number; honeypot: string },
): Promise<SubmitResult> {
  if (!isFormEndpointSet()) return 'not_configured'

  const data: Record<string, string> = {}
  for (const f of def.fields) {
    const v = values[f.name]
    if (f.type === 'checkbox') data[f.name] = v === true ? 'Yes' : ''
    else if ((f.type === 'select' || f.type === 'radio') && typeof v === 'string' && v) {
      // Always save the English answer, so the sheet is easy to read whatever language was used.
      const labels = en.formOptions[f.group] as Record<string, string>
      data[f.name] = labels[v] ?? v
    } else data[f.name] = typeof v === 'string' ? v.trim() : ''
  }

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 20_000)
  try {
    // A plain-text body keeps this a "simple" request, which Apps Script accepts without CORS setup.
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        form: def.id,
        data,
        lang: meta.lang,
        elapsedMs: Date.now() - meta.startedAt,
        website: meta.honeypot, // hidden spam trap: real people leave this empty
      }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
    const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (json?.ok) return 'ok'
    return json?.error === 'busy' ? 'busy' : 'error'
  } catch {
    return 'error'
  } finally {
    window.clearTimeout(timer)
  }
}
