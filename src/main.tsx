import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { I18nProvider } from './i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
    {/*
      Vercel Web Analytics: counts page views with no cookies and no personal data.
      We send only the page path: search words and filters (?q=..., ?live=...) are removed first.
      To remove analytics: delete this component and its import, and update the privacy page.
    */}
    <Analytics beforeSend={(event) => ({ ...event, url: event.url.split(/[?#]/)[0] })} />
  </StrictMode>,
)
