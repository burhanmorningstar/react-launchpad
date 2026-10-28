import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Executes a planned file generation with atomic rollback on failure.
 *
 * @param {{
 *   rootDir: string,
 *   operations: import('./plan-files.mjs').FileOperation[]
 * }} plan
 * @param {{ dryRun?: boolean, logger?: Console }} [options]
 * @returns {{
 *   success: boolean,
 *   dryRun: boolean,
 *   createdFiles: string[],
 *   modifiedFiles: string[]
 * }}
 */
export function writeFiles(plan, { dryRun = false, logger = console } = {}) {
  const { operations } = plan

  if (dryRun) {
    logger.log('\n[DRY RUN] The following operations would be performed:')
    for (const op of operations) {
      if (op.type === 'create') {
        logger.log(`  + CREATE  ${op.path} (${op.description})`)
      } else if (op.type === 'modify') {
        logger.log(`  ~ MODIFY  ${op.path} (${op.description})`)
      }
    }
    return {
      success: true,
      dryRun: true,
      createdFiles: [],
      modifiedFiles: [],
    }
  }

  const createdFiles = /** @type {string[]} */ ([])
  const modifiedBackups = new Map()

  try {
    for (const op of operations) {
      if (op.type === 'create') {
        const dir = path.dirname(op.absolutePath)
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
        writeFileSync(op.absolutePath, op.content ?? '', 'utf8')
        createdFiles.push(op.absolutePath)
      } else if (op.type === 'modify') {
        if (!existsSync(op.absolutePath)) {
          throw new Error(`Target file to modify does not exist: ${op.path}`)
        }
        const originalContent = readFileSync(op.absolutePath, 'utf8')
        if (!modifiedBackups.has(op.absolutePath)) {
          modifiedBackups.set(op.absolutePath, originalContent)
        }
        const nextContent = op.transform ? op.transform(originalContent) : originalContent
        writeFileSync(op.absolutePath, nextContent, 'utf8')
      }
    }

    return {
      success: true,
      dryRun: false,
      createdFiles,
      modifiedFiles: Array.from(modifiedBackups.keys()),
    }
  } catch (error) {
    // Atomic rollback
    logger.error?.('[GENERATOR ERROR] Execution failed. Performing atomic rollback...')

    for (const createdPath of createdFiles) {
      try {
        if (existsSync(createdPath)) {
          unlinkSync(createdPath)
        }
      } catch {
        // Best-effort cleanup
      }
    }

    for (const [modPath, originalContent] of modifiedBackups.entries()) {
      try {
        writeFileSync(modPath, originalContent, 'utf8')
      } catch {
        // Best-effort restore
      }
    }

    throw error
  }
}
