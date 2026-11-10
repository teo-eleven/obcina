import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'
import {
  EMULATOR_CONFIG,
  EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  readFirebaseConfig,
  usesEmulators,
} from './firebaseConfig'

// The one deliberate piece of module state: a single Firestore instance for the whole app.
let db: Firestore | undefined

function createDb(): Firestore {
  const env = import.meta.env
  if (!usesEmulators(env)) return getFirestore(initializeApp(readFirebaseConfig(env)))
  // A flag leaked into the Vercel build would point every visitor at their own 127.0.0.1; say so
  // instead. Builds with --mode emulators (E2E against a production bundle) stay allowed.
  if (env.MODE === 'production') {
    throw new Error('VITE_USE_EMULATORS=true is not allowed in a production build.')
  }

  // Must connect before the first read or write, so it happens here and only here.
  const emulatorDb = getFirestore(initializeApp(EMULATOR_CONFIG))
  connectFirestoreEmulator(emulatorDb, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT)
  return emulatorDb
}

// Lazy on purpose: pages that never touch data don't need a config, so tests and builds without
// .env.local keep working, and a missing variable fails where data is first needed, not at startup.
export function getDb(): Firestore {
  db ??= createDb()
  return db
}
