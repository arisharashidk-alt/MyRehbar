import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Info, Lock } from 'lucide-react'
import { Button } from '../components/Button'
import { usePageMeta } from '../hooks/usePageMeta'
import { fmt } from '../i18n'
import { isTrackerEndpointSet } from '../config/tracker'
import { trackerCall, type ApiError } from '../tracker/api'
import { normaliseEmail, passwordKey, passwordProblem } from '../tracker/crypto'
import { setSession, useSession } from '../tracker/session'
import { useTrackerText } from '../tracker/text'
import { inputClass, labelClass } from '../tracker/components/ui'

type Mode = 'login' | 'signup' | 'verify' | 'forgot' | 'reset'

/** Only send people on to tracker pages after logging in (never to another site). */
function safeNext(value: string | null): string {
  return value && /^\/tracker(\?[\w=&%:.-]*)?$/.test(value) ? value : '/tracker'
}

const EMAIL_RE = /^[a-z0-9][a-z0-9._%+'-]*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/

export default function Login() {
  const tt = useTrackerText()
  const a = tt.auth
  usePageMeta(tt.meta.loginTitle, tt.meta.description)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const session = useSession()
  const formId = useId()

  const [mode, setMode] = useState<Mode>(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [consent, setConsent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const startedAt = useRef(Date.now())
  const headingRef = useRef<HTMLHeadingElement>(null)
  const ended = params.get('ended') === '1'

  // Move focus to the new heading when the step changes, for screen readers and keyboards.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [mode])

  if (session) return <Navigate to={next} replace />

  const ready = isTrackerEndpointSet()
  const id = (name: string) => `${formId}-${name}`

  function go(m: Mode) {
    setMode(m)
    setError('')
    setPassword('')
    setConfirm('')
    setCode('')
  }

  function apiMessage(err: ApiError): string {
    const e = a.errors
    switch (err) {
      case 'wrong':
        return e.wrong
      case 'locked':
        return e.locked
      case 'code':
        return e.code
      case 'wait':
        return e.wait
      case 'busy':
        return e.busy
      case 'network':
        return e.network
      case 'not_configured':
        return e.notReady
      case 'too_fast':
        return e.tooFast
      case 'invalid':
        return e.email
      default:
        return e.server
    }
  }

  function checkNewPassword(): string {
    const problem = passwordProblem(password, email)
    if (problem === 'short') return a.errors.short
    if (problem === 'long') return a.errors.long
    if (problem === 'common') return a.errors.common
    if (problem === 'email') return a.errors.emailInPassword
    if (password !== confirm) return a.errors.match
    return ''
  }

  async function key(): Promise<string | null> {
    try {
      return await passwordKey(email, password)
    } catch {
      setError(a.errors.crypto)
      return null
    }
  }

  function loggedIn(res: { token: string; email: string; expiresAt: string }) {
    setPassword('')
    setConfirm('')
    setSession({ token: res.token, email: res.email, expiresAt: res.expiresAt }, remember)
    navigate(next, { replace: true })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setError('')
    const cleanEmail = normaliseEmail(email)
    if (mode !== 'verify' && mode !== 'reset' && !EMAIL_RE.test(cleanEmail)) return setError(a.errors.email)

    if (mode === 'signup') {
      const problem = checkNewPassword()
      if (problem) return setError(problem)
      if (!consent) return setError(a.errors.consent)
    }
    if (mode === 'reset') {
      const problem = checkNewPassword()
      if (problem) return setError(problem)
    }
    if ((mode === 'verify' || mode === 'reset') && !/^\d{6}$/.test(code.trim())) return setError(a.errors.codeFormat)

    setBusy(true)
    try {
      if (mode === 'login') {
        const k = await key()
        if (!k) return
        const res = await trackerCall<{ token: string; email: string; expiresAt: string }>('login', { email: cleanEmail, key: k, remember })
        if (res.ok) loggedIn(res)
        else setError(apiMessage(res.error))
      } else if (mode === 'signup') {
        const k = await key()
        if (!k) return
        const res = await trackerCall('signup', { email: cleanEmail, key: k, website: honeypot, elapsedMs: Date.now() - startedAt.current })
        if (res.ok) {
          setPassword('')
          setConfirm('')
          setMode('verify')
        } else setError(apiMessage(res.error))
      } else if (mode === 'verify') {
        const res = await trackerCall<{ token: string; email: string; expiresAt: string }>('verify', { email: cleanEmail, code: code.trim(), remember })
        if (res.ok) loggedIn(res)
        else setError(apiMessage(res.error))
      } else if (mode === 'forgot') {
        const res = await trackerCall('forgot', { email: cleanEmail })
        if (res.ok) go('reset')
        else setError(apiMessage(res.error))
      } else {
        const k = await key()
        if (!k) return
        const res = await trackerCall<{ token: string; email: string; expiresAt: string }>('reset', { email: cleanEmail, code: code.trim(), key: k, remember })
        if (res.ok) loggedIn(res)
        else setError(apiMessage(res.error))
      }
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (busy) return
    setBusy(true)
    setError('')
    const res = await trackerCall('forgot', { email: normaliseEmail(email) })
    setBusy(false)
    if (!res.ok) setError(apiMessage(res.error))
  }

  const titles: Record<Mode, [string, string]> = {
    login: [a.loginTitle, a.loginIntro],
    signup: [a.signupTitle, a.signupIntro],
    verify: [a.verifyTitle, fmt(a.verifyIntro, { email: normaliseEmail(email) })],
    forgot: [a.forgotTitle, a.forgotIntro],
    reset: [a.resetTitle, fmt(a.resetIntro, { email: normaliseEmail(email) })],
  }
  const newPassword = mode === 'signup' || mode === 'reset'
  const PasswordIcon = showPassword ? EyeOff : Eye

  const submitLabel: Record<Mode, string> = {
    login: a.login,
    signup: a.signup,
    verify: a.verify,
    forgot: a.sendCode,
    reset: a.setPassword,
  }

  return (
    <div className="bg-mint-50">
      <div className="container-page flex min-h-[70vh] items-start justify-center py-10 md:py-16">
        <div className="w-full max-w-md">
          <div className="rounded-card border border-line bg-white p-6 md:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint-50 text-mint-700">
              <Lock aria-hidden size={22} strokeWidth={1.5} />
            </span>
            <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-xl focus:outline-none">
              {titles[mode][0]}
            </h1>
            <p className="mt-2 text-slate">{titles[mode][1]}</p>

            {ended && mode === 'login' && (
              <p className="mt-4 flex gap-2 rounded-xl bg-sand p-3 text-sm" role="status">
                <Info aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                {a.sessionEnded}
              </p>
            )}
            {!ready && (
              <p className="mt-4 flex gap-2 rounded-xl bg-sand p-3 text-sm" role="status">
                <Info aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                {import.meta.env.DEV ? a.devNote : a.notReady}
              </p>
            )}

            <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
              {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                <Field label={a.email} id={id('email')}>
                  <input
                    id={id('email')}
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              )}

              {(mode === 'verify' || mode === 'reset') && (
                <Field label={a.code} id={id('code')}>
                  <input
                    id={id('code')}
                    dir="ltr"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className={`${inputClass} tracking-[0.4em]`}
                  />
                </Field>
              )}

              {(mode === 'login' || newPassword) && (
                <Field label={mode === 'reset' ? a.newPassword : a.password} id={id('password')} hint={newPassword ? a.passwordHint : undefined}>
                  <div className="relative">
                    <input
                      id={id('password')}
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      autoComplete={newPassword ? 'new-password' : 'current-password'}
                      maxLength={200}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-describedby={newPassword ? `${id('password')}-hint` : undefined}
                      className={`${inputClass} pe-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 end-0 flex min-w-tap items-center justify-center text-slate hover:text-mint-900"
                      aria-pressed={showPassword}
                    >
                      <PasswordIcon aria-hidden size={18} strokeWidth={1.5} />
                      <span className="sr-only">{showPassword ? a.hide : a.show}</span>
                    </button>
                  </div>
                </Field>
              )}

              {newPassword && (
                <Field label={a.confirmPassword} id={id('confirm')}>
                  <input
                    id={id('confirm')}
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    autoComplete="new-password"
                    maxLength={200}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              )}

              {mode === 'signup' && (
                <label className="flex min-h-tap items-start gap-3 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-mint-700" />
                  <span>
                    {a.consent}{' '}
                    <Link to="/privacy" target="_blank" rel="noopener">
                      {a.privacyLink}
                    </Link>
                  </span>
                </label>
              )}

              {mode !== 'forgot' && (
                <div>
                  <label className="flex min-h-tap items-start gap-3 text-sm">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-mint-700" />
                    <span>
                      {a.remember}
                      <span className="block text-slate">{a.rememberHint}</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Spam trap. Hidden from people and screen readers; bots tend to fill it in. */}
              {mode === 'signup' && (
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor={id('website')}>Website</label>
                  <input id={id('website')} type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>
              )}

              {error && (
                <p role="alert" className="flex gap-2 rounded-xl bg-danger-50 p-3 text-sm text-danger">
                  <AlertCircle aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={busy || !ready} aria-busy={busy}>
                {busy ? a.working : submitLabel[mode]}
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-start gap-1 border-t border-line pt-4 text-sm">
              {mode === 'login' && (
                <>
                  <LinkButton onClick={() => go('signup')}>{a.toSignup}</LinkButton>
                  <LinkButton onClick={() => go('forgot')}>{a.toForgot}</LinkButton>
                </>
              )}
              {mode === 'signup' && <LinkButton onClick={() => go('login')}>{a.toLogin}</LinkButton>}
              {mode === 'verify' && <LinkButton onClick={() => go('signup')}>{a.back}</LinkButton>}
              {mode === 'forgot' && <LinkButton onClick={() => go('login')}>{a.back}</LinkButton>}
              {mode === 'reset' && (
                <>
                  <LinkButton onClick={resend}>{a.resend}</LinkButton>
                  <LinkButton onClick={() => go('login')}>{a.back}</LinkButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate">
          {hint}
        </p>
      )}
    </div>
  )
}

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-tap items-center font-semibold text-mint-700 underline-offset-4 hover:underline">
      {children}
    </button>
  )
}
