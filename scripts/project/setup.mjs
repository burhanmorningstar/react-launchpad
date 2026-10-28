#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { removeExamples } from './remove-examples.mjs'

/**
 * Derives a short monogram brand mark from display name
 * @param {string} displayName
 */
function deriveBrandMark(displayName) {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return displayName.slice(0, 2).toUpperCase()
}

/**
 * Configures the launchpad for a custom application brand and settings.
 *
 * @param {{
 *   name?: string,
 *   displayName?: string,
 *   defaultLocale?: string,
 *   examples?: 'keep' | 'remove',
 *   dryRun?: boolean,
 *   rootDir?: string,
 *   logger?: Console
 * }} options
 */
export function setupProject({
  name = 'my-launchpad-app',
  displayName = 'My Launchpad App',
  defaultLocale = 'en',
  examples = 'keep',
  dryRun = false,
  rootDir = process.cwd(),
  logger = console,
}) {
  const pkgPath = path.resolve(rootDir, 'package.json')
  const htmlPath = path.resolve(rootDir, 'index.html')
  const configPath = path.resolve(rootDir, 'project.config.json')

  if (dryRun) {
    logger.log('\n[DRY RUN] Project setup would apply the following configurations:')
    logger.log(`  ~ package.json: name -> "${name}"`)
    logger.log(`  ~ index.html: <title> -> "${displayName}"`)
    logger.log(`  ~ project.config.json: name -> "${displayName}", defaultLocale -> "${defaultLocale}"`)
    if (examples === 'remove') {
      logger.log(`  - Examples will be removed using template manifest`)
      removeExamples({ dryRun: true, rootDir, logger })
    }
    return {
      success: true,
      dryRun: true,
      name,
      displayName,
      defaultLocale,
      examples,
    }
  }

  // 1. package.json
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    pkg.name = name
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  }

  // 2. index.html
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, 'utf8')
    html = html.replace(/<title>.*?<\/title>/i, `<title>${displayName}</title>`)
    writeFileSync(htmlPath, html, 'utf8')
  }

  // 3. project.config.json
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    config.name = displayName
    if (defaultLocale) {
      config.defaultLocale = defaultLocale
    }
    if (!config.brand) config.brand = {}
    config.brand.mark = deriveBrandMark(displayName)
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8')
  }

  // 4. Examples removal if requested
  if (examples === 'remove') {
    removeExamples({ dryRun: false, rootDir, logger })
  }

  return {
    success: true,
    dryRun: false,
    name,
    displayName,
    defaultLocale,
    examples,
  }
}

/**
 * CLI parser
 * @param {string[]} args
 */
function parseArgs(args) {
  let name = ''
  let displayName = ''
  let defaultLocale = 'en'
  let examples = /** @type {'keep' | 'remove'} */ ('keep')
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--name') {
      name = args[++i] || ''
    } else if (arg.startsWith('--name=')) {
      name = arg.split('=')[1] || ''
    } else if (arg === '--display-name') {
      displayName = args[++i] || ''
    } else if (arg.startsWith('--display-name=')) {
      displayName = arg.split('=')[1] || ''
    } else if (arg === '--locale') {
      defaultLocale = args[++i] || 'en'
    } else if (arg.startsWith('--locale=')) {
      defaultLocale = arg.split('=')[1] || 'en'
    } else if (arg === '--examples') {
      const val = args[++i]
      if (val === 'remove' || val === 'keep') {
        examples = val
      }
    } else if (arg.startsWith('--examples=')) {
      const val = arg.split('=')[1]
      if (val === 'remove' || val === 'keep') {
        examples = val
      }
    }
  }

  return {
    name: name || (displayName ? displayName.toLowerCase().replace(/\s+/g, '-') : 'my-app'),
    displayName: displayName || (name ? name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'My App'),
    defaultLocale,
    examples,
    dryRun,
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log(`
Usage:
  pnpm setup:project --name <slug> --display-name <name> --locale <code> --examples keep|remove [--dry-run]
`)
    process.exit(0)
  }

  const parsed = parseArgs(args)
  try {
    const result = setupProject(parsed)
    if (result.dryRun) {
      console.log('\n✓ [DRY RUN] Project configuration verified cleanly. No files modified.')
    } else {
      console.log(`\n✓ Project configured successfully for "${result.displayName}" (${result.name}).`)
    }
  } catch (error) {
    console.error(`\n✖ Project setup failed: ${/** @type {any} */ (error).message}`)
    process.exit(1)
  }
}

if (process.argv[1]?.includes('setup.mjs')) {
  main()
}
