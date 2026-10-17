import type { Resource } from '../types'

// TODO-REVIEW: Read and edit this guide, then set draft: false.
const guide: Resource = {
  slug: 'personal-statement',
  title: 'How to write a personal statement',
  summary: 'Tell your real story in simple, clear words. Here is a step-by-step way to do it.',
  readingMinutes: 5,
  draft: true,
  sections: [
    {
      heading: 'What is a personal statement?',
      paragraphs: [
        'A personal statement is a short essay about you. It tells the reader who you are, what you want to study, and why.',
        'It is your chance to show the person behind your grades.',
      ],
    },
    {
      heading: 'Your background is a strength',
      paragraphs: [
        'You do not need a dramatic story. Real, honest details are stronger than big words.',
        'If you helped your family, worked while studying, or taught yourself something, that shows effort and responsibility. Readers value this.',
      ],
    },
    {
      heading: 'A simple plan',
      steps: [
        'Read the question carefully. Answer exactly what it asks.',
        'Write down three moments that shaped you. Pick the strongest one to start with.',
        'Explain what you want to study, and connect it to your experience.',
        'Say what you will do with your education, for you and for your community.',
        'Write a first draft without worrying about perfect English.',
        'Read it out loud. Cut anything that does not sound like you.',
        'Ask your Rehbar or a teacher to give feedback. Then edit.',
      ],
    },
    {
      heading: 'Common mistakes',
      list: [
        'Copying essays from the internet. Readers can tell, and it can get you rejected.',
        'Using long, difficult words you would not normally use.',
        'Listing achievements without explaining why they matter.',
        'Going over the word limit.',
      ],
    },
  ],
}

export default guide
