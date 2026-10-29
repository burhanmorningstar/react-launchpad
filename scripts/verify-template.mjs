#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { planFiles } from './generators/plan-files.mjs'
import { writeFiles } from './generators/write-files.mjs'
import { runI18nCheck } from './i18n/check.mjs'
import { runDoctor } from './project/doctor.mjs'
import { setupProject } from './project/setup.mjs'

/**
 * Prepares a clean isolated consumer project directory with template skeleton.
 *
 * @param {string} targetDir
 * @param {string} [rootDir]
 */
export function prepareConsumerProject(targetDir, rootDir = process.cwd()) {
  mkdirSync(targetDir, { recursive: true })
  const copyTargets = [
    'package.json',
    'index.html',
    'project.config.json',
    '.template-manifest.json',
    '.env.example',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
  ]

  for (const item of copyTargets) {
    const src = path.resolve(rootDir, item)
    if (existsSync(src)) {
      cpSync(src, path.join(targetDir, item))
    }
  }

  // Copy src and scripts
  cpSync(path.resolve(rootDir, 'src'), path.join(targetDir, 'src'), { recursive: true })
  cpSync(path.resolve(rootDir, 'scripts'), path.join(targetDir, 'scripts'), { recursive: true })

  // Link node_modules so tooling and imports resolve instantly without external installation
  const nmSrc = path.resolve(rootDir, 'node_modules')
  if (existsSync(nmSrc)) {
    try {
      const nmDest = path.join(targetDir, 'node_modules')
      const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
      symlinkSync(nmSrc, nmDest, symlinkType)
    } catch {
      // Best effort link
    }
  }
}

/**
 * Executes Consumer A acceptance flow:
 * Brand setup with examples kept + new billing feature, page, and form.
 *
 * @param {string} targetDir
 * @param {{ logger?: Console }} [options]
 */
export function runConsumerAcceptanceA(targetDir, { logger = console } = {}) {
  logger.log('\n[ACCEPTANCE] Executing Consumer A: Full Showcase App (Keep examples)...')

  // 1. Re-brand project
  setupProject({
    name: 'full-showcase',
    displayName: 'Full Showcase',
    defaultLocale: 'en',
    examples: 'keep',
    rootDir: targetDir,
    logger,
  })

  // 2. Generate billing feature
  const featurePlan = planFiles({
    type: 'feature',
    name: 'billing',
    rootDir: targetDir,
  })
  writeFiles(featurePlan, { logger })

  // 3. Generate invoices page
  const pagePlan = planFiles({
    type: 'page',
    name: 'invoices',
    options: { feature: 'billing' },
    rootDir: targetDir,
  })
  writeFiles(pagePlan, { logger })

  // 4. Generate invoice-create form
  const formPlan = planFiles({
    type: 'form',
    name: 'invoice-create',
    options: { feature: 'billing' },
    rootDir: targetDir,
  })
  writeFiles(formPlan, { logger })

  return { success: true, consumer: 'Consumer A' }
}

/**
 * Executes Consumer B acceptance flow:
 * Re-brand with examples removed + Turkish default locale + new dashboard-v2 feature.
 *
 * @param {string} targetDir
 * @param {{ logger?: Console }} [options]
 */
export function runConsumerAcceptanceB(targetDir, { logger = console } = {}) {
  logger.log('\n[ACCEPTANCE] Executing Consumer B: Clean Production App (Remove examples)...')

  // 1. Re-brand and remove examples
  setupProject({
    name: 'acme-core',
    displayName: 'Acme Core',
    defaultLocale: 'tr',
    examples: 'remove',
    rootDir: targetDir,
    logger,
  })

  // 2. Generate clean dashboard-v2 feature
  const featurePlan = planFiles({
    type: 'feature',
    name: 'dashboard-v2',
    rootDir: targetDir,
  })
  writeFiles(featurePlan, { logger })

  return { success: true, consumer: 'Consumer B' }
}

/**
 * Certifies full template acceptance across two isolated consumer project scenarios.
 *
 * @param {{ logger?: Console }} [options]
 */
export function runFullTemplateVerification({ logger = console } = {}) {
  logger.log('\n========================================')
  logger.log('   Template Acceptance Certification')
  logger.log('========================================\n')

  const tmpA = mkdtempSync(path.join(os.tmpdir(), 'launchpad-cert-a-'))
  const tmpB = mkdtempSync(path.join(os.tmpdir(), 'launchpad-cert-b-'))

  try {
    // 1. Prepare & certify Consumer A (keep examples + brand + billing feature + form)
    logger.log('Certifying Consumer A flow (Full showcase app with examples)...')
    prepareConsumerProject(tmpA)
    const resultA = runConsumerAcceptanceA(tmpA, { logger })
    const doctorA = runDoctor({ rootDir: tmpA, logger })
    if (!doctorA.healthy) {
      throw new Error('Consumer A failed health diagnostics')
    }
    const i18nA = runI18nCheck({ localesDir: path.resolve(tmpA, 'src/i18n/locales') })
    if (i18nA.errors.length > 0) {
      throw new Error(`Consumer A has ${i18nA.errors.length} i18n issue(s)`)
    }
    logger.log('✓ Consumer A certified successfully.')

    // 2. Prepare & certify Consumer B (remove examples + custom locale + clean feature)
    logger.log('\nCertifying Consumer B flow (Clean production app without examples)...')
    prepareConsumerProject(tmpB)
    const resultB = runConsumerAcceptanceB(tmpB, { logger })
    const doctorB = runDoctor({ rootDir: tmpB, logger })
    if (!doctorB.healthy) {
      throw new Error('Consumer B failed health diagnostics')
    }
    const i18nB = runI18nCheck({ localesDir: path.resolve(tmpB, 'src/i18n/locales') })
    if (i18nB.errors.length > 0) {
      throw new Error(`Consumer B has ${i18nB.errors.length} i18n issue(s)`)
    }
    logger.log('✓ Consumer B certified successfully.')

    return {
      certified: true,
      consumerA: resultA,
      consumerB: resultB,
    }
  } finally {
    try {
      rmSync(tmpA, { recursive: true, force: true })
      rmSync(tmpB, { recursive: true, force: true })
    } catch {
      // Best effort cleanup
    }
  }
}

async function main() {
  try {
    const report = runFullTemplateVerification({ logger: console })
    if (report.certified) {
      console.log('\n✓ Both consumer acceptance scenarios certified successfully.\n')
      process.exit(0)
    }
  } catch (error) {
    console.error(`\n✖ Template acceptance certification failed: ${/** @type {any} */ (error).message}\n`)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('verify-template.mjs')) {
  main()
}
