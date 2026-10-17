/**
 * Site-wide settings. Edit these values, push to GitHub, and Vercel redeploys.
 */
export const site = {
  name: 'MyRehbar',
  domain: 'myrehbar.org',
  url: 'https://myrehbar.org',
  tagline: "Your guide to what's possible.",

  // TODO: replace with your real public contact email, or leave empty ('') to hide it.
  // This is the organisation's email. Never put a mentor's personal email anywhere on the site.
  contactEmail: '',

  // Founder details shown with the founder story (Home and About pages).
  // Leave a value empty ('') to hide it.
  founder: {
    name: 'Arisha Rashid Khan',
    photo: '/founder.jpg', // small square image in /public (about 256×256px)
    linkedin: 'https://www.linkedin.com/in/arisha-rashid/',
  },

  // TODO: add your social links. Leave a value empty ('') to hide that link.
  social: {
    instagram: '',
    linkedin: '',
    facebook: '',
    x: '',
    youtube: '',
  },
} as const

export const socialLabels: Record<keyof typeof site.social, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  youtube: 'YouTube',
}
