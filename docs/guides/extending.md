# Extending Architecture & Module Boundaries

React Launchpad follows strict unidirectional module boundaries enforced by `scripts/check-boundaries.mjs`:

```
src/
├── app/        (Application root, shell layouts, global providers, routing root)
├── features/   (Isolated domain modules, e.g. auth, users, billing)
├── core/       (Shared primitives, design system components, hooks, adapters)
└── config/     (Project, environment, and boundary configurations)
```

---

## 1. Boundary Contract Rules

1. **Core is Independent:** `core` modules may NEVER import from `features` or `app`.
2. **Features are Isolated:** A feature in `features/foo` may NEVER import from internal files of `features/bar` (only via explicit public API `features/bar/index.ts`).
3. **App Coordinates:** `app` imports from `features` and `core` to compose layouts and routes, but features must never import from `app`.
4. **Relative Traversal Defense:** No `../` path may escape its architectural boundary.

---

## 2. Creating a Feature Module

Every feature module follows a standard contract:

- `components/`: UI components private to the feature.
- `pages/`: Route-level views.
- `types.ts`: Domain models and schemas.
- `routes.tsx`: Route definition with lazy imports.
- `index.ts`: Public API export.

Use the generator to scaffold compliant modules instantly:

```bash
pnpm generate:feature customers
```

---

## 3. Storybook and Unit Test Requirements

- **Storybook Coverage:** Every exported UI component must have a corresponding Storybook story in its directory (`*.stories.tsx`). Verified by `pnpm check:stories`.
- **Unit Tests:** Every hook and component must include a Vitest test file (`*.test.tsx`).
- Run tests:
  ```bash
  pnpm test:unit
  pnpm check
  ```
