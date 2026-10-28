# Static Hosting & Production Deployment Guide

React Launchpad compiles to an optimized, purely static Single Page Application (SPA). It can be served from any object storage, CDN, static site host, or minimal container runtime.

---

## 1. Hosting Architecture & Cache Rules

Because Vite generates content-hashed filenames for all compiled assets, static file servers should enforce the following caching header contract:

| Resource Path                           | Cache-Control Header                     | Rationale                                                                |
| :-------------------------------------- | :--------------------------------------- | :----------------------------------------------------------------------- |
| `/assets/*` (JS, CSS, fonts, images)    | `public, max-age=31536000, immutable`    | Hashes change whenever content changes; browsers can cache indefinitely. |
| `/index.html`                           | `no-cache, no-store, must-revalidate`    | Guarantees users always download the latest chunk manifest on release.   |
| `/manifest.webmanifest`, `/favicon.ico` | `public, max-age=86400, must-revalidate` | 24-hour cache with revalidation.                                         |

---

## 2. Multi-Provider Static Hosting Recipes

### A. Firebase Hosting

Create a `firebase.json` in your project root:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

Deploy with:

```bash
pnpm build
firebase deploy --only hosting
```

---

### B. Cloudflare Pages

- **Framework preset:** `Vite`
- **Build command:** `pnpm build`
- **Build output directory:** `dist`

Add `public/_headers` for cache control:

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: no-cache, no-store, must-revalidate
```

---

### C. Vercel

Add `vercel.json` in your project root:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

---

### D. Nginx & Docker

The launchpad includes a hardened multi-stage Docker build with unprivileged Alpine Nginx:

```bash
# Build production container image
docker build -t react-launchpad .

# Run unprivileged container on port 3000
docker run -p 3000:8080 react-launchpad
```

Or with Docker Compose:

```bash
docker compose up -d app
```

---

## 3. Subpath Hosting (`VITE_BASE_PATH`)

If your frontend is hosted under a subdirectory (e.g. `https://example.com/portal/`):

1. Set the environment variable before building:
   ```bash
   VITE_BASE_PATH=/portal/ pnpm build
   ```
2. In `src/config/project.json` or React Router initialization, the base route automatically resolves relative to this path.
