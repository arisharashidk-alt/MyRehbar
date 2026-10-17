/**
 * English text for the whole site.
 * Keep sentences short and simple: many readers use English as a second language.
 *
 * src/i18n/ur.ts must have exactly the same keys (TypeScript will tell you if one is missing).
 * Placeholders like {count} are filled in by the code.
 */

// Fields of study. Used for Rehbar cards, filters and the forms.
const fields = {
  engineering: 'Engineering',
  medicine: 'Medicine',
  business: 'Business',
  cs: 'Computer Science',
  arts: 'Arts & Humanities',
  'social-sciences': 'Social Sciences',
  law: 'Law',
  sciences: 'Natural Sciences',
}

const en = {
  meta: {
    defaultTitle: "MyRehbar · Your guide to what's possible",
    defaultDescription:
      'Free mentors (Rehbars) and scholarship guidance for students in Pakistan.',
  },

  brand: {
    tagline: "Your guide to what's possible.",
    mission:
      "Students don't fail because they lack money. They rule themselves out because nobody told them funding exists.",
    missionPart1: "Students don't fail because they lack money.",
    missionPart2: 'They rule themselves out because nobody told them funding exists.',
  },

  nav: {
    skip: 'Skip to main content',
    home: 'Home',
    rehbars: 'Find a Rehbar',
    scholarships: 'Scholarships',
    students: 'For Students',
    becomeRehbar: 'Become a Rehbar',
    resources: 'Guides',
    schools: 'Schools',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNav: 'Main',
    language: 'Language',
  },

  common: {
    requestRehbar: 'Request this Rehbar',
    viewProfile: 'View profile',
    viewDetails: 'View details',
    readGuide: 'Read guide',
    officialWebsite: 'Official website',
    opensNewTab: '(opens in a new tab)',
    sample: 'Sample',
    draft: 'Draft',
    lastVerified: 'Last verified: {date}',
    notVerified: 'Not verified yet',
    checkOfficial: 'Always check the official website for the latest details.',
    deadline: 'Deadline',
    deadlineUnknown: 'Check official website',
    closed: 'Closed',
    daysLeft: '{count} days left',
    applicationWindow: 'Application window',
    level: 'Level',
    country: 'Country',
    funding: 'Funding',
    eligibility: 'Who can apply',
    languages: 'Languages',
    field: 'Field',
    availability: 'Availability',
    back: 'Back',
    backToRehbars: 'All Rehbars',
    backToScholarships: 'All scholarships',
    backToGuides: 'All guides',
    minutesRead: '{count} min read',
    seeAllRehbars: 'See all Rehbars',
    seeAllScholarships: 'See all scholarships',
    free: 'Free',
  },

  forms: {
    optional: 'optional',
    submit: 'Send',
    submitting: 'Sending…',
    privacyNote:
      'Your answers are sent securely and saved in a private sheet. Only the MyRehbar team can see them.',
    privacyLink: 'Read our privacy note',
    successTitle: 'Thank you! We got your answers.',
    successText: 'Our team will read them and contact you soon. Please keep your phone or email handy.',
    sendAnother: 'Send another response',
    errorSummary: 'Please fix the highlighted questions.',
    errorRequired: 'Please answer this question.',
    errorTick: 'Please tick this box to continue.',
    errorEmail: 'Please enter a valid email, like name@example.com.',
    errorPhone: 'Please enter a valid phone number, like 0300 1234567.',
    errorUrl: 'Please enter a full link starting with https://',
    errorContact: 'Please give a phone number or an email, so we can reach you.',
    errorTooLong: 'This is too long. Please keep it under {max} characters.',
    errorSend: 'Sorry, your answers could not be sent. Please check your internet and try again.',
    errorBusy: 'We are getting a lot of messages right now. Please try again in a minute.',
    notReady: 'This form is not set up yet. Please check back soon, or contact us.',
    charsLeft: '{count} characters left',
  },

  // Labels for every form question. `hint` is the small grey help text ('' for none).
  formFields: {
    fullName: { label: 'Full name', hint: '' },
    age: { label: 'Age', hint: '' },
    city: { label: 'City or area', hint: 'For example: Lyari, Karachi' },
    school: { label: 'School or college', hint: '' },
    studyLevel: { label: 'What are you studying now?', hint: '' },
    phone: { label: 'Phone or WhatsApp number', hint: 'Only the MyRehbar team will see this.' },
    email: { label: 'Email', hint: 'Only the MyRehbar team will see this.' },
    contactOwner: { label: 'Whose phone or email is this?', hint: '' },
    fieldInterest: { label: 'What would you like to study?', hint: '' },
    scholarship: { label: 'Is there a scholarship you want help with?', hint: 'Leave this empty if you are not sure yet.' },
    womanRehbar: { label: 'Would you like a woman Rehbar?', hint: '' },
    internet: { label: 'How do you usually get online?', hint: '' },
    needs: { label: 'What do you need help with?', hint: 'A few sentences is enough. You can write in English or Urdu.' },
    guardianAware: { label: 'I am 18 or older, or a parent or teacher knows I am signing up.', hint: '' },
    consent: { label: 'I agree that MyRehbar can save my answers and use them to contact me.', hint: '' },
    rehbar: { label: 'Which Rehbar would you like?', hint: '' },
    university: { label: 'University or organisation', hint: '' },
    program: { label: 'Degree or program', hint: 'For example: BBA, MBBS, MSc Computer Science' },
    country: { label: 'Country you live in', hint: '' },
    field: { label: 'Field', hint: '' },
    languages: { label: 'Languages you can mentor in', hint: 'For example: English, Urdu, Sindhi' },
    hours: { label: 'How much time can you give?', hint: '' },
    gender: { label: 'Gender', hint: 'This helps us match girls who ask for a woman Rehbar.' },
    background: { label: 'Tell us about your background', hint: 'Where did you grow up? Why do you want to be a Rehbar?' },
    linkedin: { label: 'LinkedIn profile', hint: 'Helps us check your background.' },
    conduct: { label: 'I agree to follow the MyRehbar code of conduct and safeguarding rules.', hint: '' },
    organisation: { label: 'Organisation', hint: '' },
    topic: { label: 'What is this about?', hint: '' },
    message: { label: 'Message', hint: '' },
  },

  // Answer choices. The order shown in the form is set in src/forms/schema.ts.
  formOptions: {
    age: {
      under14: 'Under 14',
      '14': '14',
      '15': '15',
      '16': '16',
      '17': '17',
      '18': '18',
      '19': '19',
      '20': '20',
      over20: 'Over 20',
    },
    studyLevel: {
      matric: 'Class 9–10 (Matric / O Levels)',
      inter: 'Class 11–12 (Intermediate / A Levels)',
      finished: 'Finished school or college',
      university: 'At university',
      other: 'Other',
    },
    contactOwner: {
      mine: 'Mine',
      parent: 'My parent’s or guardian’s',
      teacher: 'My teacher’s',
    },
    fieldInterest: { ...fields, unsure: 'Not sure yet' },
    field: fields,
    womanRehbar: {
      yes: 'Yes, please',
      any: 'No preference',
    },
    internet: {
      home: 'Internet at home',
      phone: 'Only on a phone',
      school: 'Only at school',
      none: 'I usually have no internet',
    },
    hours: {
      week1: 'About 1 hour per week',
      week2: '2 hours or more per week',
      month2: 'About 2 hours per month',
    },
    gender: {
      woman: 'Woman',
      man: 'Man',
      none: 'Prefer not to say',
    },
    topic: {
      school: 'Bring MyRehbar to my school',
      ngo: 'NGO partnership',
      embassy: 'Embassy or scholarship program',
      donor: 'Donating or funding',
      media: 'Media or press',
      other: 'Something else',
    },
  },

  request: {
    title: 'Request a Rehbar',
    intro:
      'Tell us a little about yourself. Our team will check your request and connect you with the Rehbar safely.',
    requesting: 'You are asking for',
    changeRehbar: 'Choose a different Rehbar',
    formTitle: 'Your details',
  },

  filters: {
    search: 'Search',
    searchRehbars: 'Name, university or field',
    searchScholarships: 'Name or provider',
    allFields: 'All fields',
    allCountries: 'All countries',
    pakistan: 'In Pakistan',
    abroad: 'Abroad',
    allLanguages: 'All languages',
    allLevels: 'All levels',
    womenOnly: 'Women Rehbars only',
    scholarshipRecipients: 'Scholarship recipients',
    fullyFundedOnly: 'Fully funded only',
    openForPakistani: 'Open to Pakistani students',
    deadlineUpcoming: 'Deadline coming up',
    sortBy: 'Sort by',
    sortDeadline: 'Nearest deadline',
    sortName: 'Name (A–Z)',
    clear: 'Clear filters',
    results: '{count} results',
    oneResult: '1 result',
    filters: 'Filters',
  },

  empty: {
    rehbarsTitle: 'No Rehbars match your search',
    rehbarsText: 'Try fewer filters, or sign up and we will find a Rehbar for you.',
    scholarshipsTitle: 'No scholarships match your search',
    scholarshipsText: 'Try fewer filters. New scholarships are added often.',
    notFoundRehbar: 'We could not find this Rehbar.',
    notFoundScholarship: 'We could not find this scholarship.',
    notFoundGuide: 'We could not find this guide.',
  },

  fields,

  levels: {
    undergraduate: 'Undergraduate',
    masters: "Master's",
    phd: 'PhD',
    exchange: 'Exchange',
  },

  funding: {
    full: 'Fully funded',
    partial: 'Partial funding',
  },

  helpsWith: {
    'choosing-field': 'Choosing a field',
    applications: 'Scholarship applications',
    essays: 'Essays and personal statements',
    interviews: 'Interview practice',
    'english-tests': 'English tests',
    'university-life': 'University life',
  },

  home: {
    eyebrow: 'Free mentorship for students in Pakistan',
    heroText:
      'MyRehbar connects you with a free mentor, called a Rehbar, who has walked the same road and can help you find and apply for scholarships.',
    ctaStudent: "I'm a student, find a Rehbar",
    ctaRehbar: 'Become a Rehbar',
    howTitle: 'How it works',
    howIntro: 'Three simple steps. Everything is free.',
    steps: [
      {
        title: 'Sign up',
        text: 'Fill in one short form. It takes about 5 minutes. No account needed.',
      },
      {
        title: 'Get matched with a Rehbar',
        text: 'We connect you with a mentor who studies what you want to study.',
      },
      {
        title: 'Apply with guidance',
        text: 'Your Rehbar helps you choose scholarships, write your essays and prepare.',
      },
    ],
    founderEyebrow: 'Why MyRehbar exists',
    // Founder story. Shown on the Home and About pages.
    founderTitle: 'Someone showed me the door. Now we hold it open.',
    founderText: [
      'My family could not afford big schools. So I never let myself dream of top universities. I thought they were for other people.',
      'Then a mentor sat with me and told me what nobody had told me before: scholarships are real, and they are for students like me. I applied, and I got a 100% scholarship to IBA Karachi.',
      'MyRehbar exists so that every student gets that same conversation.',
    ],
    founderName: 'Founder, MyRehbar',
    featuredScholarshipsTitle: 'Scholarships you can apply for',
    featuredScholarshipsIntro: 'Funding exists. Here are a few places to start.',
    featuredRehbarsTitle: 'Meet some Rehbars',
    featuredRehbarsIntro: 'Students and graduates who came from places like yours.',
    impactTitle: 'Our impact so far',
    finalTitle: 'Your future is not decided by your bank balance.',
    finalText: 'Talk to a Rehbar. It is free, and it could change everything.',
    finalCta: 'Find a Rehbar',
  },

  stats: {
    studentsReached: 'Students reached',
    rehbars: 'Rehbars',
    schoolsVisited: 'Schools visited',
    scholarshipsWon: 'Scholarships won',
  },

  rehbars: {
    title: 'Find a Rehbar',
    intro:
      'A Rehbar is a volunteer mentor. They are students and graduates from top universities in Pakistan and abroad. Many grew up just like you.',
    womenNote:
      'Girls and families: you can choose a woman Rehbar. Use the "Women Rehbars only" filter.',
    helpTitle: 'What {name} can help with',
    storyTitle: 'My story',
    requestNote:
      'We never share Rehbars’ phone numbers or emails. Send a request and our team will connect you safely.',
    notSure: 'Not sure who to pick?',
    notSureText: 'Sign up and we will choose a Rehbar for you.',
    notSureCta: 'Sign up as a student',
  },

  scholarships: {
    title: 'Scholarships',
    intro:
      'Many scholarships pay for everything: fees, books, travel and living costs. Here are some that Pakistani students can apply for.',
    disclaimerTitle: 'Before you apply',
    disclaimer:
      'Details change every year. Always check the official website for the latest dates and rules.',
    aboutTitle: 'About this scholarship',
    coversTitle: 'What it pays for',
    howToApplyTitle: 'How to apply',
    defaultSteps: [
      'Read the official website carefully, including who can apply.',
      'Make a list of the documents you need (transcripts, ID, letters).',
      'Ask for recommendation letters at least one month early.',
      'Write your personal statement and ask your Rehbar to review it.',
      'Submit before the deadline, and save a copy of everything.',
    ],
    getHelpTitle: 'Want help applying?',
    getHelpText: 'A Rehbar can help you plan, write your essays and prepare for interviews.',
    getHelpCta: 'Get a Rehbar to help you apply',
  },

  students: {
    title: 'For Students',
    intro:
      'MyRehbar is for any student in Pakistan who wants to study further but does not know where to start.',
    whoTitle: 'Who is it for?',
    whoList: [
      'Students aged 14 to 20, in school, college or just finished.',
      'Students whose families cannot pay for university.',
      'Students who will be the first in their family to go to university.',
      'Girls and boys, from any city or background.',
    ],
    freeTitle: 'What is free?',
    freeText: 'Everything. MyRehbar never asks for money. If someone asks you to pay, tell us.',
    expectTitle: 'What to expect',
    expectList: [
      'You fill in a short sign-up form.',
      'Our team reads it and matches you with a Rehbar.',
      'You meet your Rehbar online or in a group session.',
      'Your Rehbar helps you find scholarships and apply.',
    ],
    faqTitle: 'Questions students ask',
    faq: [
      {
        q: 'Is it really free?',
        a: 'Yes. Rehbars are volunteers. There is no fee now and no fee later.',
      },
      {
        q: 'Do I need good English?',
        a: 'No. Many Rehbars speak Urdu and other local languages. They can help you improve your English step by step.',
      },
      {
        q: 'Can girls join?',
        a: 'Yes, and we really want you to. You can ask for a woman Rehbar. Many of our Rehbars are women who went through the same thing.',
      },
      {
        q: 'My parents are worried. What should I tell them?',
        a: 'Tell them MyRehbar is free and safe. Sessions for students under 18 happen in groups or with a teacher or parent present. Rehbars do not contact students privately on social media. Your parents are welcome to contact us with any questions.',
      },
      {
        q: 'I do not have a laptop or good internet. Can I still join?',
        a: 'Yes. The site works on a phone. Tell us in the form, and we will try to arrange sessions at your school or help with internet access.',
      },
    ],
    signupTitle: 'Sign up as a student',
    signupText:
      'It takes about 5 minutes. If you are under 18, please sign up with a parent or teacher knowing.',
  },

  become: {
    title: 'Become a Rehbar',
    intro:
      'Be the person you needed when you were 16. Give one hour a week and help a student see what is possible.',
    whyTitle: 'Why mentor?',
    whyList: [
      'Many talented students never apply because nobody told them they could.',
      'One conversation can change the direction of a life.',
      'You already know the path. You can save someone years of guessing.',
    ],
    timeTitle: 'Time commitment',
    timeText:
      'About 1 hour per week, for at least 3 months. Sessions are online, so you can mentor from anywhere in the world.',
    goodTitle: 'What makes a good Rehbar',
    goodList: [
      'You are a student or graduate of a good university in Pakistan or abroad.',
      'You come from a similar background, or you understand it well. This matters most.',
      'You are patient, kind and reliable.',
      'You can explain things in simple words, in English or Urdu.',
    ],
    conductTitle: 'Code of conduct (summary)',
    conductList: [
      'Be respectful and kind. Never judge a student for their background.',
      'Never ask a student for money or favours.',
      'Give honest advice. Never promise a scholarship.',
      'Keep students’ information private.',
    ],
    safeTitle: 'Safeguarding',
    safeList: [
      'Sessions with students under 18 happen in groups or in supervised settings.',
      'No private contact on social media or personal messaging apps.',
      'Use only the channels the MyRehbar team sets up.',
      'If you are worried about a student’s safety, report it to the team right away.',
    ],
    applyTitle: 'Apply to be a Rehbar',
    applyText: 'Tell us about yourself. We review every application and reply by email.',
  },

  resources: {
    title: 'Guides',
    intro: 'Simple guides to help you understand scholarships and prepare strong applications.',
  },

  schools: {
    title: 'MyRehbar in Schools',
    intro:
      'We visit schools to tell students that scholarships exist, and then we stay with them while they apply.',
    pilot: 'Our pilot starts in Lyari and Kati Pahari, Karachi.',
    programTitle: 'What the program includes',
    program: [
      {
        title: 'Awareness sessions',
        text: 'A short, friendly talk at your school about scholarships, universities and what is possible.',
      },
      {
        title: 'Online sessions with Rehbars',
        text: 'Students meet Rehbars from around the world in group video sessions at school.',
      },
      {
        title: 'Follow-up mentorship',
        text: 'Interested students are matched with a Rehbar for regular guidance.',
      },
      {
        title: 'Internet access support',
        text: 'We help schools find ways for students to get online for sessions and applications.',
      },
    ],
    timelineTitle: 'The first 90 days',
    timeline: [
      {
        label: 'Month 1',
        title: 'Awareness',
        text: 'School visit and awareness session. Students who are interested sign up.',
      },
      {
        label: 'Month 2',
        title: 'Matching',
        text: 'Students are matched with Rehbars and start online group sessions.',
      },
      {
        label: 'Month 3',
        title: 'Applying',
        text: 'Students shortlist scholarships and start their applications with their Rehbar.',
      },
    ],
    ctaTitle: 'Bring MyRehbar to your school',
    ctaText: 'Are you a teacher, principal or NGO? Tell us about your school. It is free.',
    ctaButton: 'Contact us about your school',
  },

  about: {
    title: 'About MyRehbar',
    intro: '"Rehbar" (رہبر) means "guide" in Urdu. That is what we want to be for every student.',
    storyTitle: 'Our story',
    missionTitle: 'Our mission',
    missionText:
      'To make sure no student in Pakistan rules themselves out of education because nobody told them that funding exists.',
    valuesTitle: 'What we believe',
    values: [
      { title: 'Free, always', text: 'Students never pay. Not now, not later.' },
      {
        title: 'Guides who understand',
        text: 'Our Rehbars often come from the same communities as our students.',
      },
      { title: 'Girls belong here', text: 'We work hard to make girls and their families feel safe and welcome.' },
      { title: 'Honest advice', text: 'We never promise results. We help students make their best attempt.' },
    ],
    sdgTitle: 'Global Goals we work towards',
    sdgIntro: 'Our work supports these United Nations Sustainable Development Goals.',
    sdgs: [
      { number: '4', title: 'Quality Education' },
      { number: '5', title: 'Gender Equality' },
      { number: '10', title: 'Reduced Inequalities' },
    ],
    partnersTitle: 'Partners',
    partnersEmpty: 'We are looking for our first partners: schools, NGOs, embassies and scholarship programs.',
    partnersCta: 'Partner with us',
  },

  contact: {
    title: 'Contact and partnerships',
    intro:
      'We work with schools, NGOs, embassies, scholarship programs and donors. We would love to hear from you.',
    whoList: [
      'Schools: bring an awareness session to your students.',
      'NGOs: refer students or run sessions together.',
      'Embassies and scholarship programs: help students learn about your programs.',
      'Donors: help pay for internet access and school visits.',
    ],
    formTitle: 'Send us a message',
    emailLabel: 'Email',
    socialTitle: 'Follow us',
    studentNote: 'Are you a student? Please use the student sign-up form instead.',
  },

  privacy: {
    title: 'Privacy',
    intro: 'This is our privacy note in plain language.',
    sections: [
      {
        heading: 'What we collect',
        text: 'This website does not have accounts and does not save anything about you. When you fill in one of our forms, we collect only what you type into that form, such as your name, city, school and how to contact you.',
      },
      {
        heading: 'Where it goes',
        text: 'Your answers are sent securely (encrypted) to a private Google Sheet owned by the MyRehbar team. Only the team can open it. The website itself does not keep a copy.',
      },
      {
        heading: 'How we use it',
        text: 'We use your answers only to match you with a Rehbar and to contact you about MyRehbar. We never sell your data, and we never share it with advertisers.',
      },
      {
        heading: 'Rehbars’ contact details',
        text: 'We never show Rehbars’ phone numbers or emails on this website. All requests go through our team.',
      },
      {
        heading: 'Students under 18',
        text: 'If you are under 18, please sign up with your parent or a teacher knowing. Sessions for students under 18 happen in groups or with supervision.',
      },
      {
        heading: 'Cookies and tracking',
        text: 'This website does not use advertising cookies or tracking. It only remembers your language choice (English or Urdu) on your device.',
      },
      {
        heading: 'Delete your data',
        text: 'You can ask us to delete your form answers at any time. Use the contact form and we will do it.',
      },
    ],
  },

  footer: {
    quickLinks: 'Quick links',
    social: 'Follow us',
    madeIn: 'Made in Karachi',
    privacyNote: 'No accounts, no tracking. Form answers go to a private sheet only our team can see.',
    privacyLink: 'Read our privacy note',
    rights: '© {year} MyRehbar',
  },

  notFound: {
    title: 'This page does not exist',
    text: 'The link may be old, or there may be a typo. Let’s get you back on track.',
    cta: 'Go to the home page',
  },
}

/** Same shape as `en`, but every text value is just `string` (so Urdu can have different text). */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> }

export type Dictionary = Widen<typeof en>

export default en as Dictionary
