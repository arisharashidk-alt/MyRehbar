/**
 * Turns a password into the key that is sent to the server, so the password itself never leaves the browser.
 *
 * PBKDF2-SHA256 with 600,000 rounds (OWASP's 2023 recommendation). The salt is the email,
 * so the same password gives a different key for every person. The server then mixes in its own
 * random salt and secret pepper before storing anything (google-apps-script/Tracker.gs).
 *
 * Never change ITERATIONS or SALT_PREFIX: existing passwords would stop working.
 */
const ITERATIONS = 600_000
const SALT_PREFIX = 'myrehbar-tracker-v1:'

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function passwordKey(email: string, password: string): Promise<string> {
  const enc = new TextEncoder()
  const base = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT_PREFIX + normaliseEmail(email)), iterations: ITERATIONS },
    base,
    256,
  )
  let binary = ''
  for (const byte of new Uint8Array(bits)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Some very common passwords, refused at sign-up. Length (10+) does most of the work. */
const COMMON = new Set([
  '1234567890', '12345678910', '0123456789', 'qwertyuiop', 'password12', 'password123', 'password1234',
  'pakistan123', 'pakistan786', 'pakistan1947', 'iloveyou12', 'abcdefghij', 'asdfghjkl1', '1q2w3e4r5t',
  'qwerty1234', 'letmein123', 'welcome123', 'admin12345', '1111111111', '0000000000', 'aaaaaaaaaa',
  'myrehbar123', 'myrehbar1234', 'bismillah1', 'bismillah123', 'allahis1', 'princess12', 'football12',
])

export type PasswordProblem = 'short' | 'long' | 'common' | 'email' | null

export function passwordProblem(password: string, email: string): PasswordProblem {
  if (password.length < 10) return 'short'
  if (password.length > 200) return 'long'
  const lower = password.toLowerCase()
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) return 'common'
  const local = normaliseEmail(email).split('@')[0]
  if (local.length >= 4 && lower.includes(local)) return 'email'
  return null
}
