# Backend Integration, API Types, and Mocking Guide

This guide describes how to connect the React Launchpad to your backend API, generate type-safe API clients from OpenAPI specs, and leverage Mock Service Worker (MSW).

---

## 1. Connecting to a Backend API

The HTTP client lives in `src/core/api/client.ts`. It provides an Axios instance with automatic:

- Base URL configuration via `VITE_API_URL`
- Authorization header injection (`Bearer <token>`)
- Correlation request IDs (`X-Request-ID`)
- Global error normalization (`ApiException`, status code handling)

```typescript
import { apiClient } from '@/core/api/client'

// GET request
const { data } = await apiClient.get<UserProfile>('/users/me')

// POST request with validation
const response = await apiClient.post<OrderResponse>('/orders', orderPayload)
```

---

## 2. Automatic OpenAPI Type Generation

You can generate TypeScript types directly from an OpenAPI / Swagger JSON or YAML specification:

1. Place your API schema at `schema.yaml` or provide a remote URL in `scripts/generate-api-types.js`.
2. Run the type generator:
   ```bash
   pnpm generate:api-types
   ```
3. Types are generated into `src/api-types/schema.d.ts` and can be imported across features:

   ```typescript
   import type { components } from '@/api-types/schema'

   type UserDto = components['schemas']['User']
   ```

---

## 3. Mock Service Worker (MSW) Strategy

Launchpad includes Mock Service Worker for network-level API mocking:

### Development Mocking

Enable MSW in development by setting in `.env`:

```bash
VITE_MSW_ENABLED=true
```

When enabled, `src/test/mocks/initMsw.ts` initializes the browser service worker and intercepts API calls before they leave the browser. Handlers are organized by domain in `src/test/mocks/handlers/`.

### Unit and Integration Testing

In Vitest unit tests, MSW runs in Node.js via `setupServer` (`src/test/mocks/server.ts`). Handlers are reset between each test to prevent cross-test pollution.

---

## 4. State Management Separation

Launchpad maintains a clean separation of concerns:

1. **Server State:** Managed by TanStack Query (`useQuery`, `useMutation`). Handles caching, revalidation, optimistic updates, and background refetching.
2. **Client UI State:** Managed by Zustand (`src/core/feature-flags/store.ts` or feature-specific stores). Handles purely ephemeral local state such as drawer visibility or multi-step wizard step navigation.
