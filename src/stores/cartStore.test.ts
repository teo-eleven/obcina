import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCartStore } from './cartStore'
import { CART_STORAGE_KEY, EMPTY_CART, MAX_LINE_QUANTITY, MAX_SAVED_CART_CHARS } from '../constants'
import { parseCart } from '../utils'

const MIERE = 'miere-de-tei'
const ZACUSCA = 'zacusca-de-ciuperci'

type FakeStorage = Pick<Storage, 'getItem' | 'setItem'>

/** In-memory storage; `values` is exposed so tests can seed and inspect it. */
function fakeStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
  } satisfies FakeStorage
  return { storage, values }
}

const stored = (values: Map<string, string>) => JSON.parse(values.get(CART_STORAGE_KEY) ?? 'null')

function fireStorageEvent(key: string | null, newValue: string | null, storageArea?: Storage) {
  window.dispatchEvent(
    new StorageEvent('storage', { key, newValue, storageArea: storageArea ?? null }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('CART_STORAGE_KEY', () => {
  // Pinned on purpose: changing it orphans every saved cart, so it must come with a migration.
  it('is versioned', () => {
    expect(CART_STORAGE_KEY).toBe('obcina.cart.v1')
  })
})

describe('createCartStore: initial state', () => {
  it('starts as the empty cart with empty storage', () => {
    const { storage } = fakeStorage()

    expect(createCartStore(storage).getSnapshot()).toEqual(EMPTY_CART)
  })

  it('works in memory when storage is undefined (private mode)', () => {
    const store = createCartStore(undefined)

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    store.addItem(MIERE, 2)
    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 2 }])
  })

  it('reads the cart saved under CART_STORAGE_KEY', () => {
    const { storage } = fakeStorage({
      [CART_STORAGE_KEY]: JSON.stringify([{ productId: MIERE, quantity: 3 }]),
    })

    expect(createCartStore(storage).getSnapshot()).toEqual([{ productId: MIERE, quantity: 3 }])
    expect(storage.getItem).toHaveBeenCalledWith(CART_STORAGE_KEY)
  })

  it.each(['{', 'null', '"x"', '[{"productId":1}]', 'not json', ''])(
    'starts empty, without throwing, when the stored value is %j',
    (corrupt) => {
      const { storage } = fakeStorage({ [CART_STORAGE_KEY]: corrupt })

      expect(createCartStore(storage).getSnapshot()).toEqual(EMPTY_CART)
    },
  )

  it('starts empty without parsing a saved value longer than MAX_SAVED_CART_CHARS', () => {
    const parse = vi.spyOn(JSON, 'parse')
    const { storage } = fakeStorage({
      [CART_STORAGE_KEY]: `[${'0,'.repeat(MAX_SAVED_CART_CHARS)}0]`,
    })

    expect(createCartStore(storage).getSnapshot()).toEqual(EMPTY_CART)
    expect(parse).not.toHaveBeenCalled()
  })

  it('allows a saved value of 8 KB, more than a full 50-line cart needs', () => {
    expect(MAX_SAVED_CART_CHARS).toBe(8192)
    const full = Array.from({ length: 50 }, (_, i) => ({
      productId: `produs-cu-un-nume-destul-de-lung-${i}`,
      quantity: 99,
    }))
    expect(JSON.stringify(full).length).toBeLessThan(MAX_SAVED_CART_CHARS)
  })

  it('does not warn about corrupt saved data (an old or edited value is not an error)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { storage } = fakeStorage({ [CART_STORAGE_KEY]: '{' })

    createCartStore(storage)

    expect(warn).not.toHaveBeenCalled()
  })

  it('keeps the valid lines of partially valid data (delegates to parseCart)', () => {
    const raw = [{ productId: MIERE, quantity: 2 }, { productId: '../x', quantity: 1 }, null]
    const { storage } = fakeStorage({ [CART_STORAGE_KEY]: JSON.stringify(raw) })

    const snapshot = createCartStore(storage).getSnapshot()

    expect(snapshot).toStrictEqual(parseCart(raw))
    expect(snapshot).toStrictEqual([{ productId: MIERE, quantity: 2 }])
  })
})

describe('createCartStore: actions and persistence', () => {
  it('addItem adds a line (default quantity 1) and saves the cart as JSON', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)

    store.addItem(MIERE)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 1 }])
    expect(stored(values)).toEqual([{ productId: MIERE, quantity: 1 }])
  })

  it('addItem increases an existing line and caps it', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)

    store.addItem(MIERE, MAX_LINE_QUANTITY - 1)
    store.addItem(MIERE, 5)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: MAX_LINE_QUANTITY }])
  })

  it('setQuantity changes a quantity and saves it', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE)

    store.setQuantity(MIERE, 4)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 4 }])
    expect(stored(values)).toEqual([{ productId: MIERE, quantity: 4 }])
  })

  it('setQuantity to 0 removes the line', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)

    store.setQuantity(MIERE, 0)

    expect(store.getSnapshot()).toEqual([])
  })

  it('removeItem removes a line and saves the cart', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE)
    store.addItem(ZACUSCA)

    store.removeItem(MIERE)

    expect(store.getSnapshot()).toEqual([{ productId: ZACUSCA, quantity: 1 }])
    expect(stored(values)).toEqual([{ productId: ZACUSCA, quantity: 1 }])
  })

  it('clear empties the cart and saves it', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE)

    store.clear()

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    expect(stored(values)).toEqual([])
  })

  it('survives a refresh: a second store on the same storage starts with the same cart', () => {
    const { storage } = fakeStorage()
    const first = createCartStore(storage)
    first.addItem(MIERE, 2)
    first.addItem(ZACUSCA)

    const second = createCartStore(storage)

    expect(second.getSnapshot()).toEqual(first.getSnapshot())
    expect(second.getSnapshot()).toEqual([
      { productId: MIERE, quantity: 2 },
      { productId: ZACUSCA, quantity: 1 },
    ])
  })

  it('throws RangeError for invalid arguments instead of swallowing them', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)

    expect(() => store.addItem(MIERE, 0)).toThrow(RangeError)
    expect(() => store.addItem('', 1)).toThrow(RangeError)
    expect(() => store.setQuantity(MIERE, 1.5)).toThrow(RangeError)
    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    expect(storage.setItem).not.toHaveBeenCalled()
  })
})

describe('createCartStore: what it accepts survives a reload', () => {
  it('refuses an id that parseCart would drop on the next load', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)

    expect(() => store.addItem('Foo Bar')).toThrow(RangeError)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('round-trips every cart it builds through storage unchanged', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE, 3)
    store.addItem(ZACUSCA, MAX_LINE_QUANTITY)
    store.setQuantity(MIERE, 7)

    expect(createCartStore(storage).getSnapshot()).toStrictEqual(store.getSnapshot())
  })
})

describe('createCartStore: no-op actions', () => {
  it('keep the snapshot reference, do not notify and do not write', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE, 2)
    const before = store.getSnapshot()
    const listener = vi.fn()
    store.subscribe(listener)
    storage.setItem.mockClear()

    store.removeItem('produs-necunoscut')
    store.setQuantity(MIERE, 2)
    store.setQuantity('produs-necunoscut', 5)

    expect(store.getSnapshot()).toBe(before)
    expect(listener).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('clear on an empty cart does not notify or write', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)

    store.clear()

    expect(listener).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })
})

describe('createCartStore: storage failures', () => {
  it('does not crash when getItem throws, and warns once without the stored value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const secret = 'SECRET-STORED-VALUE'
    const storage: FakeStorage = {
      getItem: () => {
        throw new Error(`blocked ${secret}`)
      },
      setItem: () => undefined,
    }

    const store = createCartStore(storage)

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).not.toContain(secret)
  })

  it('keeps updating in memory when setItem throws (quota), warning once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const storage: FakeStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
    }
    const store = createCartStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)

    expect(() => store.addItem(MIERE, 2)).not.toThrow()

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 2 }])
    expect(listener).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(warn.mock.calls)).not.toContain(MIERE)
  })
})

describe('createCartStore: unreadable storage and catching up', () => {
  it('keeps the in-memory cart when storage still cannot be read at the next subscribe', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const store = createCartStore({
      getItem: () => {
        throw new DOMException('denied', 'SecurityError')
      },
      setItem: () => undefined,
    })
    store.addItem(MIERE, 2)

    const unsubscribe = store.subscribe(() => undefined)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 2 }])
    expect(warn).toHaveBeenCalledTimes(1)
    unsubscribe()
  })
})

describe('createCartStore: repeated storage failures', () => {
  it('warns only once however many writes fail, so the console is not flooded', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const store = createCartStore({
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
    })

    store.addItem(MIERE)
    store.addItem(MIERE)
    store.addItem(ZACUSCA)

    expect(store.getSnapshot()).toEqual([
      { productId: MIERE, quantity: 2 },
      { productId: ZACUSCA, quantity: 1 },
    ])
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe('createCartStore: subscribe', () => {
  it('calls the listener once per real change', () => {
    const store = createCartStore(fakeStorage().storage)
    const listener = vi.fn()
    store.subscribe(listener)

    store.addItem(MIERE)
    store.addItem(MIERE)
    store.setQuantity(MIERE, 5)
    store.removeItem(MIERE)

    expect(listener).toHaveBeenCalledTimes(4)
  })

  it('stops calling the listener after unsubscribe', () => {
    const store = createCartStore(fakeStorage().storage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    unsubscribe()
    store.addItem(MIERE)

    expect(listener).not.toHaveBeenCalled()
  })

  it('notifies every subscriber and only unsubscribes the one asked', () => {
    const store = createCartStore(fakeStorage().storage)
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribeFirst = store.subscribe(first)
    store.subscribe(second)

    unsubscribeFirst()
    store.addItem(MIERE)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('returns a referentially stable snapshot between changes', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)

    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })

  it('returns a new snapshot reference after a change', () => {
    const store = createCartStore(fakeStorage().storage)
    const before = store.getSnapshot()

    store.addItem(MIERE)

    expect(store.getSnapshot()).not.toBe(before)
  })

  it('has a stable snapshot when the stored data is corrupt', () => {
    const { storage } = fakeStorage({ [CART_STORAGE_KEY]: '{' })
    const store = createCartStore(storage)

    expect(store.getSnapshot()).toBe(store.getSnapshot())
  })
})

describe('createCartStore: cross-tab sync', () => {
  it('adopts the cart from a storage event for the cart key and notifies', () => {
    const store = createCartStore(fakeStorage().storage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    const incoming = [{ productId: ZACUSCA, quantity: 2 }]

    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify(incoming))

    expect(store.getSnapshot()).toStrictEqual(parseCart(incoming))
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('validates incoming data through parseCart', () => {
    const store = createCartStore(fakeStorage().storage)
    const unsubscribe = store.subscribe(() => undefined)
    const incoming = [
      { productId: MIERE, quantity: 500 },
      { productId: '../x', quantity: 1 },
    ]

    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify(incoming))

    expect(store.getSnapshot()).toStrictEqual([{ productId: MIERE, quantity: MAX_LINE_QUANTITY }])
    unsubscribe()
  })

  it('ignores events for other keys', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)
    const before = store.getSnapshot()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    fireStorageEvent('other.key', JSON.stringify([{ productId: ZACUSCA, quantity: 1 }]))

    expect(store.getSnapshot()).toBe(before)
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('becomes the empty cart when another tab clears the key (newValue null)', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    fireStorageEvent(CART_STORAGE_KEY, null)

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('treats corrupt incoming JSON as an empty cart without throwing', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)
    const unsubscribe = store.subscribe(() => undefined)

    expect(() => fireStorageEvent(CART_STORAGE_KEY, '{')).not.toThrow()

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    unsubscribe()
  })

  it('does not notify when the incoming cart equals the current one', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE, 2)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify([{ productId: MIERE, quantity: 2 }]))

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('does not write back to storage when it adopts an incoming cart', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    const unsubscribe = store.subscribe(() => undefined)

    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify([{ productId: MIERE, quantity: 1 }]))

    expect(storage.setItem).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('attaches the window listener only while there is a subscriber', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const store = createCartStore(fakeStorage().storage)
    const storageCalls = (spy: typeof add) => spy.mock.calls.filter(([type]) => type === 'storage')

    expect(storageCalls(add)).toHaveLength(0)

    const unsubscribeFirst = store.subscribe(() => undefined)
    const unsubscribeSecond = store.subscribe(() => undefined)
    expect(storageCalls(add)).toHaveLength(1)

    unsubscribeFirst()
    expect(storageCalls(remove)).toHaveLength(0)

    unsubscribeSecond()
    expect(storageCalls(remove)).toHaveLength(1)
    expect(storageCalls(remove)[0]?.[1]).toBe(storageCalls(add)[0]?.[1])
  })

  it('becomes the empty cart when another tab clears all storage (key null)', () => {
    const store = createCartStore(fakeStorage().storage)
    store.addItem(MIERE)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    fireStorageEvent(null, null)

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('ignores the same key changing in another storage area (sessionStorage)', () => {
    const store = createCartStore(window.localStorage)
    const unsubscribe = store.subscribe(() => undefined)

    fireStorageEvent(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: MIERE, quantity: 1 }]),
      window.sessionStorage,
    )

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
    unsubscribe()
  })

  it('catches up with changes made while nobody was listening, on the next subscribe', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)
    values.set(CART_STORAGE_KEY, JSON.stringify([{ productId: ZACUSCA, quantity: 4 }]))

    const unsubscribe = store.subscribe(() => undefined)

    expect(store.getSnapshot()).toEqual([{ productId: ZACUSCA, quantity: 4 }])
    expect(storage.setItem).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('stops reacting to storage events after the last unsubscribe', () => {
    const store = createCartStore(fakeStorage().storage)
    const unsubscribe = store.subscribe(() => undefined)
    unsubscribe()

    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify([{ productId: MIERE, quantity: 1 }]))

    expect(store.getSnapshot()).toEqual(EMPTY_CART)
  })

  it('calling unsubscribe twice does not detach another subscriber', () => {
    const store = createCartStore(fakeStorage().storage)
    const unsubscribeFirst = store.subscribe(() => undefined)
    const listener = vi.fn()
    const unsubscribeSecond = store.subscribe(listener)

    unsubscribeFirst()
    unsubscribeFirst()
    fireStorageEvent(CART_STORAGE_KEY, JSON.stringify([{ productId: MIERE, quantity: 1 }]))

    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribeSecond()
  })
})

describe('createCartStore: stock limit', () => {
  it('addItem respects the limit', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)

    store.addItem(MIERE, 5, 3)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 3 }])
    expect(stored(values)).toEqual([{ productId: MIERE, quantity: 3 }])
  })

  it('addItem at the limit does not notify or write', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE, 3, 3)
    const before = store.getSnapshot()
    const listener = vi.fn()
    store.subscribe(listener)
    storage.setItem.mockClear()

    store.addItem(MIERE, 1, 3)

    expect(store.getSnapshot()).toBe(before)
    expect(listener).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('setQuantity respects the limit', () => {
    const { storage, values } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE)

    store.setQuantity(MIERE, 9, 4)

    expect(store.getSnapshot()).toEqual([{ productId: MIERE, quantity: 4 }])
    expect(stored(values)).toEqual([{ productId: MIERE, quantity: 4 }])
  })

  it('setQuantity to the already-clamped quantity does not notify or write', () => {
    const { storage } = fakeStorage()
    const store = createCartStore(storage)
    store.addItem(MIERE, 4)
    const listener = vi.fn()
    store.subscribe(listener)
    storage.setItem.mockClear()

    store.setQuantity(MIERE, 9, 4)

    expect(listener).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('throws RangeError for an invalid limit and leaves the cart alone', () => {
    const store = createCartStore(fakeStorage().storage)

    expect(() => store.addItem(MIERE, 1, -1)).toThrow(RangeError)
    expect(store.getSnapshot()).toEqual(EMPTY_CART)
  })
})
