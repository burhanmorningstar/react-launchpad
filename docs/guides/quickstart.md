# Quickstart Guide

Welcome to the React Launchpad! This guide walks you through setting up your first project, customizing your brand, adding feature modules, and verifying health.

---

## 1. Quick Setup in 3 Steps

### Step 1: Install Dependencies

```bash
git clone https://github.com/Aybavs/react-launchpad.git my-app
cd my-app
pnpm install
```

### Step 2: System & Project Diagnostics

Run doctor to verify your Node runtime (24.20.0+), pnpm version, translation completeness, and Storybook catalog:

```bash
pnpm doctor
```

### Step 3: Re-Brand & Choose Starter Mode

Configure your application title, display name, default locale, and starter modules:

```bash
# Option A: Keep example screens to explore architecture and components
pnpm setup:project --name my-company --display-name "My Company" --locale en --examples keep

# Option B: Remove example screens for a pristine, clean production canvas
pnpm setup:project --name my-company --display-name "My Company" --locale tr --examples remove
```

Start the local development server:

```bash
pnpm dev
```

---

## 2. Generating Your First Feature Module

The launchpad includes a code generator that produces type-safe, boundary-tested feature scaffolding with atomic rollback protection:

```bash
# Generate a complete feature module with routes, pages, and i18n
pnpm generate:feature products

# Generate an additional page inside the feature
pnpm generate:page inventory --feature products

# Generate a Zod-validated form with story and test
pnpm generate:form create-product --feature products
```

All commands support `--dry-run` to inspect planned changes without touching the disk:

```bash
pnpm generate:feature billing --dry-run
```

---

## 3. Running Verification Gates

Before submitting PRs or deploying, run the full verification pipeline:

```bash
pnpm check
```

This runs TypeScript checking, module boundaries check, Storybook catalog coverage, bundle budget check, ESLint, Prettier, unit tests, and tooling regression tests.
