import { createContext, useContext } from 'react'
import type { Dictionary } from './en'
import en from './en'

export type Lang = 'en' | 'ur'

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** The text dictionary for the current language. Example: t.nav.home */
  t: Dictionary
  /** 'ltr' for English, 'rtl' for Urdu */
  dir: 'ltr' | 'rtl'
}

export const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: en,
  dir: 'ltr',
})

/** Use inside any component: const { t, lang } = useI18n() */
export function useI18n() {
  return useContext(I18nContext)
}

/**
 * Fill {placeholders} in a string.
 * fmt('{count} results', { count: 3 }) -> '3 results'
 */
export function fmt(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}
