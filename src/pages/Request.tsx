import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { Avatar } from '../components/Avatar'
import { MyRehbarForm } from '../components/MyRehbarForm'
import { requestForm } from '../forms/schema'
import { getRehbar } from '../data'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

/** /request?rehbar=<slug>: a student asks to be connected with a specific Rehbar. */
export default function Request() {
  const { t } = useI18n()
  usePageMeta(t.request.title, t.request.intro)
  const [params] = useSearchParams()
  const rehbar = getRehbar(params.get('rehbar') ?? undefined)

  return (
    <>
      <PageHeader title={t.request.title} intro={t.request.intro} />
      <Section className="!pt-8 md:!pt-12">
        <div className="mx-auto max-w-3xl">
          {rehbar && (
            <div className="mb-8 flex flex-col gap-4 rounded-card border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={rehbar.name} photo={rehbar.photo} />
                <div>
                  <p className="text-sm text-slate">{t.request.requesting}</p>
                  <p className="text-lg font-semibold text-mint-900">{rehbar.name}</p>
                  {rehbar.university && <p className="text-sm text-slate">{rehbar.university}</p>}
                </div>
              </div>
              <Link to="/rehbars" className="inline-flex min-h-tap items-center gap-2 font-semibold no-underline hover:underline">
                <ArrowLeft aria-hidden size={18} strokeWidth={1.5} className="rtl:rotate-180" />
                {t.request.changeRehbar}
              </Link>
            </div>
          )}

          <h2 className="mb-6 text-xl">{t.request.formTitle}</h2>
          <MyRehbarForm
            // key resets the form if the person switches to a different Rehbar
            key={rehbar?.slug ?? 'none'}
            def={requestForm}
            initialValues={rehbar ? { rehbar: rehbar.name } : {}}
            readOnly={rehbar ? ['rehbar'] : []}
          />

          <p className="mt-6 flex gap-2 text-sm text-slate">
            <ShieldCheck aria-hidden size={18} strokeWidth={1.5} className="shrink-0 text-mint-700" />
            {t.rehbars.requestNote}
          </p>
        </div>
      </Section>
    </>
  )
}
