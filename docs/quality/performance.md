# Frontend Performance, Budgets, and Loading Contracts

This document establishes the performance architecture, loading contracts, bundle budgets, and network telemetry policy for the React Launchpad.

---

## 1. Performance Budgets

The launchpad strictly enforces automated performance budgets on every production build via `scripts/check-bundle.mjs`:

| Asset Category         | Target Budget           | Enforcement Mechanism              |
| :--------------------- | :---------------------- | :--------------------------------- |
| **Initial JS Closure** | $\le 200$ KiB gzip      | `pnpm check:bundle` / `pnpm check` |
| **Initial CSS Bundle** | $\le 50$ KiB gzip       | `pnpm check:bundle` / `pnpm check` |
| **Route Chunks**       | $\le 100$ KiB gzip each | Vite rollupOptions warning limit   |
| **External Network**   | **0 external requests** | `e2e/network-contract.spec.ts`     |

---

## 2. Code-Splitting Architecture

### Vendor Chunks

Third-party dependencies are split into long-term cacheable vendor chunks defined in `vite.config.ts`:

- `react`: `react`, `react-dom` (~4 KiB gzip)
- `router`: `react-router` (~29 KiB gzip)
- `query`: `@tanstack/react-query` (~10 KiB gzip)
- `ui`: `clsx`, `sonner` (~10 KiB gzip)

### Lazy Dynamic Chunks

Heavy components and routes are dynamically imported to keep the initial page load lightweight:

1. **Rich Text Editor:** `@tiptap/*` (~65 KiB gzip) is lazy-loaded only when the editor or Content page mounts.
2. **Charts & Visualizations:** SVG charting primitives are tree-shaken and split.
3. **Feature Routes:** Discovered via `import.meta.glob('../../features/*/routes.tsx')` and deferred until user navigation.

---

## 3. Network Isolation Contract (Zero Telemetry by Default)

Launchpad adopts a strict **privacy-first, zero-telemetry default**:

- **Self-Hosted Assets:** Inter Variable font (`InterVariable-*.woff2`) is hosted locally in `/dist/assets`, requiring zero external Google Fonts connections.
- **Opt-in Telemetry:** PostHog analytics and Sentry monitoring are fully disabled by default (`VITE_ANALYTICS_ENABLED=false`, `VITE_SENTRY_DSN=""`).
- **Network Contract Test:** `e2e/network-contract.spec.ts` fails the build if any unauthorized outbound HTTP request is made to any third-party domain during initial page navigation.

---

## 4. Verification Workflow

```bash
# 1. Build production assets with manifest
pnpm build

# 2. Verify bundle size against budgets
pnpm check:bundle

# 3. Analyze visual treemap of bundle chunks
pnpm build:analyze
```
