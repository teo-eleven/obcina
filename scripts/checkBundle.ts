// Fails when the code every visitor downloads first (the entry chunk and every chunk it imports
// statically) pulls in zod or Firebase. Both belong in the lazy chunk of the data pages. The folder
// index.ts files make it easy to drag them in by accident, and only package.json "sideEffects"
// keeps them out (CLAUDE.md), so this guards that after `npm run build`.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const DIST = resolve(import.meta.dirname, '..', 'dist')

// Strings that only appear in each library's own code and survive minification. FirebaseError
// ships with any Firebase module (firebase/app included), not only Firestore.
const FORBIDDEN = [
  { library: 'zod', marker: 'ZodError' },
  { library: 'Firebase', marker: 'FirebaseError' },
] as const

// Static imports between built chunks: `import"./x.js"` / `from"./x.js"` (minified or not).
// Lazy routes use import("./x.js") and are deliberately not followed.
const STATIC_IMPORT = /(?:\bimport|\bfrom)\s*["'](\.{1,2}\/[^"']+\.js)["']/g

function entryChunkPath(): string {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8')
  const src = /<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/.exec(html)?.[1]
  if (!src) throw new Error('No module script in dist/index.html; run `npm run build` first.')
  return resolve(DIST, src)
}

/** The entry chunk and everything it loads before the page can run. */
function firstLoadChunks(entry: string): string[] {
  const seen = new Set<string>()
  const queue = [entry]
  while (queue.length > 0) {
    const chunk = queue.pop()!
    if (seen.has(chunk)) continue
    seen.add(chunk)
    const code = readFileSync(chunk, 'utf8')
    for (const match of code.matchAll(STATIC_IMPORT)) {
      queue.push(resolve(dirname(chunk), match[1]!))
    }
  }
  return [...seen]
}

function main(): void {
  const chunks = firstLoadChunks(entryChunkPath())
  const leaks = chunks.flatMap((chunk) => {
    const code = readFileSync(chunk, 'utf8')
    return FORBIDDEN.filter(({ marker }) => code.includes(marker)).map(
      ({ library }) => `${library} in ${chunk}`,
    )
  })
  if (leaks.length > 0) {
    console.error(`First-load code must stay free of zod and Firebase:\n  ${leaks.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`First-load code is free of zod and Firebase (${chunks.length} chunk(s) checked).`)
}

main()
