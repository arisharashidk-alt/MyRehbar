/**
 * Google Forms used instead of a backend.
 * Responses go to the Google Sheet linked to each form (in your Google account).
 *
 * HOW TO FILL THIS IN (full steps in README.md):
 * 1. Create the form in Google Forms.
 * 2. Click "Send" -> link icon -> copy the link. Use the long link that ends in /viewform
 *    (not the forms.gle short link, because pre-fill and embedding need the long one).
 * 3. Paste it into `url` below.
 * 4. For pre-fill: in the form, open the ⋮ menu -> "Get pre-filled link", type anything into
 *    the field, click "Get link", and copy it. The link contains something like
 *    entry.1234567890=anything. Paste "entry.1234567890" into the matching `prefill` key.
 *
 * Until a URL is filled in, buttons still show but the embedded form shows a
 * "not set up yet" note instead of a broken frame.
 */

export interface FormConfig {
  /** The /viewform URL of the Google Form */
  url: string
  /** Map of our field names -> Google Forms entry ids, e.g. { rehbarName: 'entry.1234567890' } */
  prefill?: Record<string, string>
}

const PLACEHOLDER = 'YOUR_FORM_ID'

export const forms = {
  /** Students sign up to get a Rehbar */
  studentSignup: {
    url: `https://docs.google.com/forms/d/e/${PLACEHOLDER}/viewform`,
    prefill: {
      // TODO: optional. A short-answer question like "Which scholarship do you want help with?"
      scholarship: 'entry.0000000001',
    },
  },

  /** Volunteers apply to become a Rehbar */
  rehbarApplication: {
    url: `https://docs.google.com/forms/d/e/${PLACEHOLDER}/viewform`,
  },

  /** A student asks for a specific Rehbar */
  mentorshipRequest: {
    url: `https://docs.google.com/forms/d/e/${PLACEHOLDER}/viewform`,
    prefill: {
      // TODO: the entry id of the "Which Rehbar would you like?" question
      rehbarName: 'entry.0000000002',
    },
  },

  /** Schools, NGOs, embassies, donors */
  contact: {
    url: `https://docs.google.com/forms/d/e/${PLACEHOLDER}/viewform`,
    prefill: {
      // TODO: optional. A question like "What is this about?" so the Schools page can pre-fill it.
      topic: 'entry.0000000003',
    },
  },
} satisfies Record<string, FormConfig>

export type FormKey = keyof typeof forms

/** True once a real Google Form URL has been pasted in. */
export function isFormConfigured(form: FormConfig): boolean {
  return Boolean(form.url) && !form.url.includes(PLACEHOLDER)
}

/** True once a real entry id has been pasted in (placeholders are all zeros). */
function isEntryConfigured(entryId: string | undefined): entryId is string {
  return Boolean(entryId) && !/^entry\.0+\d$/.test(entryId as string)
}

/**
 * Build the link to open a form, optionally pre-filled.
 * Example: formLink(forms.mentorshipRequest, { rehbarName: 'Sample Rehbar 1' })
 */
export function formLink(form: FormConfig, values?: Record<string, string>): string {
  if (!values || !form.prefill) return form.url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    const entryId = form.prefill[key]
    if (isEntryConfigured(entryId) && value) params.set(entryId, value)
  }
  if ([...params.keys()].length === 0) return form.url
  params.set('usp', 'pp_url')
  return `${form.url}?${params.toString()}`
}

/** URL for the embedded (iframe) version of a form. */
export function formEmbedLink(form: FormConfig, values?: Record<string, string>): string {
  const link = formLink(form, values)
  return link + (link.includes('?') ? '&' : '?') + 'embedded=true'
}
