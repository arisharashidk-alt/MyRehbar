import { Link, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Card } from '../components/Card'
import { CheckList } from '../components/CheckList'
import { MyRehbarForm } from '../components/MyRehbarForm'
import { contactForm } from '../forms/schema'
import { site, socialLabels } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function Contact() {
  const { t } = useI18n()
  usePageMeta(t.contact.title, t.contact.intro)
  // /contact?topic=school pre-selects the topic (used by the Schools page).
  const [params] = useSearchParams()
  const topic = params.get('topic') ?? ''
  const topicField = contactForm.fields.find((f) => f.name === 'topic')
  const validTopic = topicField?.type === 'select' && topicField.options.includes(topic)
  const socials = (Object.keys(site.social) as (keyof typeof site.social)[]).filter((k) => site.social[k])

  return (
    <>
      <PageHeader title={t.contact.title} intro={t.contact.intro} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <CheckList className="text-lg" items={t.contact.whoList} />
            <div className="mt-12">
              <SectionHeading title={t.contact.formTitle} />
              <MyRehbarForm def={contactForm} initialValues={validTopic ? { topic } : {}} />
            </div>
          </div>
          <aside className="space-y-6">
            {site.contactEmail && (
              <Card>
                <h2 className="text-lg">{t.contact.emailLabel}</h2>
                <a href={`mailto:${site.contactEmail}`} className="mt-2 inline-flex min-h-tap items-center gap-2 font-semibold">
                  <Mail aria-hidden size={18} strokeWidth={1.5} />
                  {site.contactEmail}
                </a>
              </Card>
            )}
            {socials.length > 0 && (
              <Card>
                <h2 className="text-lg">{t.contact.socialTitle}</h2>
                <ul className="mt-2">
                  {socials.map((k) => (
                    <li key={k}>
                      <a href={site.social[k]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center font-semibold">
                        {socialLabels[k]}
                        <span className="sr-only"> {t.common.opensNewTab}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Card className="bg-mint-50">
              <p>{t.contact.studentNote}</p>
              <Link to="/students" className="mt-2 inline-flex min-h-tap items-center font-semibold">
                {t.students.signupTitle} →
              </Link>
            </Card>
          </aside>
        </div>
      </Section>
    </>
  )
}
