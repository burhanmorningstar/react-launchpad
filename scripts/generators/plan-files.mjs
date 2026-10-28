import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * Validates name against path traversal, empty input, or illegal characters
 * @param {string} name
 * @param {string} fieldName
 */
export function assertSafeName(name, fieldName = 'name') {
  if (!name || typeof name !== 'string') {
    throw new Error(`${fieldName} is required`)
  }
  const trimmed = name.trim()
  if (
    trimmed.includes('..') ||
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    /[<>:"|?*]/.test(trimmed) ||
    trimmed.startsWith('.')
  ) {
    throw new Error(`Path traversal or invalid characters detected in ${fieldName}: "${name}"`)
  }
  return trimmed
}

/**
 * Ensures path resolves inside rootDir
 * @param {string} relativePath
 * @param {string} rootDir
 */
export function resolveSafePath(relativePath, rootDir) {
  const rootResolved = path.resolve(rootDir)
  const fullPath = path.resolve(rootResolved, relativePath)
  if (!fullPath.startsWith(rootResolved + path.sep) && fullPath !== rootResolved) {
    throw new Error(`Path traversal detected: "${relativePath}" escapes root "${rootDir}"`)
  }
  return fullPath
}

/**
 * @param {string} str
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

/**
 * @param {string} str
 */
export function toPascalCase(str) {
  return str
    .replace(/(?:^|[-_ \t]+)(\w)/g, (/** @type {string} */ _, /** @type {string} */ c) => c.toUpperCase())
}

/**
 * @param {string} str
 */
export function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Discovers locale codes in the project or fallback to defaults
 * @param {string} rootDir
 * @returns {string[]}
 */
function getLocales(rootDir) {
  const localesDir = path.join(rootDir, 'src/i18n/locales')
  if (existsSync(localesDir)) {
    try {
      const entries = readdirSync(localesDir, { withFileTypes: true })
      const found = entries.filter((e) => e.isDirectory()).map((e) => e.name)
      if (found.length > 0) return found
    } catch {
      // Fallback
    }
  }
  return ['en', 'tr']
}

/**
 * @typedef {{
 *   type: 'create' | 'modify',
 *   path: string,
 *   absolutePath: string,
 *   content?: string,
 *   transform?: (content: string) => string,
 *   description: string
 * }} FileOperation
 */

/**
 * Plans file generation operations with collision and traversal checking.
 *
 * @param {{
 *   type: 'feature' | 'page' | 'form' | 'component' | 'hook',
 *   name: string,
 *   options?: Record<string, any>,
 *   rootDir?: string
 * }} params
 * @returns {{ rootDir: string, operations: FileOperation[] }}
 */
export function planFiles({ type, name, options = {}, rootDir = process.cwd() }) {
  const safeName = assertSafeName(name, 'name')
  const operations = /** @type {FileOperation[]} */ ([])

  if (options.feature) {
    assertSafeName(options.feature, 'feature')
  }

  switch (type) {
    case 'feature': {
      const kebab = toKebabCase(safeName)
      const pascal = toPascalCase(safeName)
      const camel = toCamelCase(safeName)
      const baseDir = `src/features/${kebab}`

      // Types
      operations.push({
        type: 'create',
        path: `${baseDir}/types.ts`,
        absolutePath: resolveSafePath(`${baseDir}/types.ts`, rootDir),
        content: `export interface ${pascal}Item {\n  id: string\n  createdAt: string\n}\n`,
        description: `Types for ${pascal}`,
      })

      // Page
      operations.push({
        type: 'create',
        path: `${baseDir}/pages/${pascal}Page.tsx`,
        absolutePath: resolveSafePath(`${baseDir}/pages/${pascal}Page.tsx`, rootDir),
        content: `import { useTranslation } from 'react-i18next'\n\nimport { PageHeader } from '@/core/blocks/PageHeader'\nimport { Breadcrumbs } from '@/core/ui/components/breadcrumbs'\nimport { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/components/card'\n\nexport function ${pascal}Page() {\n  const { t } = useTranslation()\n\n  return (\n    <div className="space-y-6">\n      <Breadcrumbs\n        items={[\n          { label: 'Home', href: '/' },\n          { label: t('${kebab}:nav', '${pascal}') },\n        ]}\n      />\n      <PageHeader\n        title={t('${kebab}:title', '${pascal}')}\n        description={t('${kebab}:description', '${pascal} feature overview')}\n      />\n      <Card>\n        <CardHeader>\n          <CardTitle>{t('${kebab}:title', '${pascal}')}</CardTitle>\n          <CardDescription>{t('${kebab}:description', 'Manage ${pascal}')}</CardDescription>\n        </CardHeader>\n        <CardContent>\n          <p className="text-muted-foreground text-sm">\n            {t('${kebab}:description', '${pascal} content goes here.')}\n          </p>\n        </CardContent>\n      </Card>\n    </div>\n  )\n}\n`,
        description: `Overview page for ${pascal}`,
      })

      // Pages index
      operations.push({
        type: 'create',
        path: `${baseDir}/pages/index.ts`,
        absolutePath: resolveSafePath(`${baseDir}/pages/index.ts`, rootDir),
        content: `export * from './${pascal}Page'\n`,
        description: `Pages barrel for ${kebab}`,
      })

      // Components barrel
      operations.push({
        type: 'create',
        path: `${baseDir}/components/index.ts`,
        absolutePath: resolveSafePath(`${baseDir}/components/index.ts`, rootDir),
        content: `// Export feature components here\nexport {}\n`,
        description: `Components barrel for ${kebab}`,
      })

      // Hooks barrel
      operations.push({
        type: 'create',
        path: `${baseDir}/hooks/index.ts`,
        absolutePath: resolveSafePath(`${baseDir}/hooks/index.ts`, rootDir),
        content: `// Export feature hooks here\nexport {}\n`,
        description: `Hooks barrel for ${kebab}`,
      })

      // Routes
      operations.push({
        type: 'create',
        path: `${baseDir}/routes.tsx`,
        absolutePath: resolveSafePath(`${baseDir}/routes.tsx`, rootDir),
        content: `import { lazy } from 'react'\nimport type { RouteObject } from 'react-router'\n\nconst ${pascal}Page = lazy(() =>\n  import('./pages/${pascal}Page').then((m) => ({ default: m.${pascal}Page }))\n)\n\nexport const ${camel}Routes: RouteObject[] = [\n  {\n    path: '${kebab}',\n    element: <${pascal}Page />,\n  },\n]\n`,
        description: `Routes for ${kebab}`,
      })

      // Feature index (public API)
      operations.push({
        type: 'create',
        path: `${baseDir}/index.ts`,
        absolutePath: resolveSafePath(`${baseDir}/index.ts`, rootDir),
        content: `export * from './routes'\nexport * from './types'\n`,
        description: `Public entrypoint for ${kebab}`,
      })

      // Locales
      const locales = getLocales(rootDir)
      for (const loc of locales) {
        operations.push({
          type: 'create',
          path: `src/i18n/locales/${loc}/${kebab}.json`,
          absolutePath: resolveSafePath(`src/i18n/locales/${loc}/${kebab}.json`, rootDir),
          content: `{\n  "title": "${pascal}",\n  "description": "${pascal} feature description",\n  "nav": "${pascal}"\n}\n`,
          description: `I18n locale file for ${loc}/${kebab}`,
        })
      }
      break
    }

    case 'page': {
      if (!options.feature) {
        throw new Error('Feature option (--feature <name>) is required for page generation')
      }
      const featureKebab = toKebabCase(options.feature)
      let pagePascal = toPascalCase(safeName)
      if (!pagePascal.endsWith('Page')) {
        pagePascal += 'Page'
      }
      const routePath = toKebabCase(pagePascal.replace(/Page$/, ''))
      const pageFile = `src/features/${featureKebab}/pages/${pagePascal}.tsx`
      const routesFile = `src/features/${featureKebab}/routes.tsx`

      operations.push({
        type: 'create',
        path: pageFile,
        absolutePath: resolveSafePath(pageFile, rootDir),
        content: `import { useTranslation } from 'react-i18next'\n\nimport { PageHeader } from '@/core/blocks/PageHeader'\nimport { Breadcrumbs } from '@/core/ui/components/breadcrumbs'\nimport { Card, CardContent, CardHeader, CardTitle } from '@/core/ui/components/card'\n\nexport function ${pagePascal}() {\n  const { t } = useTranslation()\n\n  return (\n    <div className="space-y-6">\n      <Breadcrumbs\n        items={[\n          { label: 'Home', href: '/' },\n          { label: t('${featureKebab}:${routePath}.nav', '${pagePascal.replace(/Page$/, '')}') },\n        ]}\n      />\n      <PageHeader\n        title={t('${featureKebab}:${routePath}.title', '${pagePascal.replace(/Page$/, '')}')}\n        description={t('${featureKebab}:${routePath}.description', '${pagePascal.replace(/Page$/, '')} page')}\n      />\n      <Card>\n        <CardHeader>\n          <CardTitle>{t('${featureKebab}:${routePath}.title', '${pagePascal.replace(/Page$/, '')}')}</CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p className="text-muted-foreground text-sm">\n            {t('${featureKebab}:${routePath}.content', 'Page content goes here.')}\n          </p>\n        </CardContent>\n      </Card>\n    </div>\n  )\n}\n`,
        description: `Page component ${pagePascal}`,
      })

      // Add to routes.tsx
      operations.push({
        type: 'modify',
        path: routesFile,
        absolutePath: resolveSafePath(routesFile, rootDir),
        transform: (content) => {
          if (content.includes(pagePascal)) {
            return content
          }
          // Add lazy import before the export
          const lazyImport = `const ${pagePascal} = lazy(() =>\n  import('./pages/${pagePascal}').then((m) => ({ default: m.${pagePascal} }))\n)\n\n`
          let updated = lazyImport + content
          // Insert route object inside array
          const routeObject = `  {\n    path: '${routePath}',\n    element: <${pagePascal} />,\n  },\n`
          if (updated.includes('Routes: RouteObject[] = [')) {
            updated = updated.replace(
              /Routes: RouteObject\[\] = \[\n?/,
              (m) => `${m}${routeObject}`
            )
          }
          return updated
        },
        description: `Register ${pagePascal} in ${routesFile}`,
      })
      break
    }

    case 'form': {
      if (!options.feature) {
        throw new Error('Feature option (--feature <name>) is required for form generation')
      }
      const featureKebab = toKebabCase(options.feature)
      let formPascal = toPascalCase(safeName)
      if (!formPascal.endsWith('Form')) {
        formPascal += 'Form'
      }
      const formCamel = toCamelCase(formPascal)
      const baseDir = `src/features/${featureKebab}/forms/${formPascal}`

      // schema.ts
      operations.push({
        type: 'create',
        path: `${baseDir}/schema.ts`,
        absolutePath: resolveSafePath(`${baseDir}/schema.ts`, rootDir),
        content: `import { z } from 'zod'\n\nexport const ${formCamel}Schema = z.object({\n  title: z.string().min(1, 'validation:required'),\n  description: z.string().optional(),\n})\n\nexport type ${formPascal}Values = z.infer<typeof ${formCamel}Schema>\n`,
        description: `Validation schema for ${formPascal}`,
      })

      // Form component
      operations.push({
        type: 'create',
        path: `${baseDir}/${formPascal}.tsx`,
        absolutePath: resolveSafePath(`${baseDir}/${formPascal}.tsx`, rootDir),
        content: `import { useForm } from 'react-hook-form'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { useTranslation } from 'react-i18next'\n\nimport { Button } from '@/core/ui/components/button'\nimport {\n  Form,\n  FormControl,\n  FormField,\n  FormItem,\n  FormLabel,\n  FormMessage,\n} from '@/core/ui/components/form'\nimport { Input } from '@/core/ui/components/input'\n\nimport { ${formCamel}Schema, type ${formPascal}Values } from './schema'\n\nexport interface ${formPascal}Props {\n  onSubmit: (values: ${formPascal}Values) => void\n  defaultValues?: Partial<${formPascal}Values>\n}\n\nexport function ${formPascal}({ onSubmit, defaultValues }: ${formPascal}Props) {\n  const { t } = useTranslation()\n  const form = useForm<${formPascal}Values>({\n    resolver: zodResolver(${formCamel}Schema),\n    defaultValues: defaultValues ?? { title: '', description: '' },\n  })\n\n  return (\n    <Form {...form}>\n      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">\n        <FormField\n          control={form.control}\n          name="title"\n          render={({ field }) => (\n            <FormItem>\n              <FormLabel>{t('title', 'Title')}</FormLabel>\n              <FormControl>\n                <Input placeholder="Enter title" {...field} />\n              </FormControl>\n              <FormMessage />\n            </FormItem>\n          )}\n        />\n        <Button type="submit">{t('common:submit', 'Submit')}</Button>\n      </form>\n    </Form>\n  )\n}\n`,
        description: `Form component for ${formPascal}`,
      })

      // Test
      operations.push({
        type: 'create',
        path: `${baseDir}/${formPascal}.test.tsx`,
        absolutePath: resolveSafePath(`${baseDir}/${formPascal}.test.tsx`, rootDir),
        content: `import { describe, expect, it, vi } from 'vitest'\nimport { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\n\nimport { ${formPascal} } from './${formPascal}'\n\ndescribe('${formPascal}', () => {\n  it('renders form and validates required fields', async () => {\n    const user = userEvent.setup()\n    const onSubmit = vi.fn()\n    render(<${formPascal} onSubmit={onSubmit} />)\n\n    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()\n    await user.click(screen.getByRole('button', { name: /submit/i }))\n    expect(onSubmit).not.toHaveBeenCalled()\n  })\n})\n`,
        description: `Test for ${formPascal}`,
      })

      // Story
      operations.push({
        type: 'create',
        path: `${baseDir}/${formPascal}.stories.tsx`,
        absolutePath: resolveSafePath(`${baseDir}/${formPascal}.stories.tsx`, rootDir),
        content: `import type { Meta, StoryObj } from '@storybook/react-vite'\n\nimport { ${formPascal} } from './${formPascal}'\n\nconst meta = {\n  title: 'Features/${toPascalCase(featureKebab)}/${formPascal}',\n  component: ${formPascal},\n  parameters: {\n    layout: 'centered',\n  },\n} satisfies Meta<typeof ${formPascal}>\n\nexport default meta\ntype Story = StoryObj<typeof meta>\n\nexport const Default: Story = {\n  args: {\n    onSubmit: (values) => console.log('Submitted:', values),\n  },\n}\n`,
        description: `Storybook story for ${formPascal}`,
      })

      // Index
      operations.push({
        type: 'create',
        path: `${baseDir}/index.ts`,
        absolutePath: resolveSafePath(`${baseDir}/index.ts`, rootDir),
        content: `export * from './schema'\nexport * from './${formPascal}'\n`,
        description: `Index export for ${formPascal}`,
      })
      break
    }

    case 'component': {
      const pascal = toPascalCase(safeName)
      let targetDir = 'src/core/ui/components'
      if (options.feature) {
        targetDir = `src/features/${toKebabCase(options.feature)}/components`
      }

      operations.push({
        type: 'create',
        path: `${targetDir}/${pascal}.tsx`,
        absolutePath: resolveSafePath(`${targetDir}/${pascal}.tsx`, rootDir),
        content: `import * as React from 'react'\n\nimport { cn } from '@/core/ui/lib/utils'\n\nexport interface ${pascal}Props extends React.HTMLAttributes<HTMLDivElement> {}\n\nexport const ${pascal} = React.forwardRef<HTMLDivElement, ${pascal}Props>(\n  ({ className, children, ...props }, ref) => {\n    return (\n      <div ref={ref} className={cn('p-4 rounded-md border', className)} {...props}>\n        {children}\n      </div>\n    )\n  }\n)\n${pascal}.displayName = '${pascal}'\n`,
        description: `Component ${pascal}`,
      })

      operations.push({
        type: 'create',
        path: `${targetDir}/${pascal}.test.tsx`,
        absolutePath: resolveSafePath(`${targetDir}/${pascal}.test.tsx`, rootDir),
        content: `import { describe, expect, it } from 'vitest'\nimport { render, screen } from '@testing-library/react'\n\nimport { ${pascal} } from './${pascal}'\n\ndescribe('${pascal}', () => {\n  it('renders children correctly', () => {\n    render(<${pascal}>Hello</${pascal}>)\n    expect(screen.getByText('Hello')).toBeInTheDocument()\n  })\n})\n`,
        description: `Test for ${pascal}`,
      })

      operations.push({
        type: 'create',
        path: `${targetDir}/${pascal}.stories.tsx`,
        absolutePath: resolveSafePath(`${targetDir}/${pascal}.stories.tsx`, rootDir),
        content: `import type { Meta, StoryObj } from '@storybook/react-vite'\n\nimport { ${pascal} } from './${pascal}'\n\nconst meta = {\n  title: '${options.feature ? `Features/${toPascalCase(options.feature)}` : 'Core/UI'}/${pascal}',\n  component: ${pascal},\n} satisfies Meta<typeof ${pascal}>\n\nexport default meta\ntype Story = StoryObj<typeof meta>\n\nexport const Default: Story = {\n  args: {\n    children: 'Sample Content',\n  },\n}\n`,
        description: `Story for ${pascal}`,
      })
      break
    }

    case 'hook': {
      let clean = safeName.replace(/^use/, '')
      const pascal = toPascalCase(clean)
      const hookName = `use${pascal}`
      let targetDir = 'src/core/hooks'
      if (options.feature) {
        targetDir = `src/features/${toKebabCase(options.feature)}/hooks`
      }

      operations.push({
        type: 'create',
        path: `${targetDir}/${hookName}.ts`,
        absolutePath: resolveSafePath(`${targetDir}/${hookName}.ts`, rootDir),
        content: `import { useState } from 'react'\n\nexport function ${hookName}<T>(initialValue: T) {\n  const [value, setValue] = useState<T>(initialValue)\n  return [value, setValue] as const\n}\n`,
        description: `Hook ${hookName}`,
      })

      operations.push({
        type: 'create',
        path: `${targetDir}/${hookName}.test.ts`,
        absolutePath: resolveSafePath(`${targetDir}/${hookName}.test.ts`, rootDir),
        content: `import { describe, expect, it } from 'vitest'\nimport { act, renderHook } from '@testing-library/react'\n\nimport { ${hookName} } from './${hookName}'\n\ndescribe('${hookName}', () => {\n  it('initializes and updates value', () => {\n    const { result } = renderHook(() => ${hookName}(0))\n    expect(result.current[0]).toBe(0)\n    act(() => {\n      result.current[1](42)\n    })\n    expect(result.current[0]).toBe(42)\n  })\n})\n`,
        description: `Test for ${hookName}`,
      })
      break
    }

    default:
      throw new Error(`Unknown generator type: "${type}"`)
  }

  // Pre-execution collision check: any 'create' must not already exist
  for (const op of operations) {
    if (op.type === 'create' && existsSync(op.absolutePath)) {
      throw new Error(`Collision detected: File already exists at ${op.path}`)
    }
  }

  return { rootDir, operations }
}
