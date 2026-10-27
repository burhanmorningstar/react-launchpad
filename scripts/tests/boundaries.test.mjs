import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const fixtures = path.join(root, '.tmp')
mkdirSync(fixtures, { recursive: true })

/** @param {Record<string, string>} files */
function check(files) {
  const fixture = mkdtempSync(path.join(fixtures, 'boundaries-'))
  try {
    const sources = {
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: { '@/*': ['src/*'], '@private/*': ['src/features/two/*'] },
        },
      }),
      'src/features/two/internal.ts': 'export const value = 1',
      'src/features/two/index.ts': "export { value } from './internal'",
      'src/app/page.ts': 'export const value = 1',
      ...files,
    }
    for (const [file, source] of Object.entries(sources)) {
      const target = path.join(fixture, file)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, source)
    }
    const result = spawnSync(
      process.execPath,
      [path.join(root, 'scripts/check-boundaries.mjs'), fixture],
      { encoding: 'utf8' }
    )
    assert.ifError(result.error)
    return { status: result.status, output: result.stdout + result.stderr }
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
}

/** @type {Array<[string, string, string, RegExp]>} */
const cases = [
  [
    'Vite root-absolute import',
    'src/core/probe.ts',
    "import '/src/features/two/internal.ts'",
    /core cannot import features/i,
  ],
  [
    'core to feature alias',
    'src/core/probe.ts',
    "import { value } from '@/features/two'",
    /core cannot import features/i,
  ],
  [
    'core to feature relative',
    'src/core/probe.ts',
    "import { value } from '../features/two/internal'",
    /core cannot import features/i,
  ],
  [
    'core to app alias',
    'src/core/probe.ts',
    "export { value } from '@/app/page'",
    /core cannot import app/i,
  ],
  [
    'core to app relative',
    'src/core/probe.ts',
    "export { value } from '../app/page'",
    /core cannot import app/i,
  ],
  [
    'cross-feature alias',
    'src/features/one/probe.ts',
    "import { value } from '@/features/two/internal'",
    /public API/i,
  ],
  [
    'cross-feature relative',
    'src/features/one/probe.ts',
    "import { value } from '../two/internal'",
    /public API/i,
  ],
  [
    'dynamic import',
    'src/features/one/probe.ts',
    "export const load = () => import('../two/internal')",
    /public API/i,
  ],
  [
    'type import expression',
    'src/features/one/probe.ts',
    "export type T = typeof import('../two/internal')",
    /public API/i,
  ],
  [
    'custom alias',
    'src/features/one/probe.ts',
    "import { value } from '@private/internal'",
    /public API/i,
  ],
  [
    'JS extension resolving to TS',
    'src/features/one/probe.ts',
    "export { value } from '../two/internal.js'",
    /public API/i,
  ],
  [
    'feature to app',
    'src/features/one/probe.ts',
    "import { value } from '../../app/page'",
    /features cannot import app/i,
  ],
]
for (const [label, file, code, message] of cases) {
  test(`rejects ${label}`, () => {
    const result = check({ [file]: code })
    assert.equal(result.status, 1, result.output)
    assert.match(result.output, message)
    assert.match(result.output, /probe\.ts:1:/)
  })
}

test('allows public APIs, same-feature internals and app composition', () => {
  const result = check({
    'src/features/one/probe.ts':
      "import { value } from '@/features/two'; export { value as other } from '../two/index.js'",
    'src/features/two/own.ts': "export { value } from './internal'",
    'src/app/composition.ts':
      "export { value } from '../features/two/internal'",
    'src/core/comments.ts':
      "// import '@/features/two'\nexport const text = \"import('@/app/page')\"",
  })
  assert.equal(result.status, 0, result.output)
})

test('fails unresolved internal imports instead of silently skipping them', () => {
  const result = check({ 'src/core/probe.ts': "import '@/features/missing'" })
  assert.equal(result.status, 1, result.output)
  assert.match(result.output, /cannot resolve internal import/i)
})
