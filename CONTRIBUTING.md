# Contributing to React Boilerplate

First off, thank you for considering contributing! ❤️

## Development Setup

### Prerequisites

- Node.js 24.20.0+
- pnpm 10.29.2+

### Getting Started

1. **Fork & Clone**

   ```bash
   git clone https://github.com/Aybavs/react-launchpad.git
   cd react-launchpad
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Create Branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **Run Development Server**

   ```bash
   pnpm dev
   ```

5. **Run Tests**
   ```bash
   pnpm test        # Unit tests
   pnpm test:e2e    # E2E tests
   ```

## Project Structure

This project uses **Feature-Based Architecture**. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed guide.

```
src/
├── app/         # Application layer (routing, layouts, providers)
├── features/    # Feature modules (auth, users, dashboard, etc.)
├── core/        # Core infrastructure (API, auth, UI components)
├── shared/      # Shared utilities, types, constants
└── i18n/        # Internationalization
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting, missing semicolons, etc.
- refactor: Code restructuring
- test:     Adding/updating tests
- chore:    Build process, dependencies, etc.
```

### Examples

```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(users): resolve pagination bug"
git commit -m "docs: update API documentation"
git commit -m "test(dashboard): add unit tests for stats cards"
```

**Pre-commit hooks will automatically:**

- Lint your code (ESLint)
- Format your code (Prettier)
- Validate commit message (commitlint)

## Pull Request Process

1. **Update Documentation** if needed (README, ARCHITECTURE, etc.)

2. **Add Tests** for new features

   ```bash
   # Unit tests
   pnpm test

   # E2E tests
   pnpm test:e2e
   ```

3. **Run All Checks**

   ```bash
   pnpm lint        # ESLint
   pnpm typecheck   # TypeScript
   pnpm test        # All tests
   pnpm build       # Build check
   ```

4. **Fill PR Template** completely

5. **Wait for Review** - maintainers will review your PR ASAP!

## Code Style Guidelines

### TypeScript

- ✅ Use TypeScript strict mode (no `any` types)
- ✅ Prefer interfaces over types for object shapes
- ✅ Use type imports: `import type { User } from './types'`
- ✅ Avoid enums, use `as const` instead

### React

- ✅ Use functional components with hooks
- ✅ Extract reusable logic into custom hooks
- ✅ Use React Query for server state
- ✅ Use Zustand for client state (minimal usage)

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useUsers.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Constants: `UPPER_CASE` (e.g., `STORAGE_KEYS`)

### Import Order

```typescript
// 1. External dependencies
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal imports (@/ alias)
import { Button } from '@/core/ui'
import { useAuth } from '@/core/auth'

// 3. Relative imports
import { UserCard } from './UserCard'
import type { User } from '../types'
```

## Adding New Features

Use Plop generators for consistency:

```bash
pnpm generate:feature     # New feature module
pnpm generate:component   # New UI component
pnpm generate:hook        # New custom hook
```

### Feature Module Structure

```
features/[name]/
├── index.ts              # Public API (barrel export)
├── pages/                # Lazy-loaded pages
├── components/           # Feature-specific UI
├── api/                  # TanStack Query hooks
│   ├── queries.ts
│   └── mutations.ts
├── types/                # TypeScript types
└── store/                # Feature state (optional)
```

**Important:** Features must be independent! No cross-feature imports.

## Testing Guidelines

### Unit Tests (Vitest)

```typescript
// UserCard.test.tsx
import { render, screen } from '@/test/utils/render'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('renders user information', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' }
    render(<UserCard user={user} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```typescript
// users.spec.ts
import { test, expect } from '@playwright/test'

test('should display users list', async ({ page }) => {
  await page.goto('/users')
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
})
```

## Internationalization (i18n)

Add translations for both English and Turkish:

```json
// src/i18n/locales/en/[feature].json
{
  "title": "Users",
  "actions": {
    "create": "Create User",
    "edit": "Edit User"
  }
}
```

```json
// src/i18n/locales/tr/[feature].json
{
  "title": "Kullanıcılar",
  "actions": {
    "create": "Kullanıcı Oluştur",
    "edit": "Kullanıcıyı Düzenle"
  }
}
```

## Documentation

When adding new features:

1. Update [README.md](./README.md) if it affects setup/usage
2. Update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) if it changes architecture
3. Add JSDoc comments for public APIs
4. Create Storybook stories for UI components

## Getting Help

- 📖 Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for architecture guide
- 💬 Open a [Discussion](https://github.com/Aybavs/react-launchpad/discussions)
- 🐛 Report bugs via [Issues](https://github.com/Aybavs/react-launchpad/issues)

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to learn and build together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🚀
