import { Link } from 'react-router-dom'
import { Wordmark } from './Logo'
import { site, socialLabels } from '../config/site'
import { fmt, useI18n } from '../i18n'

export function Footer() {
  const { t } = useI18n()
  const socials = (Object.keys(site.social) as (keyof typeof site.social)[]).filter((k) => site.social[k])

  const links = [
    { to: '/rehbars', label: t.nav.rehbars },
    { to: '/scholarships', label: t.nav.scholarships },
    { to: '/students', label: t.nav.students },
    { to: '/become-a-rehbar', label: t.nav.becomeRehbar },
    { to: '/resources', label: t.nav.resources },
    { to: '/schools', label: t.nav.schools },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <footer className="bg-mint-900 text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <Wordmark variant="dark" />
          <p className="mt-4 max-w-sm text-mint-200">{t.brand.mission}</p>
        </div>

        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-base text-white">
            {t.footer.quickLinks}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-tap items-center text-mint-200 no-underline hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          {socials.length > 0 && (
            <>
              <h2 className="text-base text-white">{t.footer.social}</h2>
              <ul className="mt-3">
                {socials.map((k) => (
                  <li key={k}>
                    <a
                      href={site.social[k]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-tap items-center text-mint-200 no-underline hover:text-white hover:underline"
                    >
                      {socialLabels[k]}
                      <span className="sr-only"> {t.common.opensNewTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {site.contactEmail && (
            <p className="mt-6">
              <span className="block text-sm text-mint-200">{t.footer.email}</span>
              <a
                href={`mailto:${site.contactEmail}`}
                dir="ltr"
                className="inline-flex min-h-tap items-center font-semibold text-white underline"
              >
                {site.contactEmail}
              </a>
            </p>
          )}
          <p className="mt-6 text-sm text-mint-200">{t.footer.privacyNote}</p>
          <Link to="/privacy" className="mt-1 inline-flex min-h-tap items-center text-sm text-white underline">
            {t.footer.privacyLink}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-1 py-6 text-sm text-mint-200 sm:flex-row sm:justify-between">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <p>{t.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  )
}
