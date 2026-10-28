import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import { planFiles } from '../generators/plan-files.mjs'
import { writeFiles } from '../generators/write-files.mjs'

function createTempProject() {
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'launchpad-gen-test-'))
  // Setup minimal project structure
  mkdirSync(path.join(tmpDir, 'src/features'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/core/ui/components'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/core/hooks'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/i18n/locales/en'), { recursive: true })
  mkdirSync(path.join(tmpDir, 'src/i18n/locales/tr'), { recursive: true })
  return tmpDir
}

test('planFiles rejects path traversal attempts in names or options', () => {
  const tmpDir = createTempProject()
  try {
    assert.throws(
      () => planFiles({ type: 'feature', name: '../escape', rootDir: tmpDir }),
      /traversal/i
    )
    assert.throws(
      () => planFiles({ type: 'page', name: 'SafePage', options: { feature: '../../bad' }, rootDir: tmpDir }),
      /traversal/i
    )
    assert.throws(
      () => planFiles({ type: 'component', name: 'Safe', options: { feature: '../../../core' }, rootDir: tmpDir }),
      /traversal/i
    )
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('planFiles plans complete feature structure with i18n locales', () => {
  const tmpDir = createTempProject()
  try {
    const plan = planFiles({
      type: 'feature',
      name: 'billing-portal',
      rootDir: tmpDir,
    })

    const expectedPaths = [
      'src/features/billing-portal/types.ts',
      'src/features/billing-portal/pages/BillingPortalPage.tsx',
      'src/features/billing-portal/pages/index.ts',
      'src/features/billing-portal/components/index.ts',
      'src/features/billing-portal/hooks/index.ts',
      'src/features/billing-portal/routes.tsx',
      'src/features/billing-portal/index.ts',
      'src/i18n/locales/en/billing-portal.json',
      'src/i18n/locales/tr/billing-portal.json',
    ]

    for (const exp of expectedPaths) {
      assert(
        plan.operations.some((op) => op.path.replace(/\\/g, '/') === exp),
        `Missing expected planned file: ${exp}`
      )
    }

    // Verify content has public API exports
    const indexOp = plan.operations.find(
      (op) => op.path.replace(/\\/g, '/') === 'src/features/billing-portal/index.ts'
    )
    assert(indexOp?.content?.includes("export * from './routes'"))
    assert(indexOp?.content?.includes("export * from './types'"))

    // Verify routes contains lazy template
    const routesOp = plan.operations.find((op) => op.path.replace(/\\/g, '/').endsWith('routes.tsx'))
    assert(routesOp?.content?.includes('lazy('))
    assert(routesOp?.content?.includes('billingPortalRoutes'))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('planFiles plans page and injects into existing feature routes', () => {
  const tmpDir = createTempProject()
  try {
    // Generate feature first
    const featurePlan = planFiles({ type: 'feature', name: 'analytics', rootDir: tmpDir })
    writeFiles(featurePlan)

    const pagePlan = planFiles({
      type: 'page',
      name: 'dashboard',
      options: { feature: 'analytics' },
      rootDir: tmpDir,
    })

    assert(
      pagePlan.operations.some(
        (op) => op.path.replace(/\\/g, '/') === 'src/features/analytics/pages/DashboardPage.tsx'
      )
    )

    const routeMod = pagePlan.operations.find(
      (op) => op.path.replace(/\\/g, '/') === 'src/features/analytics/routes.tsx'
    )
    assert(routeMod && routeMod.type === 'modify', 'Should modify existing routes.tsx')
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('planFiles plans form with schema, types, test, and story', () => {
  const tmpDir = createTempProject()
  try {
    const plan = planFiles({
      type: 'form',
      name: 'invoice',
      options: { feature: 'billing' },
      rootDir: tmpDir,
    })

    const expected = [
      'src/features/billing/forms/InvoiceForm/schema.ts',
      'src/features/billing/forms/InvoiceForm/InvoiceForm.tsx',
      'src/features/billing/forms/InvoiceForm/InvoiceForm.test.tsx',
      'src/features/billing/forms/InvoiceForm/InvoiceForm.stories.tsx',
      'src/features/billing/forms/InvoiceForm/index.ts',
    ]

    for (const exp of expected) {
      assert(
        plan.operations.some((op) => op.path.replace(/\\/g, '/') === exp),
        `Missing expected form file: ${exp}`
      )
    }

    const schemaOp = plan.operations.find((op) => op.path.endsWith('schema.ts'))
    assert(schemaOp?.content?.includes('z.object'))
    assert(schemaOp?.content?.includes('InvoiceFormValues'))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('planFiles plans component and hook for core and feature', () => {
  const tmpDir = createTempProject()
  try {
    const compPlanCore = planFiles({
      type: 'component',
      name: 'MetricBadge',
      options: { core: true },
      rootDir: tmpDir,
    })
    assert(
      compPlanCore.operations.some(
        (op) => op.path.replace(/\\/g, '/') === 'src/core/ui/components/MetricBadge.tsx'
      )
    )

    const compPlanFeature = planFiles({
      type: 'component',
      name: 'UserCard',
      options: { feature: 'users' },
      rootDir: tmpDir,
    })
    assert(
      compPlanFeature.operations.some(
        (op) => op.path.replace(/\\/g, '/') === 'src/features/users/components/UserCard.tsx'
      )
    )

    const hookPlanCore = planFiles({
      type: 'hook',
      name: 'useEventListener',
      options: { core: true },
      rootDir: tmpDir,
    })
    assert(
      hookPlanCore.operations.some(
        (op) => op.path.replace(/\\/g, '/') === 'src/core/hooks/useEventListener.ts'
      )
    )
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('planFiles detects collisions and prevents overwrite', () => {
  const tmpDir = createTempProject()
  try {
    const featurePath = path.join(tmpDir, 'src/features/billing/index.ts')
    mkdirSync(path.dirname(featurePath), { recursive: true })
    writeFileSync(featurePath, '// already exists', 'utf8')

    assert.throws(
      () => planFiles({ type: 'feature', name: 'billing', rootDir: tmpDir }),
      /collision/i
    )
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('writeFiles supports --dry-run without touching disk', () => {
  const tmpDir = createTempProject()
  try {
    const plan = planFiles({ type: 'feature', name: 'payments', rootDir: tmpDir })
    const result = writeFiles(plan, { dryRun: true })
    assert.equal(result.dryRun, true)
    assert.equal(existsSync(path.join(tmpDir, 'src/features/payments')), false)
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

test('writeFiles rolls back atomically when an error occurs during execution', () => {
  const tmpDir = createTempProject()
  try {
    const existingFile = path.join(tmpDir, 'src/features/existing.txt')
    writeFileSync(existingFile, 'initial content', 'utf8')

    // Create a plan with a poison operation that throws
    const poisonedPlan = {
      rootDir: tmpDir,
      operations: [
        {
          type: /** @type {const} */ ('create'),
          path: 'src/features/rollback-test/file1.txt',
          absolutePath: path.join(tmpDir, 'src/features/rollback-test/file1.txt'),
          content: 'file 1',
          description: 'file 1',
        },
        {
          type: /** @type {const} */ ('modify'),
          path: 'src/features/existing.txt',
          absolutePath: existingFile,
          transform: () => 'modified content',
          description: 'modify existing',
        },
        {
          type: /** @type {const} */ ('create'),
          path: 'src/features/rollback-test/file2.txt',
          absolutePath: path.join(tmpDir, 'src/features/rollback-test/file2.txt'),
          get content() {
            throw new Error('Simulated write failure')
          },
          description: 'file 2',
        },
      ],
    }

    assert.throws(() => writeFiles(/** @type {any} */ (poisonedPlan)), /Simulated write failure/)

    // Assert file1 was cleaned up
    assert.equal(
      existsSync(path.join(tmpDir, 'src/features/rollback-test/file1.txt')),
      false,
      'Created file should be removed on rollback'
    )

    // Assert existingFile was restored
    assert.equal(
      readFileSync(existingFile, 'utf8'),
      'initial content',
      'Modified file should be restored to initial content'
    )
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})
