import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Info, Lock } from 'lucide-react'
import { Button } from './Button'
import type { FieldDef, FormDef } from '../forms/schema'
import { maxLengthOf, validate, type Errors, type Values } from '../forms/validate'
import { submitForm } from '../forms/submit'
import { isFormEndpointSet } from '../config/forms'
import { fmt, useI18n } from '../i18n'

interface MyRehbarFormProps {
  def: FormDef
  /** Pre-filled answers, e.g. { rehbar: 'Sample Rehbar 1' } */
  initialValues?: Values
  /** Questions shown but not editable (e.g. the Rehbar chosen on the previous page) */
  readOnly?: string[]
}

type Status = 'idle' | 'sending' | 'success' | 'error' | 'busy' | 'not_configured'

const inputBase =
  'w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-slate transition duration-150 focus:border-mint-700'

/**
 * A MyRehbar-styled form that saves answers to the private Google Sheet.
 * Questions come from src/forms/schema.ts.
 */
export function MyRehbarForm({ def, initialValues = {}, readOnly = [] }: MyRehbarFormProps) {
  const { t, lang } = useI18n()
  const formId = useId()
  const [values, setValues] = useState<Values>(initialValues)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [honeypot, setHoneypot] = useState('')
  const startedAt = useRef(Date.now())
  const successRef = useRef<HTMLHeadingElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  const idFor = (name: string) => `${formId}-${name}`

  function setValue(name: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Clear a field's error as soon as the person changes it.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(def, values, t)
    setErrors(found)
    const firstInvalid = def.fields.find((f) => found[f.name])
    if (firstInvalid) {
      setStatus('idle')
      document.getElementById(idFor(firstInvalid.name))?.focus()
      return
    }

    setStatus('sending')
    const result = await submitForm(def, values, { lang, startedAt: startedAt.current, honeypot })
    if (result === 'ok') {
      // Forget the answers in this browser as soon as they are sent.
      setValues(initialValues)
      setStatus('success')
    } else {
      setStatus(result)
      summaryRef.current?.focus()
    }
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
    startedAt.current = Date.now()
    setStatus('idle')
  }

  if (status === 'success') {
    return (
      <div className="rounded-card border border-line bg-mint-50 p-6 text-center md:p-10" role="status">
        <CheckCircle2 aria-hidden size={48} strokeWidth={1.5} className="mx-auto text-mint-700" />
        <h3 ref={successRef} tabIndex={-1} className="mt-4 text-xl focus:outline-none">
          {t.forms.successTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-slate">{t.forms.successText}</p>
        <Button variant="secondary" className="mt-6" onClick={reset}>
          {t.forms.sendAnother}
        </Button>
      </div>
    )
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const statusMessage =
    status === 'error'
      ? t.forms.errorSend
      : status === 'busy'
        ? t.forms.errorBusy
        : status === 'not_configured'
          ? t.forms.notReady
          : hasErrors
            ? t.forms.errorSummary
            : ''

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-card border border-line bg-white p-5 md:p-8">
      {import.meta.env.DEV && !isFormEndpointSet() && (
        <p className="mb-6 flex gap-2 rounded-xl bg-sand p-4 text-sm">
          <Info aria-hidden size={18} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          Developer note (only visible locally): paste your Apps Script URL in src/config/forms.ts to save answers.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {def.fields.map((f) => (
          <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
            <Field
              field={f}
              id={idFor(f.name)}
              value={values[f.name]}
              error={errors[f.name]}
              readOnly={readOnly.includes(f.name)}
              onChange={(v) => setValue(f.name, v)}
            />
          </div>
        ))}
      </div>

      {/* Spam trap. Hidden from people and screen readers; bots tend to fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={idFor('website')}>Website</label>
        <input
          id={idFor('website')}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div ref={summaryRef} tabIndex={-1} role="alert" className="focus:outline-none">
        {statusMessage && (
          <p className="mt-6 flex gap-2 rounded-xl bg-danger-50 p-4 text-danger">
            <AlertCircle aria-hidden size={20} strokeWidth={1.5} className="mt-0.5 shrink-0" />
            {statusMessage}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex gap-2 text-sm text-slate">
          <Lock aria-hidden size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-mint-700" />
          <span>
            {t.forms.privacyNote}{' '}
            <Link to="/privacy" className="font-semibold">
              {t.forms.privacyLink}
            </Link>
          </span>
        </p>
        <Button type="submit" size="lg" disabled={status === 'sending'} aria-busy={status === 'sending'} className="shrink-0 disabled:opacity-60">
          {status === 'sending' ? t.forms.submitting : t.forms.submit}
        </Button>
      </div>
    </form>
  )
}

/* ---------- One question ---------- */

interface FieldProps {
  field: FieldDef
  id: string
  value: string | boolean | undefined
  error?: string
  readOnly?: boolean
  onChange: (value: string | boolean) => void
}

function Field({ field: f, id, value, error, readOnly, onChange }: FieldProps) {
  const { t } = useI18n()
  const { label, hint } = t.formFields[f.name]
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  const text = typeof value === 'string' ? value : ''
  const border = error ? 'border-danger' : 'border-line'
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': f.required || undefined,
  }

  const labelEl = (
    <>
      {label}
      {!f.required && <span className="font-normal text-slate"> ({t.forms.optional})</span>}
    </>
  )
  const hintEl = hint ? (
    <p id={hintId} className="mt-1 text-sm text-slate">
      {hint}
    </p>
  ) : null
  const errorEl = error ? (
    <p id={errorId} className="mt-2 flex items-center gap-1 text-sm font-semibold text-danger">
      <AlertCircle aria-hidden size={16} strokeWidth={2} />
      {error}
    </p>
  ) : null

  if (f.type === 'checkbox') {
    return (
      <div>
        <label htmlFor={id} className="flex min-h-tap cursor-pointer items-start gap-3">
          <input
            {...common}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className={`mt-1 h-5 w-5 shrink-0 cursor-pointer accent-mint-700 ${error ? 'outline outline-2 outline-danger' : ''}`}
          />
          <span>{labelEl}</span>
        </label>
        {errorEl}
      </div>
    )
  }

  if (f.type === 'radio') {
    const labels = t.formOptions[f.group] as Record<string, string>
    return (
      <fieldset aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
        <legend className="font-semibold text-mint-900">{labelEl}</legend>
        {hintEl}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {f.options.map((opt, i) => (
            <label
              key={opt}
              className={`flex min-h-tap cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 transition duration-150 hover:bg-mint-50 has-[:checked]:border-mint-700 has-[:checked]:bg-mint-50 ${border}`}
            >
              <input
                // The first option gets the id so "jump to first error" can focus it.
                id={i === 0 ? id : undefined}
                type="radio"
                name={id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="h-5 w-5 shrink-0 accent-mint-700"
              />
              <span>{labels[opt]}</span>
            </label>
          ))}
        </div>
        {errorEl}
      </fieldset>
    )
  }

  const labelBlock = (
    <label htmlFor={id} className="block font-semibold text-mint-900">
      {labelEl}
    </label>
  )

  if (f.type === 'select') {
    const labels = t.formOptions[f.group] as Record<string, string>
    return (
      <div>
        {labelBlock}
        {hintEl}
        <select
          {...common}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${border} mt-2 min-h-[48px]`}
        >
          <option value="">—</option>
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {labels[opt]}
            </option>
          ))}
        </select>
        {errorEl}
      </div>
    )
  }

  const max = maxLengthOf(f)

  if (f.type === 'textarea') {
    const left = max - text.length
    return (
      <div>
        {labelBlock}
        {hintEl}
        <textarea
          {...common}
          dir="auto"
          value={text}
          rows={f.rows ?? 4}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${border} mt-2 py-3`}
        />
        {left < max * 0.2 && <p className="mt-1 text-sm text-slate">{fmt(t.forms.charsLeft, { count: left })}</p>}
        {errorEl}
      </div>
    )
  }

  // text, email, tel, url
  return (
    <div>
      {labelBlock}
      {hintEl}
      <input
        {...common}
        type={f.type}
        value={text}
        maxLength={max}
        readOnly={readOnly}
        autoComplete={f.autoComplete ?? 'off'}
        inputMode={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : undefined}
        // Phone numbers, emails and links read left-to-right even in Urdu.
        dir={f.type === 'text' ? 'auto' : 'ltr'}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${border} mt-2 min-h-[48px] ${readOnly ? 'bg-mint-50 font-semibold' : ''} ${
          f.type === 'text' ? '' : 'rtl:text-right'
        }`}
      />
      {errorEl}
    </div>
  )
}
