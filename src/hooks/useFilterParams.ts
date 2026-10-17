import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Keeps filter values in the URL (?field=cs&women=1), so a filtered list can be shared
 * or linked to, e.g. /rehbars?women=1 for "Women Rehbars only".
 */
export function useFilterParams() {
  const [params, setParams] = useSearchParams()

  const get = useCallback((key: string) => params.get(key) ?? '', [params])
  const getBool = useCallback((key: string) => params.get(key) === '1', [params])

  const set = useCallback(
    (key: string, value: string | boolean) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const v = typeof value === 'boolean' ? (value ? '1' : '') : value
          if (v) next.set(key, v)
          else next.delete(key)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const clear = useCallback(() => setParams({}, { replace: true }), [setParams])
  const hasAny = [...params.keys()].length > 0

  return { get, getBool, set, clear, hasAny }
}
