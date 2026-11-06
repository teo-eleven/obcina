import type { FirebaseOptions } from 'firebase/app'

// The web config is public (it ships to every visitor); Firestore rules are what protect data.
// It still lives in .env.local so each environment (local, emulator, Vercel) can point elsewhere.
const ENV_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const

type ConfigField = keyof typeof ENV_KEYS

// Firebase keeps any `demo-` project offline: with it, test data can never reach the live project.
export const EMULATOR_PROJECT_ID = 'demo-obcina'
// Must match firebase.json (guarded by emulatorSetup.test.ts).
export const EMULATOR_HOST = '127.0.0.1'
export const FIRESTORE_EMULATOR_PORT = 8080
export const AUTH_EMULATOR_PORT = 9099

export const EMULATOR_CONFIG: FirebaseOptions = {
  apiKey: 'demo-api-key',
  authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
  projectId: EMULATOR_PROJECT_ID,
  appId: 'demo-app-id',
}

// Set by .env.emulators (`npm run dev:emulators`). Exact match only, so a typo stays on the safe side.
export function usesEmulators(env: Readonly<Record<string, string | undefined>>): boolean {
  return env.VITE_USE_EMULATORS === 'true'
}

export function readFirebaseConfig(
  env: Readonly<Record<string, string | undefined>>,
): FirebaseOptions {
  const read = (field: ConfigField) => env[ENV_KEYS[field]]?.trim() ?? ''
  const config = {
    apiKey: read('apiKey'),
    authDomain: read('authDomain'),
    projectId: read('projectId'),
    appId: read('appId'),
  } satisfies Record<ConfigField, string>

  const missing = Object.values(ENV_KEYS).filter((envKey) => !env[envKey]?.trim())
  if (missing.length > 0) {
    // Names only, never values: this message can end up in logs or on screen.
    throw new Error(
      `Missing Firebase config: ${missing.join(', ')}. Copy .env.example to .env.local and fill them in.`,
    )
  }

  return config
}
