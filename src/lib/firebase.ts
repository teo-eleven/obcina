import { initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { readFirebaseConfig } from './firebaseConfig'

// The one deliberate piece of module state: a single Firestore instance for the whole app.
let db: Firestore | undefined

// Lazy on purpose: pages that never touch data don't need a config, so tests and builds without
// .env.local keep working, and a missing variable fails where data is first needed, not at startup.
export function getDb(): Firestore {
  db ??= getFirestore(initializeApp(readFirebaseConfig(import.meta.env)))
  return db
}
