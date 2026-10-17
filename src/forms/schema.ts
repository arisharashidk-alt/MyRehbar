/**
 * The questions in each MyRehbar form.
 *
 * Question text lives in src/i18n/en.ts -> formFields and formOptions.
 *
 * IMPORTANT: if you add, remove or rename a question here, make the same change in
 * google-apps-script/Code.gs (the FORMS list), or the answer will not be saved.
 */
import type { Dictionary } from '../i18n/en'

export type FormId = 'student' | 'rehbar' | 'request' | 'contact'
export type FieldName = keyof Dictionary['formFields']
export type OptionGroup = keyof Dictionary['formOptions']

interface BaseField {
  name: FieldName
  required?: boolean
  /** Max characters. Defaults: 200 for short answers, 1000 for long answers. */
  maxLength?: number
  /** Show half-width next to another half field on larger screens */
  half?: boolean
  /** Browser autofill hint, e.g. "name", "email", "tel" */
  autoComplete?: string
}

export type FieldDef =
  | (BaseField & { type: 'text' | 'email' | 'tel' | 'url' })
  | (BaseField & { type: 'textarea'; rows?: number })
  | (BaseField & { type: 'select' | 'radio'; group: OptionGroup; options: string[] })
  | (BaseField & { type: 'checkbox' })

export interface FormDef {
  id: FormId
  fields: FieldDef[]
  /** At least one of these must be filled in (e.g. phone OR email). */
  atLeastOne?: FieldName[]
}

const AGES = ['under14', '14', '15', '16', '17', '18', '19', '20', 'over20']
const FIELD_IDS = ['engineering', 'medicine', 'business', 'cs', 'arts', 'social-sciences', 'law', 'sciences']

export const studentForm: FormDef = {
  id: 'student',
  atLeastOne: ['phone', 'email'],
  fields: [
    { name: 'fullName', type: 'text', required: true, maxLength: 100, autoComplete: 'name' },
    { name: 'age', type: 'select', required: true, group: 'age', options: AGES, half: true },
    { name: 'city', type: 'text', required: true, maxLength: 100, half: true },
    { name: 'school', type: 'text', required: true, maxLength: 150 },
    {
      name: 'studyLevel',
      type: 'select',
      required: true,
      group: 'studyLevel',
      options: ['matric', 'inter', 'finished', 'university', 'other'],
    },
    { name: 'phone', type: 'tel', maxLength: 30, autoComplete: 'tel', half: true },
    { name: 'email', type: 'email', maxLength: 150, autoComplete: 'email', half: true },
    { name: 'contactOwner', type: 'radio', required: true, group: 'contactOwner', options: ['mine', 'parent', 'teacher'] },
    { name: 'fieldInterest', type: 'select', required: true, group: 'fieldInterest', options: [...FIELD_IDS, 'unsure'] },
    { name: 'scholarship', type: 'text', maxLength: 200 },
    { name: 'womanRehbar', type: 'radio', group: 'womanRehbar', options: ['yes', 'any'] },
    { name: 'internet', type: 'radio', group: 'internet', options: ['home', 'phone', 'school', 'none'] },
    { name: 'needs', type: 'textarea', maxLength: 1000 },
    { name: 'guardianAware', type: 'checkbox', required: true },
    { name: 'consent', type: 'checkbox', required: true },
  ],
}

export const requestForm: FormDef = {
  id: 'request',
  atLeastOne: ['phone', 'email'],
  fields: [
    { name: 'rehbar', type: 'text', required: true, maxLength: 100 },
    { name: 'fullName', type: 'text', required: true, maxLength: 100, autoComplete: 'name' },
    { name: 'age', type: 'select', required: true, group: 'age', options: AGES, half: true },
    { name: 'city', type: 'text', required: true, maxLength: 100, half: true },
    { name: 'phone', type: 'tel', maxLength: 30, autoComplete: 'tel', half: true },
    { name: 'email', type: 'email', maxLength: 150, autoComplete: 'email', half: true },
    { name: 'contactOwner', type: 'radio', required: true, group: 'contactOwner', options: ['mine', 'parent', 'teacher'] },
    { name: 'needs', type: 'textarea', required: true, maxLength: 1000 },
    { name: 'guardianAware', type: 'checkbox', required: true },
    { name: 'consent', type: 'checkbox', required: true },
  ],
}

export const rehbarForm: FormDef = {
  id: 'rehbar',
  fields: [
    { name: 'fullName', type: 'text', required: true, maxLength: 100, autoComplete: 'name' },
    { name: 'email', type: 'email', required: true, maxLength: 150, autoComplete: 'email', half: true },
    { name: 'phone', type: 'tel', maxLength: 30, autoComplete: 'tel', half: true },
    { name: 'university', type: 'text', required: true, maxLength: 150 },
    { name: 'program', type: 'text', required: true, maxLength: 150, half: true },
    { name: 'field', type: 'select', required: true, group: 'field', options: FIELD_IDS, half: true },
    { name: 'country', type: 'text', required: true, maxLength: 80, autoComplete: 'country-name', half: true },
    { name: 'languages', type: 'text', required: true, maxLength: 150, half: true },
    { name: 'hours', type: 'radio', required: true, group: 'hours', options: ['week1', 'week2', 'month2'] },
    { name: 'gender', type: 'radio', group: 'gender', options: ['woman', 'man', 'none'] },
    { name: 'background', type: 'textarea', required: true, maxLength: 1500, rows: 6 },
    { name: 'linkedin', type: 'url', maxLength: 200, autoComplete: 'url' },
    { name: 'conduct', type: 'checkbox', required: true },
    { name: 'consent', type: 'checkbox', required: true },
  ],
}

export const contactForm: FormDef = {
  id: 'contact',
  fields: [
    { name: 'fullName', type: 'text', required: true, maxLength: 100, autoComplete: 'name' },
    { name: 'organisation', type: 'text', maxLength: 150, autoComplete: 'organization' },
    { name: 'email', type: 'email', required: true, maxLength: 150, autoComplete: 'email', half: true },
    { name: 'phone', type: 'tel', maxLength: 30, autoComplete: 'tel', half: true },
    {
      name: 'topic',
      type: 'select',
      required: true,
      group: 'topic',
      options: ['school', 'ngo', 'embassy', 'donor', 'media', 'other'],
    },
    { name: 'message', type: 'textarea', required: true, maxLength: 2000, rows: 6 },
    { name: 'consent', type: 'checkbox', required: true },
  ],
}
