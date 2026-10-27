import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const metadata = JSON.parse(
  readFileSync(path.join(root, 'package.json'), 'utf8')
)

// Removing a referenced config from the real command must make these tests fail.
for (const [label, file, contents] of [
  ['application', 'src/probe.ts', 'export const value: string = 123\n'],
  ['Vite config', 'vite.config.ts', 'export const value: string = 123\n'],
  ['Vitest config', 'vitest.config.ts', 'export const value: string = 123\n'],
  [
    'Playwright config',
    'playwright.config.ts',
    'export const value: string = 123\n',
  ],
  [
    'Storybook config',
    '.storybook/main.ts',
    'export const value: string = 123\n',
  ],
  [
    'Storybook preview',
    '.storybook/preview.ts',
    'export const value: string = 123\n',
  ],
  [
    'tooling script',
    'scripts/probe.mjs',
    '/** @type {string} */\nexport const value = 123\n',
  ],
  ['unit test', 'src/probe.test.ts', 'export const value: string = 123\n'],
]) {
  test(`typecheck rejects a ${label} type error and accepts its correction`, () => {
    const temporaryRoot = path.join(root, '.tmp')
    mkdirSync(temporaryRoot, { recursive: true })
    const fixture = mkdtempSync(path.join(temporaryRoot, 'typecheck-'))
    try {
      for (const config of [
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'tsconfig.test.json',
      ]) {
        const source = path.join(root, config)
        cpSync(source, path.join(fixture, config))
      }
      /** @type {Record<string, string>} */
      const files = {
        'src/probe.ts': 'export const value: string = "ok"\n',
        'src/probe.test.ts': 'export const value: string = "ok"\n',
        'vite.config.ts': 'export const value: string = "ok"\n',
        'vitest.config.ts': 'export const value: string = "ok"\n',
        'playwright.config.ts': 'export const value: string = "ok"\n',
        '.storybook/main.ts': 'export const value: string = "ok"\n',
        '.storybook/preview.ts': 'export const value: string = "ok"\n',
        'scripts/probe.mjs':
          '/** @type {string} */\nexport const value = "ok"\n',
      }
      for (const [name, text] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(fixture, name)), { recursive: true })
        writeFileSync(path.join(fixture, name), text)
      }
      if (metadata.scripts.typecheck.startsWith('node ')) {
        cpSync(
          path.join(root, 'scripts/check-typecheck.mjs'),
          path.join(fixture, 'scripts/check-typecheck.mjs')
        )
      }
      const [executable, ...arguments_] = metadata.scripts.typecheck.split(' ')
      assert.ok(executable === 'node' || executable === 'tsc')
      const command =
        executable === 'node'
          ? arguments_
          : [path.join(root, 'node_modules/typescript/bin/tsc'), ...arguments_]
      const run = () => {
        const result = spawnSync(process.execPath, command, {
          cwd: fixture,
          encoding: 'utf8',
        })
        assert.ifError(result.error)
        return result
      }
      const clean = run()
      assert.equal(
        clean.status,
        0,
        `valid fixture failed: ${clean.stdout}${clean.stderr}`
      )
      writeFileSync(path.join(fixture, file), contents)
      const broken = run()
      assert.notEqual(
        broken.status,
        0,
        `${label} type error was silently ignored`
      )
      assert.match(
        broken.stdout + broken.stderr,
        /TS2322/,
        'must fail on the intended type error'
      )
      writeFileSync(path.join(fixture, file), files[file])
      const corrected = run()
      assert.equal(
        corrected.status,
        0,
        `${corrected.stdout}${corrected.stderr}`
      )
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })
}
