import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

/** @typedef {{ file: string, line: number, column: number, specifier: string, message: string }} Diagnostic */

/** @param {string} root */
function compilerOptions(root) {
  const config = path.join(
    root,
    existsSync(path.join(root, 'tsconfig.app.json'))
      ? 'tsconfig.app.json'
      : 'tsconfig.json'
  )
  const read = ts.readConfigFile(config, ts.sys.readFile)
  if (read.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(read.error.messageText, '\n')
    )
  return ts.parseJsonConfigFileContent(read.config, ts.sys, root).options
}

/** @param {import('typescript').SourceFile} source */
function importLiterals(source) {
  /** @type {import('typescript').StringLiteralLike[]} */
  const imports = []
  /** @param {import('typescript').Node} node */
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier)
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    )
      imports.push(node.moduleReference.expression)
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    )
      imports.push(node.argument.literal)
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      const argument = node.arguments[0]
      if (argument && ts.isStringLiteralLike(argument)) imports.push(argument)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

/** @param {string} source @param {string} target @param {string} root */
function violation(source, target, root) {
  const origin = path.relative(path.join(root, 'src'), source).split(path.sep)
  const destination = path
    .relative(path.join(root, 'src'), target)
    .split(path.sep)
  if (destination[0] === '..' || path.isAbsolute(destination[0])) return
  if (origin[0] === 'core' && ['features', 'app'].includes(destination[0]))
    return `core cannot import ${destination[0]}`
  if (origin[0] === 'features') {
    if (destination[0] === 'app') return 'features cannot import app'
    if (
      destination[0] === 'features' &&
      origin[1] !== destination[1] &&
      !(
        destination.length === 3 && /^index\.[cm]?[jt]sx?$/.test(destination[2])
      )
    )
      return `cross-feature imports must use the public API of ${destination[1]} (index.ts)`
  }
  if (
    origin[0] === 'shared' &&
    ['core', 'features', 'app'].includes(destination[0])
  )
    return `shared cannot import ${destination[0]}`
}

/** @param {string} root */
function createChecker(root) {
  const options = compilerOptions(root)
  /** @param {string} file @param {string} text @returns {Diagnostic[]} */
  return (file, text) => {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    /** @type {Diagnostic[]} */
    const diagnostics = []
    for (const literal of importLiterals(source)) {
      const specifier = literal.text
      const rootAbsolute = specifier.startsWith('/src/')
      const moduleSpecifier = rootAbsolute
        ? path.join(root, specifier.slice(1))
        : specifier
      const resolved = ts.resolveModuleName(
        moduleSpecifier,
        file,
        options,
        ts.sys
      ).resolvedModule?.resolvedFileName
      const resource = specifier.split('?')[0]
      const direct = rootAbsolute
        ? path.join(root, resource.slice(1))
        : resource.startsWith('.')
          ? path.resolve(path.dirname(file), resource)
          : resource.startsWith('@/')
            ? path.join(root, 'src', resource.slice(2))
            : undefined
      const target =
        resolved ??
        (direct && existsSync(direct) && ts.sys.fileExists(direct)
          ? direct
          : undefined)
      const internal =
        rootAbsolute ||
        specifier.startsWith('.') ||
        Object.keys(options.paths ?? {}).some((alias) =>
          alias.includes('*')
            ? specifier.startsWith(alias.split('*')[0])
            : specifier === alias
        )
      const message = target
        ? violation(realpathSync(file), realpathSync(target), root)
        : internal
          ? `cannot resolve internal import '${specifier}'`
          : undefined
      if (message) {
        const position = source.getLineAndCharacterOfPosition(
          literal.getStart(source)
        )
        diagnostics.push({
          file,
          line: position.line + 1,
          column: position.character + 1,
          specifier,
          message,
        })
      }
    }
    return diagnostics
  }
}

/** @param {string} directory @returns {string[]} */
function sourceFiles(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory()
      ? sourceFiles(file)
      : entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)
        ? [file]
        : []
  })
}

/** @param {string} [directory] */
export function checkBoundaries(directory = process.cwd()) {
  const root = realpathSync(directory)
  const checkFile = createChecker(root)
  return sourceFiles(path.join(root, 'src'))
    .sort()
    .flatMap((file) => checkFile(file, readFileSync(file, 'utf8')))
}

/** @type {Map<string, ReturnType<typeof createChecker>>} */
const checkers = new Map()

/** @type {import('eslint').Rule.RuleModule} */
export const boundaryRule = {
  meta: {
    type: 'problem',
    schema: [],
    docs: { description: 'Enforce resolved source module boundaries' },
  },
  create(context) {
    const root = realpathSync(context.cwd)
    if (!checkers.has(root)) checkers.set(root, createChecker(root))
    const checkFile = checkers.get(root)
    return {
      Program() {
        const file = context.filename
        if (
          !checkFile ||
          !existsSync(file) ||
          !file.startsWith(path.join(root, 'src') + path.sep)
        )
          return
        for (const diagnostic of checkFile(file, context.sourceCode.text))
          context.report({
            loc: { line: diagnostic.line, column: diagnostic.column - 1 },
            message: `${diagnostic.message}: ${diagnostic.specifier}`,
          })
      },
    }
  },
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    const root = path.resolve(process.argv[2] ?? process.cwd())
    const diagnostics = checkBoundaries(root)
    for (const diagnostic of diagnostics)
      console.error(
        `${path.relative(root, diagnostic.file)}:${diagnostic.line}:${diagnostic.column} ${diagnostic.message}: ${diagnostic.specifier}`
      )
    if (!diagnostics.length) console.log('Module boundaries passed.')
    process.exitCode = diagnostics.length ? 1 : 0
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}
