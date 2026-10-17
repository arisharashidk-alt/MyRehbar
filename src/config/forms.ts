/**
 * Where MyRehbar form answers are sent.
 *
 * Paste your Google Apps Script web app URL below. It looks like
 *   https://script.google.com/macros/s/AKfycb.../exec
 * Setup steps: README.md -> "7. Forms".
 *
 * Answers go only to the private Google Sheet the script is attached to.
 * This URL is not a password: it can only ADD rows, never read them.
 * Never paste the Google Sheet's own link anywhere in this project.
 */
export const FORM_ENDPOINT = ''

/** True once a real Apps Script URL has been pasted in. Only script.google.com URLs are accepted. */
export function isFormEndpointSet(url: string = FORM_ENDPOINT): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)
}
