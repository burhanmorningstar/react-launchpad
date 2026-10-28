#!/usr/bin/env node
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { loadManifest } from './manifest.mjs'

/**
 * Removes template example screens, routes, and translations safely using the manifest.
 *
 * @param {{
 *   dryRun?: boolean,
 *   rootDir?: string,
 *   logger?: Console
 * }} [options]
 */
export function removeExamples({
  dryRun = false,
  rootDir = process.cwd(),
  logger = console,
} = {}) {
  const manifest = loadManifest(rootDir)
  const { directories, files } = manifest.examples
  const allTargets = [...directories, ...files]

  if (dryRun) {
    logger.log('\n[DRY RUN] remove-examples would perform the following actions:')
    for (const dir of directories) {
      logger.log(`  - REMOVE DIRECTORY ${dir}`)
    }
    for (const file of files) {
      logger.log(`  - REMOVE FILE      ${file}`)
    }
    logger.log(`  ~ UPDATE           src/i18n/index.ts (remove examples imports & resources)`)
    logger.log(`  ~ UPDATE           project.config.json (set examples.enabled to false)`)
    return {
      success: true,
      dryRun: true,
      removed: allTargets,
    }
  }

  // 1. Remove directories
  for (const dir of directories) {
    const fullPath = path.resolve(rootDir, dir)
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true })
    }
  }

  // 2. Remove files
  for (const file of files) {
    const fullPath = path.resolve(rootDir, file)
    if (existsSync(fullPath)) {
      rmSync(fullPath, { force: true })
    }
  }

  // 3. Update src/i18n/index.ts
  const i18nPath = path.resolve(rootDir, 'src/i18n/index.ts')
  if (existsSync(i18nPath)) {
    let content = readFileSync(i18nPath, 'utf8')
    // Remove example imports
    content = content.replace(/import\s+enExamples\s+from\s+['"].*?examples\.json['"]\s*\r?\n/g, '')
    content = content.replace(/import\s+trExamples\s+from\s+['"].*?examples\.json['"]\s*\r?\n/g, '')
    // Remove example resource assignments
    content = content.replace(/\s*examples:\s*enExamples,?\r?\n/g, '\n')
    content = content.replace(/\s*examples:\s*trExamples,?\r?\n/g, '\n')
    writeFileSync(i18nPath, content, 'utf8')
  }

  // 4. Update project.config.json
  const configPath = path.resolve(rootDir, 'project.config.json')
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'))
      if (!config.examples) config.examples = {}
      config.examples.enabled = false
      writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8')
    } catch {
      // Best effort
    }
  }

  return {
    success: true,
    dryRun: false,
    removed: allTargets,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  try {
    const result = removeExamples({ dryRun })
    if (result.dryRun) {
      console.log('\n✓ [DRY RUN] Checked successfully. No files deleted.')
    } else {
      console.log(`\n✓ Successfully removed ${result.removed.length} example asset(s) and decoupled routing/i18n.`)
    }
  } catch (error) {
    console.error(`\n✖ Failed to remove examples: ${/** @type {any} */ (error).message}`)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('remove-examples.mjs')) {
  main()
}
