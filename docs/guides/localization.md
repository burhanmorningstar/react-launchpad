# Localization Guide (i18n)

This guide documents the scalable internationalization and translation runtime used in React Launchpad.

---

## Architecture Overview

- **Canonical Locale:** `en` (English) is the authoritative reference for all translation keys and namespaces.
- **Dynamic Discovery:** Locales are discovered via `src/i18n/locales/*/_meta.json`. No central array or barrel import is manually maintained.
- **Draft vs. Enabled Lifecycle:**
  - Newly generated locales default to `status: "draft"`.
  - Draft locales are visible in Storybook/preview but do not break production CI checks on incomplete keys.
  - A locale must be verified and marked as `status: "enabled"` via `i18n:enable` before being released.
- **Quality Gates:** `pnpm i18n:check` strictly audits missing/extra keys, JSON syntax, variable interpolation (`{{count}}`), and language-specific plural forms.

---

## Common CLI Workflows

### 1. Generating a New Locale

To add a new language, run:

```bash
pnpm generate:locale fr --name "Français" --direction ltr
```

Flags:
- `<code>`: Standard 2-letter or region code (e.g., `de`, `es`, `ar`, `pt-BR`).
- `--name`: Human-readable display name.
- `--direction`: `ltr` (left-to-right) or `rtl` (right-to-left).
- `--dry-run`: Preview planned files without writing to disk.

This generates `src/i18n/locales/fr/_meta.json` with `status: "draft"` and empty translation skeletons mirroring all canonical namespaces (`common.json`, `users.json`, `validation.json`).

### 2. Generating a New Namespace

When creating a new product feature or domain, add a namespace across all locales:

```bash
pnpm generate:namespace billing
```

This creates `billing.json` across all enabled and draft locales simultaneously.

### 3. Checking Translation Completeness

Run the quality gate:

```bash
pnpm i18n:check
```

Options:
- `--include-drafts`: Also verifies draft locales strictly, reporting any incomplete keys as failures.

What is checked:
1. **Key Parity:** Every key present in `en/<ns>.json` must exist in `<target>/<ns>.json`.
2. **Type Consistency:** Primitive types (string, number, array) must match.
3. **Interpolation Variables:** Placeholders such as `{{count}}` or `{{name}}` must match the exact variable names used in canonical.
4. **Plural Rules:** Ensures all language-specific plural categories (e.g. `_one`, `_few`, `_many`, `_other` in Arabic, Polish, etc. resolved via `Intl.PluralRules`) are provided.

### 4. Enabling a Reviewed Locale

Once translators have completed the keys for a draft language and all checks pass:

```bash
pnpm i18n:enable fr --reviewed
```

*Note: The `--reviewed` flag is mandatory to certify translation verification. If unresolved errors or missing keys remain, `enable-locale` will abort.*

---

## Runtime Formatters

Import formatters from `@/i18n`:

```typescript
import {
  formatDateOnly,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatRelativeTime
} from '@/i18n'

// Timezone-safe calendar date (anchored at UTC noon to prevent day rollbacks)
formatDateOnly('2026-10-28') // e.g. "10/28/2026" (en-US) or "28.10.2026" (tr-TR)

// Full timestamp with explicit timezone
formatDateTime(new Date(), { timeZone: 'UTC' })

// Currency
formatCurrency(49.99, 'USD') // "$49.99"
formatCurrency(1250, 'TRY')  // "1.250,00 ₺"

// Relative Time
formatRelativeTime(-1, 'day') // "yesterday" or "1 day ago"
```

