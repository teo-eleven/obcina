import type { Product } from './product'

/** What a catalogue sync writes and deletes (utils/catalog.ts, scripts/seed.ts). */
export interface SyncPlan {
  readonly upsert: readonly Product[]
  readonly remove: readonly string[]
}
