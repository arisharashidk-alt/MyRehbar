import { Mail } from 'lucide-react'
import { site } from '../config/site'
import { fmt, useI18n } from '../i18n'

/**
 * "Questions? Email us" box. Pass a university name to pre-fill the email subject.
 * Uses the organisation email from src/config/site.ts.
 */
export function AskCta({ about }: { about?: string }) {
  const { t } = useI18n()
  if (!site.contactEmail) return null
  const subject = about ? fmt(t.ask.subjectUni, { name: about }) : t.ask.subjectGeneral
  const href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`

  return (
    <section aria-labelledby="ask-title" className="rounded-card border border-line bg-mint-50 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 id="ask-title" className="text-xl">
            {about ? `${t.ask.title.replace(/\?$/, '')}: ${about}?` : t.ask.title}
          </h2>
          <p className="mt-2 text-ink">{t.ask.text}</p>
          <p className="mt-2 text-sm font-semibold text-mint-900" dir="ltr">
            {site.contactEmail}
          </p>
        </div>
        <a
          href={href}
          className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-mint-700 px-6 text-lg font-semibold text-white no-underline transition duration-150 hover:-translate-y-px hover:bg-mint-900"
        >
          <Mail aria-hidden size={20} strokeWidth={1.5} />
          {t.ask.button}
        </a>
      </div>
    </section>
  )
}
