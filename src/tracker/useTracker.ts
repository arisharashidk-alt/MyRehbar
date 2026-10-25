import { useCallback, useEffect, useRef, useState } from 'react'
import { trackerCall } from './api'
import { LIMITS, normalise, type TrackerData } from './model'
import { PENDING_KEY, endSessionFromServer, sessionStorageArea, type Session } from './session'

export type SyncState = 'saved' | 'pending' | 'saving' | 'offline' | 'error' | 'tooLarge' | 'conflict'

interface Pending {
  base: number
  data: string
}

const SAVE_DELAY = 1200
const RETRY_DELAY = 15_000

function readPending(): Pending | null {
  try {
    const raw = sessionStorageArea()?.getItem(PENDING_KEY)
    const v = raw ? (JSON.parse(raw) as Partial<Pending>) : null
    return v && typeof v.base === 'number' && typeof v.data === 'string' ? { base: v.base, data: v.data } : null
  } catch {
    return null
  }
}

function writePending(p: Pending | null) {
  try {
    const area = sessionStorageArea()
    if (!area) return
    if (p) area.setItem(PENDING_KEY, JSON.stringify(p))
    else area.removeItem(PENDING_KEY)
  } catch {
    // Storage full or blocked: changes are still saved to the server, just not kept if the tab closes first.
  }
}

function parseData(raw: string | null | undefined): TrackerData {
  if (!raw) return normalise(null)
  try {
    return normalise(JSON.parse(raw))
  } catch {
    return normalise(null)
  }
}

/**
 * Loads the person's tracker and saves every change.
 *
 * - Changes show at once and are kept in this browser until the server confirms them,
 *   so closing the tab or losing the internet does not lose work.
 * - Saves are grouped (about one per second while typing).
 * - Each save says which version it was based on. If another tab or device saved in between,
 *   nothing is overwritten: `conflict` is set and the person chooses which copy to keep.
 */
export function useTracker(session: Session) {
  const [data, setData] = useState<TrackerData | null>(null)
  const [email, setEmail] = useState(session.email)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [sync, setSync] = useState<SyncState>('saved')
  const [conflict, setConflict] = useState<{ version: number; data: TrackerData } | null>(null)
  const [size, setSize] = useState(0)

  const version = useRef(0)
  const latest = useRef<TrackerData | null>(null)
  const dirty = useRef(false)
  const saving = useRef(false)
  const blocked = useRef(false) // during a conflict
  const timer = useRef<number | undefined>(undefined)
  const token = session.token

  const lostLogin = useCallback(() => {
    endSessionFromServer()
  }, [])

  const save = useCallback(async () => {
    window.clearTimeout(timer.current)
    if (saving.current || blocked.current || !dirty.current || !latest.current) return
    const json = JSON.stringify(latest.current)
    if (json.length > LIMITS.data) {
      setSync('tooLarge')
      return
    }
    saving.current = true
    dirty.current = false
    setSync('saving')
    const res = await trackerCall<{ version: number }>('save', { token, version: version.current, data: json })
    saving.current = false

    if (res.ok) {
      version.current = res.version
      if (dirty.current) {
        timer.current = window.setTimeout(() => void save(), SAVE_DELAY)
        setSync('pending')
      } else {
        writePending(null)
        setSync('saved')
      }
      return
    }
    dirty.current = true
    if (res.error === 'auth') return lostLogin()
    if (res.error === 'conflict') {
      blocked.current = true
      setConflict({ version: res.version ?? 0, data: parseData(res.data) })
      setSync('conflict')
      return
    }
    if (res.error === 'too_large') return setSync('tooLarge')
    setSync(res.error === 'network' ? 'offline' : 'error')
    timer.current = window.setTimeout(() => void save(), RETRY_DELAY)
  }, [token, lostLogin])

  const load = useCallback(async () => {
    setPhase('loading')
    const res = await trackerCall<{ email: string; version: number; data: string | null }>('load', { token })
    if (!res.ok) {
      if (res.error === 'auth') return lostLogin()
      setPhase('error')
      return
    }
    version.current = res.version
    if (res.email) setEmail(res.email)
    const server = parseData(res.data)
    const pending = readPending()

    if (pending && pending.base === res.version) {
      // Changes made here that never reached the server: keep them and save now.
      const mine = parseData(pending.data)
      latest.current = mine
      setData(mine)
      dirty.current = true
      setPhase('ready')
      void save()
    } else if (pending && pending.data !== res.data) {
      latest.current = parseData(pending.data)
      setData(latest.current)
      blocked.current = true
      dirty.current = true
      setConflict({ version: res.version, data: server })
      setSync('conflict')
      setPhase('ready')
    } else {
      writePending(null)
      latest.current = server
      setData(server)
      setSync('saved')
      setPhase('ready')
    }
    setSize((res.data ?? '').length)
  }, [token, lostLogin, save])

  useEffect(() => {
    void load()
    return () => window.clearTimeout(timer.current)
  }, [load])

  /** Change the tracker. `fn` gets the current data and returns the new data (never mutate it). */
  const update = useCallback(
    (fn: (d: TrackerData) => TrackerData) => {
      if (!latest.current) return
      const next = fn(latest.current)
      if (next === latest.current) return
      latest.current = next
      setData(next)
      const json = JSON.stringify(next)
      setSize(json.length)
      writePending({ base: version.current, data: json })
      dirty.current = true
      if (blocked.current) return
      setSync('pending')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => void save(), SAVE_DELAY)
    },
    [save],
  )

  const resolveConflict = useCallback(
    (keep: 'mine' | 'theirs') => {
      if (!conflict) return
      version.current = conflict.version
      blocked.current = false
      setConflict(null)
      if (keep === 'theirs') {
        latest.current = conflict.data
        setData(conflict.data)
        dirty.current = false
        writePending(null)
        setSync('saved')
      } else {
        dirty.current = true
        void save()
      }
    },
    [conflict, save],
  )

  // Warn before closing the tab with changes the server has not confirmed.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty.current || saving.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [])

  // Try again as soon as the internet comes back.
  useEffect(() => {
    const onOnline = () => void save()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [save])

  return { data, email, phase, sync, conflict, size, update, resolveConflict, reload: load, saveNow: save }
}
