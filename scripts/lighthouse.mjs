// Lighthouse audit of the production build, on Lighthouse's default mobile profile
// (emulated phone, simulated slow 4G). Writes an HTML report per page to lighthouse-report/
// and exits with code 1 if any category falls below its threshold (see docs/PLAN.md).
// Why this script instead of @lhci/cli: docs/adr/0004-lighthouse-direct-not-lhci.md.
//
// Usage: npm run lighthouse   (builds first, then runs this script)
// Chrome: CHROME_PATH if set, otherwise the Chromium that Playwright installed.

import { access, constants, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import { preview } from 'vite'

// Own port, so it never collides with Playwright's preview server on 4180.
const PORT = 4190
// Performance varies run to run; like Lighthouse CI, judge the median of several runs.
const RUNS_PER_PAGE = 3
const REPORT_DIR = resolve('lighthouse-report')

const PAGES = [
  { slug: 'acasa', path: '/' },
  { slug: '404', path: '/pagina-care-nu-exista' },
]

// Minimum category scores, 0–1. Performance rises to 0.9 at step 11.2.
const THRESHOLDS = {
  performance: 0.85,
  accessibility: 0.95,
  'best-practices': 0.9,
  seo: 0.9,
}

async function chromePath() {
  const { chromium } = await import('@playwright/test')
  const path = process.env.CHROME_PATH || chromium.executablePath()
  // chrome-launcher reports a missing binary as an unhandled 'error' event that crashes Node,
  // so check up front and fail with a readable message instead.
  try {
    await access(path, constants.X_OK)
  } catch {
    throw new Error(
      `Chrome not found or not executable: ${path} (set CHROME_PATH or run "npx playwright install chromium")`,
    )
  }
  return path
}

function categoryScore(result, category) {
  const score = result.lhr.categories[category]?.score
  if (typeof score !== 'number') {
    throw new Error(
      `Lighthouse produced no "${category}" score for ${result.lhr.finalDisplayedUrl}`,
    )
  }
  return score
}

async function runOnce(chrome, url) {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: 'html',
    logLevel: 'error',
    onlyCategories: Object.keys(THRESHOLDS),
  })
  if (!result) throw new Error(`Lighthouse returned no result for ${url}`)
  return result
}

async function auditPage(chrome, page) {
  const url = `http://localhost:${PORT}${page.path}`
  const runs = []
  for (let run = 0; run < RUNS_PER_PAGE; run++) runs.push(await runOnce(chrome, url))
  runs.sort((a, b) => categoryScore(a, 'performance') - categoryScore(b, 'performance'))
  const median = runs[Math.floor(runs.length / 2)]

  await writeFile(resolve(REPORT_DIR, `${page.slug}.html`), String(median.report))

  const row = { page: page.path }
  const failures = []
  for (const [category, minimum] of Object.entries(THRESHOLDS)) {
    const score = categoryScore(median, category)
    row[category] = Math.round(score * 100)
    if (score < minimum) {
      failures.push(`${page.path} ${category}: ${row[category]} < ${Math.round(minimum * 100)}`)
    }
  }
  return { row, failures }
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true })
  // Resolve Chrome before starting anything that needs cleaning up.
  const executable = await chromePath()
  const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'warn' })
  let chrome

  try {
    chrome = await launch({
      chromePath: executable,
      chromeFlags: ['--headless=new', '--no-sandbox'],
    })

    const results = []
    // One page at a time: parallel runs on one Chrome would skew each other's timings.
    for (const page of PAGES) results.push(await auditPage(chrome, page))

    console.table(results.map((result) => result.row))
    console.log(`Reports: ${REPORT_DIR}`)

    const failures = results.flatMap((result) => result.failures)
    if (failures.length > 0) {
      console.error(`\nLighthouse below threshold:\n  ${failures.join('\n  ')}`)
      process.exitCode = 1
    }
  } finally {
    chrome?.kill()
    await server.close()
  }
}

main().catch((error) => {
  console.error('Lighthouse audit failed to run:', error)
  process.exitCode = 1
})
