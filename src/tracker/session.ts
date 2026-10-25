import { useSyncExternalStore } from 'react'

/**
 * The tracker login, kept in this browser only.
 *
 * - "Keep me logged in" stores it in localStorage (30 days). Otherwise sessionStorage,
 *   which the browser forgets when the tab is closed (and the server forgets after 12 hours).
 * - Only a random login token and the email are stored, never the password.
 * - Logging out removes the token here and on the server, plus any unsaved tracker changes.
 *
 * This file is small on purpose: the header imports it on every page.
 */
export interface Session {
  token: string
  email: string
  expiresAt: string
}

const SESSION_KEY = 'myrehbar-tracker-session'
/** Unsaved tracker changes (in the same storage as the session). See useTracker. */
export const PENDING_KEY = 'myrehbar-tracker-pending'

const listeners = new Set<() => void>()
let cached: { raw: string | null; session: Session | null } = { raw: null, session: null }
let endedByServer = false

function storages(): Storage[] {
  const list: Storage[] = []
  try {
    list.push(window.localStorage)
  } catch {
    // Blocked storage (private mode, settings): fall through.
  }
  try {
    list.push(window.sessionStorage)
  } catch {
    // Same.
  }
  return list
}

/** The storage holding the current session, if any. */
export function sessionStorageArea(): Storage | null {
  for (const s of storages()) {
    try {
      if (s.getItem(SESSION_KEY)) return s
    } catch {
      // Ignore and try the next one.
    }
  }
  return null
}

function readRaw(): string | null {
  const area = sessionStorageArea()
  try {
    return area ? area.getItem(SESSION_KEY) : null
  } catch {
    return null
  }
}

function parse(raw: string | null): Session | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as Partial<Session>
    if (typeof v.token !== 'string' || !/^[a-f0-9]{64}$/.test(v.token)) return null
    if (typeof v.email !== 'string' || typeof v.expiresAt !== 'string') return null
    if (!(Date.parse(v.expiresAt) > Date.now())) return null
    return { token: v.token, email: v.email, expiresAt: v.expiresAt }
  } catch {
    return null
  }
}

export function getSession(): Session | null {
  const raw = readRaw()
  if (raw !== cached.raw) cached = { raw, session: parse(raw) }
  return cached.session
}

function notify() {
  listeners.forEach((l) => l())
}

export function setSession(session: Session, remember: boolean) {
  clearSession(false)
  endedByServer = false
  const list = storages()
  const area = remember ? list[0] : list[1] ?? list[0]
  try {
    area?.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage blocked: the person stays logged in only until the page reloads.
  }
  notify()
}

/** Forget the login and any unsaved changes in this browser. */
export function clearSession(announce = true) {
  for (const s of storages()) {
    try {
      s.removeItem(SESSION_KEY)
      s.removeItem(PENDING_KEY)
    } catch {
      // Nothing to remove.
    }
  }
  if (announce) notify()
}

/** The server said the login is no longer valid (expired, or logged out everywhere). */
export function endSessionFromServer() {
  endedByServer = true
  clearSession()
}

/** True if the last logout was the server's doing, so the login page can say why. */
export function sessionEndedByServer(): boolean {
  return endedByServer
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Logging in or out in another tab updates this one too.
  const onStorage = (e: StorageEvent) => (e.key === null || e.key === SESSION_KEY) && listener()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** The current tracker login, or null. Re-renders when it changes. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null)
}
