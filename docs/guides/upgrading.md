# Upgrading & Maintenance Guide

This document outlines best practices for keeping React Launchpad and its underlying dependencies up to date.

---

## 1. Upgrading Dependencies

We recommend using `pnpm`'s interactive update utility:

```bash
# Check for outdated packages
pnpm outdated

# Interactively update dependencies
pnpm update -i --latest
```

After updating dependencies:

1. Run `pnpm typecheck` to detect any compiler breakages.
2. Run `pnpm test:unit` and `pnpm test:tooling` to ensure backward compatibility.
3. Run `pnpm check:bundle` to ensure bundle budgets are not exceeded.

---

## 2. React 19 & Tailwind CSS v4 Notes

- **React 19:** Function components no longer require `forwardRef` for standard refs in newly authored components; however, design system primitives preserve Radix UI compatibility patterns.
- **Tailwind CSS v4:** Styles are compiled natively via `@tailwindcss/vite` without PostCSS config files. Theme variables and utility layers are declared in `@import "tailwindcss";` inside `src/styles/globals.css`.

---

## 3. Tooling Regression Gates

Run the comprehensive check command whenever core dependencies are changed:

```bash
pnpm check
```
