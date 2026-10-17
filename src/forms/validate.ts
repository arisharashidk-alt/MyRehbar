import type { Dictionary } from '../i18n/en'
import { fmt } from '../i18n'
import type { FieldDef, FormDef } from './schema'

export type Values = Record<string, string | boolean>
export type Errors = Partial<Record<string, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[\d\s()-]{7,20}$/

export const maxLengthOf = (f: FieldDef) => f.maxLength ?? (f.type === 'textarea' ? 1000 : 200)

const text = (v: string | boolean | undefined) => (typeof v === 'string' ? v.trim() : '')

/** Returns an error message per field name. Empty object = all good. */
export function validate(def: FormDef, values: Values, t: Dictionary): Errors {
  const errors: Errors = {}

  for (const f of def.fields) {
    const v = values[f.name]
    if (f.type === 'checkbox') {
      if (f.required && v !== true) errors[f.name] = t.forms.errorTick
      continue
    }
    const s = text(v)
    if (!s) {
      if (f.required) errors[f.name] = t.forms.errorRequired
      continue
    }
    if (s.length > maxLengthOf(f)) errors[f.name] = fmt(t.forms.errorTooLong, { max: maxLengthOf(f) })
    else if (f.type === 'email' && !EMAIL.test(s)) errors[f.name] = t.forms.errorEmail
    else if (f.type === 'tel' && !PHONE.test(s)) errors[f.name] = t.forms.errorPhone
    else if (f.type === 'url' && !isHttpsUrl(s)) errors[f.name] = t.forms.errorUrl
    else if ((f.type === 'select' || f.type === 'radio') && !f.options.includes(s)) errors[f.name] = t.forms.errorRequired
  }

  // e.g. phone OR email
  if (def.atLeastOne && def.atLeastOne.every((name) => !text(values[name]))) {
    const first = def.atLeastOne[0]
    if (!errors[first]) errors[first] = t.forms.errorContact
  }

  return errors
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
