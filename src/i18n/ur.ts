import type { Dictionary } from './en'

/**
 * Urdu text. Same keys as en.ts.
 *
 * HOW TO TRANSLATE:
 * - Any value starting with "TODO-UR" is not translated yet. The site shows the English
 *   text for it until you replace it. The English is copied after "TODO-UR:" to help you.
 * - Replace the whole string (including "TODO-UR: ") with your Urdu text.
 * - Short UI strings below have a first-draft translation. Please review them too.
 * - Search this file for TODO-UR to see what is left.
 */
const ur: Dictionary = {
  meta: {
    defaultTitle: 'مائی رہبر · آپ کا رہنما',
    defaultDescription: 'TODO-UR: Free mentors (Rehbars) and scholarship guidance for students in Pakistan.',
  },

  brand: {
    tagline: 'جو ممکن ہے، اس کی طرف آپ کا رہنما۔',
    mission:
      'طلبہ پیسے کی کمی کی وجہ سے ناکام نہیں ہوتے۔ وہ خود کو اس لیے پیچھے کر لیتے ہیں کیونکہ کسی نے انہیں بتایا ہی نہیں کہ اسکالرشپ موجود ہیں۔',
    missionPart1: 'طلبہ پیسے کی کمی کی وجہ سے ناکام نہیں ہوتے۔',
    missionPart2: 'وہ خود کو اس لیے پیچھے کر لیتے ہیں کیونکہ کسی نے انہیں بتایا ہی نہیں کہ اسکالرشپ موجود ہیں۔',
  },

  nav: {
    skip: 'مرکزی مواد پر جائیں',
    home: 'ہوم',
    rehbars: 'رہبر تلاش کریں',
    scholarships: 'اسکالرشپس',
    students: 'طلبہ کے لیے',
    becomeRehbar: 'رہبر بنیں',
    resources: 'رہنمائی',
    schools: 'اسکول',
    about: 'ہمارے بارے میں',
    contact: 'رابطہ',
    privacy: 'رازداری',
    openMenu: 'مینو کھولیں',
    closeMenu: 'مینو بند کریں',
    mainNav: 'مرکزی',
    language: 'زبان',
  },

  common: {
    requestRehbar: 'اس رہبر سے رابطہ کریں',
    viewProfile: 'پروفائل دیکھیں',
    viewDetails: 'تفصیل دیکھیں',
    readGuide: 'پڑھیں',
    officialWebsite: 'سرکاری ویب سائٹ',
    opensNewTab: '(نئے ٹیب میں کھلے گا)',
    sample: 'نمونہ',
    draft: 'مسودہ',
    lastVerified: 'آخری تصدیق: {date}',
    notVerified: 'ابھی تصدیق نہیں ہوئی',
    checkOfficial: 'تازہ ترین معلومات کے لیے ہمیشہ سرکاری ویب سائٹ دیکھیں۔',
    deadline: 'آخری تاریخ',
    deadlineUnknown: 'سرکاری ویب سائٹ دیکھیں',
    closed: 'بند',
    daysLeft: '{count} دن باقی',
    applicationWindow: 'درخواست کا وقت',
    level: 'سطح',
    country: 'ملک',
    funding: 'فنڈنگ',
    eligibility: 'کون درخواست دے سکتا ہے',
    languages: 'زبانیں',
    field: 'شعبہ',
    availability: 'دستیابی',
    back: 'واپس',
    backToRehbars: 'تمام رہبر',
    backToScholarships: 'تمام اسکالرشپس',
    backToGuides: 'تمام رہنمائی',
    minutesRead: '{count} منٹ',
    seeAllRehbars: 'تمام رہبر دیکھیں',
    seeAllScholarships: 'تمام اسکالرشپس دیکھیں',
    free: 'مفت',
  },

  forms: {
    openForm: 'فارم کھولیں',
    showHere: 'اسی صفحے پر فارم بھریں',
    hide: 'فارم چھپائیں',
    notReady: 'TODO-UR: This form is not set up yet. Please check back soon, or contact us.',
    frameTitle: '{name} فارم',
    note: 'TODO-UR: The form is a Google Form. Your answers go only to the MyRehbar team.',
  },

  filters: {
    search: 'تلاش',
    searchRehbars: 'نام، یونیورسٹی یا شعبے سے تلاش کریں',
    searchScholarships: 'نام یا ادارے سے تلاش کریں',
    allFields: 'تمام شعبے',
    allCountries: 'تمام ممالک',
    pakistan: 'پاکستان میں',
    abroad: 'بیرونِ ملک',
    allLanguages: 'تمام زبانیں',
    allLevels: 'تمام سطحیں',
    womenOnly: 'صرف خواتین رہبر',
    scholarshipRecipients: 'اسکالرشپ حاصل کرنے والے',
    fullyFundedOnly: 'صرف مکمل فنڈڈ',
    openForPakistani: 'پاکستانی طلبہ کے لیے',
    deadlineUpcoming: 'آخری تاریخ قریب ہے',
    sortBy: 'ترتیب',
    sortDeadline: 'قریب ترین آخری تاریخ',
    sortName: 'نام (حروفِ تہجی)',
    clear: 'فلٹر ہٹائیں',
    results: '{count} نتائج',
    oneResult: '1 نتیجہ',
    filters: 'فلٹر',
  },

  empty: {
    rehbarsTitle: 'کوئی رہبر نہیں ملا',
    rehbarsText: 'TODO-UR: Try fewer filters, or sign up and we will find a Rehbar for you.',
    scholarshipsTitle: 'کوئی اسکالرشپ نہیں ملی',
    scholarshipsText: 'TODO-UR: Try fewer filters. New scholarships are added often.',
    notFoundRehbar: 'یہ رہبر نہیں ملا۔',
    notFoundScholarship: 'یہ اسکالرشپ نہیں ملی۔',
    notFoundGuide: 'یہ رہنمائی نہیں ملی۔',
  },

  fields: {
    engineering: 'انجینئرنگ',
    medicine: 'میڈیسن',
    business: 'بزنس',
    cs: 'کمپیوٹر سائنس',
    arts: 'آرٹس اور ہیومینیٹیز',
    'social-sciences': 'سوشل سائنسز',
    law: 'قانون',
    sciences: 'سائنس',
  },

  levels: {
    undergraduate: 'انڈرگریجویٹ',
    masters: 'ماسٹرز',
    phd: 'پی ایچ ڈی',
    exchange: 'ایکسچینج',
  },

  funding: {
    full: 'مکمل فنڈڈ',
    partial: 'جزوی فنڈنگ',
  },

  helpsWith: {
    'choosing-field': 'شعبے کا انتخاب',
    applications: 'اسکالرشپ کی درخواستیں',
    essays: 'مضامین اور پرسنل اسٹیٹمنٹ',
    interviews: 'انٹرویو کی تیاری',
    'english-tests': 'انگریزی کے ٹیسٹ',
    'university-life': 'یونیورسٹی کی زندگی',
  },

  home: {
    eyebrow: 'پاکستان کے طلبہ کے لیے مفت رہنمائی',
    heroText:
      'TODO-UR: MyRehbar connects you with a free mentor, called a Rehbar, who has walked the same road and can help you find and apply for scholarships.',
    ctaStudent: 'میں طالب علم ہوں، رہبر تلاش کریں',
    ctaRehbar: 'رہبر بنیں',
    howTitle: 'یہ کیسے کام کرتا ہے',
    howIntro: 'تین آسان مراحل۔ سب کچھ مفت ہے۔',
    steps: [
      {
        title: 'سائن اپ کریں',
        text: 'TODO-UR: Fill in one short form. It takes about 5 minutes. No account needed.',
      },
      {
        title: 'رہبر سے ملیں',
        text: 'TODO-UR: We connect you with a mentor who studies what you want to study.',
      },
      {
        title: 'رہنمائی کے ساتھ درخواست دیں',
        text: 'TODO-UR: Your Rehbar helps you choose scholarships, write your essays and prepare.',
      },
    ],
    founderEyebrow: 'مائی رہبر کیوں',
    founderTitle: 'TODO-UR: Someone showed me the door. Now we hold it open.',
    founderText: [
      'TODO-UR: My father drove a rickshaw in Karachi. I did not know that scholarships were real, or that they were for people like me.',
      'TODO-UR: Then a mentor sat with me and showed me what was possible. I applied, and I got a 100% scholarship to IBA Karachi.',
      'TODO-UR: MyRehbar exists so that every student gets that same conversation.',
    ],
    founderName: 'بانی، مائی رہبر',
    featuredScholarshipsTitle: 'اسکالرشپس جن کے لیے آپ درخواست دے سکتے ہیں',
    featuredScholarshipsIntro: 'TODO-UR: Funding exists. Here are a few places to start.',
    featuredRehbarsTitle: 'کچھ رہبروں سے ملیں',
    featuredRehbarsIntro: 'TODO-UR: Students and graduates who came from places like yours.',
    impactTitle: 'اب تک ہمارا کام',
    finalTitle: 'TODO-UR: Your future is not decided by your bank balance.',
    finalText: 'TODO-UR: Talk to a Rehbar. It is free, and it could change everything.',
    finalCta: 'رہبر تلاش کریں',
  },

  stats: {
    studentsReached: 'طلبہ تک رسائی',
    rehbars: 'رہبر',
    schoolsVisited: 'اسکولوں کے دورے',
    scholarshipsWon: 'حاصل کی گئی اسکالرشپس',
  },

  rehbars: {
    title: 'رہبر تلاش کریں',
    intro:
      'TODO-UR: A Rehbar is a volunteer mentor. They are students and graduates from top universities in Pakistan and abroad. Many grew up just like you.',
    womenNote:
      'TODO-UR: Girls and families: you can choose a woman Rehbar. Use the "Women Rehbars only" filter.',
    helpTitle: '{name} ان چیزوں میں مدد کر سکتے ہیں',
    storyTitle: 'میری کہانی',
    requestNote:
      'TODO-UR: We never share Rehbars’ phone numbers or emails. Send a request and our team will connect you safely.',
    notSure: 'فیصلہ نہیں کر پا رہے؟',
    notSureText: 'TODO-UR: Sign up and we will choose a Rehbar for you.',
    notSureCta: 'طالب علم کے طور پر سائن اپ کریں',
  },

  scholarships: {
    title: 'اسکالرشپس',
    intro:
      'TODO-UR: Many scholarships pay for everything: fees, books, travel and living costs. Here are some that Pakistani students can apply for.',
    disclaimerTitle: 'درخواست دینے سے پہلے',
    disclaimer:
      'TODO-UR: Details change every year. Always check the official website for the latest dates and rules.',
    aboutTitle: 'اس اسکالرشپ کے بارے میں',
    coversTitle: 'یہ کن چیزوں کا خرچ دیتی ہے',
    howToApplyTitle: 'درخواست کیسے دیں',
    defaultSteps: [
      'TODO-UR: Read the official website carefully, including who can apply.',
      'TODO-UR: Make a list of the documents you need (transcripts, ID, letters).',
      'TODO-UR: Ask for recommendation letters at least one month early.',
      'TODO-UR: Write your personal statement and ask your Rehbar to review it.',
      'TODO-UR: Submit before the deadline, and save a copy of everything.',
    ],
    getHelpTitle: 'درخواست میں مدد چاہیے؟',
    getHelpText: 'TODO-UR: A Rehbar can help you plan, write your essays and prepare for interviews.',
    getHelpCta: 'درخواست کے لیے رہبر کی مدد لیں',
  },

  students: {
    title: 'طلبہ کے لیے',
    intro:
      'TODO-UR: MyRehbar is for any student in Pakistan who wants to study further but does not know where to start.',
    whoTitle: 'یہ کس کے لیے ہے؟',
    whoList: [
      'TODO-UR: Students aged 14 to 20, in school, college or just finished.',
      'TODO-UR: Students whose families cannot pay for university.',
      'TODO-UR: Students who will be the first in their family to go to university.',
      'TODO-UR: Girls and boys, from any city or background.',
    ],
    freeTitle: 'کیا مفت ہے؟',
    freeText: 'TODO-UR: Everything. MyRehbar never asks for money. If someone asks you to pay, tell us.',
    expectTitle: 'کیا توقع رکھیں',
    expectList: [
      'TODO-UR: You fill in a short sign-up form.',
      'TODO-UR: Our team reads it and matches you with a Rehbar.',
      'TODO-UR: You meet your Rehbar online or in a group session.',
      'TODO-UR: Your Rehbar helps you find scholarships and apply.',
    ],
    faqTitle: 'طلبہ کے سوالات',
    faq: [
      {
        q: 'کیا یہ واقعی مفت ہے؟',
        a: 'TODO-UR: Yes. Rehbars are volunteers. There is no fee now and no fee later.',
      },
      {
        q: 'کیا مجھے اچھی انگریزی آنی چاہیے؟',
        a: 'TODO-UR: No. Many Rehbars speak Urdu and other local languages. They can help you improve your English step by step.',
      },
      {
        q: 'کیا لڑکیاں شامل ہو سکتی ہیں؟',
        a: 'TODO-UR: Yes, and we really want you to. You can ask for a woman Rehbar. Many of our Rehbars are women who went through the same thing.',
      },
      {
        q: 'میرے والدین پریشان ہیں۔ میں انہیں کیا بتاؤں؟',
        a: 'TODO-UR: Tell them MyRehbar is free and safe. Sessions for students under 18 happen in groups or with a teacher or parent present. Rehbars do not contact students privately on social media. Your parents are welcome to contact us with any questions.',
      },
      {
        q: 'میرے پاس لیپ ٹاپ یا اچھا انٹرنیٹ نہیں ہے۔ کیا میں پھر بھی شامل ہو سکتا/سکتی ہوں؟',
        a: 'TODO-UR: Yes. The site works on a phone. Tell us in the form, and we will try to arrange sessions at your school or help with internet access.',
      },
    ],
    signupTitle: 'طالب علم کے طور پر سائن اپ کریں',
    signupText:
      'TODO-UR: It takes about 5 minutes. If you are under 18, please sign up with a parent or teacher knowing.',
  },

  become: {
    title: 'رہبر بنیں',
    intro:
      'TODO-UR: Be the person you needed when you were 16. Give one hour a week and help a student see what is possible.',
    whyTitle: 'رہنمائی کیوں کریں؟',
    whyList: [
      'TODO-UR: Many talented students never apply because nobody told them they could.',
      'TODO-UR: One conversation can change the direction of a life.',
      'TODO-UR: You already know the path. You can save someone years of guessing.',
    ],
    timeTitle: 'کتنا وقت درکار ہے',
    timeText:
      'TODO-UR: About 1 hour per week, for at least 3 months. Sessions are online, so you can mentor from anywhere in the world.',
    goodTitle: 'ایک اچھا رہبر کون ہے',
    goodList: [
      'TODO-UR: You are a student or graduate of a good university in Pakistan or abroad.',
      'TODO-UR: You come from a similar background, or you understand it well. This matters most.',
      'TODO-UR: You are patient, kind and reliable.',
      'TODO-UR: You can explain things in simple words, in English or Urdu.',
    ],
    conductTitle: 'ضابطۂ اخلاق (خلاصہ)',
    conductList: [
      'TODO-UR: Be respectful and kind. Never judge a student for their background.',
      'TODO-UR: Never ask a student for money or favours.',
      'TODO-UR: Give honest advice. Never promise a scholarship.',
      'TODO-UR: Keep students’ information private.',
    ],
    safeTitle: 'تحفظ',
    safeList: [
      'TODO-UR: Sessions with students under 18 happen in groups or in supervised settings.',
      'TODO-UR: No private contact on social media or personal messaging apps.',
      'TODO-UR: Use only the channels the MyRehbar team sets up.',
      'TODO-UR: If you are worried about a student’s safety, report it to the team right away.',
    ],
    applyTitle: 'رہبر بننے کے لیے درخواست دیں',
    applyText: 'TODO-UR: Tell us about yourself. We review every application and reply by email.',
  },

  resources: {
    title: 'رہنمائی',
    intro: 'TODO-UR: Simple guides to help you understand scholarships and prepare strong applications.',
  },

  schools: {
    title: 'اسکولوں میں مائی رہبر',
    intro:
      'TODO-UR: We visit schools to tell students that scholarships exist, and then we stay with them while they apply.',
    pilot: 'TODO-UR: Our pilot starts in Lyari and Kati Pahari, Karachi.',
    programTitle: 'پروگرام میں کیا شامل ہے',
    program: [
      {
        title: 'آگاہی سیشن',
        text: 'TODO-UR: A short, friendly talk at your school about scholarships, universities and what is possible.',
      },
      {
        title: 'رہبروں کے ساتھ آن لائن سیشن',
        text: 'TODO-UR: Students meet Rehbars from around the world in group video sessions at school.',
      },
      {
        title: 'مسلسل رہنمائی',
        text: 'TODO-UR: Interested students are matched with a Rehbar for regular guidance.',
      },
      {
        title: 'انٹرنیٹ تک رسائی میں مدد',
        text: 'TODO-UR: We help schools find ways for students to get online for sessions and applications.',
      },
    ],
    timelineTitle: 'پہلے 90 دن',
    timeline: [
      {
        label: 'پہلا مہینہ',
        title: 'آگاہی',
        text: 'TODO-UR: School visit and awareness session. Students who are interested sign up.',
      },
      {
        label: 'دوسرا مہینہ',
        title: 'رہبر سے ملاپ',
        text: 'TODO-UR: Students are matched with Rehbars and start online group sessions.',
      },
      {
        label: 'تیسرا مہینہ',
        title: 'درخواستیں',
        text: 'TODO-UR: Students shortlist scholarships and start their applications with their Rehbar.',
      },
    ],
    ctaTitle: 'مائی رہبر کو اپنے اسکول میں لائیں',
    ctaText: 'TODO-UR: Are you a teacher, principal or NGO? Tell us about your school. It is free.',
    ctaButton: 'اپنے اسکول کے بارے میں رابطہ کریں',
  },

  about: {
    title: 'مائی رہبر کے بارے میں',
    intro: '"رہبر" کا مطلب ہے رہنما۔ ہم ہر طالب علم کے لیے یہی بننا چاہتے ہیں۔',
    storyTitle: 'ہماری کہانی',
    missionTitle: 'ہمارا مقصد',
    missionText:
      'TODO-UR: To make sure no student in Pakistan rules themselves out of education because nobody told them that funding exists.',
    valuesTitle: 'ہم کس بات پر یقین رکھتے ہیں',
    values: [
      { title: 'ہمیشہ مفت', text: 'TODO-UR: Students never pay. Not now, not later.' },
      {
        title: 'سمجھنے والے رہبر',
        text: 'TODO-UR: Our Rehbars often come from the same communities as our students.',
      },
      {
        title: 'لڑکیوں کی جگہ یہاں ہے',
        text: 'TODO-UR: We work hard to make girls and their families feel safe and welcome.',
      },
      {
        title: 'ایمان دار مشورہ',
        text: 'TODO-UR: We never promise results. We help students make their best attempt.',
      },
    ],
    sdgTitle: 'عالمی اہداف',
    sdgIntro: 'TODO-UR: Our work supports these United Nations Sustainable Development Goals.',
    sdgs: [
      { number: '4', title: 'معیاری تعلیم' },
      { number: '5', title: 'صنفی مساوات' },
      { number: '10', title: 'عدم مساوات میں کمی' },
    ],
    partnersTitle: 'شراکت دار',
    partnersEmpty:
      'TODO-UR: We are looking for our first partners: schools, NGOs, embassies and scholarship programs.',
    partnersCta: 'ہمارے ساتھ شراکت کریں',
  },

  contact: {
    title: 'رابطہ اور شراکت',
    intro:
      'TODO-UR: We work with schools, NGOs, embassies, scholarship programs and donors. We would love to hear from you.',
    whoList: [
      'TODO-UR: Schools: bring an awareness session to your students.',
      'TODO-UR: NGOs: refer students or run sessions together.',
      'TODO-UR: Embassies and scholarship programs: help students learn about your programs.',
      'TODO-UR: Donors: help pay for internet access and school visits.',
    ],
    formTitle: 'ہمیں پیغام بھیجیں',
    emailLabel: 'ای میل',
    socialTitle: 'ہمیں فالو کریں',
    studentNote: 'TODO-UR: Are you a student? Please use the student sign-up form instead.',
  },

  privacy: {
    title: 'رازداری',
    intro: 'TODO-UR: This is our privacy note in plain language.',
    sections: [
      {
        heading: 'ہم کیا جمع کرتے ہیں',
        text: 'TODO-UR: This website does not have accounts and does not save anything about you. When you fill in one of our forms, we collect only what you type into that form, such as your name, city, school and how to contact you.',
      },
      {
        heading: 'معلومات کہاں جاتی ہیں',
        text: 'TODO-UR: Our forms are Google Forms. Your answers are saved in a Google account owned by the MyRehbar team. Only the team can see them.',
      },
      {
        heading: 'ہم اسے کیسے استعمال کرتے ہیں',
        text: 'TODO-UR: We use your answers only to match you with a Rehbar and to contact you about MyRehbar. We never sell your data, and we never share it with advertisers.',
      },
      {
        heading: 'رہبروں کی رابطہ معلومات',
        text: 'TODO-UR: We never show Rehbars’ phone numbers or emails on this website. All requests go through our team.',
      },
      {
        heading: '18 سال سے کم عمر طلبہ',
        text: 'TODO-UR: If you are under 18, please sign up with your parent or a teacher knowing. Sessions for students under 18 happen in groups or with supervision.',
      },
      {
        heading: 'کوکیز اور ٹریکنگ',
        text: 'TODO-UR: This website does not use advertising cookies or tracking. It only remembers your language choice (English or Urdu) on your device.',
      },
      {
        heading: 'اپنا ڈیٹا حذف کروائیں',
        text: 'TODO-UR: You can ask us to delete your form answers at any time. Use the contact form and we will do it.',
      },
    ],
  },

  footer: {
    quickLinks: 'اہم لنکس',
    social: 'ہمیں فالو کریں',
    madeIn: 'کراچی میں بنایا گیا',
    privacyNote: 'TODO-UR: No accounts, no tracking. Forms are handled by Google Forms.',
    privacyLink: 'ہمارا رازداری نوٹ پڑھیں',
    rights: '© {year} مائی رہبر',
  },

  notFound: {
    title: 'یہ صفحہ موجود نہیں ہے',
    text: 'TODO-UR: The link may be old, or there may be a typo. Let’s get you back on track.',
    cta: 'ہوم پیج پر جائیں',
  },
}

export default ur
