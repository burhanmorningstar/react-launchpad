import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { runConsumerAcceptanceA, runConsumerAcceptanceB } from '../verify-template.mjs'

function createAcceptanceFixture() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-accept-fixture-'))
  // Project setup files
  writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({ name: 'react-launchpad', version: '1.0.0' }, null, 2),
    'utf8'
  )
  writeFileSync(
    path.join(tmpDir, 'index.html'),
    '<!DOCTYPE html><html><head><title>Launchpad</title></head><body></body></html>',
    'utf8'
  )
  writeFileSync(
    path.join(tmpDir, 'project.config.json'),
    JSON.stringify(
      {
        name: 'Launchpad',
        defaultLocale: 'en',
        brand: { mark: 'LP' },
        examples: { enabled: true },
      },
      null,
      2
    ),
    'utf8'
  )
  writeFileSync(
    path.join(tmpDir, '.template-manifest.json'),
    JSON.stringify(
      {
        version: '1.0.0',
        examples: {
          directories: ['src/features/examples', 'src/examples'],
          files: ['src/i18n/locales/en/examples.json', 'src/i18n/locales/tr/examples.json'],
          modifications: [
            { file: 'src/i18n/index.ts', description: 'Remove examples' },
            { file: 'project.config.json', description: 'Disable examples' },
          ],
        },
      },
      null,
      2
    ),
    'utf8'
  )

  // Directory skeleton
  mkdirSync(path.join(tmpDir, 'src/features/examples'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/examples'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/core/ui/components'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/core/hooks'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/i18n/locales/en'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/i18n/locales/tr'), { recursive: true })
  writeFileSync(path.join(tmpDir, 'src/i18n/locales/en/examples.json'), '{}', 'utf8')
  writeFileSync(path.join(tmpDir, 'src/i18n/locales/tr/examples.json'), '{}', 'utf8')
  writeFileSync(
    path.join(tmpDir, 'src/i18n/index.ts'),
    `import enExamples from './locales/en/examples.json'
import trExamples from './locales/tr/examples.json'
export const resources = { en: { examples: enExamples }, tr: { examples: trExamples } } as const
`,
    'utf8'
  )

  return tmpDir
}

test('runConsumerAcceptanceA certifies Consumer A flow (Keep examples + Brand + Feature + Page + Form)', () => {
  const tmpDir = createAcceptanceFixture()
  try {
    const result = runConsumerAcceptanceA(tmpDir)
    assert.equal(result.success, true)

    // Verify brand
    const pkg = JSON.parse(readFileSync(path.join(tmpDir, 'package.json'), 'utf8'))
    assert.equal(pkg.name, 'full-showcase')

    // Verify examples kept
    assert.equal(existsSync(path.join(tmpDir, 'src/features/examples')), true)

    // Verify generated feature & page & form
    assert.equal(existsSync(path.join(tmpDir, 'src/features/billing/routes.tsx')), true)
    assert.equal(existsSync(path.join(tmpDir, 'src/features/billing/pages/InvoicesPage.tsx')), true)
    assert.equal(
      existsSync(path.join(tmpDir, 'src/features/billing/forms/InvoiceCreateForm/schema.ts')),
      true
    )
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('runConsumerAcceptanceB certifies Consumer B flow (Remove examples + Custom locale + New feature)', () => {
  const tmpDir = createAcceptanceFixture()
  try {
    const result = runConsumerAcceptanceB(tmpDir)
    assert.equal(result.success, true)

    // Verify brand & locale
    const config = JSON.parse(readFileSync(path.join(tmpDir, 'project.config.json'), 'utf8'))
    assert.equal(config.name, 'Acme Core')
    assert.equal(config.defaultLocale, 'tr')
    assert.equal(config.examples.enabled, false)

    // Verify examples removed
    assert.equal(existsSync(path.join(tmpDir, 'src/features/examples')), false)
    assert.equal(existsSync(path.join(tmpDir, 'src/examples')), false)

    // Verify clean feature generated
    assert.equal(existsSync(path.join(tmpDir, 'src/features/dashboard-v2/routes.tsx')), true)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

