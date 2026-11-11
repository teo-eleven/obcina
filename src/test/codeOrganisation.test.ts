// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

// Pins the folder layout described in CLAUDE.md ("Organizarea codului").
const SRC = join(process.cwd(), 'src')
const BARREL_FOLDERS = ['hooks', 'utils', 'schemas', 'types', 'constants', 'services', 'stores']
const INDEXED_FOLDERS = [
  'components',
  'components/illustrations',
  'components/ui',
  'components/ui/sheet',
  ...BARREL_FOLDERS,
]
const PAGE_NAMES = ['HomePage', 'CategoryPage', 'ProductPage', 'NotFoundPage']
const ALLOWED_TOP_LEVEL = [
  'components', 'constants', 'hooks', 'pages', 'schemas', 'services', 'stores', 'styles', 'test',
  'types', 'utils', 'main.tsx', 'routes.tsx', 'routes.test.tsx', 'vite-env.d.ts',
] // prettier-ignore
const SEED_FILE = 'seedProducts'
// A heuristic, not a parser: top-level `function Foo` or `const Foo = (` / `x =>` / memo / forwardRef.
// Uppercase constants (NBSP) live in .ts files under constants/, so they never reach this check.
const COMPONENT_DECLARATION =
  /^(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*=\s*(?:\(|\w+\s*=>|(?:React\.)?(?:memo|forwardRef)\b))/gm
// Folders whose modules are imported through their index.ts from anywhere else.
const BARREL_AREAS = ['components', ...BARREL_FOLDERS]
// Plain logic layers: they must never reach for the network code in services/.
const LOWER_LAYERS = ['utils', 'constants', 'schemas', 'types']
const NODE_SIDE = ['scripts', 'e2e', 'firebase']
const RELATIVE_IMPORT = /(?:from\s+|import\s*\(\s*)['"](\.{1,2}\/[^'"]*)['"]/g

const abs = (dir: string) => join(SRC, dir)
const isTest = (file: string) => /\.test\.tsx?$/.test(file)
const isIndex = (file: string) => basename(file).startsWith('index.')
const rel = (file: string) => relative(SRC, file)
const read = (file: string) => readFileSync(file, 'utf8')

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const sourceFiles = (dir: string) =>
  walk(abs(dir)).filter((f) => /\.tsx?$/.test(f) && !isTest(f) && !f.endsWith('.d.ts'))

/** Direct children only: modules that a folder's own index.ts must re-export. */
function directModules(dir: string): string[] {
  if (!existsSync(abs(dir))) return []
  return readdirSync(abs(dir))
    .map((name) => join(abs(dir), name))
    .filter((f) => statSync(f).isFile() && /\.tsx?$/.test(f) && !isTest(f) && !isIndex(f))
}

function componentNames(file: string): string[] {
  return [...read(file).matchAll(COMPONENT_DECLARATION)].map((m) => m[1] ?? m[2]!)
}

/** Every relative import of a file, resolved to an absolute path without extension. */
function relativeImports(file: string): string[] {
  return [...read(file).matchAll(RELATIVE_IMPORT)].map((m) =>
    resolve(dirname(file), m[1]!).replace(/\.(tsx?|css)$/, ''),
  )
}

/** The folder a src path belongs to: a barrel folder, a page folder, or the file itself. */
function areaOf(path: string): string {
  const [first = '', second = ''] = relative(SRC, path).split(sep)
  return first === 'pages' && second ? `pages/${second}` : first
}

/** Names of the direct subfolders of a src folder. */
const subfolders = (dir: string) =>
  existsSync(abs(dir)) ? readdirSync(abs(dir)).filter((name) => isFolder(join(abs(dir), name))) : []

const isFolder = (path: string) => existsSync(path) && statSync(path).isDirectory()

const componentFiles = () =>
  ['components', 'pages'].flatMap(sourceFiles).filter((f) => f.endsWith('.tsx') && !isIndex(f))

describe('code organisation (CLAUDE.md)', () => {
  it.each(INDEXED_FOLDERS)('src/%s exists and has an index.ts', (folder) => {
    expect(existsSync(join(abs(folder), 'index.ts')), `missing src/${folder}/index.ts`).toBe(true)
  })

  it('no longer has src/lib or src/data', () => {
    const leftovers = ['lib', 'data'].filter((d) => existsSync(abs(d)))
    expect(leftovers, 'move these folders into utils/constants/services/types').toEqual([])
  })

  it.each(PAGE_NAMES)('%s lives in its own pages folder with an index.ts', (name) => {
    expect(existsSync(abs(`pages/${name}/${name}.tsx`)), `missing pages/${name}/${name}.tsx`).toBe(
      true,
    )
    expect(existsSync(abs(`pages/${name}/index.ts`)), `missing pages/${name}/index.ts`).toBe(true)
  })

  it('has no .tsx files directly in src/pages', () => {
    const loose = readdirSync(abs('pages')).filter((f) => f.endsWith('.tsx') && !isTest(f))
    expect(loose).toEqual([])
  })

  it('declares exactly one React component per file', () => {
    const offenders = componentFiles()
      .map((f) => ({ file: rel(f), names: componentNames(f) }))
      .filter(({ names }) => names.length !== 1)
      .map(({ file, names }) => `${file} -> [${names.join(', ')}]`)
    expect(offenders, 'files with 0 or several top-level components').toEqual([])
  })

  it('names every component file after its component', () => {
    const offenders = componentFiles()
      .map((f) => ({ file: rel(f), names: componentNames(f), stem: basename(f, extname(f)) }))
      .filter(({ names, stem }) => names.length === 1 && names[0] !== stem)
      .map(({ file, names }) => `${file} declares ${names[0]}`)
    expect(offenders).toEqual([])
  })

  it('keeps utils free of React and hooks', () => {
    const offenders = sourceFiles('utils')
      .filter((f) => !isIndex(f))
      .filter((f) => /from\s+['"](react(\/[^'"]*)?|(\.\.\/)+hooks(\/[^'"]*)?)['"]/.test(read(f)))
      .map(rel)
    expect(offenders, 'utils must be plain logic, no React or hooks').toEqual([])
  })

  it('keeps stores free of React and hooks', () => {
    const offenders = sourceFiles('stores')
      .filter((f) => !isIndex(f))
      .filter((f) => /from\s+['"](react(\/[^'"]*)?|(\.\.\/)+hooks(\/[^'"]*)?)['"]/.test(read(f)))
      .map(rel)
    expect(offenders, 'stores must not import React or hooks').toEqual([])
  })

  it.each(['components', 'components/ui', 'components/ui/sheet', ...BARREL_FOLDERS])(
    're-exports every module of src/%s from its index.ts',
    (folder) => {
      const indexFile = join(abs(folder), 'index.ts')
      const barrel = existsSync(indexFile) ? read(indexFile) : ''
      const missing = directModules(folder)
        .map((f) => basename(f, extname(f)))
        .filter((name) => name !== SEED_FILE)
        .filter((name) => !barrel.includes(`from './${name}'`))
      expect(missing, `not exported by src/${folder}/index.ts`).toEqual([])
    },
  )

  it('re-exports every subfolder of components/ui from components/ui/index.ts', () => {
    const indexFile = abs('components/ui/index.ts')
    const barrel = existsSync(indexFile) ? read(indexFile) : ''
    const folders = ['sheet', ...subfolders('components/ui')]
    const missing = [...new Set(folders)].filter((name) => !barrel.includes(`from './${name}'`))
    expect(missing, 'not exported by src/components/ui/index.ts').toEqual([])
  })

  it('gives every subfolder of components/ui its own index.ts', () => {
    const missing = subfolders('components/ui').filter(
      (name) => !existsSync(join(abs('components/ui'), name, 'index.ts')),
    )
    expect(missing).toEqual([])
  })

  it('holds subfolders of components to the one-component-per-file rules', () => {
    const nested = componentFiles()
      .map(rel)
      .filter((f) => f.startsWith('components/ui/sheet/'))
    expect(nested.length, 'componentFiles() must walk components/ui/sheet').toBeGreaterThan(0)
  })

  it('re-exports every illustration from components/illustrations/index.ts', () => {
    const indexFile = abs('components/illustrations/index.ts')
    const barrel = existsSync(indexFile) ? read(indexFile) : ''
    const missing = directModules('components/illustrations')
      .map((f) => basename(f, extname(f)))
      .filter((name) => !barrel.includes(`from './${name}'`))
    expect(missing).toEqual([])
  })

  it('keeps seedProducts out of every barrel (seed data stays out of app bundles)', () => {
    const exporting = walk(SRC)
      .filter((f) => isIndex(f) && read(f).includes(SEED_FILE))
      .map(rel)
    expect(exporting).toEqual([])
  })

  it('names hook files use*.ts', () => {
    const bad = directModules('hooks')
      .map((f) => basename(f))
      .filter((n) => !/^use[A-Z]\w*\.tsx?$/.test(n))
    expect(bad).toEqual([])
  })

  it('imports from another folder only through its index.ts, and never its own index', () => {
    const offenders = walk(SRC)
      .filter((f) => /\.tsx?$/.test(f))
      .flatMap((file) =>
        relativeImports(file)
          .filter((target) => target.startsWith(SRC + sep))
          .filter((target) => {
            const from = areaOf(file)
            const to = areaOf(target)
            const ownIndex = target === abs(from) && BARREL_AREAS.includes(from)
            if (ownIndex) return true
            if (from === to) return false
            // Test helpers have no index; the seed catalogue is imported by its own path on purpose.
            if (to === 'test' || basename(target) === SEED_FILE) return false
            const intoFolder = BARREL_AREAS.includes(to) || to.startsWith('pages/')
            return intoFolder && target !== abs(to)
          })
          .map((target) => `${rel(file)} -> ${rel(target)}`),
      )
    expect(offenders, 'import the folder (its index.ts), not a file inside it').toEqual([])
  })

  it('keeps utils, constants, schemas and types away from services', () => {
    const offenders = LOWER_LAYERS.flatMap(sourceFiles)
      .filter((f) => relativeImports(f).some((target) => areaOf(target) === 'services'))
      .map(rel)
    expect(offenders, 'plain logic must not import network code').toEqual([])
  })

  it('lets Node scripts, e2e and rules tests import src files directly, never through an index.ts', () => {
    // A folder import would load the whole barrel, e.g. the Firebase client SDK in a Node script.
    const offenders = NODE_SIDE.flatMap((dir) => walk(join(process.cwd(), dir)))
      .filter((f) => /\.tsx?$/.test(f))
      .flatMap((file) =>
        relativeImports(file)
          .filter((target) => target.startsWith(SRC + sep) && isFolder(target))
          .map((target) => `${relative(process.cwd(), file)} -> ${rel(target)}`),
      )
    expect(offenders).toEqual([])
  })

  it('imports firebase packages only inside src/services', () => {
    const offenders = walk(SRC)
      .filter((f) => /\.tsx?$/.test(f) && !isTest(f) && !rel(f).startsWith('services/'))
      .filter((f) => /(?:from\s+|import\s*\(?\s*)['"]firebase\//.test(read(f)))
      .map(rel)
    expect(offenders, 'Firebase belongs in src/services').toEqual([])
  })

  it('only has the allowed top-level entries in src/', () => {
    const unexpected = readdirSync(SRC).filter((entry) => !ALLOWED_TOP_LEVEL.includes(entry))
    expect(unexpected, 'index.css belongs in src/styles/').toEqual([])
  })
})
