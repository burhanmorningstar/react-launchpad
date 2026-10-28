# Progressive Web Application (PWA) Guide

React Launchpad features built-in, opt-in Progressive Web Application (PWA) capabilities powered by `vite-plugin-pwa` and Workbox.

---

## 1. Enabling PWA

PWA support is disabled by default to maintain zero service worker overhead during standard web development. To enable PWA capabilities for your project:

In `.env`:

```bash
VITE_PWA_ENABLED=true
```

When building for production (`pnpm build`), Vite compiles the service worker (`sw.js`) and generates the web manifest (`manifest.webmanifest`).

---

## 2. Web App Manifest Configuration

The manifest settings live in `vite.config.ts` under `VitePWA`:

```typescript
manifest: {
  name: 'Launchpad Application',
  short_name: 'Launchpad',
  description: 'Production-ready React application',
  theme_color: '#0f172a',
  background_color: '#ffffff',
  display: 'standalone',
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
  ]
}
```

---

## 3. Workbox Caching Strategies

The default Workbox configuration provides two caching rules:

1. **API Requests (`NetworkFirst`):**
   - Pattern: `/^https:\/\/api\..*/i`
   - Attempts fresh network fetch first; falls back to cached responses when offline.
   - Cache expiry: 24 hours, max 100 entries.

2. **Media & Static Assets (`CacheFirst`):**
   - Pattern: `/\.(png|jpg|jpeg|svg|gif|webp)$/`
   - Serves immediately from local cache; updates in background.
   - Cache expiry: 30 days, max 50 entries.

---

## 4. Updates & Service Worker Lifecycle

The plugin uses `registerType: 'autoUpdate'`. When a new deployment is detected:

1. The new service worker installs in the background.
2. Once active, the client reloads caches seamlessly.
3. You can bind custom UI prompts to `useRegisterSW` to notify users: "New version available. Click here to reload."
