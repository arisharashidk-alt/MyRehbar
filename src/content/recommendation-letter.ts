import type { Resource } from '../types'

// TODO-REVIEW: Read and edit this guide, then set draft: false.
const guide: Resource = {
  slug: 'recommendation-letter',
  title: 'How to ask for a recommendation letter',
  summary: 'Who to ask, when to ask, and how to make it easy for them to write a strong letter.',
  readingMinutes: 3,
  draft: true,
  sections: [
    {
      heading: 'What is a recommendation letter?',
      paragraphs: [
        'It is a letter from a teacher or another adult who knows you well. It tells the scholarship team why you deserve the chance.',
      ],
    },
    {
      heading: 'Who to ask',
      list: [
        'A teacher who knows your work and your attitude, not just your marks.',
        'A principal, coach, or the leader of a group you volunteer with.',
        'Not family members. Most programs do not accept letters from relatives.',
      ],
    },
    {
      heading: 'How to ask',
      steps: [
        'Ask at least one month before the deadline.',
        'Ask politely, in person if you can. Explain what the scholarship is.',
        'Give them a short note: your achievements, your goals, and the deadline.',
        'Tell them exactly how to submit the letter (email, upload link, or sealed envelope).',
        'Send a kind reminder one week before the deadline.',
        'Say thank you, and tell them the result.',
      ],
    },
  ],
}

export default guide
