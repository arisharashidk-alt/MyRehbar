import { useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from './Button'
import { formEmbedLink, formLink, isFormConfigured, type FormConfig } from '../config/forms'
import { fmt, useI18n } from '../i18n'

interface FormEmbedProps {
  form: FormConfig
  /** Short name used for the iframe title, e.g. "Student sign-up" */
  name: string
  /** Optional pre-fill values, e.g. { rehbarName: 'Sample Rehbar 1' } */
  values?: Record<string, string>
  /** Height of the embedded form in pixels */
  height?: number
}

/**
 * Shows a Google Form: a primary button to open it in a new tab, plus an
 * optional "fill it in here" toggle. The iframe only loads when asked for,
 * which keeps pages fast on slow mobile data.
 */
export function FormEmbed({ form, name, values, height = 1200 }: FormEmbedProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  if (!isFormConfigured(form)) {
    return (
      <div className="flex gap-3 rounded-card border border-line bg-sand/60 p-6 text-ink">
        <Info aria-hidden size={22} strokeWidth={1.5} className="mt-1 shrink-0 text-mint-900" />
        <div>
          <p>{t.forms.notReady}</p>
          {import.meta.env.DEV && (
            <p className="mt-2 text-sm text-slate">Developer note: add the form URL in src/config/forms.ts</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button href={formLink(form, values)} size="lg">
          {t.forms.openForm}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? t.forms.hide : t.forms.showHere}
        </Button>
      </div>
      <p className="mt-3 text-sm text-slate">{t.forms.note}</p>
      {open && (
        <iframe
          src={formEmbedLink(form, values)}
          title={fmt(t.forms.frameTitle, { name })}
          loading="lazy"
          className="mt-6 w-full rounded-card border border-line bg-white"
          style={{ height }}
        />
      )}
    </div>
  )
}
