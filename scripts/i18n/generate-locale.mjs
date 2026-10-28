import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  CANONICAL_LOCALE,
  getDefaultLocalesDir,
  getNamespaces,
  validateLocaleCode,
} from './model.mjs'

/**
 * @param {any} canonicalObj
 * @returns {any}
 */
function buildDraftSkeleton(canonicalObj) {
  if (Array.isArray(canonicalObj)) {
    return []
  }
  if (canonicalObj && typeof canonicalObj === 'object') {
    /** @type {Record<string, any>} */
    const draft = {}
    for (const [k, v] of Object.entries(canonicalObj)) {
      draft[k] = buildDraftSkeleton(v)
    }
    return draft
  }
  return ''
}

/**
 * @param {{
 *   code: string,
 *   name: string,
 *   direction?: 'ltr'|'rtl',
 *   dryRun?: boolean,
 *   localesDir?: string
 * }} options
 */
export function generateLocale(options) {
  const { code, name, direction = 'ltr', dryRun = false, localesDir = getDefaultLocalesDir() } = options

  validateLocaleCode(code)

  if (!name || typeof name !== 'string') {
    throw new Error('Locale name is required (use --name <name>)')
  }

  if (!['ltr', 'rtl'].includes(direction)) {
    throw new Error('Direction must be either "ltr" or "rtl" (use --direction ltr|rtl)')
  }

  const targetDir = path.join(localesDir, code)
  if (existsSync(targetDir)) {
    throw new Error(`Locale "${code}" already exists at ${targetDir}. Overwrite is rejected.`)
  }

  const canonicalDir = path.join(localesDir, CANONICAL_LOCALE)
  if (!existsSync(canonicalDir)) {
    throw new Error(`Canonical directory not found at ${canonicalDir}`)
  }

  const namespaces = getNamespaces(canonicalDir)

  const metaContent = {
    code,
    name,
    direction,
    status: 'draft',
  }

  const plannedFiles = [
    {
      filePath: path.join(targetDir, '_meta.json'),
      content: JSON.stringify(metaContent, null, 2) + '\n',
    },
  ]

  for (const ns of namespaces) {
    const canonicalFile = path.join(canonicalDir, `${ns}.json`)
    const raw = JSON.parse(readFileSync(canonicalFile, 'utf8'))
    const skeleton = buildDraftSkeleton(raw)
    plannedFiles.push({
      filePath: path.join(targetDir, `${ns}.json`),
      content: JSON.stringify(skeleton, null, 2) + '\n',
    })
  }

  if (!dryRun) {
    mkdirSync(targetDir, { recursive: true })
    for (const file of plannedFiles) {
      writeFileSync(file.filePath, file.content, 'utf8')
    }
  }

  return {
    code,
    name,
    direction,
    dryRun,
    targetDir,
    createdFiles: plannedFiles.map((f) => f.filePath),
  }
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const args = process.argv.slice(2)
  const code = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  /** @param {string} flag */
  function getArgValue(flag) {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const name = getArgValue('--name')
  const direction = /** @type {'ltr'|'rtl'} */ (getArgValue('--direction') || 'ltr')
  const customDir = getArgValue('--dir')

  try {
    if (!code) {
      throw new Error('Usage: node scripts/i18n/generate-locale.mjs <code> --name <name> --direction ltr|rtl [--dry-run]')
    }

    const result = generateLocale({
      code,
      name: name ?? '',
      direction,
      dryRun,
      localesDir: customDir,
    })

    console.log(
      `${result.dryRun ? '[DRY RUN] Would create' : '✓ Successfully created'} draft locale "${result.code}" (${result.name}):`
    )
    for (const f of result.createdFiles) {
      console.log(`  + ${f}`)
    }
    process.exit(0)
  } catch (/** @type {any} */ err) {
    console.error(`✖ generate-locale failed: ${err.message}`)
    process.exit(1)
  }
}
