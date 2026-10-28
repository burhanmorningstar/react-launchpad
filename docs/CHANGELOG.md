# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-29

### Certified Full Release (Completed 24/24 Superpowers Milestone)

#### Added

- **Core Toolchain & Architecture:**
  - Modern frontend foundation: React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4.
  - Strict AST-based unidirectional module boundaries (`scripts/check-boundaries.mjs`).
  - Centralized runtime project configuration (`src/config/project.ts` & `project.config.json`).
  - Seamless dark/light/system theme provider with instant bootstrap script (`ThemeProvider`).
- **Design System & Storybook Catalog:**
  - 37+ accessible primitives based on Radix UI and Tailwind CSS v4.
  - Responsive Application Shell, AppSidebar, PageHeader, PageToolbar, FilterBar, and Blocks.
  - Interactive Storybook catalog with 100% public component coverage gate (`pnpm check:stories`).
- **Advanced Frontend Modules:**
  - TipTap Rich Text Editor with DOMPurify sanitization (`RichTextEditor`, `RichTextContent`).
  - Accessible SVG charting primitives for Bar, Line, and Area charts (`Chart`, `ChartEmptyState`).
  - Accessible Embla carousel and window-based virtualization (`VirtualList`).
  - Keyboard-activated Command Palette (`CommandPalette`) with quick navigation and theme toggling.
- **Enterprise Data & Form Patterns:**
  - React Hook Form + Zod schema integration with localized validation error keys.
  - Advanced form controls: ComboboxField, DateField, DateRangeField, FieldArray, and FormStepper.
  - Production TanStack Table v8 DataTable with URL state synchronization, faceted filters, pagination, column visibility, and row selection.
  - Multi-file upload dropzone, file preview tiles, and upload queue management (`FileDropzone`, `useUploadQueue`).
- **Internationalization (i18n):**
  - react-i18next with lazy namespace loader (`loadNamespace.ts`) and formatters (dates, currency, relative time).
  - Localization CLI suite: `generate:locale`, `generate:namespace`, `i18n:check`, `i18n:enable` with draft/enabled workflow.
  - Full RTL direction support with document synchronization.
- **Developer Experience & Scaffolding:**
  - Plop and standalone CLI generators with collision detection and atomic rollback: `generate:feature`, `generate:page`, `generate:form`, `generate:component`, `generate:hook`.
  - Single-command project branding setup (`pnpm setup:project`).
  - Diagnostic health doctor (`pnpm doctor`).
  - Safe template examples uninstaller (`pnpm examples:remove`) backed by `.template-manifest.json`.
- **Quality, Accessibility & Performance Gates:**
  - Automated accessibility scanning via `@axe-core/playwright` (`e2e/accessibility.spec.ts`) enforcing zero critical/serious issues.
  - Keyboard navigation and focus management specs (`e2e/keyboard.spec.ts`).
  - Strict bundle budgets: initial JS closure $\le 200$ KiB gzip and CSS $\le 50$ KiB gzip (`pnpm check:bundle`).
  - Zero-telemetry privacy contract test (`e2e/network-contract.spec.ts`).
  - Multi-provider static hosting recipes (Firebase, Cloudflare, Vercel, Docker/Nginx unprivileged) and SPA fallback tests.
  - Automated two-consumer template acceptance suite (`scripts/verify-template.mjs`).
