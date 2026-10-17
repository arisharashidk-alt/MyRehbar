import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function NotFound() {
  const { t } = useI18n()
  usePageMeta(t.notFound.title)

  return (
    <div className="container-page section text-center">
      <Logo size={72} className="mx-auto" />
      <h1 className="mt-6 text-2xl md:text-3xl">{t.notFound.title}</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-slate">{t.notFound.text}</p>
      <Button to="/" size="lg" className="mt-8">
        {t.notFound.cta}
      </Button>
    </div>
  )
}
