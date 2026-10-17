import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../config/site'

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/**
 * Sets the page title, description, canonical URL and social tags for the current page.
 * Usage: usePageMeta('Scholarships', 'Find scholarships for Pakistani students.')
 */
export function usePageMeta(title: string, description?: string) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`
    const url = site.url + pathname

    document.title = fullTitle
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('link[rel="canonical"]', 'href', url)
    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
      setMeta('meta[name="twitter:description"]', 'content', description)
    }
  }, [title, description, pathname])
}
