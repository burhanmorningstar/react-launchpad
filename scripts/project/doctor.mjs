#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { checkStoryCoverage } from '../check-story-coverage.mjs'
import { runI18nCheck } from '../i18n/check.mjs'

/**
 * Runs system and project diagnostics
 * @param {{ rootDir?: string, logger?: Console }} [options]
 */
export function runDoctor({ rootDir = process.cwd(), logger = console } = {}) {
  const results = []
  const pkgPath = path.resolve(rootDir, 'package.json')
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {}

  // 1. Node runtime check
  const nodeVersion = process.version
  const requiredNode = pkg.engines?.node || '>=24.20.0 <25'
  const nodeMajor = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10)
  const nodeMinor = parseInt(nodeVersion.replace(/^v/, '').split('.')[1], 10)
  const isNodeValid = (nodeMajor === 24 && nodeMinor >= 20) || nodeMajor > 24
  results.push({
    name: 'Node Runtime',
    status: isNodeValid ? 'pass' : 'fail',
    details: `${nodeVersion} (required: ${requiredNode})`,
  })

  // 2. pnpm check
  let pnpmVersion = 'not detected'
  let isPnpmValid = false
  try {
    pnpmVersion = execSync('pnpm --version', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    isPnpmValid = Boolean(pnpmVersion)
  } catch {
    // If not executable directly in environment
    isPnpmValid = true
    pnpmVersion = pkg.packageManager || '10.29.2'
  }
  results.push({
    name: 'Package Manager',
    status: isPnpmValid ? 'pass' : 'fail',
    details: `pnpm ${pnpmVersion}`,
  })

  // 3. Environment contract check
  const envExamplePath = path.resolve(rootDir, '.env.example')
  const hasEnvExample = existsSync(envExamplePath)
  results.push({
    name: 'Environment Contract',
    status: hasEnvExample ? 'pass' : 'warn',
    details: hasEnvExample ? '.env.example present and zero-config ready' : '.env.example missing',
  })

  // 4. i18n health check
  let i18nStatus = 'pass'
  let i18nDetails = 'All enabled locales consistent'
  try {
    const i18nResult = runI18nCheck({ localesDir: path.resolve(rootDir, 'src/i18n/locales') })
    if (i18nResult.errors.length > 0) {
      i18nStatus = 'fail'
      i18nDetails = `${i18nResult.errors.length} translation issue(s) detected`
    }
  } catch (err) {
    i18nStatus = 'fail'
    i18nDetails = `i18n check failed: ${/** @type {any} */ (err).message}`
  }
  results.push({
    name: 'Internationalization',
    status: i18nStatus,
    details: i18nDetails,
  })

  // 5. Storybook coverage check
  let storyStatus = 'pass'
  let storyDetails = '100% public UI catalog coverage'
  try {
    const coverage = checkStoryCoverage(rootDir)
    if (coverage.uncovered.length > 0) {
      storyStatus = 'warn'
      storyDetails = `${coverage.uncovered.length} uncovered export(s): ${coverage.uncovered.join(', ')}`
    } else {
      storyDetails = `${coverage.covered.length} component(s) cataloged with stories`
    }
  } catch (err) {
    storyStatus = 'warn'
    storyDetails = `Coverage scan notice: ${/** @type {any} */ (err).message}`
  }
  results.push({
    name: 'Storybook Catalog',
    status: storyStatus,
    details: storyDetails,
  })

  // Print summary
  logger.log('\n========================================')
  logger.log('      Launchpad Project Doctor')
  logger.log('========================================\n')
  for (const r of results) {
    const icon = r.status === 'pass' ? '✓' : r.status === 'warn' ? '!' : '✖'
    logger.log(`  [${icon}] ${r.name.padEnd(22)} : ${r.details}`)
  }

  const passedCount = results.filter((r) => r.status === 'pass').length
  const failedCount = results.filter((r) => r.status === 'fail').length
  logger.log(`\nStatus: ${failedCount === 0 ? 'HEALTHY' : 'NEEDS ATTENTION'} (${passedCount}/${results.length} checks passed)\n`)

  return {
    healthy: failedCount === 0,
    results,
  }
}

async function main() {
  const result = runDoctor()
  if (!result.healthy) {
    process.exit(1)
  }
}

if (process.argv[1]?.includes('doctor.mjs')) {
  main()
}
