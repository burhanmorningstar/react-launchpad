import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { analyzeBundle } from '../check-bundle.mjs'

function createFakeDist(jsSizes = [50 * 1024], cssSizes = [10 * 1024]) {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-bundle-test-'))
  const manifestDir = path.join(tmpDir, '.vite')
  mkdirSync(manifestDir, { recursive: true })
  const assetsDir = path.join(tmpDir, 'assets')
  mkdirSync(assetsDir, { recursive: true })

  /** @type {Record<string, any>} */
  const manifest = {}
  /** @type {string[]} */
  const jsImports = []
  /** @type {string[]} */
  const cssFiles = []

  // Create JS chunks
  jsSizes.forEach((size, idx) => {
    const chunkName = `chunk-${idx}.js`
    const chunkPath = path.join(assetsDir, chunkName)
    const content = Buffer.alloc(size, 'a')
    writeFileSync(chunkPath, content)

    manifest[`src/chunk-${idx}.ts`] = {
      file: `assets/${chunkName}`,
      isEntry: idx === 0,
    }
    if (idx > 0) {
      jsImports.push(`src/chunk-${idx}.ts`)
    }
  })

  // Create CSS files
  cssSizes.forEach((size, idx) => {
    const cssName = `style-${idx}.css`
    const cssPath = path.join(assetsDir, cssName)
    const content = Buffer.alloc(size, 'c')
    writeFileSync(cssPath, content)
    cssFiles.push(`assets/${cssName}`)
  })

  // Entrypoint
  manifest['index.html'] = {
    file: manifest['src/chunk-0.ts'].file,
    isEntry: true,
    imports: jsImports,
    css: cssFiles,
  }

  writeFileSync(path.join(manifestDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  return tmpDir
}

test('analyzeBundle passes when bundle sizes are within budgets', () => {
  // 30KB uncompressed yields very small gzip (< 200KB)
  const tmpDir = createFakeDist([30 * 1024, 20 * 1024], [5 * 1024])
  try {
    const result = analyzeBundle({
      distDir: tmpDir,
      budgets: { jsGzipMax: 200 * 1024, cssGzipMax: 50 * 1024 },
    })

    assert.equal(result.passed, true)
    assert.equal(result.errors.length, 0)
    assert(result.totalJsGzip > 0)
    assert(result.totalCssGzip > 0)
    assert(result.totalJsGzip <= 200 * 1024)
    assert(result.totalCssGzip <= 50 * 1024)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('analyzeBundle fails when JS bundle exceeds gzip budget', () => {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-bundle-heavy-'))
  try {
    const manifestDir = path.join(tmpDir, '.vite')
    mkdirSync(manifestDir, { recursive: true })
    const assetsDir = path.join(tmpDir, 'assets')
    mkdirSync(assetsDir, { recursive: true })

    const chunkPath = path.join(assetsDir, 'heavy.js')
    writeFileSync(chunkPath, Buffer.alloc(250 * 1024, 'x'))

    /** @type {Record<string, any>} */
    const manifest = {
      'index.html': {
        file: 'assets/heavy.js',
        isEntry: true,
      },
    }
    writeFileSync(path.join(manifestDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')

    // Set tight budget of 100 bytes to force breach
    const result = analyzeBundle({
      distDir: tmpDir,
      budgets: { jsGzipMax: 100, cssGzipMax: 50 * 1024 },
    })

    assert.equal(result.passed, false)
    assert(result.errors.some((err) => err.includes('JS bundle budget exceeded')))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('analyzeBundle fails when CSS exceeds gzip budget', () => {
  const tmpDir = createFakeDist([10 * 1024], [200 * 1024])
  try {
    const result = analyzeBundle({
      distDir: tmpDir,
      budgets: { jsGzipMax: 200 * 1024, cssGzipMax: 50 }, // 50 bytes budget
    })

    assert.equal(result.passed, false)
    assert(result.errors.some((err) => err.includes('CSS bundle budget exceeded')))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})
