import { describe, expect, it } from 'vitest'
import { readFirebaseConfig } from './firebaseConfig'

const VALID_ENV = {
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-obcina.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-obcina',
  VITE_FIREBASE_APP_ID: '1:123:web:test-app-id',
}

function errorMessageOf(fn: () => unknown): string {
  try {
    fn()
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
  throw new Error('expected the call to throw')
}

describe('readFirebaseConfig', () => {
  it('maps the four VITE_FIREBASE_* variables to Firebase options', () => {
    const config = readFirebaseConfig(VALID_ENV)

    expect(config).toEqual({
      apiKey: 'test-api-key',
      authDomain: 'demo-obcina.firebaseapp.com',
      projectId: 'demo-obcina',
      appId: '1:123:web:test-app-id',
    })
  })

  it('trims surrounding whitespace from values', () => {
    const config = readFirebaseConfig({ ...VALID_ENV, VITE_FIREBASE_PROJECT_ID: '  demo-obcina\n' })

    expect(config.projectId).toBe('demo-obcina')
  })

  it('ignores unrelated keys such as server secrets', () => {
    const config = readFirebaseConfig({ ...VALID_ENV, STRIPE_SECRET_KEY: 'sk_test_fake' })

    expect(Object.keys(config).sort()).toEqual(['apiKey', 'appId', 'authDomain', 'projectId'])
  })

  it('names every missing variable at once and points to .env.local', () => {
    const message = errorMessageOf(() =>
      readFirebaseConfig({
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_APP_ID: undefined,
      }),
    )

    expect(message).toContain('VITE_FIREBASE_AUTH_DOMAIN')
    expect(message).toContain('VITE_FIREBASE_PROJECT_ID')
    expect(message).toContain('VITE_FIREBASE_APP_ID')
    expect(message).not.toContain('VITE_FIREBASE_API_KEY')
    expect(message).toContain('.env.local')
  })

  it('treats empty and whitespace-only values as missing', () => {
    const message = errorMessageOf(() =>
      readFirebaseConfig({ ...VALID_ENV, VITE_FIREBASE_API_KEY: '', VITE_FIREBASE_APP_ID: '   ' }),
    )

    expect(message).toContain('VITE_FIREBASE_API_KEY')
    expect(message).toContain('VITE_FIREBASE_APP_ID')
  })

  it('never puts the provided values in the error message', () => {
    const message = errorMessageOf(() =>
      readFirebaseConfig({ ...VALID_ENV, VITE_FIREBASE_PROJECT_ID: undefined }),
    )

    for (const value of ['test-api-key', 'demo-obcina.firebaseapp.com', '1:123:web:test-app-id']) {
      expect(message).not.toContain(value)
    }
  })
})
