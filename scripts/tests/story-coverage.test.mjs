import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { checkStoryCoverage, findStoryFiles } from '../check-story-coverage.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))

test('findStoryFiles locates stories across the src directory', () => {
  const stories = findStoryFiles(path.join(root, 'src'))
  assert(stories.length > 5, 'Should find multiple story files in the project')
  assert(stories.some((f) => f.includes('button.stories.tsx')))
  assert(stories.some((f) => f.includes('Form.stories.tsx')))
  assert(stories.some((f) => f.includes('DataTable.stories.tsx')))
})

test('checkStoryCoverage reports 100% coverage on current launchpad catalog', () => {
  const result = checkStoryCoverage(root)
  assert.equal(result.uncovered.length, 0, `Uncovered exports found: ${result.uncovered.join(', ')}`)
  assert(result.covered.length > 20, 'Should have multiple directly covered components')
  assert(result.internal.length > 20, 'Should account for internal compound sub-primitives')
})

test('checkStoryCoverage catches newly exported components that lack story coverage', () => {
  const tmpDir = mkdtempSync(path.join(root, '.tmp-coverage-'))
  try {
    const srcDir = path.join(tmpDir, 'src/core/ui/components')
    mkdirSync(srcDir, { recursive: true })

    // Write index.ts with an uncovered hypothetical component
    writeFileSync(
      path.join(srcDir, 'index.ts'),
      'export { Button } from "./button"\nexport { UncoveredWidget } from "./widget"\n'
    )

    // Write a story that only covers Button
    writeFileSync(
      path.join(srcDir, 'button.stories.tsx'),
      'export default {}\nexport const Default = () => <Button />\n'
    )

    const result = checkStoryCoverage(tmpDir)
    assert.deepEqual(result.uncovered, ['UncoveredWidget'])
    assert(result.covered.includes('Button'))
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
})

