import { TRACKER_ENDPOINT, isTrackerEndpointSet } from '../config/tracker'

export type ApiError =
  | 'auth' // not logged in, or the login expired
  | 'wrong' // wrong email or password
  | 'locked' // too many wrong passwords: wait 15 minutes
  | 'code' // wrong or expired email code
  | 'wait' // an email was sent very recently
  | 'conflict' // saved from another tab or device in between
  | 'too_large'
  | 'too_fast'
  | 'invalid'
  | 'busy'
  | 'server'
  | 'network'
  | 'not_configured'

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; error: ApiError; version?: number; data?: string | null }

/**
 * One request to the tracker Apps Script (google-apps-script/Tracker.gs).
 *
 * - HTTPS to script.google.com only (checked in isTrackerEndpointSet).
 * - The login token goes in the request body, never in the URL, so it can't end up in logs or history.
 * - No cookies are sent, and nothing is logged to the console.
 */
export async function trackerCall<T = object>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResult<T>> {
  if (!isTrackerEndpointSet()) return { ok: false, error: 'not_configured' }
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 30_000)
  try {
    // A plain-text body keeps this a "simple" request, which Apps Script accepts without CORS setup.
    const res = await fetch(TRACKER_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ ...payload, action }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store',
      signal: controller.signal,
    })
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null
    if (!json || typeof json !== 'object' || typeof json.ok !== 'boolean') return { ok: false, error: 'server' }
    return json
  } catch {
    return { ok: false, error: 'network' }
  } finally {
    window.clearTimeout(timer)
  }
}
