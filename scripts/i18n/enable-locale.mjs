import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { runI18nCheck } from './check.mjs'
import { getDefaultLocalesDir, validateLocaleCode } from './model.mjs'

/**
 * @param {{
 *   code: string,
 *   reviewed?: boolean,
 *   localesDir?: string
 * }} options
 */
export function enableLocale(options) {
  const { code, reviewed = false, localesDir = getDefaultLocalesDir() } = options

  validateLocaleCode(code)

  if (!reviewed) {
    throw new Error(
      `Cannot enable locale "${code}": --reviewed flag is required to certify that all translations have been checked and verified.`
    )
  }

  const targetDir = path.join(localesDir, code)
  const metaPath = path.join(targetDir, '_meta.json')

  if (!existsSync(metaPath)) {
    throw new Error(`Locale "${code}" does not exist at ${metaPath}`)
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  if (meta.status === 'enabled') {
    return {
      code,
      status: 'enabled',
      alreadyEnabled: true,
      metaPath,
    }
  }

  // Verify completeness before allowing enablement
  const checkResults = runI18nCheck({ localesDir, includeDrafts: true })
  const localeErrors = checkResults.errors.filter((e) => e.locale === code)

  if (localeErrors.length > 0) {
    const errorDetails = localeErrors.map((e) => `  - [${e.namespace}] ${e.message}`).join('\n')
    throw new Error(
      `Cannot enable locale "${code}": found ${localeErrors.length} unresolved translation error(s):\n${errorDetails}`
    )
  }

  meta.status = 'enabled'
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8')

  return {
    code,
    status: 'enabled',
    alreadyEnabled: false,
    metaPath,
  }
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2)
  const code = args.find((a) => !a.startsWith('--'))
  const reviewed = args.includes('--reviewed')

  /** @param {string} flag */
  function getArgValue(flag) {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const customDir = getArgValue('--dir')

  try {
    if (!code) {
      throw new Error('Usage: node scripts/i18n/enable-locale.mjs <code> --reviewed')
    }

    const result = enableLocale({
      code,
      reviewed,
      localesDir: customDir,
    })

    if (result.alreadyEnabled) {
      console.log(`ℹ Locale "${result.code}" is already enabled.`)
    } else {
      console.log(`✓ Successfully verified and enabled locale "${result.code}".`)
    }
    process.exit(0)
  } catch (/** @type {any} */ err) {
    console.error(`✖ enable-locale failed: ${err.message}`)
    process.exit(1)
  }
}
