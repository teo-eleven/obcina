import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCartStore } from './useCart'
import { EMPTY_CART } from '../constants'
import { createCartStore } from '../stores'

const MIERE = 'miere-de-tei'
const ZACUSCA = 'zacusca-de-ciuperci'

function freshStore() {
  const values = new Map<string, string>()
  return createCartStore({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
  })
}

describe('useCartStore', () => {
  it('starts with the empty cart and no items', () => {
    const { result } = renderHook(() => useCartStore(freshStore()))

    expect(result.current.cart).toEqual(EMPTY_CART)
    expect(result.current.itemCount).toBe(0)
  })

  it('reads a cart that is already in the store', () => {
    const store = freshStore()
    store.addItem(MIERE, 2)

    const { result } = renderHook(() => useCartStore(store))

    expect(result.current.cart).toEqual([{ productId: MIERE, quantity: 2 }])
  })

  it('rerenders when an action runs through the hook', () => {
    const store = freshStore()
    const { result } = renderHook(() => useCartStore(store))

    act(() => result.current.addItem(MIERE, 2))

    expect(result.current.cart).toEqual([{ productId: MIERE, quantity: 2 }])
  })

  it('rerenders when the store changes from outside the hook', () => {
    const store = freshStore()
    const { result } = renderHook(() => useCartStore(store))

    act(() => store.addItem(ZACUSCA))

    expect(result.current.cart).toEqual([{ productId: ZACUSCA, quantity: 1 }])
  })

  it('itemCount is the sum of the quantities', () => {
    const store = freshStore()
    const { result } = renderHook(() => useCartStore(store))

    act(() => {
      result.current.addItem(MIERE, 2)
      result.current.addItem(ZACUSCA, 3)
    })

    expect(result.current.itemCount).toBe(5)
  })

  it('exposes setQuantity, removeItem and clear', () => {
    const store = freshStore()
    const { result } = renderHook(() => useCartStore(store))
    act(() => {
      result.current.addItem(MIERE)
      result.current.addItem(ZACUSCA)
    })

    act(() => result.current.setQuantity(MIERE, 4))
    expect(result.current.itemCount).toBe(5)

    act(() => result.current.removeItem(ZACUSCA))
    expect(result.current.cart).toEqual([{ productId: MIERE, quantity: 4 }])

    act(() => result.current.clear())
    expect(result.current.cart).toEqual(EMPTY_CART)
  })

  it('keeps the action functions stable across renders and changes', () => {
    const store = freshStore()
    const { result, rerender } = renderHook(() => useCartStore(store))
    const first = result.current

    act(() => result.current.addItem(MIERE))
    rerender()

    expect(result.current.addItem).toBe(first.addItem)
    expect(result.current.removeItem).toBe(first.removeItem)
    expect(result.current.setQuantity).toBe(first.setQuantity)
    expect(result.current.clear).toBe(first.clear)
  })

  it('does not rerender when a no-op action runs', () => {
    const store = freshStore()
    store.addItem(MIERE)
    const renders = vi.fn()
    const { result } = renderHook(() => {
      renders()
      return useCartStore(store)
    })
    const before = renders.mock.calls.length

    act(() => result.current.removeItem('produs-necunoscut'))

    expect(renders.mock.calls.length).toBe(before)
  })

  it('unsubscribes from the store on unmount', () => {
    const store = freshStore()
    const unsubscribe = vi.fn()
    const subscribe = store.subscribe.bind(store)
    vi.spyOn(store, 'subscribe').mockImplementation((listener) => {
      const stop = subscribe(listener)
      return () => {
        unsubscribe()
        stop()
      }
    })
    const { unmount } = renderHook(() => useCartStore(store))

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})

describe('useCart', () => {
  it("reads and changes the app's own cart store", async () => {
    const { useCart } = await import('./useCart')
    const { cartStore } = await import('../stores')
    const { result } = renderHook(() => useCart())

    act(() => result.current.addItem(MIERE, 2))

    expect(result.current.cart).toEqual([{ productId: MIERE, quantity: 2 }])
    expect(cartStore.getSnapshot()).toBe(result.current.cart)
    act(() => result.current.clear())
  })
})
