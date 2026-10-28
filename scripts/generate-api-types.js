#!/usr/bin/env node
/**
 * API Type Generation Script
 *
 * Generates TypeScript types from OpenAPI specification using local binary with safe argument arrays.
 *
 * Usage:
 *   pnpm generate:api-types                      # Use default openapi.yaml
 *   pnpm generate:api-types ./path/to/spec.yaml  # Custom spec file
 *   pnpm generate:api-types https://api.example.com/openapi.json
 */

import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// Default paths
const DEFAULT_SPEC = resolve(rootDir, 'openapi.yaml')
const EXAMPLE_SPEC = resolve(rootDir, 'openapi.example.yaml')
const OUTPUT_FILE = resolve(rootDir, 'src/api-types/schema.d.ts')

// Get spec path from args or use default
const specPath = process.argv[2] || (existsSync(DEFAULT_SPEC) ? DEFAULT_SPEC : EXAMPLE_SPEC)

// Check if spec exists (for local files)
if (!specPath.startsWith('http') && !existsSync(specPath)) {
  console.error(`❌ OpenAPI spec not found: ${specPath}`)
  console.error('')
  console.error('To get started:')
  console.error('  1. Copy openapi.example.yaml to openapi.yaml')
  console.error('  2. Update with your actual API specification')
  console.error('  3. Run: pnpm generate:api-types')
  console.error('')
  console.error('Or provide a remote URL:')
  console.error('  pnpm generate:api-types https://api.example.com/openapi.json')
  process.exit(1)
}

console.log('🔄 Generating API types...')
console.log(`   Spec: ${specPath}`)
console.log(`   Output: ${OUTPUT_FILE}`)

// Run openapi-typescript via pnpm exec with safe argument array (no shell interpolation)
const isWindows = process.platform === 'win32'
const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm'

const result = spawnSync(
  pnpmCmd,
  ['exec', 'openapi-typescript', specPath, '-o', OUTPUT_FILE],
  {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  }
)

if (result.status !== 0) {
  console.error('❌ Failed to generate API types')
  process.exit(result.status || 1)
}

console.log('✅ API types generated successfully!')
