import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRemoteData } from './useRemoteData'

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('useRemoteData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts loading, then returns the data', async () => {
    const load = vi.fn().mockResolvedValue('hello')

    const { result } = renderHook(() => useRemoteData('greeting', load))

    expect(result.current).toEqual({ status: 'loading' })
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', data: 'hello' }))
  })

  it('reports an error, then loads again on retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('back')
    const { result } = renderHook(() => useRemoteData('greeting', load))
    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => {
      if (result.current.status === 'error') result.current.retry()
    })

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', data: 'back' }))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('ignores a late answer for an old key', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const loads: Record<string, () => Promise<string>> = {
      a: () => first.promise,
      b: () => second.promise,
    }
    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        useRemoteData(key, loads[key] ?? (() => Promise.reject(new Error('?')))),
      { initialProps: { key: 'a' } },
    )

    rerender({ key: 'b' })
    await act(async () => {
      second.resolve('B')
      await second.promise
    })
    await act(async () => {
      first.resolve('A')
      await first.promise
    })

    expect(result.current).toEqual({ status: 'ready', data: 'B' })
  })

  it('logs a failure with the key', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const failure = new Error('permission-denied')

    const { result } = renderHook(() =>
      useRemoteData('product:miere-de-tei', () => Promise.reject(failure)),
    )

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(error).toHaveBeenCalledWith(expect.stringContaining('product:miere-de-tei'), failure)
  })
})
