import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import en from './en'
import ur from './ur'
import { I18nContext, type Lang } from './context'
import { withFallback } from './merge'

const STORAGE_KEY = 'myrehbar-lang' // only the language choice is stored, never personal data
const URDU_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap'

// Urdu with English fallback for anything still marked TODO-UR.
const urMerged = withFallback(ur, en)

function readSavedLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'ur' ? 'ur' : 'en'
  } catch {
    return 'en'
  }
}

/** Load the Urdu font only when it is first needed (it is large, so we skip it for English readers). */
function loadUrduFont() {
  if (document.getElementById('urdu-font')) return
  const link = document.createElement('link')
  link.id = 'urdu-font'
  link.rel = 'stylesheet'
  link.href = URDU_FONT_URL
  document.head.appendChild(link)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readSavedLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode or blocked storage: the choice just won't be remembered.
    }
  }, [])

  // Keep <html lang> and <html dir> in sync so the browser lays out Urdu right-to-left.
  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ur' ? 'rtl' : 'ltr'
    if (lang === 'ur') loadUrduFont()
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: lang === 'ur' ? urMerged : en,
      dir: (lang === 'ur' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
