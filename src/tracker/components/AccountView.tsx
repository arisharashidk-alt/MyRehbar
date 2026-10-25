import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Download, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/Button'
import { trackerCall } from '../api'
import { passwordKey } from '../crypto'
import { LIMITS, type TrackerData } from '../model'
import { clearSession, type Session } from '../session'
import { useTrackerText } from '../text'
import { inputClass, labelClass } from './ui'

export function AccountView({
  data,
  email,
  session,
  size,
  beforeLogout,
}: {
  data: TrackerData
  email: string
  session: Session
  size: number
  /** Save any last changes first */
  beforeLogout: () => Promise<void>
}) {
  const tt = useTrackerText()
  const x = tt.account
  const navigate = useNavigate()
  const formId = useId()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'' | 'export' | 'logoutAll' | 'delete'>('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const percent = Math.min(100, Math.round((size / LIMITS.data) * 100))

  async function exportFile() {
    setBusy('export')
    try {
      // Loaded only when needed, so the tracker page itself stays small.
      const { downloadTracker } = await import('../xlsx')
      downloadTracker(data, tt)
    } finally {
      setBusy('')
    }
  }

  async function logout() {
    await beforeLogout()
    await trackerCall('logout', { token: session.token })
    clearSession()
    navigate('/', { replace: true })
  }

  async function logoutAll() {
    setBusy('logoutAll')
    const res = await trackerCall('logoutAll', { token: session.token })
    setBusy('')
    if (res.ok || res.error === 'auth') {
      clearSession()
      navigate('/login', { replace: true })
    } else setError(tt.auth.errors.network)
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!password || !window.confirm(x.confirmDelete)) return
    setBusy('delete')
    try {
      const key = await passwordKey(email, password)
      const res = await trackerCall('deleteAccount', { token: session.token, key })
      if (res.ok) {
        clearSession()
        setMessage(x.deleted)
        navigate('/', { replace: true })
      } else if (res.error === 'wrong') setError(tt.auth.errors.wrong)
      else if (res.error === 'auth') clearSession()
      else setError(tt.auth.errors.server)
    } catch {
      setError(tt.auth.errors.crypto)
    } finally {
      setBusy('')
      setPassword('')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-card border border-line bg-white p-5">
        <h2 className="text-xl">{x.title}</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-slate">{x.email}</dt>
            <dd className="font-semibold" dir="ltr">
              {email}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate">{x.storage}</dt>
            <dd>
              <span className="font-semibold" dir="ltr">
                {percent}%
              </span>
              <span className="mt-1 block h-2 w-full max-w-xs overflow-hidden rounded-full bg-line" aria-hidden>
                <span className={`block h-full ${percent > 85 ? 'bg-red-700' : 'bg-mint-500'}`} style={{ width: `${percent}%` }} />
              </span>
            </dd>
          </div>
        </dl>
        <div className="mt-6 space-y-2">
          <Button onClick={exportFile} disabled={busy === 'export'} icon={<Download aria-hidden size={18} strokeWidth={1.5} />}>
            {busy === 'export' ? x.exporting : x.export}
          </Button>
          <p className="text-sm text-slate">{x.exportHint}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={logout} icon={<LogOut aria-hidden size={18} strokeWidth={1.5} />}>
            {x.logout}
          </Button>
          <Button variant="ghost" onClick={logoutAll} disabled={busy === 'logoutAll'}>
            {x.logoutAll}
          </Button>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-card border border-line bg-mint-50 p-5">
          <h2 className="flex items-center gap-2 text-xl">
            <ShieldCheck aria-hidden size={22} strokeWidth={1.5} className="text-mint-700" />
            {x.privacyTitle}
          </h2>
          <p className="mt-2">{x.privacyText}</p>
        </section>

        <section className="rounded-card border border-danger/30 bg-white p-5">
          <h2 className="text-xl">{x.deleteTitle}</h2>
          <p className="mt-2 text-slate">{x.deleteText}</p>
          <form onSubmit={deleteAccount} className="mt-4 space-y-3">
            <div>
              <label htmlFor={`${formId}-pw`} className={labelClass}>
                {x.deletePassword}
              </label>
              <input
                id={`${formId}-pw`}
                type="password"
                dir="ltr"
                autoComplete="current-password"
                value={password}
                maxLength={200}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} max-w-sm`}
              />
            </div>
            <button
              type="submit"
              disabled={!password || busy === 'delete'}
              className="inline-flex min-h-tap items-center rounded-xl bg-danger px-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy === 'delete' ? tt.auth.working : x.delete}
            </button>
          </form>
        </section>

        {(error || message) && (
          <p role="alert" className={`flex gap-2 rounded-xl p-3 text-sm ${error ? 'bg-danger-50 text-danger' : 'bg-mint-50 text-mint-900'}`}>
            {error && <AlertCircle aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />}
            {error || message}
          </p>
        )}
      </div>
    </div>
  )
}
