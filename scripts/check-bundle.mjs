#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import zlib from 'node:zlib'

const DEFAULT_BUDGETS = {
  jsGzipMax: 200 * 1024, // 200 KiB
  cssGzipMax: 50 * 1024,  // 50 KiB
}

/**
 * @param {number} bytes
 */
function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`
}

/**
 * Traverses manifest imports recursively to collect all JS chunks and CSS assets
 * in the initial route closure.
 *
 * @param {Record<string, any>} manifest
 * @param {string} entryKey
 */
function collectInitialGraph(manifest, entryKey) {
  const visitedChunks = new Set()
  const jsChunkFiles = new Set()
  const cssFiles = new Set()

  /**
   * @param {string} key
   */
  function traverse(key) {
    if (visitedChunks.has(key)) return
    visitedChunks.add(key)

    const entry = manifest[key]
    if (!entry) return

    if (entry.file && entry.file.endsWith('.js')) {
      jsChunkFiles.add(entry.file)
    }

    if (Array.isArray(entry.css)) {
      for (const css of entry.css) {
        cssFiles.add(css)
      }
    }

    if (Array.isArray(entry.imports)) {
      for (const imp of entry.imports) {
        traverse(imp)
      }
    }
  }

  traverse(entryKey)

  return {
    jsChunks: Array.from(jsChunkFiles),
    cssFiles: Array.from(cssFiles),
  }
}

/**
 * Analyzes the initial entry bundle and compares against performance budgets.
 *
 * @param {{
 *   distDir?: string,
 *   budgets?: { jsGzipMax?: number, cssGzipMax?: number }
 * }} [options]
 */
export function analyzeBundle({
  distDir = path.resolve(process.cwd(), 'dist'),
  budgets = DEFAULT_BUDGETS,
} = {}) {
  const manifestLocations = [
    path.join(distDir, '.vite', 'manifest.json'),
    path.join(distDir, 'manifest.json'),
  ]

  let manifestPath = ''
  for (const loc of manifestLocations) {
    if (existsSync(loc)) {
      manifestPath = loc
      break
    }
  }

  if (!manifestPath) {
    throw new Error(
      `Vite build manifest not found in ${distDir}. Ensure "pnpm build" was run with "build.manifest: true".`
    )
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  // Find index.html or root entry
  const entryKey = manifest['index.html']
    ? 'index.html'
    : Object.keys(manifest).find((k) => manifest[k].isEntry)

  if (!entryKey) {
    throw new Error('Could not identify root entry point in Vite manifest')
  }

  const { jsChunks, cssFiles } = collectInitialGraph(manifest, entryKey)

  const jsBreakdown = []
  let totalJsRaw = 0
  let totalJsGzip = 0

  for (const relFile of jsChunks) {
    const fullPath = path.resolve(distDir, relFile)
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath)
      const gzip = zlib.gzipSync(content)
      totalJsRaw += content.length
      totalJsGzip += gzip.length
      jsBreakdown.push({
        file: relFile,
        rawBytes: content.length,
        gzipBytes: gzip.length,
      })
    }
  }

  const cssBreakdown = []
  let totalCssRaw = 0
  let totalCssGzip = 0

  for (const relFile of cssFiles) {
    const fullPath = path.resolve(distDir, relFile)
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath)
      const gzip = zlib.gzipSync(content)
      totalCssRaw += content.length
      totalCssGzip += gzip.length
      cssBreakdown.push({
        file: relFile,
        rawBytes: content.length,
        gzipBytes: gzip.length,
      })
    }
  }

  const errors = []
  const jsMax = budgets.jsGzipMax ?? DEFAULT_BUDGETS.jsGzipMax
  const cssMax = budgets.cssGzipMax ?? DEFAULT_BUDGETS.cssGzipMax

  if (totalJsGzip > jsMax) {
    errors.push(
      `Initial JS bundle budget exceeded! ${formatBytes(totalJsGzip)} > max ${formatBytes(jsMax)} (+${formatBytes(totalJsGzip - jsMax)})`
    )
  }

  if (totalCssGzip > cssMax) {
    errors.push(
      `Initial CSS bundle budget exceeded! ${formatBytes(totalCssGzip)} > max ${formatBytes(cssMax)} (+${formatBytes(totalCssGzip - cssMax)})`
    )
  }

  return {
    passed: errors.length === 0,
    totalJsRaw,
    totalJsGzip,
    totalCssRaw,
    totalCssGzip,
    jsChunks: jsBreakdown,
    cssFiles: cssBreakdown,
    errors,
  }
}

async function main() {
  try {
    const analysis = analyzeBundle()
    console.log('\n========================================')
    console.log('       Bundle Budget Report')
    console.log('========================================\n')

    console.log('Initial JS Closure:')
    for (const chunk of analysis.jsChunks) {
      console.log(`  - ${chunk.file.padEnd(35)} : ${formatBytes(chunk.gzipBytes)} (gzip) / ${formatBytes(chunk.rawBytes)}`)
    }
    console.log(`Total Initial JS (gzip): ${formatBytes(analysis.totalJsGzip)} / budget: ${formatBytes(DEFAULT_BUDGETS.jsGzipMax)}`)

    console.log('\nInitial CSS Assets:')
    for (const css of analysis.cssFiles) {
      console.log(`  - ${css.file.padEnd(35)} : ${formatBytes(css.gzipBytes)} (gzip) / ${formatBytes(css.rawBytes)}`)
    }
    console.log(`Total CSS (gzip): ${formatBytes(analysis.totalCssGzip)} / budget: ${formatBytes(DEFAULT_BUDGETS.cssGzipMax)}`)

    if (!analysis.passed) {
      console.error('\n✖ Bundle budget checks failed:')
      for (const err of analysis.errors) {
        console.error(`  - ${err}`)
      }
      process.exit(1)
    }

    console.log('\n✓ All bundle loading budgets passed green.\n')
  } catch (error) {
    console.error(`\n✖ Bundle analysis error: ${/** @type {any} */ (error).message}`)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('check-bundle.mjs')) {
  main()
}
