import type { Resource } from '../types'

// TODO-REVIEW: Read and edit this guide, then set draft: false.
const guide: Resource = {
  slug: 'interview-prep',
  title: 'Preparing for a scholarship interview',
  summary: 'What interviewers want to know, common questions, and how to practise.',
  readingMinutes: 4,
  draft: true,
  sections: [
    {
      heading: 'What interviewers want to know',
      paragraphs: [
        'They want to understand who you are, why you chose your subject, and what you will do with the opportunity.',
        'They are not trying to trick you. Honest, clear answers are best.',
      ],
    },
    {
      heading: 'Common questions',
      list: [
        'Tell us about yourself.',
        'Why do you want to study this subject?',
        'Why this university or this scholarship?',
        'Tell us about a challenge you faced and what you learned.',
        'What will you do after you finish your studies?',
      ],
    },
    {
      heading: 'How to practise',
      steps: [
        'Read your own application again. Interviewers often ask about it.',
        'Write short notes for each common question. Do not memorise full answers.',
        'Practise out loud with your Rehbar, a teacher, or a friend.',
        'If the interview is online, test your internet, camera and a quiet place the day before.',
        'Prepare one or two questions to ask them at the end.',
      ],
    },
    {
      heading: 'On the day',
      list: [
        'Be on time, or join online 10 minutes early.',
        'It is okay to pause and think before you answer.',
        'If you do not understand a question, ask them to repeat it. That is normal.',
      ],
    },
  ],
}

export default guide
