import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AUTH_EMULATOR_PORT,
  EMULATOR_HOST,
  EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_PORT,
} from './firebaseConfig'

// Drift guard: the constants the app connects with must match what `npm run emulators` starts.
function readRepoFile(name: string): string {
  return readFileSync(resolve(process.cwd(), name), 'utf8')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function field(source: unknown, path: readonly string[], file: string): unknown {
  let current = source
  for (const key of path) {
    if (!isRecord(current) || !(key in current)) {
      throw new Error(`${file} is missing "${path.join('.')}"`)
    }
    current = current[key]
  }
  return current
}

function readJson(name: string): unknown {
  return JSON.parse(readRepoFile(name))
}

describe('emulator setup', () => {
  it('firebase.json uses the host and ports the app connects to', () => {
    const firebaseJson = readJson('firebase.json')

    for (const emulator of ['firestore', 'auth']) {
      expect(field(firebaseJson, ['emulators', emulator, 'host'], 'firebase.json')).toBe(
        EMULATOR_HOST,
      )
    }

    expect(field(firebaseJson, ['emulators', 'firestore', 'port'], 'firebase.json')).toBe(
      FIRESTORE_EMULATOR_PORT,
    )
    expect(field(firebaseJson, ['emulators', 'auth', 'port'], 'firebase.json')).toBe(
      AUTH_EMULATOR_PORT,
    )
  })

  it('the emulators script runs under the offline-only demo project', () => {
    const script = field(readJson('package.json'), ['scripts', 'emulators'], 'package.json')

    expect(typeof script).toBe('string')
    expect(script).toMatch(new RegExp(`--project ${EMULATOR_PROJECT_ID}(\\s|$)`))
  })

  describe('.env.emulators', () => {
    const readLines = () =>
      readRepoFile('.env.emulators')
        .split(/\r?\n/)
        .map((line) => line.trim())

    it('turns the emulator flag on', () => {
      expect(readLines()).toContain('VITE_USE_EMULATORS=true')
    })

    it('holds no real Firebase config, since the file is committed', () => {
      const leaked = readLines().filter((line) => line.startsWith('VITE_FIREBASE_'))

      expect(leaked).toEqual([])
    })
  })
})
