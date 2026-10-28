import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Loads and validates the template manifest.
 *
 * @param {string} [rootDir]
 * @returns {{
 *   version: string,
 *   name: string,
 *   examples: {
 *     directories: string[],
 *     files: string[],
 *     modifications: Array<{ file: string, description: string }>
 *   }
 * }}
 */
export function loadManifest(rootDir = process.cwd()) {
  const manifestPath = path.resolve(rootDir, '.template-manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`Template manifest not found at ${manifestPath}`)
  }
  const content = readFileSync(manifestPath, 'utf8')
  try {
    const data = JSON.parse(content)
    if (!data.examples || !Array.isArray(data.examples.directories)) {
      throw new Error('Manifest missing examples inventory')
    }
    return data
  } catch (error) {
    throw new Error(`Failed to parse template manifest: ${/** @type {any} */ (error).message}`)
  }
}

