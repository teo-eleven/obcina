import { useCallback, useEffect, useEffectEvent, useState } from 'react'

export type RemoteData<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly retry: () => void }
  | { readonly status: 'ready'; readonly data: T }

type Settled<T> = { readonly status: 'error' } | { readonly status: 'ready'; readonly data: T }

/**
 * Loads data for `key` and reloads when the key changes or on retry. An answer for a key the page
 * has already left is ignored. `load` must read only what `key` describes.
 */
export function useRemoteData<T>(key: string, load: () => Promise<T>): RemoteData<T> {
  // Each result remembers which request it answers, so loading is derived, not stored.
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<{ request: string; result: Settled<T> } | null>(null)
  const request = `${key}#${attempt}`
  // Always the latest `load`, without making the effect re-run on every new closure.
  const loadLatest = useEffectEvent(load)

  useEffect(() => {
    let isCurrent = true
    loadLatest().then(
      (data) => {
        if (isCurrent) setSettled({ request, result: { status: 'ready', data } })
      },
      (error: unknown) => {
        if (!isCurrent) return
        // The page shows a plain message; the cause (offline, permission-denied...) goes here.
        console.error(`Could not load ${key}:`, error)
        setSettled({ request, result: { status: 'error' } })
      },
    )
    return () => {
      isCurrent = false
    }
  }, [key, request])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  if (settled?.request !== request) return { status: 'loading' }
  return settled.result.status === 'error' ? { status: 'error', retry } : settled.result
}
