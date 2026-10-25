/**
 * MyRehbar design tokens.
 * Every colour in the app comes from here. Change a hex value once and it updates everywhere.
 *
 * Contrast rules:
 *  - Never use mint-500 for text on white (fails WCAG). It is for logo, icons and decoration only.
 *  - Use mint-700 for links and primary buttons (white text on mint-700 passes AA).
 *  - Use mint-900 for text on mint-500 or mint-50.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // We replace (not extend) the default palette so only brand colours can be used.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      mint: {
        50: '#EEF8F3', // tinted section backgrounds
        200: '#CDEFE0', // tags, hover states, selected filters
        500: '#3EB489', // brand colour: logo, icons, decoration (never text on white)
        700: '#1F7A5C', // primary buttons, links, focus rings
        900: '#0F3D2E', // headings, footer background
      },
      sand: '#F6E7C8', // sparing accent: highlights, "Sample" badges, callouts
      ink: '#1B2623', // body text
      slate: '#5A6B65', // secondary text
      line: '#E2EAE6', // borders, dividers
      paper: '#FAFCFB', // page background
      // Form errors only. #B42318 on white passes WCAG AA.
      danger: {
        DEFAULT: '#B42318',
        50: '#FEF3F2',
      },
      // Application tracker only: deadline urgency and application colours.
      // Each 700 passes WCAG AA as text on its own 50.
      red: { 50: '#FEF3F2', 200: '#FECDCA', 700: '#B42318' },
      orange: { 50: '#FFF6ED', 200: '#FDDCAB', 700: '#B54708' },
      amber: { 50: '#FEFBE8', 200: '#FDE272', 700: '#854A0E' },
      blue: { 50: '#EFF8FF', 200: '#B2DDFF', 700: '#175CD3' },
      violet: { 50: '#F4F3FF', 200: '#D9D6FE', 700: '#5925DC' },
      pink: { 50: '#FDF2FA', 200: '#FCCEEE', 700: '#C11574' },
      // Softboard: sticky notes, cork and red thread.
      note: { yellow: '#FFF3A6', pink: '#FFD9DF', blue: '#D6E9FF', green: '#D3F2E3' },
      cork: { DEFAULT: '#C9A47A', dark: '#A98258' },
      thread: '#C0392B',
    },
    // Type scale: 14 / 16 / 18 / 24 / 32 / 48
    fontSize: {
      sm: ['14px', '20px'],
      base: ['16px', '26px'],
      lg: ['18px', '28px'],
      xl: ['24px', '32px'],
      '2xl': ['32px', '40px'],
      '3xl': ['48px', '56px'],
    },
    fontFamily: {
      sans: [
        'Inter',
        'system-ui',
        '-apple-system',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
      ],
      // Inter first: it has no Urdu letters, so Urdu uses Nastaliq while English fallback text stays in Inter.
      urdu: ['Inter', '"Noto Nastaliq Urdu"', 'serif'],
    },
    extend: {
      maxWidth: {
        content: '1120px',
      },
      borderRadius: {
        card: '20px',
      },
      letterSpacing: {
        heading: '-0.5px',
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
}
