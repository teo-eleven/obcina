// Firebase keeps any `demo-` project offline: with it, test data can never reach the live project.
export const EMULATOR_PROJECT_ID = 'demo-obcina'
// Must match firebase.json (guarded by services/emulatorSetup.test.ts).
export const EMULATOR_HOST = '127.0.0.1'
export const FIRESTORE_EMULATOR_PORT = 8080
export const AUTH_EMULATOR_PORT = 9099

// Firestore accepts at most this many values in one 'in' query.
export const FIRESTORE_IN_LIMIT = 30
