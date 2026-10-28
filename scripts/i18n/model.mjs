import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const CANONICAL_LOCALE = 'en'

export function resolveRepoRoot() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '../..')
}

export function getDefaultLocalesDir() {
  return path.join(resolveRepoRoot(), 'src/i18n/locales')
}

/** @param {string} code */
export function validateLocaleCode(code) {
  if (typeof code !== 'string') {
    throw new Error('Locale code must be a string')
  }
  if (code.includes('..') || code.includes('/') || code.includes('\\')) {
    throw new Error(`Invalid locale code "${code}": path traversal characters are forbidden`)
  }
  if (!/^[a-z]{2}(-[a-zA-Z]{2,4})?$/.test(code)) {
    throw new Error(
      `Invalid locale code "${code}": must match standard 2-letter or region format (e.g. "en", "tr", "pt-BR")`
    )
  }
}

/** @param {string} name */
export function validateNamespaceName(name) {
  if (typeof name !== 'string') {
    throw new Error('Namespace name must be a string')
  }
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid namespace name "${name}": path traversal characters are forbidden`)
  }
  if (!/^[a-z0-9_-]+$/.test(name)) {
    throw new Error(
      `Invalid namespace name "${name}": must contain only lowercase alphanumeric characters, dashes, or underscores`
    )
  }
}

/**
 * @typedef {{
 *   code: string,
 *   name: string,
 *   direction: 'ltr'|'rtl',
 *   status: 'draft'|'enabled',
 *   dirPath: string,
 *   metaPath: string
 * }} LocaleInfo
 */

/**
 * @param {string} [localesDir]
 * @returns {LocaleInfo[]}
 */
export function getLocales(localesDir = getDefaultLocalesDir()) {
  if (!existsSync(localesDir)) {
    return []
  }

  const entries = readdirSync(localesDir)
  /** @type {LocaleInfo[]} */
  const locales = []

  for (const entry of entries) {
    const dirPath = path.join(localesDir, entry)
    if (!statSync(dirPath).isDirectory()) continue

    const metaPath = path.join(dirPath, '_meta.json')
    if (existsSync(metaPath)) {
      try {
        const content = JSON.parse(readFileSync(metaPath, 'utf8'))
        locales.push({
          code: content.code ?? entry,
          name: content.name ?? entry,
          direction: content.direction ?? 'ltr',
          status: content.status ?? 'draft',
          dirPath,
          metaPath,
        })
      } catch (/** @type {any} */ err) {
        throw new Error(`Malformed _meta.json in ${metaPath}: ${err.message}`)
      }
    }
  }

  return locales
}

/**
 * @param {string} localeDirPath
 * @returns {string[]}
 */
export function getNamespaces(localeDirPath) {
  if (!existsSync(localeDirPath)) return []

  return readdirSync(localeDirPath)
    .filter((file) => file.endsWith('.json') && file !== '_meta.json')
    .map((file) => path.basename(file, '.json'))
    .sort()
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function extractInterpolations(text) {
  if (typeof text !== 'string') return []
  const matches = []
  const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g
  let match
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1])
  }
  return matches.sort()
}

/**
 * @param {any} obj
 * @param {string} [prefix]
 * @returns {Map<string, { value: any, type: string, interpolations: string[] }>}
 */
export function flattenKeys(obj, prefix = '') {
  const map = new Map()

  /**
   * @param {any} current
   * @param {string} pathPrefix
   */
  function walk(current, pathPrefix) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      for (const [key, value] of Object.entries(current)) {
        const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key
        walk(value, nextPath)
      }
    } else {
      map.set(pathPrefix, {
        value: current,
        type: Array.isArray(current) ? 'array' : typeof current,
        interpolations: extractInterpolations(typeof current === 'string' ? current : ''),
      })
    }
  }

  walk(obj, prefix)
  return map
}

/**
 * @param {string} locale
 * @returns {string[]}
 */
export function getPluralCategories(locale) {
  try {
    return /** @type {string[]} */ (new Intl.PluralRules(locale).resolvedOptions().pluralCategories)
  } catch {
    return ['one', 'other']
  }
}
