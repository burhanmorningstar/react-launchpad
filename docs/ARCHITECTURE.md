# Frontend Launchpad mimarisi

Güncel sözleşme: 27 Ekim 2026, Görev 3.

## Modül sınırları

`app` route/layout/provider birleşimini yapar. `core` tekrar kullanılabilir
altyapıdır; `app` veya `features` import edemez. Feature'lar `app` import edemez;
başka bir feature'ı yalnız kökündeki `index.ts` / `index.tsx` public API'si
üzerinden kullanabilir. Aynı feature'ın kendi iç dosyaları serbesttir.
`shared`, `app`, `core` veya `features` import edemez. Proje ayarları
`src/config` altında, bütün katmanlardan kullanılabilir.

`pnpm check:boundaries`, TypeScript AST ve gerçek modül çözümlemesiyle alias,
relative path, Vite `/src/...` yolu, re-export, literal dynamic import, require ve import-type
ifadelerini kontrol eder. `tsconfig.app.json` alias'ları (fixture'da root
tsconfig), `.js` → `.ts` çözümü ve dosya/klasör giriş noktaları dikkate alınır.
Çözülemeyen iç import sessizce atlanmaz. Yorumlar ve sıradan metinler import
sayılmaz. Bu statik denetim literal import yolları içindir; çalışma anında
hesaplanan modül adreslerini çözmez.

ESLint `architecture/module-boundaries` kuralı aynı checker'ı kullanır.
`pnpm check` içine sınır kapısı eklenmiştir; ayrıca CI lint işi bunu uygular.
Bağımsız davranış fixture'ları `scripts/tests/boundaries.test.mjs` içindedir.

## Feature route sözleşmesi

Tek kayıt kaynağı `src/features/<name>/routes.tsx` dosyasıdır. Eski
`_registry.ts` açıklama kopyası kaldırıldı. Dosya `feature` adında, core'daki
`FeatureDefinition` tipine uyan bir değer export eder:

```tsx
// src/features/orders/routes.tsx
import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'orders',
  routes: [
    {
      route: {
        path: '/orders',
        lazy: () => import('./pages/OrdersPage').then(({ OrdersPage }) => ({
          Component: OrdersPage,
        })),
      },
    },
  ],
  menu: [{ id: 'orders', label: 'Orders', href: '/orders' }],
} satisfies FeatureDefinition
```

App loader'ı `import.meta.glob('../../features/*/routes.tsx')` ile tanımları
keşfeder. Kayıt sırasında yalnız küçük route tanımları yüklenir; sayfalar
`route.lazy` içinde kalır ve eşleşen adrese gidilene kadar import edilmez.
Sayfa dosyasını route tanımının başında eager import etmekten kaçının.
Feature eklemek merkez route dosyasında liste büyütmeyi gerektirmez.
Feature'ı kaldırmak, ilgili klasörü kaldırmakla kaydı da kaldırır; hiç feature
kalmadığında Welcome ve 404 route'ları çalışmaya devam eder.

Kayıt, yinelenen feature id, route id ve normalize edilmiş route path için
kaynak dosyalarıyla açık hata verir. İç içe yollar, index route'lar, sondaki
slash, büyük/küçük harf ve yalnız parametre adı farklı dinamik yollar kontrol
edilir. Starter'ın `/`, `homePath` ve kök fallback adresleri rezerve edilir.
React Router'ın diğer route yapı kuralları kendi denetiminde kalır.

`mount` isteğe bağlı, app'in tanımladığı layout/guard slot'udur. Mevcut
`guest`, `dashboard`, `admin` slot'ları `feature-layouts.tsx` içinde birleşir;
bilinmeyen slot açık hata verir. Core bu isimlere veya oturum state'ine bağlı
değildir. `mount` verilmezse route public olarak eklenir. Menü katkıları loader
sonucunda döner; ortak shell'in menü tüketimi Görev 6'da tamamlanır.

Eski auth/dashboard/users/settings adresleri kendi feature route dosyalarına
taşındı; URL ve guard davranışı korundu. `example: true` tanımları
`projectConfig.examplesEnabled=false` iken hariç tutulur; ürün feature'ları
kayıtta kalır. Örneklerin `/examples` dalına taşınması Görev 17'dir.

Kanıtlar: `src/app/router/feature-routes.test.ts`,
`src/app/pages/WelcomePage.test.tsx`, `e2e/auth.spec.ts` ve
`e2e/template-start.spec.ts`. Yerel test/build sonucu canlı deployment kanıtı
değildir; güncel kapı sonuçları [baseline raporunda](quality/baseline.md).

## Tarihsel mimari analizi

Aşağıdaki 19 Ocak 2026 analizi önceki envanteri ve önerileri korur. Güncel
route/import sözleşmesinde yukarıdaki Görev 3 bölümleri esas alınır.

> **Proje:** React + Vite + TypeScript Boilerplate  
> **Tarih:** 19 Ocak 2026  
> **Versiyon:** 0.0.0

---

## 📁 Proje Yapısı

```
boilerplate/
├── .claude/                    # Claude AI konfigürasyonu
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline (lint, test, build)
│       └── deploy.yml          # Deploy pipeline
├── .husky/                     # Git hooks
├── .storybook/                 # Storybook konfigürasyonu
├── .vscode/                    # VS Code ayarları
├── e2e/                        # E2E testleri (Playwright)
│   ├── accessibility.spec.ts
│   ├── auth.spec.ts
│   └── navigation.spec.ts
├── public/
│   └── mockServiceWorker.js    # MSW service worker
├── src/
│   ├── app/                    # Application layer (en üst katman)
│   │   ├── App.tsx
│   │   ├── layouts/            # Layout componentleri
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── RootLayout.tsx
│   │   ├── providers/          # Context providers
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── I18nProvider.tsx
│   │   │   ├── PageLoader.tsx
│   │   │   └── QueryProvider.tsx
│   │   └── router/             # Routing
│   │       ├── guards/         # Route koruyucuları
│   │       │   ├── AuthGuard.tsx
│   │       │   └── GuestGuard.tsx
│   │       ├── routes.tsx
│   │       └── types.ts
│   ├── config/                 # Global konfigürasyon
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── index.ts
│   ├── core/                   # Core layer (paylaşılan altyapı)
│   │   ├── api/                # HTTP client
│   │   │   ├── client.ts       # Axios instance
│   │   │   └── types.ts
│   │   ├── auth/               # Authentication
│   │   │   ├── context.tsx
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── performance/        # Performance monitoring
│   │   │   ├── PerformanceMonitor.tsx
│   │   │   ├── usePerformanceMonitor.ts
│   │   │   └── webVitals.ts
│   │   ├── store/              # Global state (Zustand)
│   │   │   └── slices/
│   │   │       └── uiSlice.ts
│   │   └── ui/                 # UI Design System
│   │       ├── components/
│   │       │   ├── Breadcrumbs.tsx
│   │       │   ├── Button.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── DataTable/
│   │       │   ├── Form/
│   │       │   │   ├── Checkbox.tsx
│   │       │   │   ├── Radio.tsx
│   │       │   │   ├── Select.tsx
│   │       │   │   ├── Switch.tsx
│   │       │   │   └── Textarea.tsx
│   │       │   ├── Input.tsx
│   │       │   ├── Modal/
│   │       │   ├── Skeleton.tsx
│   │       │   ├── ThemeSwitcher.tsx
│   │       │   └── Toast.tsx
│   │       ├── hooks/
│   │       │   ├── useModal.tsx
│   │       │   └── useToast.ts
│   │       ├── primitives/     # (Boş - headless UI için)
│   │       └── theme/
│   ├── features/               # Feature modules
│   │   ├── <name>/routes.tsx   # Otomatik keşfedilen route tanımı
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── settings/
│   │   └── users/
│   ├── i18n/                   # Internationalization
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   └── tr/
│   │   └── index.ts
│   ├── shared/                 # Shared utilities (en alt katman)
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   │   └── cn.ts
│   │   └── validation/         # (Boş)
│   ├── styles/
│   │   └── globals.css
│   ├── test/                   # Test utilities
│   │   ├── mocks/
│   │   │   ├── handlers/       # MSW handlers
│   │   │   ├── browser.ts
│   │   │   └── server.ts
│   │   ├── setup.ts
│   │   └── utils/
│   │       └── render.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## 🏛️ Mimari Pattern

### **Feature-Sliced Design (FSD) Varyantı**

Proje, **Feature-Based Architecture** kullanıyor. Bu, FSD'nin sadeleştirilmiş bir versiyonu:

```
┌─────────────────────────────────────────┐
│                  APP                     │  ← Orchestration
├─────────────────────────────────────────┤
│              FEATURES                    │  ← Business Logic
├─────────────────────────────────────────┤
│                CORE                      │  ← Infrastructure
├─────────────────────────────────────────┤
│               SHARED                     │  ← Utilities
└─────────────────────────────────────────┘
```

### **Katman Hiyerarşisi ve Import Kuralları**

| Katman      | İçerik                      | Import Edebilir                 |
| ----------- | --------------------------- | ------------------------------- |
| `app/`      | Routing, layouts, providers | `features/`, `core/`, `shared/` |
| `features/` | Business logic, pages       | `core/`, `shared/`              |
| `core/`     | UI, API, auth, store        | `shared/`                       |
| `shared/`   | Utils, types, constants     | Hiçbir şey                      |

### **Yasaklı Importlar (ESLint ile Enforce)**

```javascript
// ❌ YANLIŞ - Cross-feature import
import { UserCard } from '@/features/users/components/UserCard'

// ✅ DOĞRU - Barrel export kullan
import { UserCard } from '@/features/users'

// ❌ YANLIŞ - Feature'dan core'a import
// core/ui/Button.tsx içinde:
import { User } from '@/features/users'

// ❌ YANLIŞ - Yukarı katmana import
// features/auth/index.ts içinde:
import { routes } from '@/app/router'
```

---

## 📦 Mevcut Feature'lar

| Feature         | Sayfalar                | API                | Components                         | Durum    |
| --------------- | ----------------------- | ------------------ | ---------------------------------- | -------- |
| `auth`          | LoginPage, RegisterPage | mutations.ts       | -                                  | ✅ Aktif |
| `dashboard`     | DashboardPage           | -                  | -                                  | ✅ Aktif |
| `users`         | UsersPage               | queries, mutations | UserTable                          | ✅ Aktif |
| `settings`      | SettingsPage            | -                  | -                                  | ✅ Aktif |
| `notifications` | -                       | queries, mutations | NotificationBell, NotificationItem | ✅ Aktif |

### **Feature Yapısı Standardı**

```
features/[name]/
├── index.ts          # Public API (SADECE buradan export)
├── pages/            # Lazy-loaded sayfalar
│   └── [Name]Page.tsx
├── components/       # Feature-specific UI
├── api/              # TanStack Query hooks
│   ├── queries.ts    # useQuery hooks
│   └── mutations.ts  # useMutation hooks
├── hooks/            # Feature hooks
├── types/            # TypeScript types
│   └── index.ts
└── store/            # Feature state (opsiyonel, ASLA export etme)
```

---

## 🆕 Yeni Feature Ekleme

### Adım 1: Klasör Yapısını Oluştur

```bash
mkdir -p src/features/[name]/{pages,components,api,types,hooks}
```

### Adım 2: Types Tanımla

```typescript
// src/features/orders/types/index.ts
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface OrdersFilters {
  status?: OrderStatus
  userId?: string
  page?: number
  limit?: number
}
```

### Adım 3: API Hooks Oluştur

```typescript
// src/features/orders/api/queries.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api'
import type { Order, OrdersFilters } from '../types'

export function useOrders(filters?: OrdersFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>('/orders', {
        params: filters,
      })
      return data
    },
  })
}

// src/features/orders/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api'
import type { Order } from '../types'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Order, 'id' | 'createdAt'>) =>
      apiClient.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
```

### Adım 4: Page Oluştur

```typescript
// src/features/orders/pages/OrdersPage.tsx
import { useOrders } from '../api/queries'

export function OrdersPage() {
  const { data: orders, isLoading } = useOrders()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Orders</h1>
      {/* ... */}
    </div>
  )
}
```

### Adım 5: Public API Tanımla

```typescript
// src/features/orders/index.ts
// Pages
export { OrdersPage } from './pages/OrdersPage'

// Types
export type { Order, OrderStatus, OrderItem, OrdersFilters } from './types'

// API hooks (public)
export { useOrders, useOrder } from './api/queries'
export { useCreateOrder, useUpdateOrder, useDeleteOrder } from './api/mutations'
```

### Adım 6: Route Ekle

```typescript
// src/features/orders/routes.tsx
import type { FeatureDefinition } from '@/core/routing/types'

export const feature = {
  id: 'orders',
  routes: [{ route: {
    path: '/orders',
    lazy: () => import('./pages/OrdersPage').then(({ OrdersPage }) => ({ Component: OrdersPage })),
  } }],
} satisfies FeatureDefinition
```

### Adım 7: i18n Çevirileri

```json
// src/i18n/locales/en/orders.json
{
  "title": "Orders",
  "status": {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered"
  }
}
```

```typescript
// src/i18n/index.ts
import enOrders from './locales/en/orders.json'
import trOrders from './locales/tr/orders.json'

export const resources = {
  en: {
    common: enCommon,
    users: enUsers,
    orders: enOrders, // ← Ekle
  },
  // ...
}
```

### Adım 8: MSW Mock (Development)

```typescript
// src/test/mocks/handlers/orders.ts
import { http, HttpResponse } from 'msw'
import type { Order } from '@/features/orders'

export const ordersHandlers = [
  http.get('/api/orders', () => {
    return HttpResponse.json([
      /* mock data */
    ])
  }),
]
```

---

## 🔧 Feature Güncelleme

### Component Ekleme

```typescript
// src/features/orders/components/OrderCard.tsx
import type { Order } from '../types'

interface OrderCardProps {
  order: Order
  onView?: (order: Order) => void
}

export function OrderCard({ order, onView }: OrderCardProps) {
  // ...
}
```

```typescript
// src/features/orders/index.ts
export { OrderCard } from './components/OrderCard'
```

### API Endpoint Ekleme

```typescript
// src/features/orders/api/queries.ts
export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => apiClient.get('/orders/stats'),
  })
}
```

---

## 📊 Monorepo Durumu

### **Sonuç: HAYIR, Monorepo değil**

Bu proje **tek paketli (single-package)** bir yapıda:

```yaml
# pnpm-workspace.yaml
ignoredBuiltDependencies:
  - esbuild
  - msw
```

`pnpm-workspace.yaml` sadece build dependency'lerini ignore etmek için kullanılıyor, monorepo için değil.

### **Monorepo'ya Geçiş Gerekli mi?**

| Senaryo                          | Öneri                    |
| -------------------------------- | ------------------------ |
| Tek uygulama, tek takım          | ❌ Monorepo gereksiz     |
| Birden fazla frontend uygulaması | ✅ Turborepo öner        |
| Shared component library         | ✅ Packages klasörü ekle |
| Micro-frontends                  | ✅ Module Federation     |

---

## 📦 Paket Analizi

### **Production Dependencies**

| Paket                   | Versiyon | Kullanım            | Değerlendirme |
| ----------------------- | -------- | ------------------- | ------------- |
| `react`                 | 19.2.0   | UI Framework        | ✅ Güncel     |
| `react-router`          | 7.12.0   | Routing             | ✅ Güncel     |
| `@tanstack/react-query` | 5.90.19  | Server State        | ✅ Güncel     |
| `@tanstack/react-table` | 8.21.3   | Data Tables         | ✅ Güncel     |
| `zustand`               | 5.0.10   | Client State        | ✅ Güncel     |
| `react-hook-form`       | 7.71.1   | Forms               | ✅ Güncel     |
| `@hookform/resolvers`   | 5.2.2    | Form Validation     | ✅ Güncel     |
| `zod`                   | 4.3.5    | Schema Validation   | ✅ Güncel     |
| `axios`                 | 1.13.2   | HTTP Client         | ✅ Güncel     |
| `i18next`               | 25.7.4   | i18n                | ✅ Güncel     |
| `react-i18next`         | 16.5.3   | React i18n          | ✅ Güncel     |
| `clsx`                  | 2.1.1    | Class Names         | ✅ Güncel     |
| `sonner`                | 2.0.7    | Toast Notifications | ✅ Güncel     |
| `web-vitals`            | 5.1.0    | Performance         | ✅ Güncel     |

### **Dev Dependencies**

| Paket              | Versiyon | Kullanım        | Değerlendirme           |
| ------------------ | -------- | --------------- | ----------------------- |
| `vite`             | 7.2.4    | Build Tool      | ✅ Güncel               |
| `typescript`       | 5.9.3    | Type System     | ✅ Güncel               |
| `tailwindcss`      | 4.1.18   | CSS Framework   | ✅ Güncel (v4)          |
| `eslint`           | 9.39.1   | Linting         | ✅ Güncel (Flat Config) |
| `vitest`           | 4.0.17   | Unit Testing    | ✅ Güncel               |
| `@playwright/test` | 1.57.0   | E2E Testing     | ✅ Güncel               |
| `storybook`        | 10.1.11  | Component Docs  | ✅ Güncel               |
| `msw`              | 2.12.7   | API Mocking     | ✅ Güncel               |
| `husky`            | 9.1.7    | Git Hooks       | ✅ Güncel               |
| `prettier`         | 3.8.0    | Code Formatting | ✅ Güncel               |

---

## ✅ Senior Seviyesi İçin Güçlü Yanlar

### 1. **Mimari Kalitesi**

- ✅ Feature-based architecture (scalable)
- ✅ Katmanlı yapı (separation of concerns)
- ✅ ESLint ile enforce edilen import boundaries
- ✅ Barrel exports (public API pattern)

### 2. **Type Safety**

- ✅ TypeScript strict mode aktif
- ✅ Consistent type imports (`type` keyword)
- ✅ Generic types (API responses, forms)

### 3. **Testing**

- ✅ Unit testing (Vitest + Testing Library)
- ✅ E2E testing (Playwright)
- ✅ MSW ile API mocking
- ✅ Test utilities (custom render)

### 4. **Developer Experience**

- ✅ Storybook (component docs)
- ✅ Hot Module Replacement
- ✅ Path aliases (@/ imports)
- ✅ Pre-commit hooks (lint-staged)
- ✅ Conventional commits (commitlint)

### 5. **CI/CD**

- ✅ GitHub Actions workflow
- ✅ Lint, typecheck, test, build jobs
- ✅ Deploy pipeline

### 6. **Modern Stack**

- ✅ React 19 (latest)
- ✅ Vite 7 (latest)
- ✅ Tailwind CSS v4 (latest)
- ✅ ESLint Flat Config

---

## ⚠️ Senior Seviyesi İçin Eksikler

### 🔴 Yüksek Öncelik

| Eksik                   | Açıklama                       | Öneri                                           | Durum         |
| ----------------------- | ------------------------------ | ----------------------------------------------- | ------------- |
| **Error Tracking**      | Production hata izleme yok     | Sentry entegrasyonu                             | ✅ Tamamlandı |
| **Analytics**           | Kullanıcı davranış analizi yok | PostHog/Mixpanel                                | ✅ Tamamlandı |
| **Feature Flags**       | A/B testing altyapısı yok      | LaunchDarkly/Unleash                            | ✅ Tamamlandı |
| **API Type Generation** | Manual type tanımları          | OpenAPI → TypeScript (orval/openapi-typescript) | ✅ Tamamlandı |
| **Logging**             | Structured logging yok         | pino/winston                                    | ✅ Tamamlandı |

### 🟡 Orta Öncelik

| Eksik                | Açıklama                    | Öneri                                 | Durum         |
| -------------------- | --------------------------- | ------------------------------------- | ------------- |
| **Bundle Analysis**  | Build size takibi yok       | rollup-plugin-visualizer              | ✅ Tamamlandı |
| **Security Headers** | CSP, HSTS yok               | vite-plugin-csp                       | ✅ Tamamlandı |
| **Rate Limiting**    | API abuse protection yok    | Backend gerekli                       | ⏳ Beklemede  |
| **Retry Logic**      | API retry mekanizması eksik | axios-retry veya TanStack Query retry | ✅ Tamamlandı |
| **Offline Support**  | PWA/Service Worker yok      | vite-plugin-pwa                       | ✅ Tamamlandı |

### 🟢 Düşük Öncelik

| Eksik                  | Açıklama                  | Öneri                  | Durum         |
| ---------------------- | ------------------------- | ---------------------- | ------------- |
| **Plop/Hygen**         | Scaffolding CLI yok       | Feature generator ekle | ✅ Tamamlandı |
| **Changelog**          | Otomatik changelog yok    | changesets             | ✅ Tamamlandı |
| **API Documentation**  | Swagger/OpenAPI yok       | Backend gerekli        | ⏳ Beklemede  |
| **Performance Budget** | Bundle size limitleri yok | bundlesize CI check    | ⏳ Beklemede  |

---

## ❌ Gereksiz/Fazla Olanlar

| Dosya/Paket                     | Durum         | Öneri                                  |
| ------------------------------- | ------------- | -------------------------------------- |
| `src/shared/validation/`        | Boş klasör    | Sil veya Zod schemas taşı              |
| `src/core/ui/primitives/`       | Boş klasör    | Sil veya headless components ekle      |
| `@storybook/react`              | Duplicate     | Sadece `@storybook/react-vite` yeterli |
| `_registry.ts`                  | Kullanılmıyor | Route registration'a taşı veya sil     |
| `src/features/auth/components/` | Boş klasör    | LoginForm, RegisterForm ekle veya sil  |
| `src/features/auth/hooks/`      | Boş klasör    | Custom hooks ekle veya sil             |

---

## 🎯 Önerilen İyileştirmeler

### 1. Error Boundary Geliştir

```typescript
// src/app/providers/ErrorBoundary.tsx
import * as Sentry from '@sentry/react'

export const ErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: <ErrorFallback />,
    beforeCapture: (scope) => {
      scope.setTag('location', 'error-boundary')
    },
  }
)
```

### 2. API Layer Güçlendir

```typescript
// src/core/api/client.ts
import { setupCache } from 'axios-cache-interceptor'

const client = setupCache(axios.create({...}), {
  ttl: 5 * 60 * 1000, // 5 minutes
})

// Retry logic
client.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  if (!config || config.__retryCount >= 3) throw error
  config.__retryCount = (config.__retryCount || 0) + 1
  await delay(1000 * config.__retryCount)
  return client(config)
})
```

### 3. Feature Generator Ekle (Plop)

```javascript
// plopfile.js
module.exports = function (plop) {
  plop.setGenerator('feature', {
    description: 'Create a new feature',
    prompts: [{ type: 'input', name: 'name', message: 'Feature name?' }],
    actions: [
      {
        type: 'addMany',
        destination: 'src/features/{{name}}',
        templateFiles: 'plop-templates/feature/**/*',
      },
    ],
  })
}
```

### 4. Type-Safe Env Variables

```typescript
// src/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  VITE_SENTRY_DSN: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
```

---

## 📈 Sonuç ve Puan

| Kategori                 | Puan  | Açıklama                                  |
| ------------------------ | ----- | ----------------------------------------- |
| **Mimari**               | 9/10  | Feature-based, well-structured            |
| **Type Safety**          | 9/10  | Strict mode, OpenAPI types, type-safe env |
| **Testing**              | 9/10  | Vitest + Playwright + MSW                 |
| **DX**                   | 10/10 | Plop, Storybook, DevTools, hot reload     |
| **Production Readiness** | 9/10  | Sentry, analytics, logging, monitoring    |
| **Security**             | 8/10  | CSP headers, security headers             |
| **Scalability**          | 9/10  | Feature flags, PWA, type-safe API         |

### **Genel Değerlendirme: 9.2/10**

Bu boilerplate, **senior level** bir proje için production-ready bir başlangıç noktası. Tamamlanan özellikler:

1. ✅ Sentry entegrasyonu
2. ✅ Structured logging
3. ✅ Bundle analysis
4. ✅ Feature generator (Plop)
5. ✅ PWA/Offline support
6. ✅ Security headers (CSP)
7. ✅ API retry logic
8. ✅ E2E testing (Playwright)
9. ✅ CI/CD (GitHub Actions)
10. ✅ Performance monitoring (Web Vitals)
11. ✅ Changelog (changesets)
12. ✅ Analytics (PostHog)
13. ✅ Feature flags
14. ✅ API type generation (OpenAPI)

Bekleyen özellikler:

- ⏳ Rate limiting (Backend gerekli)
- ⏳ Performance budget (bundlesize CI)

---

## 📚 Referanslar

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [TanStack Query Best Practices](https://tanstack.com/query/latest)
- [Vite Guide](https://vitejs.dev/guide/)
