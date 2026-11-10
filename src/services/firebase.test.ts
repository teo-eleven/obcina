import { afterEach, describe, expect, it, vi } from 'vitest'
import { EMULATOR_CONFIG } from './firebaseConfig'
import { EMULATOR_HOST, EMULATOR_PROJECT_ID, FIRESTORE_EMULATOR_PORT } from '../constants'

const fakeApp = { name: 'fake-app' }
const fakeDb = { type: 'fake-firestore' }

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => fakeApp) }))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => fakeDb),
  connectFirestoreEmulator: vi.fn(),
}))

function stubValidEnv() {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'demo-obcina.firebaseapp.com')
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'demo-obcina')
  vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123:web:test-app-id')
  // .env.local is loaded in tests too; pin the flag off so these cover the real-project path.
  vi.stubEnv('VITE_USE_EMULATORS', '')
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

  it('never connects to the emulator without the flag', async () => {
    stubValidEnv()
    const { firestore, firebase } = await loadModules()

    firebase.getDb()

    expect(firestore.connectFirestoreEmulator).not.toHaveBeenCalled()
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

describe('getDb with emulators', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('refuses emulator mode in a production build, so a leaked flag fails loudly', async () => {
    vi.stubEnv('VITE_USE_EMULATORS', 'true')
    vi.stubEnv('MODE', 'production')
    const { app, firebase } = await loadModules()

    expect(() => firebase.getDb()).toThrow(/VITE_USE_EMULATORS/)
    expect(app.initializeApp).not.toHaveBeenCalled()
  })

  it('initialises the demo project and connects Firestore to the emulator, with no real config', async () => {
    // Vitest loads .env.local, so blank the real values to prove they are not needed.
    for (const key of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID']) {
      vi.stubEnv(`VITE_FIREBASE_${key}`, '')
    }
    vi.stubEnv('VITE_USE_EMULATORS', 'true')
    const { app, firestore, firebase } = await loadModules()

    const db = firebase.getDb()

    expect(db).toBe(fakeDb)
    expect(app.initializeApp).toHaveBeenCalledWith(EMULATOR_CONFIG)
    expect(firestore.getFirestore).toHaveBeenCalledWith(fakeApp)
    expect(firestore.connectFirestoreEmulator).toHaveBeenCalledWith(
      fakeDb,
      EMULATOR_HOST,
      FIRESTORE_EMULATOR_PORT,
    )
  })

  it('ignores real VITE_FIREBASE_* values so test data cannot reach the real project', async () => {
    stubValidEnv()
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'obcina-real-project')
    vi.stubEnv('VITE_USE_EMULATORS', 'true')
    const { app, firebase } = await loadModules()

    firebase.getDb()

    expect(app.initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: EMULATOR_PROJECT_ID }),
    )
  })

  it('connects exactly once across repeated calls', async () => {
    vi.stubEnv('VITE_USE_EMULATORS', 'true')
    const { app, firestore, firebase } = await loadModules()

    firebase.getDb()
    firebase.getDb()

    expect(app.initializeApp).toHaveBeenCalledTimes(1)
    expect(firestore.connectFirestoreEmulator).toHaveBeenCalledTimes(1)
  })

  it('does not connect when the flag is not exactly "true"', async () => {
    stubValidEnv()
    vi.stubEnv('VITE_USE_EMULATORS', '1')
    const { firestore, firebase } = await loadModules()

    firebase.getDb()

    expect(firestore.connectFirestoreEmulator).not.toHaveBeenCalled()
  })
})
