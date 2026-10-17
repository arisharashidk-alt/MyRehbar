/**
 * Shared data types. The JSON files in src/data/ must match these shapes.
 * Optional fields (marked with ?) can be left out; pages will not crash.
 */

/** Field of study ids. Labels for each id live in src/i18n/en.ts -> fields. */
export type FieldId =
  | 'engineering'
  | 'medicine'
  | 'business'
  | 'cs'
  | 'arts'
  | 'social-sciences'
  | 'law'
  | 'sciences'

/** What a Rehbar can help with. Labels live in src/i18n/en.ts -> helpsWith. */
export type HelpId =
  | 'choosing-field'
  | 'applications'
  | 'essays'
  | 'interviews'
  | 'english-tests'
  | 'university-life'

export interface Rehbar {
  /** URL-safe id, e.g. "sample-rehbar-1". Used in /rehbars/:slug */
  slug: string
  name: string
  /** Optional photo path in /public, e.g. "/rehbars/ayesha.jpg". Initials are shown if empty. */
  photo?: string
  /** Current university or organisation */
  university: string
  /** Country they live or study in, e.g. "Pakistan", "United Kingdom" */
  country: string
  /** City, optional, e.g. "Karachi" */
  city?: string
  field: FieldId
  /** Program or subject, e.g. "BBA" or "MSc Computer Science" */
  program?: string
  /** One short line for the card */
  story: string
  /** Longer story for the profile page. Each string is one paragraph. */
  fullStory?: string[]
  /** Languages they can mentor in, e.g. ["English", "Urdu", "Sindhi"] */
  languages: string[]
  /** Free-text badges shown on the card, e.g. "First-generation student" */
  tags: string[]
  /** Used by the "Women Rehbars only" filter */
  woman?: boolean
  /** Used by the "Scholarship recipients" filter */
  scholarshipRecipient?: boolean
  helpsWith?: HelpId[]
  /** e.g. "1 hour per week" */
  availability?: string
  /** Show on the home page */
  featured?: boolean
  /** Placeholder entry. Shows a "Sample" badge. */
  sample?: boolean
}

export type LevelId = 'undergraduate' | 'masters' | 'phd' | 'exchange'
export type FundingType = 'full' | 'partial'

export interface Scholarship {
  slug: string
  name: string
  provider: string
  /** Country where you would study, e.g. "Pakistan", "United States" */
  country: string
  levels: LevelId[]
  fundingType: FundingType
  /** Short plain-English summary of who can apply */
  eligibility: string
  /** Longer description for the detail page */
  description?: string
  /** What the scholarship pays for, e.g. ["Tuition", "Monthly stipend"] */
  covers?: string[]
  /** Step-by-step checklist for the detail page */
  howToApply?: string[]
  officialUrl: string
  /** Free text, e.g. "Opens in February, closes in April" */
  applicationWindow?: string
  /** Exact deadline as "YYYY-MM-DD", or null if unknown. Used for sorting. */
  deadline?: string | null
  /** Date you last checked the official website, "YYYY-MM-DD" */
  lastVerified?: string | null
  openToPakistani: boolean
  featured?: boolean
  sample?: boolean
}

export interface ResourceSection {
  heading: string
  /** Each string is one paragraph */
  paragraphs?: string[]
  /** Optional bullet list */
  list?: string[]
  /** Optional numbered steps */
  steps?: string[]
}

export interface Resource {
  slug: string
  title: string
  summary: string
  readingMinutes: number
  sections: ResourceSection[]
  /** true until you have reviewed and edited the guide. Shows a "Draft" badge. */
  draft?: boolean
}
