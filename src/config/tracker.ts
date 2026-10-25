/**
 * Where the application tracker (logins and saved trackers) is sent.
 *
 * This is a DIFFERENT Apps Script from the forms (src/config/forms.ts): google-apps-script/Tracker.gs.
 * Paste its web app URL below. It looks like
 *   https://script.google.com/macros/s/AKfycb.../exec
 * Setup steps: README.md -> "7a. Application tracker".
 *
 * The URL is not a password. Every request to read or change a tracker needs a valid login.
 */
export const TRACKER_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzBmrQf_0_7EdWMm4zVjGED-jNdpjwXhiN4qVcdQJZZmb0GI0NQ6NgDM74gBfqv8qZs/exec'

/** True once a real Apps Script URL has been pasted in. Only script.google.com URLs are accepted. */
export function isTrackerEndpointSet(url: string = TRACKER_ENDPOINT): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)
}
