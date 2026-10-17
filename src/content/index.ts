/**
 * All guides shown on /resources, in this order.
 * To add a guide: copy one of the files in this folder, change the content, and add it below.
 */
import type { Resource } from '../types'
import howScholarshipsWork from './how-scholarships-work'
import personalStatement from './personal-statement'
import recommendationLetter from './recommendation-letter'
import interviewPrep from './interview-prep'
import englishTests from './english-tests'

export const resources: Resource[] = [
  howScholarshipsWork,
  personalStatement,
  recommendationLetter,
  interviewPrep,
  englishTests,
]

export const getResource = (slug: string | undefined) => resources.find((r) => r.slug === slug)
