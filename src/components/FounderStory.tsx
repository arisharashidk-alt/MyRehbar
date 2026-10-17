import { Quote } from 'lucide-react'
import { useI18n } from '../i18n'

/** Founder story block, used on Home and About. Text lives in src/i18n/en.ts -> home.founder* */
export function FounderStory({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useI18n()
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
        <p className="mt-6 font-semibold text-mint-900">{t.home.founderName}</p>
      </div>
    </div>
  )
}
