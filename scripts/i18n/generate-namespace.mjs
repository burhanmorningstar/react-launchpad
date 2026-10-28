import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CANONICAL_LOCALE,
  getDefaultLocalesDir,
  getLocales,
  validateNamespaceName,
} from './model.mjs'

/**
 * @param {{
 *   name: string,
 *   dryRun?: boolean,
 *   localesDir?: string
 * }} options
 */
export function generateNamespace(options) {
  const { name, dryRun = false, localesDir = getDefaultLocalesDir() } = options

  validateNamespaceName(name)

  const locales = getLocales(localesDir)
  if (locales.length === 0) {
    throw new Error(`No locales found in ${localesDir}`)
  }

  const canonical = locales.find((l) => l.code === CANONICAL_LOCALE)
  if (!canonical) {
    throw new Error(`Canonical locale "${CANONICAL_LOCALE}" not found in ${localesDir}`)
  }

  const canonicalNsFile = path.join(canonical.dirPath, `${name}.json`)
  if (existsSync(canonicalNsFile)) {
    throw new Error(
      `Namespace "${name}" already exists in canonical locale at ${canonicalNsFile}. Overwrite rejected.`
    )
  }

  const plannedFiles = []
  for (const locale of locales) {
    const nsPath = path.join(locale.dirPath, `${name}.json`)
    if (existsSync(nsPath)) {
      throw new Error(`Namespace file already exists at ${nsPath}. Overwrite rejected.`)
    }
    plannedFiles.push({
      locale: locale.code,
      status: locale.status,
      filePath: nsPath,
      content: '{\n}\n',
    })
  }

  if (!dryRun) {
    for (const file of plannedFiles) {
      writeFileSync(file.filePath, file.content, 'utf8')
    }
  }

  return {
    namespace: name,
    dryRun,
    createdFiles: plannedFiles.map((f) => f.filePath),
    localesUpdated: locales.map((l) => l.code),
  }
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2)
  const name = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  /** @param {string} flag */
  function getArgValue(flag) {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const customDir = getArgValue('--dir')

  try {
    if (!name) {
      throw new Error('Usage: node scripts/i18n/generate-namespace.mjs <name> [--dry-run]')
    }

    const result = generateNamespace({
      name,
      dryRun,
      localesDir: customDir,
    })

    console.log(
      `${result.dryRun ? '[DRY RUN] Would create' : '✓ Successfully created'} namespace "${result.namespace}" across ${result.localesUpdated.length} locale(s):`
    )
    for (const f of result.createdFiles) {
      console.log(`  + ${f}`)
    }
    process.exit(0)
  } catch (/** @type {any} */ err) {
    console.error(`✖ generate-namespace failed: ${err.message}`)
    process.exit(1)
  }
}
