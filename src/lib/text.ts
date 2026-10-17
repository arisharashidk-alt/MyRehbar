/** Lower-case and strip accents so "Türkiye" matches "turkiye". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** True if every word in the query appears somewhere in the haystack. */
export function matchesQuery(query: string, haystack: (string | undefined)[]): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const text = normalize(haystack.filter(Boolean).join(' '))
  return words.every((w) => text.includes(w))
}

export const uniqueSorted = (values: string[]) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b))
