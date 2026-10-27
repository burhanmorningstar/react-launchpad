import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Build mode follows the root references; force prevents stale incremental
// output from hiding an error. noEmit lives in each referenced config.
const compiler = fileURLToPath(import.meta.resolve('typescript/bin/tsc'))
const result = spawnSync(process.execPath, [compiler, '--build', '--force'], {
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error)
}
process.exitCode = result.status ?? 1
