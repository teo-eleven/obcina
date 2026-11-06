import { afterEach, describe, expect, it, vi } from 'vitest'

const fakeApp = { name: 'fake-app' }
const fakeDb = { type: 'fake-firestore' }

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => fakeApp) }))
vi.mock('firebase/firestore', () => ({ getFirestore: vi.fn(() => fakeDb) }))

function stubValidEnv() {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'demo-obcina.firebaseapp.com')
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-obcina')
  vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123:web:test-app-id')
}

// resetModules re-runs the vi.mock factories, so every load gets fresh mocks and a fresh `db`.
// Import the mocks before ./firebase so both sides share the same mock instances.
async function loadModules() {
  vi.resetModules()
  const app = await import('firebase/app')
  const firestore = await import('firebase/firestore')
  const firebase = await import('./firebase')
  return { app, firestore, firebase }
}

describe('getDb', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('does not initialise Firebase on import', async () => {
    stubValidEnv()

    const { app, firestore } = await loadModules()

    expect(app.initializeApp).not.toHaveBeenCalled()
    expect(firestore.getFirestore).not.toHaveBeenCalled()
  })

  it('initialises once and returns the same instance on repeated calls', async () => {
    stubValidEnv()
    const { app, firestore, firebase } = await loadModules()

    const first = firebase.getDb()
    const second = firebase.getDb()

    expect(first).toBe(fakeDb)
    expect(second).toBe(first)
    expect(app.initializeApp).toHaveBeenCalledTimes(1)
    expect(firestore.getFirestore).toHaveBeenCalledTimes(1)
    expect(firestore.getFirestore).toHaveBeenCalledWith(fakeApp)
  })

  it('reads its config from the Vite env', async () => {
    stubValidEnv()
    const { app, firebase } = await loadModules()

    firebase.getDb()

    expect(app.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'demo-obcina' }),
    )
  })

  it('throws the config error and never initialises when env is missing', async () => {
    stubValidEnv()
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    const { app, firestore, firebase } = await loadModules()

    expect(() => firebase.getDb()).toThrow(/VITE_FIREBASE_PROJECT_ID/)
    expect(app.initializeApp).not.toHaveBeenCalled()
    expect(firestore.getFirestore).not.toHaveBeenCalled()
  })

  it('does not remember a config error, so a fixed env works on the next call', async () => {
    stubValidEnv()
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '')
    const { firebase } = await loadModules()
    expect(() => firebase.getDb()).toThrow()

    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-obcina')

    expect(firebase.getDb()).toBe(fakeDb)
  })
})
