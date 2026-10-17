/**
 * Impact numbers shown on the home page.
 *
 * TODO: Fill in ONLY real, current numbers.
 * Leave a value as `null` to hide it. If every value is null, the whole strip is hidden.
 * `suffix` is optional, e.g. '+'.
 */
export interface Stat {
  key: 'studentsReached' | 'rehbars' | 'schoolsVisited' | 'scholarshipsWon'
  value: number | null
  suffix?: string
}

export const stats: Stat[] = [
  { key: 'studentsReached', value: null }, // TODO: e.g. 250
  { key: 'rehbars', value: null }, // TODO
  { key: 'schoolsVisited', value: null }, // TODO
  { key: 'scholarshipsWon', value: null }, // TODO (optional)
]
