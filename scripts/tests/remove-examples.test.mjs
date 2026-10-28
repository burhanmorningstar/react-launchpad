import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { removeExamples } from '../project/remove-examples.mjs'

function createExamplesFixtureProject() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-remove-test-'))

  // Manifest
  writeFileSync(
    path.join(tmpDir, '.template-manifest.json'),
    JSON.stringify(
      {
        version: '1.0.0',
        examples: {
          directories: ['src/features/examples', 'src/examples'],
          files: [
            'src/i18n/locales/en/examples.json',
            'src/i18n/locales/tr/examples.json',
          ],
          modifications: [
            {
              file: 'src/i18n/index.ts',
              description: 'Remove examples imports and resources',
            },
            {
              file: 'project.config.json',
              description: 'Set examples.enabled to false',
            },
          ],
        },
      },
      null,
      2
    ),
    'utf8'
  )

  // Directories & files
  mkdirSync(path.join(tmpDir, 'src/features/examples'), { recursive: true })
  writeFileSync(path.join(tmpDir, 'src/features/examples/routes.tsx'), '// routes', 'utf8')

  mkdirSync(path.join(tmpDir, 'src/examples/adapters'), { recursive: true })
  writeFileSync(path.join(tmpDir, 'src/examples/adapters/demoAuth.ts'), '// auth', 'utf8')

  mkdirSync(path.join(tmpDir, 'src/i18n/locales/en'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/i18n/locales/tr'), { recursive: true })
  writeFileSync(path.join(tmpDir, 'src/i18n/locales/en/examples.json'), '{}', 'utf8')
  writeFileSync(path.join(tmpDir, 'src/i18n/locales/tr/examples.json'), '{}', 'utf8')

  // src/i18n/index.ts
  writeFileSync(
    path.join(tmpDir, 'src/i18n/index.ts'),
    `import enCommon from './locales/en/common.json'
import enExamples from './locales/en/examples.json'
import trCommon from './locales/tr/common.json'
import trExamples from './locales/tr/examples.json'

export const resources = {
  en: {
    common: enCommon,
    examples: enExamples,
  },
  tr: {
    common: trCommon,
    examples: trExamples,
  },
} as const
`,
    'utf8'
  )

  // project.config.json
  writeFileSync(
    path.join(tmpDir, 'project.config.json'),
    JSON.stringify(
      {
        name: 'Launchpad',
        examples: { enabled: true },
      },
      null,
      2
    ),
    'utf8'
  )

  return tmpDir
}

test('removeExamples dry-run preserves all example files and directories', () => {
  const tmpDir = createExamplesFixtureProject()
  try {
    const result = removeExamples({ dryRun: true, rootDir: tmpDir })
    assert.equal(result.dryRun, true)
    assert.equal(existsSync(path.join(tmpDir, 'src/features/examples')), true)
    assert.equal(existsSync(path.join(tmpDir, 'src/examples')), true)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('removeExamples cleanly uninstalls examples and updates config & i18n', () => {
  const tmpDir = createExamplesFixtureProject()
  try {
    const result = removeExamples({ rootDir: tmpDir })
    assert.equal(result.success, true)

    // Verify directories removed
    assert.equal(existsSync(path.join(tmpDir, 'src/features/examples')), false)
    assert.equal(existsSync(path.join(tmpDir, 'src/examples')), false)
    assert.equal(existsSync(path.join(tmpDir, 'src/i18n/locales/en/examples.json')), false)
    assert.equal(existsSync(path.join(tmpDir, 'src/i18n/locales/tr/examples.json')), false)

    // Verify i18n/index.ts updated
    const i18nContent = readFileSync(path.join(tmpDir, 'src/i18n/index.ts'), 'utf8')
    assert.equal(i18nContent.includes('enExamples'), false)
    assert.equal(i18nContent.includes('examples:'), false)
    assert(i18nContent.includes('enCommon'))

    // Verify project.config.json
    const config = JSON.parse(readFileSync(path.join(tmpDir, 'project.config.json'), 'utf8'))
    assert.equal(config.examples.enabled, false)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

