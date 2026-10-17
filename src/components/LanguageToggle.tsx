import { useI18n, type Lang } from '../i18n'

const options: { value: Lang; label: string; htmlLang: string }[] = [
  { value: 'en', label: 'EN', htmlLang: 'en' },
  { value: 'ur', label: 'اردو', htmlLang: 'ur' },
]

/** EN / اردو switch. Switching to Urdu flips the page right-to-left. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t.nav.language} className={`inline-flex rounded-xl border border-line bg-white p-1 ${className}`}>
      {options.map((o) => {
        const active = lang === o.value
        return (
          <button
            key={o.value}
            type="button"
            lang={o.htmlLang}
            aria-pressed={active}
            onClick={() => setLang(o.value)}
            className={`min-h-[36px] min-w-tap rounded-lg px-3 text-sm font-semibold transition duration-150 ${
              active ? 'bg-mint-700 text-white' : 'text-ink hover:bg-mint-50'
            } ${o.value === 'ur' ? 'font-urdu' : ''}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
