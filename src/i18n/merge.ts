/**
 * Build the Urdu dictionary with English fallbacks:
 * any Urdu string that is empty or starts with "TODO-UR" is replaced by the English text.
 */
export function withFallback<T>(primary: T, fallback: T): T {
  if (typeof primary === 'string') {
    const missing = primary.trim() === '' || primary.startsWith('TODO-UR')
    return (missing ? fallback : primary) as T
  }
  if (Array.isArray(primary) && Array.isArray(fallback)) {
    return fallback.map((item, i) =>
      i < primary.length ? withFallback(primary[i], item) : item,
    ) as T
  }
  if (primary && fallback && typeof primary === 'object' && typeof fallback === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(fallback)) {
      const p = (primary as Record<string, unknown>)[key]
      const f = (fallback as Record<string, unknown>)[key]
      out[key] = p === undefined ? f : withFallback(p, f)
    }
    return out as T
  }
  return primary ?? fallback
}
