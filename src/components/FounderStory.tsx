import { Linkedin, Quote } from 'lucide-react'
import { Avatar } from './Avatar'
import { site } from '../config/site'
import { useI18n } from '../i18n'

/**
 * Founder story block, used on Home and About.
 * Story text: src/i18n/en.ts -> home.founder*. Name, photo and LinkedIn: src/config/site.ts -> founder.
 */
export function FounderStory({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useI18n()
  const { name, photo, linkedin } = site.founder

  return (
    <div className="grid gap-8 rounded-card border border-line bg-white p-6 md:grid-cols-[auto_1fr] md:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint-50 text-mint-700">
        <Quote aria-hidden size={26} strokeWidth={1.5} />
      </div>
      <div>
        {showHeading && (
          <>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mint-700">{t.home.founderEyebrow}</p>
            <h2 className="text-2xl">{t.home.founderTitle}</h2>
          </>
        )}
        <div className="mt-4 max-w-2xl space-y-4 text-lg">
          {t.home.founderText.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          {photo && <Avatar name={name || 'Founder'} photo={photo} size={72} />}
          <div>
            {name && <p className="text-lg font-semibold text-mint-900">{name}</p>}
            <p className={name ? 'text-slate' : 'font-semibold text-mint-900'}>{t.home.founderName}</p>
          </div>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-tap items-center gap-2 rounded-xl border border-line px-4 font-semibold no-underline transition duration-150 hover:bg-mint-50 sm:ms-auto"
            >
              <Linkedin aria-hidden size={18} strokeWidth={1.5} />
              LinkedIn
              <span className="sr-only">
                {name ? ` — ${name}` : ''} {t.common.opensNewTab}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
