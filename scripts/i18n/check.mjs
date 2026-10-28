import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import {
  CANONICAL_LOCALE,
  flattenKeys,
  getDefaultLocalesDir,
  getLocales,
  getNamespaces,
  getPluralCategories,
} from './model.mjs'

/**
 * @typedef {{
 *   locale: string,
 *   namespace: string,
 *   type: string,
 *   key?: string,
 *   message: string
 * }} CheckIssue
 *
 * @typedef {{
 *   code: string,
 *   name: string,
 *   translatedKeys: number,
 *   totalKeys: number,
 *   percent: number
 * }} DraftReport
 *
 * @typedef {{
 *   errors: CheckIssue[],
 *   warnings: CheckIssue[],
 *   draftReports: DraftReport[],
 *   checkedLocales: string[]
 * }} CheckResults
 */

/**
 * @param {{ localesDir?: string, includeDrafts?: boolean }} [options]
 * @returns {CheckResults}
 */
export function runI18nCheck(options = {}) {
  const localesDir = options.localesDir || getDefaultLocalesDir()
  const includeDrafts = Boolean(options.includeDrafts)

  const locales = getLocales(localesDir)
  const canonical = locales.find((l) => l.code === CANONICAL_LOCALE)

  if (!canonical) {
    throw new Error(`Canonical locale "${CANONICAL_LOCALE}" not found in ${localesDir}`)
  }

  const canonicalNamespaces = getNamespaces(canonical.dirPath)
  if (canonicalNamespaces.length === 0) {
    throw new Error(`No canonical namespaces found in ${canonical.dirPath}`)
  }

  // Parse and cache canonical keys
  const canonicalData = new Map()
  for (const ns of canonicalNamespaces) {
    const filePath = path.join(canonical.dirPath, `${ns}.json`)
    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf8'))
      canonicalData.set(ns, {
        raw,
        keys: flattenKeys(raw),
      })
    } catch (/** @type {any} */ err) {
      throw new Error(`Syntax error in canonical file ${filePath}: ${err.message}`)
    }
  }

  /** @type {CheckIssue[]} */
  const errors = []
  /** @type {CheckIssue[]} */
  const warnings = []
  /** @type {DraftReport[]} */
  const draftReports = []
  /** @type {string[]} */
  const checkedLocales = []

  for (const locale of locales) {
    if (locale.code === CANONICAL_LOCALE) continue

    const isDraft = locale.status === 'draft'
    if (isDraft && !includeDrafts) {
      // Calculate draft completion percentage
      let totalKeys = 0
      let translatedKeys = 0

      for (const [ns, cData] of canonicalData.entries()) {
        const filePath = path.join(locale.dirPath, `${ns}.json`)
        totalKeys += cData.keys.size
        if (existsSync(filePath)) {
          try {
            const raw = JSON.parse(readFileSync(filePath, 'utf8'))
            const targetKeys = flattenKeys(raw)
            for (const [key] of cData.keys.entries()) {
              if (targetKeys.has(key)) {
                translatedKeys++
              }
            }
          } catch {
            // Handled during strict check
          }
        }
      }

      const percent = totalKeys === 0 ? 100 : Math.round((translatedKeys / totalKeys) * 100)
      draftReports.push({
        code: locale.code,
        name: locale.name,
        translatedKeys,
        totalKeys,
        percent,
      })
      continue
    }

    checkedLocales.push(locale.code)
    const pluralCategories = getPluralCategories(locale.code)

    for (const [ns, cData] of canonicalData.entries()) {
      const filePath = path.join(locale.dirPath, `${ns}.json`)
      if (!existsSync(filePath)) {
        errors.push({
          locale: locale.code,
          namespace: ns,
          type: 'missing_namespace',
          message: `Namespace file "${ns}.json" is missing for locale "${locale.code}"`,
        })
        continue
      }

      let targetRaw
      try {
        targetRaw = JSON.parse(readFileSync(filePath, 'utf8'))
      } catch (/** @type {any} */ err) {
        errors.push({
          locale: locale.code,
          namespace: ns,
          type: 'syntax_error',
          message: `JSON syntax error in ${filePath}: ${err.message}`,
        })
        continue
      }

      const targetKeys = flattenKeys(targetRaw)

      // Identify plural base keys in canonical
      const canonicalPluralBases = new Set()
      for (const key of cData.keys.keys()) {
        const pluralMatch = /^(.*)_(one|other)$/.exec(key)
        if (pluralMatch) {
          canonicalPluralBases.add(pluralMatch[1])
        }
      }

      // Check language-specific plural forms
      for (const baseKey of canonicalPluralBases) {
        const missingCategories = pluralCategories.filter(
          (cat) => !targetKeys.has(`${baseKey}_${cat}`)
        )
        if (missingCategories.length > 0) {
          errors.push({
            locale: locale.code,
            namespace: ns,
            type: 'missing_plural_keys',
            key: baseKey,
            message: `Missing plural form(s) for "${baseKey}": [${missingCategories.join(', ')}] required by locale "${locale.code}"`,
          })
        }
      }

      // 1. Missing keys
      for (const [key, cMeta] of cData.keys.entries()) {
        if (!targetKeys.has(key)) {
          // If this key is part of a plural family, it was already checked above
          const pluralMatch = /^(.*)_(one|other)$/.exec(key)
          if (!pluralMatch) {
            errors.push({
              locale: locale.code,
              namespace: ns,
              type: 'missing_key',
              key,
              message: `Missing key "${key}" in namespace "${ns}"`,
            })
          }
        } else {
          const tMeta = targetKeys.get(key)
          if (!tMeta) continue
          // 2. Type mismatch
          if (cMeta.type !== tMeta.type) {
            errors.push({
              locale: locale.code,
              namespace: ns,
              type: 'type_mismatch',
              key,
              message: `Type mismatch on "${key}": expected ${cMeta.type}, got ${tMeta.type}`,
            })
          }

          // 3. Interpolation mismatch
          const cVars = cMeta.interpolations
          const tVars = tMeta.interpolations
          if (cVars.join(',') !== tVars.join(',')) {
            errors.push({
              locale: locale.code,
              namespace: ns,
              type: 'interpolation_mismatch',
              key,
              message: `Interpolation variables mismatch on "${key}": canonical expects [${cVars.join(', ')}], found [${tVars.join(', ')}]`,
            })
          }
        }
      }

      // 4. Extra keys
      for (const key of targetKeys.keys()) {
        if (!cData.keys.has(key)) {
          // Allow valid plural suffixes if the base key exists
          const pluralMatch = /^(.*)_(zero|one|two|few|many|other)$/.exec(key)
          if (pluralMatch && cData.keys.has(`${pluralMatch[1]}_other`)) {
            continue
          }
          warnings.push({
            locale: locale.code,
            namespace: ns,
            type: 'extra_key',
            key,
            message: `Extra key "${key}" in namespace "${ns}" not found in canonical`,
          })
        }
      }
    }
  }

  return {
    errors,
    warnings,
    draftReports,
    checkedLocales,
  }
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const includeDrafts = process.argv.includes('--include-drafts')
  const dirIndex = process.argv.indexOf('--dir')
  const customDir = dirIndex !== -1 ? process.argv[dirIndex + 1] : undefined

  try {
    const results = runI18nCheck({ localesDir: customDir, includeDrafts })

    if (results.draftReports.length > 0) {
      console.log('ℹ Draft Locales Summary:')
      for (const draft of results.draftReports) {
        console.log(`  - [${draft.code}] ${draft.name}: ${draft.percent}% complete (${draft.translatedKeys}/${draft.totalKeys} keys)`)
      }
    }

    if (results.warnings.length > 0) {
      console.warn(`\n⚠ ${results.warnings.length} warning(s) found:`)
      for (const warn of results.warnings) {
        console.warn(`  [${warn.locale}][${warn.namespace}] ${warn.message}`)
      }
    }

    if (results.errors.length > 0) {
      console.error(`\n✖ ${results.errors.length} translation error(s) found:`)
      for (const err of results.errors) {
        console.error(`  [${err.locale}][${err.namespace}] ${err.message}`)
      }
      process.exit(1)
    }

    console.log(`✓ i18n checks passed for locales: [${results.checkedLocales.join(', ')}]`)
    process.exit(0)
  } catch (/** @type {any} */ err) {
    console.error(`✖ i18n check failed: ${err.message}`)
    process.exit(1)
  }
}
