#!/usr/bin/env node
import process from 'node:process'

import { planFiles } from './plan-files.mjs'
import { writeFiles } from './write-files.mjs'

/**
 * @param {string[]} args
 */
function parseArgs(args) {
  const [type, ...rest] = args
  let name = ''
  let dryRun = false
  let core = false
  let feature = ''

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]
    if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--core') {
      core = true
    } else if (arg === '--feature') {
      feature = rest[++i] || ''
    } else if (arg.startsWith('--feature=')) {
      feature = arg.split('=')[1] || ''
    } else if (!arg.startsWith('-') && !name) {
      name = arg
    }
  }

  return { type, name, dryRun, core, feature }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log(`
Usage:
  pnpm generate:feature <name> [--dry-run]
  pnpm generate:page <name> --feature <name> [--dry-run]
  pnpm generate:form <name> --feature <name> [--dry-run]
  pnpm generate:component <name> [--core | --feature <name>] [--dry-run]
  pnpm generate:hook <name> [--core | --feature <name>] [--dry-run]
`)
    process.exit(0)
  }

  const { type, name, dryRun, core, feature } = parseArgs(args)

  if (!name) {
    console.error(`Error: Name argument is required for "generate:${type}"`)
    process.exit(1)
  }

  const options = /** @type {Record<string, any>} */ ({})
  if (feature) options.feature = feature
  if (core) options.core = true

  try {
    const plan = planFiles({
      type: /** @type {any} */ (type),
      name,
      options,
      rootDir: process.cwd(),
    })

    const result = writeFiles(plan, { dryRun })
    if (result.dryRun) {
      console.log(`\n✓ [DRY RUN] Plan verified without errors. No files were written to disk.`)
    } else {
      console.log(`\n✓ Successfully created ${result.createdFiles.length} file(s) and modified ${result.modifiedFiles.length} file(s).`)
      for (const f of result.createdFiles) {
        console.log(`  + ${f}`)
      }
      for (const m of result.modifiedFiles) {
        console.log(`  ~ ${m}`)
      }
    }
  } catch (error) {
    console.error(`\n✖ Generation failed: ${/** @type {any} */ (error).message}`)
    process.exit(1)
  }
}

if (process.argv[1]?.endsWith('cli.mjs')) {
  main()
}
