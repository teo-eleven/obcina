import { afterEach, describe, expect, it, vi } from 'vitest'
import { CART_STORAGE_KEY } from '../constants'

const MIERE = 'miere-de-tei'

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  window.localStorage.clear()
})

// The app's own cartStore instance, created when the module loads (a fresh module per test).
describe('cartStore (the app instance)', () => {
  it('saves to window.localStorage', async () => {
    const { cartStore } = await import('./cartStore')

    cartStore.addItem(MIERE)

    expect(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? 'null')).toEqual([
      { productId: MIERE, quantity: 1 },
    ])
  })

  it('works in memory when the browser refuses access to localStorage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    const { cartStore } = await import('./cartStore')

    cartStore.addItem(MIERE, 2)

    expect(cartStore.getSnapshot()).toEqual([{ productId: MIERE, quantity: 2 }])
  })
})
