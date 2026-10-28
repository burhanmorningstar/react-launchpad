import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Inventory of compound child parts, wrappers, and sub-primitives that are documented
 * within their respective parent component stories rather than isolated stories.
 */
export const DOCUMENTED_INTERNAL_PRIMITIVES = new Set([
  // Card sub-parts
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'CardContent',
  'CardFooter',
  'CardAction',

  // Dialog & Modal sub-parts
  'DialogTrigger',
  'DialogPortal',
  'DialogOverlay',
  'DialogClose',
  'DialogContent',
  'DialogHeader',
  'DialogFooter',
  'DialogTitle',
  'DialogDescription',

  // Alert Dialog sub-parts
  'AlertDialogTrigger',
  'AlertDialogPortal',
  'AlertDialogOverlay',
  'AlertDialogContent',
  'AlertDialogHeader',
  'AlertDialogFooter',
  'AlertDialogTitle',
  'AlertDialogDescription',
  'AlertDialogAction',
  'AlertDialogCancel',

  // Dropdown Menu sub-parts
  'DropdownMenuTrigger',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'DropdownMenuCheckboxItem',
  'DropdownMenuRadioItem',
  'DropdownMenuLabel',
  'DropdownMenuSeparator',
  'DropdownMenuShortcut',
  'DropdownMenuGroup',
  'DropdownMenuPortal',
  'DropdownMenuSub',
  'DropdownMenuSubContent',
  'DropdownMenuSubTrigger',
  'DropdownMenuRadioGroup',

  // Select sub-parts
  'SelectGroup',
  'SelectValue',
  'SelectTrigger',
  'SelectContent',
  'SelectLabel',
  'SelectItem',
  'SelectSeparator',
  'SelectScrollUpButton',
  'SelectScrollDownButton',

  // Table sub-parts
  'TableHeader',
  'TableBody',
  'TableFooter',
  'TableHead',
  'TableRow',
  'TableCell',
  'TableCaption',

  // Sheet / Drawer sub-parts
  'SheetTrigger',
  'SheetClose',
  'SheetPortal',
  'SheetOverlay',
  'SheetContent',
  'SheetHeader',
  'SheetFooter',
  'SheetTitle',
  'SheetDescription',

  // Accordion sub-parts
  'AccordionItem',
  'AccordionTrigger',
  'AccordionContent',

  // Navigation Menu sub-parts
  'NavigationMenuList',
  'NavigationMenuItem',
  'NavigationMenuContent',
  'NavigationMenuTrigger',
  'NavigationMenuLink',
  'NavigationMenuIndicator',
  'NavigationMenuViewport',

  // Avatar sub-parts
  'AvatarImage',
  'AvatarFallback',

  // Breadcrumbs sub-parts
  'BreadcrumbList',
  'BreadcrumbItem',
  'BreadcrumbLink',
  'BreadcrumbPage',
  'BreadcrumbSeparator',
  'BreadcrumbEllipsis',
  'useBreadcrumbs',

  // Carousel sub-parts
  'CarouselContent',
  'CarouselItem',
  'CarouselPrevious',
  'CarouselNext',

  // Skeleton variants
  'SkeletonText',
  'SkeletonTitle',
  'SkeletonAvatar',
  'SkeletonButton',
  'SkeletonCard',

  // Form Field sub-parts
  'FieldShell',
  'useAppFormContext',

  // Helper types and variants
  'buttonVariants',
  'badgeVariants',
  'toggleVariants',
  'toggleGroupVariants',
  'navigationMenuTriggerStyle',
])

/**
 * Finds all Storybook story files in the project.
 * @param {string} dir
 * @returns {string[]}
 */
export function findStoryFiles(dir) {
  /** @type {string[]} */
  const storyFiles = []

  /** @param {string} current */
  function walk(current) {
    if (!existsSync(current)) return
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'storybook-static') {
          walk(fullPath)
        }
      } else if (entry.name.endsWith('.stories.tsx') || entry.name.endsWith('.stories.ts')) {
        storyFiles.push(fullPath)
      }
    }
  }

  walk(dir)
  return storyFiles
}

/**
 * Checks story coverage against component exports.
 * @param {string} root
 * @returns {{ covered: string[], uncovered: string[], internal: string[] }}
 */
export function checkStoryCoverage(root) {
  const storyFiles = findStoryFiles(path.join(root, 'src'))
  const storyContents = storyFiles.map((file) => readFileSync(file, 'utf8')).join('\n')

  const publicIndex = path.join(root, 'src/core/ui/components/index.ts')
  if (!existsSync(publicIndex)) {
    throw new Error(`Public UI index not found at ${publicIndex}`)
  }

  const indexSource = readFileSync(publicIndex, 'utf8')
  const exportMatches = indexSource.matchAll(/export\s+\{([^}]+)\}/g)
  const exports = new Set()

  for (const match of exportMatches) {
    const symbols = match[1]
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('type '))
      .map((s) => s.split(' as ')[0].trim())

    symbols.forEach((sym) => exports.add(sym))
  }

  const covered = []
  const internal = []
  const uncovered = []

  for (const symbol of exports) {
    if (DOCUMENTED_INTERNAL_PRIMITIVES.has(symbol)) {
      internal.push(symbol)
    } else if (storyContents.includes(symbol)) {
      covered.push(symbol)
    } else {
      uncovered.push(symbol)
    }
  }

  return { covered, uncovered, internal }
}

// CLI execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(process.argv[2] || process.cwd())
  const result = checkStoryCoverage(root)

  console.log(`\nStory Coverage Report:`)
  console.log(`✓ Directly covered components: ${result.covered.length}`)
  console.log(`✓ Documented internal compound sub-primitives: ${result.internal.length}`)

  if (result.uncovered.length > 0) {
    console.error(`\n❌ Uncovered public UI components (${result.uncovered.length}):`)
    result.uncovered.forEach((item) => console.error(`  - ${item}`))
    process.exit(1)
  } else {
    console.log(`✓ 100% of public UI exports are documented in Storybook catalog.`)
    process.exit(0)
  }
}
