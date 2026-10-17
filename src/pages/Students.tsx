import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Gift, ListChecks, Users } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { Card } from '../components/Card'
import { CheckList, StepList } from '../components/CheckList'
import { Faq } from '../components/Faq'
import { MyRehbarForm } from '../components/MyRehbarForm'
import { studentForm } from '../forms/schema'
import { getScholarship } from '../data'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export default function Students() {
  const { t } = useI18n()
  usePageMeta(t.students.title, t.students.intro)
  const [params] = useSearchParams()
  const { hash } = useLocation()

  // Coming from a scholarship page (/students?scholarship=chevening#signup): pre-fill it.
  const scholarship = getScholarship(params.get('scholarship') ?? undefined)

  useEffect(() => {
    if (hash === '#signup') document.getElementById('signup')?.scrollIntoView()
  }, [hash])

  return (
    <>
      <PageHeader title={t.students.title} intro={t.students.intro} />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <Users aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
            <h2 className="mt-4 text-xl">{t.students.whoTitle}</h2>
            <CheckList className="mt-4" items={t.students.whoList} />
          </Card>
          <Card>
            <Gift aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
            <h2 className="mt-4 text-xl">{t.students.freeTitle}</h2>
            <p className="mt-4 text-lg">{t.students.freeText}</p>
          </Card>
          <Card>
            <ListChecks aria-hidden size={28} strokeWidth={1.5} className="text-mint-700" />
            <h2 className="mt-4 text-xl">{t.students.expectTitle}</h2>
            <div className="mt-4">
              <StepList items={t.students.expectList} />
            </div>
          </Card>
        </div>
      </Section>

      <Section tint labelledBy="faq">
        <SectionHeading id="faq" title={t.students.faqTitle} />
        <div className="max-w-3xl">
          <Faq items={t.students.faq} />
          <p className="mt-6">
            <Link to="/rehbars?women=1" className="font-semibold">
              {t.filters.womenOnly} →
            </Link>
          </p>
        </div>
      </Section>

      <Section labelledBy="signup">
        <SectionHeading id="signup" title={t.students.signupTitle} intro={t.students.signupText} />
        <div className="max-w-3xl">
          <MyRehbarForm def={studentForm} initialValues={scholarship ? { scholarship: scholarship.name } : {}} />
        </div>
      </Section>
    </>
  )
}
