import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { setupProject } from '../project/setup.mjs'

function createFixtureProject() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-setup-test-'))
  // Minimal package.json
  writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({ name: 'react-launchpad', version: '1.0.0' }, null, 2),
    'utf8'
  )
  // Minimal index.html
  writeFileSync(
    path.join(tmpDir, 'index.html'),
    '<!DOCTYPE html><html><head><title>React Launchpad</title></head><body></body></html>',
    'utf8'
  )
  // Minimal project.config.json
  writeFileSync(
    path.join(tmpDir, 'project.config.json'),
    JSON.stringify(
      {
        name: 'React Launchpad',
        defaultLocale: 'en',
        brand: { mark: 'RL', tagline: 'Starter' },
        examples: { enabled: true },
      },
      null,
      2
    ),
    'utf8'
  )
  // Minimal manifest
  writeFileSync(
    path.join(tmpDir, '.template-manifest.json'),
    JSON.stringify(
      {
        version: '1.0.0',
        examples: {
          directories: ['src/features/examples'],
          files: [],
          modifications: [],
        },
      },
      null,
      2
    ),
    'utf8'
  )
  mkdirSync(path.join(tmpDir, 'src/features/examples'), { recursive: true })
  return tmpDir
}

test('setupProject dry-run does not write changes to disk', () => {
  const tmpDir = createFixtureProject()
  try {
    const result = setupProject({
      name: 'acme-portal',
      displayName: 'Acme Portal',
      defaultLocale: 'tr',
      examples: 'keep',
      dryRun: true,
      rootDir: tmpDir,
    })

    assert.equal(result.dryRun, true)
    const pkg = JSON.parse(readFileSync(path.join(tmpDir, 'package.json'), 'utf8'))
    assert.equal(pkg.name, 'react-launchpad', 'package.json should remain unchanged in dryRun')
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('setupProject configures package.json, project.config.json, and index.html', () => {
  const tmpDir = createFixtureProject()
  try {
    const result = setupProject({
      name: 'acme-portal',
      displayName: 'Acme Portal',
      defaultLocale: 'tr',
      examples: 'keep',
      rootDir: tmpDir,
    })

    assert.equal(result.success, true)
    const pkg = JSON.parse(readFileSync(path.join(tmpDir, 'package.json'), 'utf8'))
    assert.equal(pkg.name, 'acme-portal')

    const config = JSON.parse(readFileSync(path.join(tmpDir, 'project.config.json'), 'utf8'))
    assert.equal(config.name, 'Acme Portal')
    assert.equal(config.defaultLocale, 'tr')
    assert.equal(config.brand.mark, 'AP')

    const html = readFileSync(path.join(tmpDir, 'index.html'), 'utf8')
    assert(html.includes('<title>Acme Portal</title>'))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

