import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { runI18nCheck } from '../i18n/check.mjs'
import { enableLocale } from '../i18n/enable-locale.mjs'
import { generateLocale } from '../i18n/generate-locale.mjs'
import { generateNamespace } from '../i18n/generate-namespace.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const fixtures = path.join(root, '.tmp')
mkdirSync(fixtures, { recursive: true })

function createTestEnvironment() {
  const tempDir = mkdtempSync(path.join(fixtures, 'i18n-test-'))

  // Setup canonical en
  const enDir = path.join(tempDir, 'en')
  mkdirSync(enDir, { recursive: true })
  writeFileSync(
    path.join(enDir, '_meta.json'),
    JSON.stringify({ code: 'en', name: 'English', direction: 'ltr', status: 'enabled' }, null, 2)
  )
  writeFileSync(
    path.join(enDir, 'common.json'),
    JSON.stringify(
      {
        app: { name: 'Launchpad', title: 'React' },
        items_one: '{{count}} item',
        items_other: '{{count}} items',
      },
      null,
      2
    )
  )

  // Setup valid tr
  const trDir = path.join(tempDir, 'tr')
  mkdirSync(trDir, { recursive: true })
  writeFileSync(
    path.join(trDir, '_meta.json'),
    JSON.stringify({ code: 'tr', name: 'Türkçe', direction: 'ltr', status: 'enabled' }, null, 2)
  )
  writeFileSync(
    path.join(trDir, 'common.json'),
    JSON.stringify(
      {
        app: { name: 'Başlangıç', title: 'React' },
        items_one: '{{count}} öge',
        items_other: '{{count}} öge',
      },
      null,
      2
    )
  )

  return {
    localesDir: tempDir,
    cleanup: () => rmSync(tempDir, { recursive: true, force: true }),
  }
}

test('generate-locale creates draft skeletons for all canonical namespaces', () => {
  const env = createTestEnvironment()
  try {
    const result = generateLocale({
      code: 'de',
      name: 'Deutsch',
      direction: 'ltr',
      localesDir: env.localesDir,
    })

    assert.equal(result.code, 'de')
    const deMetaPath = path.join(env.localesDir, 'de/_meta.json')
    assert.ok(existsSync(deMetaPath))
    const meta = JSON.parse(readFileSync(deMetaPath, 'utf8'))
    assert.equal(meta.status, 'draft')
    assert.equal(meta.name, 'Deutsch')

    const deCommonPath = path.join(env.localesDir, 'de/common.json')
    assert.ok(existsSync(deCommonPath))
    const common = JSON.parse(readFileSync(deCommonPath, 'utf8'))
    assert.equal(common.app.name, '')
  } finally {
    env.cleanup()
  }
})

test('generate-locale rejects overwrite and path traversal', () => {
  const env = createTestEnvironment()
  try {
    assert.throws(
      () =>
        generateLocale({
          code: 'tr',
          name: 'Türkçe',
          localesDir: env.localesDir,
        }),
      /already exists/i
    )

    assert.throws(
      () =>
        generateLocale({
          code: '../escape',
          name: 'Escape',
          localesDir: env.localesDir,
        }),
      /path traversal/i
    )
  } finally {
    env.cleanup()
  }
})

test('generate-locale --dry-run does not write to disk', () => {
  const env = createTestEnvironment()
  try {
    generateLocale({
      code: 'es',
      name: 'Español',
      dryRun: true,
      localesDir: env.localesDir,
    })

    assert.equal(existsSync(path.join(env.localesDir, 'es')), false)
  } finally {
    env.cleanup()
  }
})

test('generate-namespace creates namespace files across enabled and draft locales', () => {
  const env = createTestEnvironment()
  try {
    // Add draft locale
    generateLocale({ code: 'it', name: 'Italiano', localesDir: env.localesDir })

    const result = generateNamespace({
      name: 'billing',
      localesDir: env.localesDir,
    })

    assert.equal(result.namespace, 'billing')
    assert.ok(existsSync(path.join(env.localesDir, 'en/billing.json')))
    assert.ok(existsSync(path.join(env.localesDir, 'tr/billing.json')))
    assert.ok(existsSync(path.join(env.localesDir, 'it/billing.json')))

    // Reject overwrite
    assert.throws(
      () => generateNamespace({ name: 'billing', localesDir: env.localesDir }),
      /already exists/i
    )
  } finally {
    env.cleanup()
  }
})

test('i18n check passes on valid translations and handles drafts leniently', () => {
  const env = createTestEnvironment()
  try {
    // Add an empty draft locale
    generateLocale({ code: 'nl', name: 'Nederlands', localesDir: env.localesDir })

    // Default check (without --include-drafts) should pass
    const res = runI18nCheck({ localesDir: env.localesDir, includeDrafts: false })
    assert.equal(res.errors.length, 0)
    assert.equal(res.draftReports.length, 1)
    assert.equal(res.draftReports[0].code, 'nl')
  } finally {
    env.cleanup()
  }
})

test('i18n check flags missing keys, type mismatches and interpolation errors in enabled locales', () => {
  const env = createTestEnvironment()
  try {
    // Introduce errors in tr/common.json
    writeFileSync(
      path.join(env.localesDir, 'tr/common.json'),
      JSON.stringify({
        app: {
          name: 12345, // type mismatch (number instead of string)
          // missing 'title'
        },
        items_one: '{{cnt}} öge', // interpolation mismatch
        items_other: '{{count}} öge',
      })
    )

    const res = runI18nCheck({ localesDir: env.localesDir })
    assert.ok(res.errors.length >= 3)
    assert.ok(res.errors.some((e) => e.type === 'missing_key' && e.key === 'app.title'))
    assert.ok(res.errors.some((e) => e.type === 'type_mismatch' && e.key === 'app.name'))
    assert.ok(res.errors.some((e) => e.type === 'interpolation_mismatch' && e.key === 'items_one'))
  } finally {
    env.cleanup()
  }
})

test('i18n check enforces language-specific plural forms', () => {
  const env = createTestEnvironment()
  try {
    // Add Arabic as enabled locale
    const arDir = path.join(env.localesDir, 'ar')
    mkdirSync(arDir, { recursive: true })
    writeFileSync(
      path.join(arDir, '_meta.json'),
      JSON.stringify({ code: 'ar', name: 'العربية', direction: 'rtl', status: 'enabled' })
    )

    // Arabic requires zero, one, two, few, many, other. Provide only one/other to trigger error.
    writeFileSync(
      path.join(arDir, 'common.json'),
      JSON.stringify({
        app: { name: 'العربية', title: 'React' },
        items_one: '{{count}} عنصر',
        items_other: '{{count}} عناصر',
      })
    )

    const res = runI18nCheck({ localesDir: env.localesDir })
    assert.ok(res.errors.some((e) => e.type === 'missing_plural_keys'))
  } finally {
    env.cleanup()
  }
})

test('enable-locale requires --reviewed and clean translation checks', () => {
  const env = createTestEnvironment()
  try {
    // Create draft
    generateLocale({ code: 'fr', name: 'Français', localesDir: env.localesDir })

    // 1. Without reviewed flag
    assert.throws(
      () => enableLocale({ code: 'fr', reviewed: false, localesDir: env.localesDir }),
      /--reviewed flag is required/i
    )

    // 2. Incomplete translations
    assert.throws(
      () => enableLocale({ code: 'fr', reviewed: true, localesDir: env.localesDir }),
      /unresolved translation error/i
    )

    // Fill valid translation
    writeFileSync(
      path.join(env.localesDir, 'fr/common.json'),
      JSON.stringify({
        app: { name: 'Launchpad', title: 'React' },
        items_one: '{{count}} article',
        items_many: "{{count}} d'articles",
        items_other: '{{count}} articles',
      })
    )

    // 3. Complete and reviewed
    const res = enableLocale({ code: 'fr', reviewed: true, localesDir: env.localesDir })
    assert.equal(res.status, 'enabled')

    const meta = JSON.parse(readFileSync(path.join(env.localesDir, 'fr/_meta.json'), 'utf8'))
    assert.equal(meta.status, 'enabled')
  } finally {
    env.cleanup()
  }
})
