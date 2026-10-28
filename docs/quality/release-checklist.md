# Production Release Checklist

Before releasing an application based on React Launchpad into production, verify each item in this checklist:

---

## 1. Automated Health & Quality Gates

Run the unified quality check:

```bash
pnpm check
```

Verify that all 8 automated gates pass green:

- [ ] `typecheck`: TypeScript compiler completes with zero errors across application, config, stories, tests, and tooling.
- [ ] `check:boundaries`: Module boundary rules strictly enforced; zero cross-feature leaks or core upward imports.
- [ ] `check:stories`: 100% of public UI exports are documented in Storybook.
- [ ] `check:bundle`: Initial JS bundle closure $\le 200$ KiB gzip and CSS $\le 50$ KiB gzip.
- [ ] `lint`: ESLint passes with zero errors.
- [ ] `format:check`: Prettier formatting is strictly applied.
- [ ] `test:unit`: Vitest suite runs completely green.
- [ ] `test:tooling`: All Node CLI tooling tests pass.
- [ ] `i18n:check`: All enabled translation namespaces have matching keys and valid pluralization.

---

## 2. Accessibility & Visual Testing

- [ ] Run `pnpm test:e2e` (Playwright) to verify axe-core reports zero critical or serious accessibility violations.
- [ ] Verify keyboard tab order: Skip link focuses `#main-content`, modals close on Escape.
- [ ] Verify light mode and dark mode rendering across desktop, tablet, and mobile (360px) viewports.

---

## 3. Privacy & Telemetry Policy

- [ ] Confirm no unauthorized external network requests are made on initial page load (`e2e/network-contract.spec.ts`).
- [ ] Verify `VITE_ANALYTICS_ENABLED` and `VITE_SENTRY_DSN` match your environment disclosure policy.

---

## 4. Build & Hosting

- [ ] Production build succeeds: `pnpm build`.
- [ ] Storybook builds successfully: `pnpm build-storybook`.
- [ ] SPA fallback rule (`try_files $uri $uri/ /index.html;`) is configured on your hosting provider.
- [ ] Cache headers set: 1-year immutable cache for `/assets/*` and `no-cache` for `/index.html`.
