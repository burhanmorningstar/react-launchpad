# Customization & Theming Guide

React Launchpad is built with **Tailwind CSS v4** and CSS variables, allowing deep customization without modifying component source files.

---

## 1. Project Configuration (`project.config.json`)

Global project settings are managed centrally in `project.config.json`:

```json
{
  "name": "My Company Studio",
  "defaultLocale": "en",
  "brand": {
    "mark": "MCS",
    "tagline": "Modern enterprise frontend"
  },
  "examples": {
    "enabled": true
  }
}
```

Updating this file automatically reconfigures headers, footers, page titles, and route discovery.

---

## 2. Design Tokens & Color Palettes

Theme tokens are defined in `src/styles/tokens.css` using OKLCH and CSS custom properties:

- `--primary`: Brand color
- `--secondary`: Accent and supporting elements
- `--background`, `--card`, `--popover`: Surface colors
- `--foreground`, `--muted-foreground`: Text colors
- `--destructive`: Error and deletion states

Both **Light Mode** and **Dark Mode** variants are fully supported and synchronized across `<ThemeProvider>`, Storybook, and local storage.

---

## 3. Adding New Locales

The localization system supports draft and enabled translation states:

1. Create a draft skeleton for all canonical namespaces:
   ```bash
   pnpm generate:locale de --name German
   ```
2. Review and translate the generated JSON files in `src/i18n/locales/de/*.json`.
3. Promote the locale to enabled state after passing validation:
   ```bash
   pnpm i18n:enable de --reviewed
   ```
4. RTL locales (such as Arabic or Hebrew) automatically switch document direction to `<html dir="rtl">`.
