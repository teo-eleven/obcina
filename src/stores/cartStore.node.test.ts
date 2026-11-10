// @vitest-environment node
import { describe, expect, it } from 'vitest'

// Outside a browser (Node scripts, server code at checkout) there is no window and no storage.
describe('cartStore without a window', () => {
  it('loads and creates the app instance in memory', async () => {
    const { cartStore } = await import('./cartStore')

    expect(cartStore.getSnapshot()).toEqual([])
  })

  it('subscribes, changes and unsubscribes without touching window', async () => {
    const { createCartStore } = await import('./cartStore')
    const store = createCartStore(undefined)
    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls += 1
    })

    store.addItem('miere-de-tei')
    unsubscribe()
    store.addItem('miere-de-tei')

    expect(calls).toBe(1)
    expect(store.getSnapshot()).toEqual([{ productId: 'miere-de-tei', quantity: 2 }])
  })
})
