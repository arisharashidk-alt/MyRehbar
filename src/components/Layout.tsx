import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useI18n } from '../i18n'

function PageLoading() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

export function Layout() {
  const { t } = useI18n()
  const { pathname } = useLocation()

  // Start each new page at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-mint-700 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t.nav.skip}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
