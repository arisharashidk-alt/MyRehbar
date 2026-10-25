import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ListChecks, Menu, X } from 'lucide-react'
import { Wordmark } from './Logo'
import { LanguageToggle } from './LanguageToggle'
import { Button } from './Button'
import { useI18n } from '../i18n'
import { useSession } from '../tracker/session'

export function Header() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const session = useSession()
  const trackerLabel = session ? t.nav.myTracker : t.nav.tracker

  // Close the mobile menu when the page changes or Escape is pressed.
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const links = [
    { to: '/rehbars', label: t.nav.rehbars },
    { to: '/scholarships', label: t.nav.scholarships },
    { to: '/universities', label: t.nav.universities },
    { to: '/students', label: t.nav.students },
    { to: '/resources', label: t.nav.resources },
    { to: '/schools', label: t.nav.schools },
    { to: '/about', label: t.nav.about },
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-tap items-center rounded-lg px-3 font-semibold no-underline transition duration-150 ${
      isActive ? 'text-mint-900 bg-mint-50' : 'text-ink hover:text-mint-700'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="no-underline" aria-label="MyRehbar, home">
          <Wordmark size={30} />
        </Link>

        <nav aria-label={t.nav.mainNav} className="hidden xl:block">
          <ul className="flex items-center gap-1 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {/* Icon only until there is room for the words, so the main menu never wraps. */}
          <NavLink
            to="/tracker"
            title={trackerLabel}
            className={({ isActive }) =>
              `hidden min-h-tap min-w-tap items-center justify-center gap-2 rounded-xl border border-line px-2 text-sm font-semibold no-underline transition duration-150 xl:inline-flex 2xl:px-3 ${
                isActive ? 'bg-mint-50 text-mint-900' : 'bg-white text-mint-900 hover:border-mint-700'
              }`
            }
          >
            <ListChecks aria-hidden size={20} strokeWidth={1.5} />
            <span className="sr-only 2xl:not-sr-only">{trackerLabel}</span>
          </NavLink>
          <Button to="/become-a-rehbar" size="sm" className="hidden xl:inline-flex">
            {t.nav.becomeRehbar}
          </Button>
          <button
            type="button"
            className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-xl border border-line bg-white text-mint-900 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden size={22} strokeWidth={1.5} /> : <Menu aria-hidden size={22} strokeWidth={1.5} />}
            <span className="sr-only">{open ? t.nav.closeMenu : t.nav.openMenu}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={t.nav.mainNav} className="border-t border-line bg-paper xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-4 text-lg">
            {[...links, { to: '/contact', label: t.nav.contact }, { to: '/tracker', label: trackerLabel }].map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-3">
              <Button to="/become-a-rehbar" className="w-full">
                {t.nav.becomeRehbar}
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
