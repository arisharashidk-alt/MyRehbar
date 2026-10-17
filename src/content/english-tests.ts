import type { Resource } from '../types'

// TODO-REVIEW: Read and edit this guide, then set draft: false.
// Do not add prices or test dates here: they change often. Always send students to the official sites.
const guide: Resource = {
  slug: 'english-tests',
  title: 'Common English tests: an overview',
  summary: 'IELTS, TOEFL, Duolingo and PTE: what they are and how to choose.',
  readingMinutes: 3,
  draft: true,
  sections: [
    {
      heading: 'Do I need an English test?',
      paragraphs: [
        'Many universities abroad ask for an English test. Some do not, or accept other proof, such as a letter saying your studies were in English.',
        'Check the rules of each university and scholarship before you book a test.',
      ],
    },
    {
      heading: 'The main tests',
      list: [
        'IELTS Academic: tests reading, writing, listening and speaking. Accepted in many countries.',
        'TOEFL iBT: also tests all four skills. Common for universities in the United States.',
        'Duolingo English Test: taken online at home. Accepted by a growing number of universities.',
        'PTE Academic: taken on a computer at a test centre. Accepted in many countries.',
      ],
    },
    {
      heading: 'How to choose',
      steps: [
        'List the universities and scholarships you want to apply to.',
        'Check which tests each one accepts, and the minimum score.',
        'Choose a test that all (or most) of them accept.',
        'Check the official test website for current prices, dates and test centres.',
        'Ask about fee waivers or support. Some programs and organisations can help.',
      ],
    },
    {
      heading: 'Free ways to prepare',
      list: [
        'Free practice tests on the official test websites.',
        'Reading English news and listening to English podcasts every day.',
        'Practising speaking with your Rehbar.',
      ],
    },
  ],
}

export default guide
