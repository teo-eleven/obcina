import type { FirebaseOptions } from 'firebase/app'
import { EMULATOR_PROJECT_ID } from '../constants'

// The web config is public (it ships to every visitor); Firestore rules are what protect data.
// It still lives in .env.local so each environment (local, emulator, Vercel) can point elsewhere.
const ENV_KEYS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const

type ConfigField = keyof typeof ENV_KEYS

export const EMULATOR_CONFIG: FirebaseOptions = {
  apiKey: 'demo-api-key',
  authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
  projectId: EMULATOR_PROJECT_ID,
  appId: 'demo-app-id',
}

const isDemoProject = (projectId: string) => projectId.startsWith('demo-')

/**
 * Throws unless the given project and the environment can only ever reach the emulators: a `demo-`
 * project, no service-account credentials, no real project named by Google's own variables.
 * For Node scripts that write with the Admin SDK, which ignores security rules.
 */
export function assertEmulatorOnly(
  env: Readonly<Record<string, string | undefined>>,
  projectId: string,
): void {
  if (!isDemoProject(projectId)) {
    throw new Error(`Refusing to run against "${projectId}": only demo- projects are allowed.`)
  }
  // Name the variable, never its value (it is a path to a key file).
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('Refusing to run: GOOGLE_APPLICATION_CREDENTIALS is set. Unset it first.')
  }
  for (const key of ['GCLOUD_PROJECT', 'GOOGLE_CLOUD_PROJECT']) {
    const named = env[key]
    if (named && !isDemoProject(named)) {
      throw new Error(`Refusing to run: ${key} names a real project. Unset it first.`)
    }
  }
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
