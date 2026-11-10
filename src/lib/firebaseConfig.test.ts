import { describe, expect, it } from 'vitest'
import {
  assertEmulatorOnly,
  EMULATOR_PROJECT_ID,
  readFirebaseConfig,
  usesEmulators,
} from './firebaseConfig'

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

describe('usesEmulators', () => {
  it.each([
    ['true', true],
    ['TRUE', false],
    ['True', false],
    ['1', false],
    ['yes', false],
    [' true', false],
    ['true ', false],
    ['false', false],
    ['', false],
    [undefined, false],
  ])('VITE_USE_EMULATORS=%j gives %s', (value, expected) => {
    expect(usesEmulators({ VITE_USE_EMULATORS: value })).toBe(expected)
  })
})

describe('emulator project', () => {
  it('uses a demo- project id, which Firebase keeps offline-only', () => {
    expect(EMULATOR_PROJECT_ID.startsWith('demo-')).toBe(true)
  })
})

// The seed script writes with the Admin SDK, which ignores security rules. This guard is its second
// line of defence: even if the emulator host were lost, it refuses anything that could reach a real
// Google Cloud project.
describe('assertEmulatorOnly', () => {
  it('accepts the demo project with a clean environment', () => {
    expect(() => assertEmulatorOnly({}, EMULATOR_PROJECT_ID)).not.toThrow()
  })

  it.each(['obcina-4f2a1', 'demo', 'my-demo-obcina'])('refuses the project id %s', (projectId) => {
    expect(() => assertEmulatorOnly({}, projectId)).toThrow(/demo-/)
  })

  it('refuses when service-account credentials are in the environment', () => {
    expect(() =>
      assertEmulatorOnly({ GOOGLE_APPLICATION_CREDENTIALS: '/keys/sa.json' }, EMULATOR_PROJECT_ID),
    ).toThrow(/GOOGLE_APPLICATION_CREDENTIALS/)
  })

  it.each(['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT'])(
    'refuses when %s names a real project',
    (key) => {
      expect(() => assertEmulatorOnly({ [key]: 'obcina-4f2a1' }, EMULATOR_PROJECT_ID)).toThrow(
        new RegExp(key),
      )
    },
  )

  it('allows those variables when they name a demo project', () => {
    expect(() =>
      assertEmulatorOnly({ GCLOUD_PROJECT: 'demo-obcina' }, EMULATOR_PROJECT_ID),
    ).not.toThrow()
  })

  it('never echoes the credential path it found', () => {
    expect(() =>
      assertEmulatorOnly(
        { GOOGLE_APPLICATION_CREDENTIALS: '/keys/secret-sa.json' },
        EMULATOR_PROJECT_ID,
      ),
    ).not.toThrow(/secret-sa/)
  })
})
