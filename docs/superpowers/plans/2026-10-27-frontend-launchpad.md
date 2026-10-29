# Frontend Launchpad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bu repodan oluşturulan yeni projeye, backend gerektirmeden çalışan ve kolay özelleştirilen eksiksiz bir React frontend başlangıcı sağlamak.

**Architecture:** Mevcut React/Vite uygulaması korunur; `app` birleştirme ve route katmanı, `core` tekrar kullanılabilir frontend sistemleri, `features` ürün özellikleridir. Shadcn/Radix primitive'leri, form ve çeviri altyapısı tek sözleşmeyle birleşir. Örnekler ve ağır parçalar ayrı lazy route'larda, katalog Storybook'ta tutulur.

**Tech Stack:** React 19, TypeScript 5, Vite, Tailwind 4, shadcn/Radix, React Hook Form, Zod 4, i18next/react-i18next, TanStack Query/Table, Axios, Zustand, next-themes, Vitest/Testing Library, Playwright, Storybook, MSW, Plop. Mevcut uyumlu major sürümler korunur; yeni modüllerin sürümleri eklenmeden önce doğrulanır.

**Spec:** [Ürün ve mimari tasarımı](../specs/2026-10-27-frontend-launchpad-design.md)

Tarih: 27 Ekim 2026. Durum: uygulamaya hazır öneri planı; hiçbir uygulama görevi henüz yapılmış sayılmaz. Kullanıcı bu turda plan istemiştir. Kaynak kod, bağımlılıklar, workflow ve deployment bu belge hazırlanırken değiştirilmez.

## Global Constraints

- Ana dağıtım şekli bu repodan yeni proje başlatmaktır.
- Kapsam yalnız frontend'dir; çalışan backend, veritabanı veya auth servisi teslim edilmez.
- Shadcn tabanlı bileşenlerin kaynak kodu projede bulunur ve değiştirilebilir.
- Form kurma, doğrulama, çeviri kullanma ve yeni dil ekleme kolaylığı temel ürün özellikleridir.
- `core` hiçbir `feature` veya `app` dosyasını import etmez. Feature'lar birbirinin iç dosyalarını import etmez. `app` bağımlılıkları birleştirir.
- Formlar ve layout'lar kapalı bir JSON renderer'a veya görsel sürükle-bırak editörüne mecbur bırakılmaz.
- Plan varsayımı: Node 24 LTS geliştirme/CI/Docker tabanı; pnpm 10 ailesinden doğrulanmış tam sürüm `packageManager` alanında sabitlenir. Patch sürümleri uygulamanın ilk görevinde seçilip kilitlenir.
- Canonical dil `en`; `en` ve `tr` başlangıçta tamdır. Yeni dil klasörleri ve namespace dosyaları keşfedilir; merkezî import listesi elle büyütülmez.
- Sentry/PostHog adaptörleri ve PWA isteğe bağlıdır. Varsayılan başlangıçta dışarı veri göndermez, service worker kaydetmez ve özel API verisini cache'lemez.
- Varsayılan route'un toplam initial JS hedefi en fazla 200 KiB gzip; heavy örnekler lazy; bütçe aşımı ölçülür ve açıklanmadan geçilmez.
- WCAG 2.2 AA hedeflenir; otomatik kontroller erişilebilirlik sertifikası sayılmaz.
- Kaynak incelemesi, test/build çıktısı ve gerçek tarayıcı/deploy doğrulaması ayrı kanıt türleridir. Birinin geçmesi diğerini geçmiş saydırmaz.
- Kullanıcıya ait değişiklikleri koru. Aşağıdaki commit adımları gelecekteki uygulama içindir; plan hazırlama sırasında commit/push yapılmaz.

## Review Focus

1. Formda dil değişmesi, async seçeneklerin geç gelmesi veya kaydın yenilenmesi kullanıcının yazdıklarını kaybettirmemeli — Görev 10–11.
2. Üçüncü dil ve yeni namespace, plural/interpolation farkları ve eksik çeviriyle de deterministik çalışmalı; yanlışlıkla tam çevrilmiş sayılmamalı — Görev 8–9.
3. Mobil sidebar, iç içe modal ve kirli form geçişinde klavye odağı doğru yerde kalmalı; RTL/uzun metinler taşmamalı — Görev 6, 11 ve 21.
4. Bozuk URL/storage, iptal edilen istek ve POST tekrarında yanlış veri/tekrarlı işlem üretilmemeli — Görev 4 ve 12–14.
5. Setup/üreticiler ikinci çalıştırmada veya çakışmada kullanıcı dosyalarını bozmamalı; örnekleri kaldırılmış temiz template hâlâ build almalı — Görev 19–20 ve 24.

## Çalışma biçimi ve aşama kapıları

Bu plan alt sistemlere göre gruplandırılmıştır; sıralama ortak arayüz bağımlılıklarını korur. Her görev bağımsız incelenebilir bir teslimdir. Sonraki aşamaya ancak mevcut aşamanın kabulüyle geçilir. İleride görev grupları ayrı çalışma planlarına bölünürse aşağıdaki arayüz adları ve kalite eşikleri korunur.

Davranış değişikliklerinde önce hedef davranışı yakalayan başarısız test, sonra en küçük uygulama, ardından ilgili test ve tip kontrolü kullanılır. Basit stil/doküman değişiklikleri için davranışı taklit eden test eklenmez; story, görsel inceleme ve uygun build yeterlidir. Kullanıcının kod yazmama talebi nedeniyle bu belgede uygulama veya test gövdeleri bulunmaz; dosyalar, arayüzler, test adları ve beklenen sonuçlar tanımlanır.

| Aşama                        | Görevler | Çıkış kapısı                                                               |
| ---------------------------- | -------- | -------------------------------------------------------------------------- |
| A. Güvenilir temel           | 1–3      | Temiz kurulum ve backend'siz açılış; gerçek typecheck; net modül sınırları |
| B. Tasarım ve sayfa sistemi  | 4–7      | Tek tema; tutarlı shadcn API'si; responsive shell ve public bloklar        |
| C. Çeviri ve formlar         | 8–11     | Yeni dil/namespace; çevrilen doğrulama; basit ve gelişmiş formlar          |
| D. Veri ve gelişmiş parçalar | 12–16    | Tek veri sözleşmesi; URL/tablo; dosya ve lazy ileri UI                     |
| E. Template deneyimi         | 17–20    | Örnek uygulama, katalog, üreticiler ve güvenli setup birlikte çalışır      |
| F. Tam sürüm kabulü          | 21–24    | Tarayıcı/görsel/a11y/bundle ve iki temiz tüketici projesi kabulü           |

## Hedef dosya haritası

| Konum                                        | Sorumluluk                                                          |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `src/config/project.ts`                      | İsim, marka, başlangıç route'u ve örnek tercihleri                  |
| `src/core/theme/`, `src/styles/`             | Tek tema provider'ı ve semantik token'lar                           |
| `src/core/ui/components/`                    | Shadcn primitive'leri; ürün/route bağımlılığı içermez               |
| `src/core/layouts/`, `src/core/blocks/`      | Slot'larla birleşen shell ve tekrar kullanılabilir sayfa blokları   |
| `src/core/forms/`                            | RHF/Zod alanları, hata eşleme ve gelişmiş form yardımcıları         |
| `src/i18n/`, `scripts/i18n/`                 | Locale keşfi, lazy kaynaklar, tipler ve çeviri kontrolleri          |
| `src/core/api/`, `src/core/routing/`         | HTTP/hata/iptal, URL durumu ve route katkı sözleşmeleri             |
| `src/core/ui/data-table/`, `src/core/files/` | Tablo ve dosya davranışı; belirli backend'e bağlı değil             |
| `src/core/charts/`, `src/core/editor/`       | Ayrı import noktaları olan ileri UI                                 |
| `src/features/examples/`, `src/examples/`    | Demo ekranlar, deterministik fixture'lar ve backend'siz adapter'lar |
| `scripts/project/`, `scripts/generators/`    | Setup, doctor ve güvenli dosya üretimi                              |
| `src/test/`, `e2e/`, `scripts/tests/`        | Ortak test ortamı; kullanıcı akışları ve araç testleri              |
| `.storybook/`, `docs/guides/`                | Çalışır katalog ve kısa tüketici rehberleri                         |

## A. Güvenilir temel

### Görev 1 — Tekrarlanabilir araç zinciri ve gerçek baseline

**Files:** Modify `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vitest.config.ts`, `.github/workflows/ci.yml`, `Dockerfile`, `docker-compose.yml`; Create `.node-version`, `scripts/check-typecheck.mjs`, `scripts/tests/typecheck.test.mjs`, `docs/quality/baseline.md`.

**Interfaces:** Ortak komutlar `typecheck`, `lint`, `format:check`, `test:unit`, `test:tooling`, `test:e2e`, `build`, `build-storybook`, `check`; `check` yerelde sırayla statik ve unit/tooling kapılarını çalıştırır; browser/build kapıları CI'da ayrıca görünür olur.

- [ ] Mevcut çalışma ağacını kaydet; Node 24 ve uyumlu tam pnpm 10 sürümünü doğrula. Mevcut major bağımlılıkları otomatik yükseltmeden frozen install dene; önce mevcut hataları baseline'a yaz.
- [ ] `typecheck.test.mjs`: geçici app ve araç fixture'ındaki belirgin tür hatalarının `typecheck` komutunu başarısız yaptığını, düzeltildikten sonra geçtiğini doğrula. Fixture'lar gerçek `src` dosyalarını değiştirmesin.
- [ ] Root references/noEmit yapısına uygun komutu seç; app, Vite/Vitest/Playwright/Storybook config ve gerekli script tiplerini kapsa. Dev ve test koşulları için ayrı uygun tsconfig kullan; ilgisiz test globals'ını tüm app'e yayma.
- [ ] Node/pnpm sürümünü package metadata, CI ve Docker'da tutarlı yap; `pnpm@latest` kullanımını kaldır. Mevcut CI akışını koruyarak baseline hatalarını sınıflandır; kaynak düzeltmesi gereken hataları ait oldukları göreve bağla.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, `pnpm test:tooling`, `pnpm build`, `pnpm build-storybook` çıktısını kaydet. İlk geçişte başarısız olan kapıları açık bırak; hiçbirini yalnız script varlığıyla yeşil sayma. Commit: `chore: establish reproducible frontend checks`.

**Kabul:** Araç sürümleri sabit; typecheck'in gerçek hata yakaladığı kanıtlı; başlangıç başarısızlık listesi ve sahip görevleri belli.

### Görev 2 — Backend gerektirmeyen başlangıç ve proje ayarları

**Files:** Create `src/config/project.ts`, `src/app/pages/WelcomePage.tsx`, `src/app/pages/NotFoundPage.tsx`, `src/app/pages/RouteErrorPage.tsx`, `src/app/pages/WelcomePage.test.tsx`, `e2e/template-start.spec.ts`; Modify `src/config/env.ts`, `.env.example`, `src/main.tsx`, `src/app/App.tsx`, `src/app/providers/index.tsx`, `src/app/router/routes.tsx`, `vite.config.ts`.

**Interfaces:** `ProjectConfig` marka/ad, varsayılan dil, `homePath`, `examplesEnabled` ve opsiyonel public API URL'sini taşır. `projectConfig` tüketici için tek düzenleme noktasıdır; runtime env ile gizli bilgi taşınmaz.

- [ ] Test: `.env` ve API adresi olmadan başlangıç sayfası açılsın; bilinmeyen route 404, render hatası geri dönüşlü hata ekranı göstersin; zorunlu `/login` yönlendirmesi olmasın.
- [ ] Varsayılan ana route'u Welcome yap; örnek protected route'ları geçici olarak koruyup sonradan ayrı demo dalına taşınacak biçimde ayır. Boş API URL'sini başlangıç hatasına dönüştürme.
- [ ] Tema/i18n/router/query provider sırasını tek yerde kur; tooltip/toast gibi gerekli provider'ları burada tamamla. Varsayılan açılışta Sentry/PostHog init ve PWA kaydı yapma.
- [ ] Playwright'ta backend, uzak font, analytics ve CDN isteği olmadığını origin bazında kontrol et; browser console ve pageerror yakala. Sonraki görevler bu testi korusun.
- [ ] İlgili unit/E2E ve app build'i çalıştır; commit: `feat: make the starter work without a backend`.

**Kabul:** Template, hesap/API anahtarı/env kopyası gerektirmeden kullanılabilir bir ilk ekran açar.

### Görev 3 — Modül sınırları ve genişletilebilir route kaydı

**Files:** Create `src/core/routing/types.ts`, `src/app/router/feature-routes.ts`, `src/app/router/feature-routes.test.ts`, `scripts/check-boundaries.mjs`, `scripts/tests/boundaries.test.mjs`; Modify `package.json`, `eslint.config.js`, `src/app/router/index.tsx`, `src/app/router/routes.tsx`, `src/features/_registry.ts`, `docs/ARCHITECTURE.md`.

**Interfaces:** `FeatureDefinition` sabit `id`, route katkıları ve opsiyonel menü katkısı taşır. Feature dosyaları `src/features/<name>/routes.tsx` içinde bu sözleşmeyi export eder. App loader bunları lazy olarak keşfeder; core feature'ları keşfetmez.

- [ ] Fixture testleri: core→feature, core→app, feature→başka feature içi ve bunların relative import karşılıkları reddedilsin; public API üzerinden izin verilen paylaşım geçsin.
- [ ] Route loader testleri: aynı id/path çakışması anlaşılır hata versin, örneksiz kurulum geçsin, feature import'u uygulama açılışında tüm sayfaları eager yüklemesin.
- [ ] Alias/relative import denetimini `check:boundaries` komutuyla kur; `check` zincirine ekle. Route sözleşmesini core'da, kayıt birleştirmesini app'te tut. Registry yalnız doküman kopyası olmaktan çıksın veya kaldırılıp tek kaynak kullanılsın.
- [ ] `pnpm check:boundaries`, ilgili testler ve build'i çalıştır; mevcut cross-feature call site'larını public API'ye taşı. Commit: `refactor: define frontend module and route contracts`.

**Kabul:** Yeni feature merkez route dosyasına tekrar eden manuel eklemeler gerektirmeden kaydolabilir; mimari sınırlar gerçek import çözümlemesiyle korunur.

## B. Tasarım ve sayfa sistemi

### Görev 4 — Tek tema, marka ve tasarım token'ları

**Files:** Create `src/styles/tokens.css`, `src/styles/typography.css`, `src/core/theme/ThemeProvider.tsx`, `src/core/theme/useTheme.ts`, `src/core/theme/ThemeProvider.test.tsx`, `src/core/theme/Theme.stories.tsx`; Modify `src/styles/globals.css`, `src/core/store/slices/uiSlice.ts`, `src/core/store/hooks/useThemeSync.ts`, `src/core/ui/components/theme-switcher.tsx`, `src/app/providers/index.tsx`, `index.html`.

**Interfaces:** `ThemeProvider`, `useTheme` ve `ThemeMode` (`light`, `dark`, `system`) tek sahip olur. Mevcut next-themes temelini kullan; UI store ayrı bir tema state'i tutmasın. Token sözleşmesi spec §6'daki adları kapsar.

- [ ] Test: sistem teması, seçimin hatırlanması, geçersiz storage ve storage erişiminin reddedilmesi başlangıcı bozmasın. İlk render/refresh'te tema yanıp sönmesi E2E ile kontrol edilsin.
- [ ] İki CSS değişken sistemini tek semantik haritaya indir; marka renkleri, focus ring, disabled/hover ve success/warning/error kontrastını light/dark'ta tanımla.
- [ ] font/radius/spacing/density/motion token'larını ekle; yerel font ve sistem font fallback'i sağla. `prefers-reduced-motion` ve uzun metin davranışını belirle.
- [ ] Eski hook ve store alanlarını call site'lar taşındıktan sonra kaldır; kullanılmayan provider/dependency kalmasın.
- [ ] Theme story'leri, ilgili testler ve ilk görsel karşılaştırmaları çalıştır; commit: `refactor: unify theme and design tokens`.

**Kabul:** Tek bir marka/tema değişikliği tüm temel bileşenlere yansır; iki ayrı tema state'i veya rekabet eden CSS kaynağı yoktur.

### Görev 5 — Shadcn primitive'lerini standartlaştırma ve tamamlama

**Files:** Modify `components.json`, `src/core/ui/components/index.ts`, mevcut `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `dialog.tsx`, `sheet.tsx`, `sonner.tsx`; Create `src/core/ui/components/accordion.tsx`, `alert-dialog.tsx`, `button-group.tsx`, `calendar.tsx`, `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `drawer.tsx`, `hover-card.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `progress.tsx`, `resizable.tsx`, `scroll-area.tsx`, `slider.tsx`, `toggle.tsx`, `toggle-group.tsx`, `spinner.tsx`, `empty.tsx`, `field.tsx`, `src/core/ui/components/stories/Primitives.stories.tsx`, `src/core/ui/components/primitives.test.tsx`.

**Interfaces:** Primitive'ler shadcn composable API'sini korur; ürün state'i veya form şeması taşımaz. `Button` loading davranışı ve icon-only erişilebilir adı ortak kurala bağlanır. Form özellikleri Görev 10'daki alan wrapper'larına aittir.

- [ ] Bileşen envanterinde spec §6'daki her parçayı existing/new/composite olarak işaretle; mevcut Radix tabanıyla uyumlu shadcn dosyalarını seç, Base UI'ye sessiz migration yapma.
- [ ] Test: modal Escape/outside dismissal/focus return, dialog başlık açıklaması, disabled/loading button ve icon-only label davranışları çalışsın. Basit renk/spacing için ek unit test yazma; story kullan.
- [ ] Eksik primitive'leri tamamla; eski özel prop'ları tüketici call site'larıyla birlikte taşı. `Modal` alias'ı, özel `Modal/` ve iki toast sisteminin hangi API'ye taşınacağını migration listesinde belirt.
- [ ] Her primitive için ilgili varyantları ve disabled/focus/error/loading durumlarını story'le; toplu dosya gösteriminin yanında gerektiğinde özel story aç.
- [ ] İlgili interaction testleri, typecheck ve Storybook build'i çalıştır; commit: `feat: standardize editable shadcn primitives`.

**Kabul:** Temel parçalarda tek belgelenmiş API vardır; farklı form/select/modal sistemleri aynı adla rekabet etmez.

### Görev 6 — Ortak AppShell, sidebar ve header

**Files:** Create `src/core/layouts/types.ts`, `AppShell.tsx`, `AppSidebar.tsx`, `AppHeader.tsx`, `ShellProvider.tsx`, `AppShell.stories.tsx`, `AppShell.test.tsx` aynı klasörde; Create `src/app/navigation.ts`; Modify `src/app/layouts/DashboardLayout.tsx`, `AdminLayout.tsx`, `AuthLayout.tsx`, `src/core/store/slices/uiSlice.ts`; Create `e2e/shell.spec.ts`.

**Interfaces:** `NavigationItem` id/label/href/icon/children/disabled alanları taşır; izin filtreleme app'te yapılır. `AppShell` nav, logo, headerActions, userMenu, footer ve children slot'larını alır; core auth/session import etmez. `ShellProvider` desktop collapsed ve mobile open state'lerini ayırır.

- [ ] Test: aktif alt route, nested menü, desktop collapse, mobil kapalı başlangıç, route değişiminde mobil kapanma ve breakpoint geçişi.
- [ ] Sidebar/header'ı ortak bileşenlere taşı; admin ile dashboard farkları veri/slot üzerinden verilsin. Menü ve layout içinde ürün adı/marka rengi sabitlenmesin.
- [ ] Klavye ile mobil aç/kapa, Escape, focus trap/return, skip link ve main landmark'ı tamamla. Header yüksekliği, fixed/sticky davranış ve içerik minimum genişliği token'larla çalışsın.
- [ ] 360/768/1440 px, dark/light ve uzun menü başlıklarıyla E2E/story kontrolü yap; ilgili testler/build geçsin. Commit: `feat: add configurable responsive application shell`.

**Kabul:** Tek shell üzerinden farklı ürün görünümleri oluşturulur; sidebar kapatma ve odak davranışı mobilde kullanılabilirdir.

### Görev 7 — Sayfa blokları ve public site düzeni

**Files:** Create `src/core/layouts/SiteShell.tsx`, `src/core/blocks/PageHeader.tsx`, `PageSection.tsx`, `PageToolbar.tsx`, `FilterBar.tsx`, `StatCard.tsx`, `HeroSection.tsx`, `FeatureGrid.tsx`, `PricingSection.tsx`, `FaqSection.tsx`, `CallToAction.tsx`, `SiteFooter.tsx`, `Blocks.stories.tsx`, `src/core/routing/PageMeta.tsx`; Test `src/core/blocks/PageHeader.test.tsx`, `src/core/routing/PageMeta.test.tsx`.

**Interfaces:** Bloklar içerik/aksiyonları prop veya children ile alır; route ve ticari servis bilgisi içermez. `PageMeta` title/description/canonical alanlarını client DOM'a uygular; SSR veya sitemap üretimi vaadi taşımaz.

- [ ] Kullanım örneklerini tanımla: liste sayfası, detay sayfası, ayarlar ve public landing. Aynı PageHeader aksiyon yerleşimi mobilde taşmadan çalışsın.
- [ ] Blokları semantik HTML ve composable slot'larla oluştur; pricing yalnız sunum bileşeni olsun, ödeme entegrasyonu yapmasın.
- [ ] PageMeta route değişiminde güncellensin ve kaldırıldığında eski değer sızdırmasın. Heading hiyerarşisi, dış link özellikleri ve uzun CTA metni test/stories ile doğrulansın.
- [ ] Storybook ve app build'i çalıştır; commit: `feat: add reusable page and public site blocks`.

**Kabul:** Dashboard ve genel site ekranları aynı tasarım sisteminden kurulabilir; metin ve aksiyonlar tamamen tüketici tarafından değiştirilebilir.

## C. Çeviri ve formlar

### Görev 8 — Locale keşfi, lazy namespace ve tip güvenliği

**Files:** Create `src/i18n/types.runtime.ts`, `registry.ts`, `loadNamespace.ts`, `format.ts`, `registry.test.ts`, `format.test.ts`, `locales/en/_meta.json`, `locales/tr/_meta.json`, `locales/en/validation.json`, `locales/tr/validation.json`; Modify `src/i18n/index.ts`, `types.ts`, `src/app/providers/I18nProvider.tsx`, `src/features/settings/pages/SettingsPage.tsx`; Create `src/i18n/I18n.stories.tsx`.

**Interfaces:** `LocaleMetadata` code/name/direction/status (`draft` veya `enabled`) taşır. `getLocales` keşfedilen metadata'yı döndürür. `loadNamespace(locale, namespace)` aynı istekleri birleştirir ve Promise döndürür. `formatNumber`, `formatCurrency`, `formatDateOnly`, `formatDateTime`, `formatRelativeTime` aktif locale ve açık timezone sözleşmesiyle çalışır.

- [ ] Fixture testleri: üçüncü locale ve namespace merkezi dosya değiştirmeden keşfedilsin; metadata hatası açık mesaj versin; aynı namespace iki kez fetch edilmesin; desteklenmeyen dil fallback'e dönsün.
- [ ] Vite glob ile locale/namespace keşfini ve lazy yüklemeyi kur. Canonical en kaynaklarından TypeScript anahtar tiplerini üret veya türet; mevcut call site'ları aynı görevde uyumlu tut.
- [ ] Dil seçimi için URL tercihi (varsa), kayıtlı seçim, browser tercihi ve proje varsayılanı sırasını açıklaştır. Storage bozuk veya kapalıysa uygulama açılsın; `html.lang/dir` güncellensin.
- [ ] Tarih-only değerlerin timezone ile önceki/sonraki güne kaymamasını, para ve yüzde biçimlerini, Türkçe harfler ve RTL story'lerini doğrula.
- [ ] Unit/typetest ve namespace network kontrolünü çalıştır; commit: `feat: add scalable typed localization runtime`.

**Kabul:** Yeni dosyalar keşfedilir; tüm diller app başlangıcında yüklenmez; locale değişimi bütün sistemlerin kullanabileceği tek runtime'dan geçer.

### Görev 9 — Dil/namespace üreticileri ve çeviri kalite kapısı

**Files:** Create `scripts/i18n/model.mjs`, `check.mjs`, `generate-locale.mjs`, `generate-namespace.mjs`, `enable-locale.mjs`, `scripts/tests/i18n-tools.test.mjs`, `scripts/tests/fixtures/i18n/`; Modify `package.json`, `.github/workflows/ci.yml`; Create `docs/guides/localization.md`.

**Interfaces:** `generate:locale <code> --name <name> --direction ltr|rtl [--dry-run]`, `generate:namespace <name> [--dry-run]`, `i18n:enable <code> --reviewed`, `i18n:check [--include-drafts]`. Yeni locale varsayılan draft'tır; enabled olmadan eksik tercüme üretimde desteklenmiş sayılmaz.

- [ ] Test: canonical anahtar iskeleti tüm namespace'lerde üretilsin; etkin/draft diller namespace üretiminde unutulmasın; mevcut dosyaya overwrite reddedilsin; geçersiz code/namespace/path traversal reddedilsin.
- [ ] `i18n:check` bozuk JSON, missing/extra key, value type, interpolation ve locale'e özgü plural kurallarını raporlasın. Arapça plural fixture'ı ve yanlış değişken isimli fixture başarısız olsun; meşru plural farkı geçsin.
- [ ] Draft iskeleti canonical referans metin ve tamamlama raporuyla üret; gerçek çeviri yapma. Enabled çeviri eksikleri default check'i başarısız yapsın; draft raporu açıkça ayrı gösterilsin. `i18n:enable` içerik denetimi ve açık reviewed kararı olmadan etkinleştirmesin.
- [ ] Tüm scriptler çalışma kökünü repo üzerinden çözsün; shell interpolasyonu kullanmasın; `--dry-run` dosya değiştirmesin. Yeni namespace tiplerini gerekliyse otomatik yenilesin.
- [ ] `pnpm test:tooling`, `pnpm i18n:check`, typecheck ve temiz fixture kabulünü çalıştır; commit: `feat: automate locale growth and translation checks`.

**Kabul:** Üçüncü dil/namespace ekleme bir komut ve tercüme işi olur; manuel merkezî import düzenlemesi gerektirmez.

### Görev 10 — Kolay ve tip güvenli temel form sistemi

**Files:** Create `src/core/forms/types.ts`, `useAppForm.ts`, `Form.tsx`, `FieldShell.tsx`, `validation.ts`, `mapFieldErrors.ts`, `fields/TextField.tsx`, `PasswordField.tsx`, `NumberField.tsx`, `TextareaField.tsx`, `SelectField.tsx`, `CheckboxField.tsx`, `RadioField.tsx`, `SwitchField.tsx`, `Form.stories.tsx`, `Form.test.tsx`; Modify `src/features/auth/api/validation.ts`, login/register sayfaları ve ilgili tipleri; eski `src/core/ui/components/Form/` call site'larını migrate et.

**Interfaces:** `useAppForm` RHF'nin schema input/output tiplerini koruyan wrapper'dır ve RHF methods'ı döndürür; varsayılan doğrulama ilk submit'te, hatalı alanın tekrar kontrolü değişimde yapılır, tüketici bu modları değiştirebilir. `FieldShell` name/label/hint/required/error bağlantısını yönetir. `ValidationMessage` key/params taşır. `mapFieldErrors` adapter'ın normalize ettiği bilinen field path hatalarını RHF'ye, bilinmeyenleri form geneline iletir.

- [ ] Test: required/email/min/max, whitespace/empty value, sayı dönüşümünde boş ile sıfır farkı, nested field path ve transform output tipleri. Hatalı alan adını typetest reddetsin.
- [ ] Primitive ile RHF Controller/register bağlantısını standartlaştır; label/error/hint için id, `aria-describedby`, `aria-invalid` ve ilk hataya focus davranışını tamamla. Consumer normal JSX/RHF API'sini kullanabilsin.
- [ ] Hata mesajını render anında aktif dile çevir. Kullanıcı dolu ve dirty formda en→tr geçince mesaj değişsin; değer, touched/dirty ve input focus kaybolmasın.
- [ ] Loading/disabled/reset/submit-success ve sunucu benzeri field/form hatalarını test et. Login/register örneklerini taşı; schema/type/çeviri tekrarı ve sabit İngilizce validasyonları kaldır.
- [ ] İlgili test/typecheck/story interaction çalıştır; tüm eski form call site'ları taşınınca duplicate wrapper'ları kaldır. Commit: `feat: provide accessible localized form building blocks`.

**Kabul:** Basit bir form şema ve alan tanımlarıyla kurulur; validation, tip, çeviri ve erişilebilir hata bağlantıları yeniden elle yazılmaz.

### Görev 11 — Koşullu, dinamik ve çok adımlı formlar

**Files:** Create `src/core/forms/fields/ComboboxField.tsx`, `MultiSelectField.tsx`, `DateField.tsx`, `DateRangeField.tsx`, `FieldArray.tsx`, `FormStepper.tsx`, `useUnsavedChanges.ts`, `useFormDraft.ts`, `AdvancedForm.stories.tsx`, `AdvancedForm.test.tsx`, `e2e/forms.spec.ts`.

**Interfaces:** `FormStepper` step id/alan grubu ve step geçiş callback'lerini alır; yalnız geçilecek aşamanın doğrulamasını yapar. `useFormDraft` açık storage key, version ve allowedFields alır; opt-in'dir. `useUnsavedChanges` dirty/submitting durumunu router adapter'ına bağlar. Async seçenek API'si abort sinyali taşır.

- [ ] Test: field array ekle/sil/sırala; nested hata doğru satırda kalsın; unmount edilen conditional alan için preserve/clear tercihi açık olsun.
- [ ] Wizard ileri/geri, step doğrulama, son submit ve edit kaydının async gelmesini kur. Refetch dirty alanları ezmesin; kayıt değiştirirken açık reset politikası uygulansın.
- [ ] Async combobox'ta debounce, loading/no-results/error ve stale response iptali; tarih alanında date-only/timestamp ayrımı; multiselect klavye ve silme davranışlarını tamamla.
- [ ] Kirli form link/back/tab-close uyarısı; başarılı submit sonrası gereksiz uyarı olmaması; draft versiyon farkı/bozuk JSON/storage quota; password ve file'ın saklanmaması test edilsin.
- [ ] Dolu wizard'da dil/tema değişimi, mobil görünüm ve modal içi kullanım E2E'sini çalıştır; commit: `feat: support advanced reusable form workflows`.

**Kabul:** Geliştirici array, wizard ve edit akışını başlangıçtan icat etmez; karmaşık formlar basit form API'sinden kopmaz.

## D. Veri ve gelişmiş parçalar

### Görev 12 — Tek frontend veri ve hata sözleşmesi

**Files:** Modify `src/core/api/client.ts`, `types.ts`, `src/app/providers/QueryProvider.tsx`, `src/core/auth/types.ts`, `context.tsx`, `hooks.ts`, `src/api-types/client.ts`, `scripts/generate-api-types.js`; Create `src/core/api/errors.ts`, `queryKeys.ts`, `client.test.ts`, `src/core/auth/adapter.ts`, `adapter.test.ts`.

**Interfaces:** `ApiError` kind/status/message/fieldErrors/requestId alanlarını taşır. `createApiClient` baseURL, header/token sağlayıcı ve retry politikasını dependency olarak alır. `AuthAdapter` session okuma/değişim aboneliği/signOut sözleşmesidir; gerçek auth implementasyonu şart değildir. `PageResult<T>` items/total/page/pageSize taşır.

- [ ] Test: adapter verilmemesi anlaşılır configuration state üretir; abort sessizce request cancellation olur; 401/403/422/429/500 ve network hata türleri doğru normalize edilir.
- [ ] Retry yalnız GET/HEAD gibi güvenli read'lerde ve sınırlandırılmış backoff ile varsayılan olsun. POST/PATCH/DELETE otomatik yinelenmesin; explicit idempotency opt-in testi ekle. Secret/header değerleri logger'a yazılmasın.
- [ ] Hardcoded `window.location.href='/login'` ve localStorage token bağımlılığını adapter callback'lerine taşı. Demo rolü gerçek yetkilendirme kanıtı sayılmasın; core ürün route'unu bilmesin.
- [ ] OpenAPI araçlarını aynı transport sözleşmesine bağla; ikinci ayrı auth/retry istemcisini migrate et. Generator shell string/npx indirmesi yerine lockfile'daki yerel binary'yi argüman dizisiyle çalıştırsın; boşluk ve özel karakterli local spec yolu test edilsin.
- [ ] Feature query/mutation'ları taşı; ilgili unit ve MSW integration testlerini çalıştır; commit: `refactor: unify frontend data and adapter contracts`.

**Kabul:** Farklı backend'lere bağlanacak noktalar açıktır; transport davranışı iki istemci arasında ayrışmaz; backend'siz başlangıç korunur.

### Görev 13 — Tip güvenli URL durumu ve navigation yardımcıları

**Files:** Create `src/core/routing/useUrlState.ts`, `queryState.ts`, `queryState.test.ts`, `useUrlState.test.tsx`, `src/core/hooks/useDebouncedValue.ts`, `useMediaQuery.ts`, `useDisclosure.ts`, `useClipboard.ts`, `hooks.test.tsx`; Modify `src/app/router/types.ts`.

**Interfaces:** `useUrlState` schema/defaults/replace-or-push politikasını alır; typed state ve patch/reset işlemlerini döndürür. Bilinmeyen URL anahtarları tüketici tercihiyle korunur; bir widget tüm search string'i ezmez.

- [ ] Test: bozuk sayı/tarih/enum, tekrarlı parametre, empty string, encode edilmiş Türkçe metin ve limit üstü pageSize normalize edilsin; back/forward state'i geri getirsin.
- [ ] Filtre değişiminde sayfanın bire dönmesini ve aramanın debounce ile replace davranışını açık yapılandır. URL okuma/yazma effect döngüsü oluşturmasın.
- [ ] Ortak hook'larda listener/timer cleanup, unmount sonrası sonuç, clipboard izin hatası ve browser API yokluğu test edilsin.
- [ ] Unit test ve URL kullanan küçük story örneğini doğrula; commit: `feat: add reusable URL state and browser hooks`.

**Kabul:** Liste filtreleri paylaşılabilir ve geri dönüşte korunur; URL yardımcıları bozuk girdide crash etmez.

### Görev 14 — Ürün seviyesinde DataTable

**Files:** Create `src/core/ui/data-table/types.ts`, `DataTable.tsx`, `DataTableToolbar.tsx`, `DataTablePagination.tsx`, `DataTableColumnHeader.tsx`, `DataTableViewOptions.tsx`, `DataTableSelectionBar.tsx`, `DataTable.stories.tsx`, `DataTable.test.tsx`, `e2e/data-table.spec.ts`; Modify mevcut `src/core/ui/components/DataTable/` export ve tüketici `UserTable`.

**Interfaces:** `DataTableProps<TData>` discriminated `mode: client|manual` kullanır. Manual mod `rowCount`, kontrollü pagination/sorting/filter state ve onChange callback'leri alır; client mod hazır data üzerinde işler. `getRowId` ürün id'sini sağlar; array index kalıcı selection kimliği değildir.

- [ ] Test: client sıralama/filtre/sayfalama ile manual modda çift sayfalama olmaması; server total değişince geçersiz sayfadan geri dönüş.
- [ ] Seçim, kolon görünürlüğü, action menüsü, boş/hata/loading durumları ve bulk action slot'larını tamamla; sayfa değişince selection kapsamını açıkça tanımla.
- [ ] Görev 13 URL adapter'ıyla arama/sıralama/filtre bağlantısını örnekle. Debounce ve stale response davranışı veri adapter'ıyla uyumlu olsun.
- [ ] Büyük sayı, uzun hücre, mobil yatay scroll, keyboard sort/selection, `aria-sort` ve translated labels için test/story yaz; keyfi HTML cell içeriği render etme.
- [ ] UserTable tüketicisini migrate et; eski DataTable export'unu call site taşınınca kaldır veya dar compatibility export yap. Test/typecheck/E2E; commit: `feat: deliver reusable data table workflows`.

**Kabul:** Tüketici kolon ve data kaynağını vererek gerçek bir liste ekranı kurabilir; client/manual state karışmaz.

### Görev 15 — Dosya seçme, önizleme ve upload adapter'ı

**Files:** Create `src/core/files/types.ts`, `validateFiles.ts`, `useFileSelection.ts`, `useUploadQueue.ts`, `FileDropzone.tsx`, `FilePreview.tsx`, `FileUpload.stories.tsx`, `files.test.tsx`, `src/core/forms/fields/FileField.tsx`.

**Interfaces:** `UploadAdapter` file/AbortSignal/progress callback alır ve asset reference döndürür. Local fixture adapter yalnız demo içindir. Policy max file count, per-file bytes ve allowed MIME/extension alanlarını taşır.

- [ ] Test: boyut sınırı, çoklu seçim, aynı adla farklı dosyalar, unsupported type, boş dosya, iptal ve yeniden deneme; kullanıcıya uygun çevrilebilir hata gösterilsin.
- [ ] File picker/dropzone klavyeyle kullanılabilsin; ilerleme erişilebilir duyurulsun; object URL create/revoke yaşam döngüsü test edilsin.
- [ ] Gerçek servisi zorunlu kılmadan adapter arayüzünü ve demo akışını ekle. Client dosya kontrolünü backend güvenlik kontrolü gibi belgelememe; upload secret'ı frontend'de tutmama.
- [ ] Form FileField entegrasyonu, modal içinde kullanım ve RTL story kontrolünü yap; commit: `feat: add frontend file and upload building blocks`.

**Kabul:** Formda dosya seçimi ve upload UI'si hazırdır; storage veya upload backend'i bu repoda kurulmaz.

### Görev 16 — Lazy ileri UI: chart, editor, sanallaştırma ve komut paleti

**Files:** Create `src/core/charts/Chart.tsx`, `ChartEmptyState.tsx`, `Charts.stories.tsx`, `src/core/editor/RichTextEditor.tsx`, `RichTextContent.tsx`, `sanitize.ts`, `Editor.stories.tsx`, `editor.test.tsx`, `src/core/ui/virtual-list/VirtualList.tsx`, `VirtualList.stories.tsx`, `src/core/blocks/CommandPalette.tsx`, `CommandPalette.test.tsx`; Create `src/core/ui/components/carousel.tsx`, `src/core/charts/charts.test.tsx`.

**Interfaces:** Chart data/config ve locale formatter alır; erişilebilir metin/tablo alternatifi sağlar. Editor controlled value/onChange ve açık format kullanır; öneri Tiptap core JSON'dur. HTML render yalnız sanitizer sınırından geçer. CommandPalette eylem/route listesini tüketiciden alır.

- [ ] Eklenecek chart/editor/virtualization bağımlılıklarının ücretsiz lisans, React 19, tree-shaking ve sürüm uyumluluğunu doğrula; lockfile'a sabitle. Bu iş için ücretli modül/API kullanılmaz.
- [ ] Editor paste/link/HTML testleri: script/event handler/javascript URL'leri temizlensin; güvenli metin korunarak render edilsin. Undo/redo, read-only ve dil değişimi veri kaybettirmesin.
- [ ] Chart no-data/error/loading ve renk dışı bilgi iletimini; virtual list stabil item key/resize/keyboard kullanımını; palette shortcut/focus/disabled-action davranışını test et.
- [ ] Story'leri ve demo route'larını dynamic import ile bağla. Varsayılan route manifest'inde bu modüllerin eager chunk olmadığını doğrula; commit: `feat: add optional advanced frontend modules`.

**Kabul:** İleri parçalar repo içinde hazırdır; kullanılmadığında ana uygulamanın başlangıç yüküne girmez.

## E. Template deneyimi

### Görev 17 — Backend'siz bütünleşik örnek uygulama

**Files:** Create `src/features/examples/routes.tsx`, `pages/OverviewPage.tsx`, `FormsPage.tsx`, `TablesPage.tsx`, `FilesPage.tsx`, `ContentPage.tsx`, `src/examples/fixtures/users.ts`, `src/examples/adapters/demoAuth.ts`, `demoData.ts`, `src/examples/Examples.test.tsx`; Modify mevcut auth/dashboard/users/settings/notifications örneklerini yeni düzene taşı; `src/app/router/routes.tsx` ve eski export'ları güncelle.

**Interfaces:** Örnekler Görev 3 `FeatureDefinition`, Görev 12 adapter'ları ve core bileşenlerini tüketir. Demo verisi deterministik ve localdir; varsayılan starter'ın dış servis gereksinimini değiştirmez. Başlangıçtan ayrı `/examples` dalı lazy yüklenir.

- [ ] Mevcut örnekleri işlev envanteriyle taşı: kullanılmayan add-user butonu, role guard, kayıt düzenleme ve bildirim durumları yeni API'lerle gerçekten çalışsın.
- [ ] Create/edit/delete, validation, 422 benzeri field error, loading/empty/error/retry, dosya ilerlemesi ve demo rol değiştirmeyi göster. Auth ekranlarının yalnız frontend örneği olduğu açık olsun.
- [ ] Örnek auth/session memory'de olsun; actual localStorage token'dan yetki türetme. Demo seed/reset ve fake latency açık kontrol edilsin; hata senaryoları rastgele olmasın.
- [ ] Tek bir bütünleşik E2E: kullanıcı formu doldur→tr'ye geç→kaydet→tablo filtrele→URL'yi yeniden aç→düzenle→onay modalı; veriler backend olmadan tutarlı kalsın.
- [ ] Eski route/export dosyalarını tüketicileri taşındıktan sonra temizle; test/typecheck/build; commit: `feat: connect the frontend example application`.

**Kabul:** Katalogdan farklı olarak parçaların birlikte çalıştığı örnek ürün vardır; sahte buton veya zorunlu API kalmaz.

### Görev 18 — Kullanılabilir ve doğrulanabilir Storybook kataloğu

**Files:** Modify `.storybook/main.ts`, `preview.ts`; Create `.storybook/decorators.tsx`, `src/docs/Introduction.mdx`, `Theming.mdx`, `Forms.mdx`, `Localization.mdx`, `Layouts.mdx`, `Data.mdx`, `scripts/check-story-coverage.mjs`, `scripts/tests/story-coverage.test.mjs`; önceki görevlerin story dosyalarını tamamla.

**Interfaces:** Global toolbar theme/locale/direction/viewport seçeneklerini tek dekoratör zinciriyle uygular. App provider'ları kopyalanıp zamanla ayrışmaz; test/katalog için küçük factory'ler ortak kullanılır.

- [ ] Her public UI export için story veya açık gerekçeli internal işareti envanteri oluştur; check aracı bu eşlemeyi denetlesin.
- [ ] Native primitive, composite form, layout, table ve file örneklerini kategori bazlı gezinilebilir yap. Her story'de hangi props ve provider gerektiği, nasıl özelleştirileceği görülsün.
- [ ] Interaction senaryolarını gerçek davranış için ekle; gereksiz snapshot/unit tekrarları yaratma. Storybook devtools ve örnek verileri ürün bundle'ına girmesin.
- [ ] Ücretli Chromatic hesabını zorunlu yapma; local interaction/a11y ve Playwright görsel kabulü yeterli olsun. `pnpm build-storybook` ve story kontrollerini çalıştır; commit: `docs: ship an interactive frontend component catalog`.

**Kabul:** Kullanıcı bileşeni bulur, farklı durumlarını dener ve gerçek kullanımı kopyalayabilir; yalnız üç örnek story ile yetinilmez.

### Görev 19 — Feature, sayfa, form ve bileşen üreticileri

**Files:** Modify `plopfile.js`, `plop-templates/feature/`, `plop-templates/component/`, `plop-templates/hook/`; Create `plop-templates/form/`, `plop-templates/page/`, `scripts/generators/plan-files.mjs`, `write-files.mjs`, `scripts/tests/generators.test.mjs`, `scripts/tests/fixtures/generated-project/`; Modify `package.json`.

**Interfaces:** `generate:feature <name>`, `generate:page <name> --feature <name>`, `generate:form <name> --feature <name>`, `generate:component`, `generate:hook`; hepsi `--dry-run` ve çakışma raporu destekler. Dosya planı önce üretilir, doğrulanır, sonra yazılır; unsafe template evaluation yapılmaz.

- [ ] Feature çıktısı public index, lazy route contribution, sayfa ve mevcut locale'lerde namespace üretir; gerekli provider'ları varsayım olarak gizlemez. Namespace üretiminde Görev 9'un ortak araç fonksiyonlarını kullan.
- [ ] Form çıktısı şema, inferred tip, alan örneği, localized validation, story ve davranış test başlangıcı üretir; kapalı form renderer yaratmaz. Nested/component isimleri dosya yolu ve export tutarlılığıyla doğrulansın.
- [ ] Fixture test: başlangıç `en/tr` yerine `en/tr/de` olduğunda üçü de güncellensin; aynı komut ikinci kez overwrite yapmasın; dosya adı çakışması/path traversal/Windows reserved name reddedilsin; dry-run ve hata yarım çıktı bırakmasın.
- [ ] Üretilen gerçek consumer fixture üzerinde typecheck/build ve form davranış testini çalıştır; yalnız metin snapshot'ıyla yetinme. Hook üreticisinin mevcutta olmayan `shared` klasörüne yanlış yönelmesi düzelsin.
- [ ] Başarısız yazmada yalnız bu çalışmanın dosyalarını geri al; kullanıcı dosyasını silme. Test/tooling/build; commit: `feat: generate integrated frontend features and forms`.

**Kabul:** Yeni ekran üretmek çeviri/route/şema kayıtlarını elle tamamlama işi bırakmaz; üretilen kod gerçekten derlenir.

### Görev 20 — Güvenli proje setup, doctor ve örnek çıkarma

**Files:** Create `scripts/project/setup.mjs`, `doctor.mjs`, `remove-examples.mjs`, `manifest.mjs`, `scripts/tests/project-setup.test.mjs`, `scripts/tests/remove-examples.test.mjs`, `.template-manifest.json`; Modify `scripts/cleanup-features.js`, `package.json`, `README.md`.

**Interfaces:** `setup:project --name <slug> --display-name <name> --locale <code> --examples keep|remove [--dry-run]`, `doctor`, `examples:remove [--dry-run]`. Interactive ve non-interactive kullanım aynı file-plan sözleşmesine gider. Plan önerisi: geniş regex'li cleanup yerine tanımlı örnek manifest'i kullanılır.

- [ ] Setup metadata, proje ayarları ve marka asset referanslarını güncellesin; repository/license bilgilerini kullanıcıya açık bırak; lisans bildirimlerini topluca silmesin.
- [ ] Test: boşluk/Türkçe görünen ad, geçersiz npm slug, mevcut özelleştirilmiş dosya, tekrar çalıştırma, hata ortasında rollback ve repo dışına çıkan symlink hedefi. Recursive silme öncesi absolute hedefin repo içinde olduğunu doğrula.
- [ ] Örnek çıkarma core, katalog ve tüketici feature'larını etkilemesin; yalnız template'e ait örnek dosyalarını kontrollü kaldırsın. Kullanıcı değiştirdiği örnek dosyaları varsa dry-run'da belirtip varsayılan olarak korusun.
- [ ] Doctor Node/pnpm/env/locale/asset/route durumunu kontrol etsin; Python/Graphify, Docker veya provider hesabını starter çalışması için zorunlu saymasın. `.devtools` ve graph çıktılarının template'e yanlışlıkla taşınmasını engelleyen paketleme/ignore yönergesi ekle.
- [ ] Keep/remove akışlarının ikisinde generated feature typecheck/build'ini çalıştır; commit: `feat: streamline safe template project setup`.

**Kabul:** Template'i yeni ürüne çevirme işlemi güvenli ve tekrar çalıştırılabilir; örnek temizliği source regex cerrahisi gerektirmez.

## F. Tam sürüm kabulü

### Görev 21 — Erişilebilirlik, responsive ve görsel regresyon kapıları

**Files:** Modify `playwright.config.ts`, `e2e/accessibility.spec.ts`, `navigation.spec.ts`, `auth.spec.ts`, `src/test/setup.ts`, `src/test/utils/render.tsx`; Create `e2e/visual.spec.ts`, `keyboard.spec.ts`, `localization.spec.ts`, `fixtures.ts`, `e2e/__screenshots__/`, `docs/quality/manual-accessibility.md`; Modify `.github/workflows/ci.yml`.

**Interfaces:** Playwright fixture'ı sabit veri/zaman ve tema/dil ayarlar; testler birbiriyle singleton i18n/store/cache paylaşmaz. Ortak render helper provider'ları her testte izole ve stabil oluşturur.

- [ ] Kritik görünüm matrisi: 360/768/1440 px × light/dark × en/tr. Bunlara ayrı uzun metin ve ar RTL fixture senaryoları ekle; desteklenen browser projeleri en az smoke akışlarını çalıştırsın.
- [ ] Keyboard E2E: skip link, sidebar, combobox, dropdown, nested modal, confirm dialog, wizard, form hatasına odak ve route geçişi. Otomatik axe kontrollerinde critical/serious ihlal sıfır olsun.
- [ ] Screenshot baseline'larını sabit Linux CI browser/font ortamında oluştur ve insan gözüyle kontrol et. Yeniden baseline alma otomatik kabul mekanizması olmasın; değişen görüntüler raporlansın.
- [ ] Windows'ta NVDA veya erişilebilirlik ağacıyla, macOS erişimi varsa VoiceOver ile kritik form ve modal akışını manuel değerlendir. Yapılamayan cihaz/ekran okuyucu kontrolünü açıkça kaydet.
- [ ] Story interaction/a11y ve E2E raporlarını PR artifact'ı yap; console/pageerror'ları filtreleyerek gizleme. Commit: `test: verify frontend accessibility and visual behavior`.

**Kabul:** Görsel ve etkileşim kalitesi tekrarlanabilir kanıtla korunur; otomatik araçların geçmesi tek başına WCAG uygunluk iddiası olmaz.

### Görev 22 — Bundle, performans ve dış etki kontrolü

**Files:** Create `scripts/check-bundle.mjs`, `scripts/tests/bundle-budget.test.mjs`, `e2e/network-contract.spec.ts`, `docs/quality/performance.md`; Modify `package.json`, `vite.config.ts`, `src/core/monitoring/`, `src/core/analytics/`, `src/core/performance/`, `.github/workflows/ci.yml`, `.env.example`.

**Interfaces:** `check:bundle` Vite manifest'inden varsayılan route'un statik import closure'ındaki toplam JS gzip boyutunu hesaplar; aynı chunk bir kez sayılır. Limit 200 KiB gzip'tir. Dinamik chart/editor/örnek chunk'ları ayrı raporlanır.

- [ ] Test: shared chunk iki kez sayılmasın, eşik üstü fixture başarısız olsun, sadece tek dosyanın küçük olması toplamı geçirmiş saydırmasın.
- [ ] Üretim build/preview'da JS boyutu ve route yüklemesini ölç; eager analytics/editor/catalog bağımlılıklarını tespit et. Aşım varsa ilgili import'ları düzelt veya açık mimari kararıyla eşik revizyonu öner; sessizce limiti yükseltme.
- [ ] Varsayılan production başlangıcında dış origin, analytics/telemetry/CDN isteği ve service worker kaydı olmamasını test et. SDK'ların kullanılmadığında lazy kalmasını ve env opt-in'ini doğrula.
- [ ] PWA opt-in ise update bildirimi, stale asset ve logout sonrası özel veri cache'i test edilsin. Monitoring adapter testinde olay alanları filtrelensin; form/parola/Authorization payload'ı gönderilmesin.
- [ ] Gerçek ölçülen Web Vitals ve laboratuvar sonuçlarını ortamlarıyla raporla; sabit performans puanı sözü verme. Commit: `perf: enforce frontend loading and network budgets`.

**Kabul:** Başlangıç hafiftir; kullanıcının açmadığı modüller dış istek/izleme başlatmaz; bundle bütçesi ölçülür.

### Görev 23 — Statik hosting ve isteğe bağlı entegrasyon rehberleri

**Files:** Modify `Dockerfile`, `docker-compose.yml`, `nginx.conf`, `.github/workflows/deploy.yml`, `vite.config.ts`; Create `.dockerignore`, `docs/guides/deployment.md`, `docs/guides/integrations.md`, `docs/guides/pwa.md`, `e2e/production-preview.spec.ts`.

**Interfaces:** `pnpm build` statik `dist` üretir; `pnpm preview` doğrulama içindir. SPA fallback, subpath `base`, cache ve güvenlik header'ları hosting tariflerinde açık olur. Deploy workflow template varsayılanında yalnız manuel/opt-in çalışır.

- [ ] Dev/preview/nginx CSP ve route fallback davranışını ayır; sayfa asset'lerinin content type'ı ve cache süresini doğrula. Auth/API endpoint ihtiyacını frontend CSP ayarından bağımsız belgeleyip örnek allowlist ver.
- [ ] Build-time `VITE_*` değişkenlerinin public olduğunu açıkça göster; Docker runtime environment değiştirmenin derlenmiş JS'i kendiliğinden değiştirmediğini belgeleyip build arg/env tarifini doğrula.
- [ ] `/examples/...` gibi deep link doğrudan açılışını ve alt dizinde yayınlamayı local production preview ile test et. Docker mevcutsa image build ve HTTP sağlık kontrolü yap; yoksa bu kanıtı eksik olarak işaretle.
- [ ] Mevcut workflow'daki PR koşulu/tetikleyici uyumsuzluğunu ve placeholder deploy adımlarını düzelt; build artifact'ı production deployment diye adlandırma. Sağlayıcı secret'ı, hesap açma veya gerçek yayın yapma.
- [ ] İlgili production testleri, config doğrulaması ve rehber komutlarını denetle; commit: `docs: validate static hosting and optional integration recipes`.

**Kabul:** Kullanıcı frontend'i nasıl yayınlayacağını bilir; doküman ve workflow gerçek deploy yapılmış izlenimi oluşturmaz.

### Görev 24 — İki temiz template kabulü ve tam sürüm dokümantasyonu

**Files:** Create `scripts/verify-template.mjs`, `scripts/tests/template-acceptance.test.mjs`, `docs/guides/quickstart.md`, `forms.md`, `tables.md`, `customization.md`, `extending.md`, `upgrading.md`, `docs/quality/release-checklist.md`; Modify `package.json`, `README.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `.github/workflows/ci.yml`.

**Interfaces:** `verify:template` repo dışındaki geçici, açıkça doğrulanmış iki tüketici klasöründe kabulü çalıştırır; kaynak çalışma ağacını değiştirmez. İçerideki Graphify venv veya mevcut node_modules başarının önkoşulu olamaz.

- [ ] Tüketici A: yeni ad/marka, örnekler açık, en/tr; feature ve doğrulamalı form üret; tr'ye geçerek doldur/kaydet, tablo URL'sini paylaş, production build ve katalog oluştur.
- [ ] Tüketici B: örnekler kaldırılmış, farklı marka ve varsayılan tr; de dilini draft üret, fixture çevirisini tamamla, reviewed olarak etkinleştir; yeni namespace/form ekle, core/locale kaydını elle düzenlemeden typecheck/build al.
- [ ] İki tüketicide `pnpm install --frozen-lockfile`, `pnpm doctor`, `pnpm check`, `pnpm i18n:check`, `pnpm build`, `pnpm build-storybook` ve gerekli E2E smoke'larını çalıştır. Hataları asıl göreve geri bağla; kabul scriptinde bypass etme.
- [ ] Üç kullanıcı işini süre tutarak dene: ilk yerel açılış hedefi 10 dakika, basit yeni form 15 dakika, üçüncü dil iskeleti 5 dakika. Gerçek adımları ve sürtünmeleri raporla; ağ/install süresi ayrıca gösterilsin.
- [ ] README'yi ilk açılış→tema→form→dil→tablo→örnek temizliği sırasıyla yaz. Mevcut roadmap'teki doğrulanmamış completed ifadelerini kanıta göre güncelle; template kopyalarının upstream güncellemeleri otomatik almadığını ve güvenli taşıma yolunu anlat.
- [ ] Tam release checklist'i evidence linkleriyle doldur; son kaynak incelemesi yap; yalnız geçen kapıları tamamlandı işaretle. Commit: `docs: certify the frontend template acceptance flows`.

**Kabul:** Dokümanı izleyen iki yeni proje mevcut çalışma ortamına bağımlı olmadan çalışır; ürünün iddiaları test ve gözlem kanıtlarıyla eşleşir.

## Bağımlılık sırası

- 1 → 2 → 3 temel sıradır.
- 4 → 5 → 6; 7, primitive ve shell sözleşmelerini tüketir.
- 8 → 9; 10, 5 ve 8'e; 11, 10 ve routing sözleşmesine bağlıdır.
- 12 temel adapter'ları üretir; 13 bağımsız URL katmanını, 14 ikisini ve 5'i tüketir; 15 form/adapter sözleşmelerine, 16 token ve primitive'lere dayanır.
- 17 önceki sistemleri birleştirir. Story'ler her görevde yazılır; 18 bunları katalog olarak tamamlar.
- 19 form/i18n/route sözleşmeleri sabitlenmeden başlamaz. 20, route/örnek manifest'i ve üretici file-plan altyapısını tüketir.
- 21'in testleri aşamalar boyunca eklenir; son matris 17–20 sonrası tamamlanır. 22–23 ölçüm ve hosting kabulünü sağlar; 24 bütün kapıların toplamıdır.

## Kapsam ve öncelik yönetimi

Çekirdek başlangıç için ilk anlamlı teslim A+B+C'dir: backend'siz açılış, tutarlı UI/layout, çeviri ve form ergonomisi birlikte çalışır. Bu bir ara teslimdir; tam ürün kabulü değildir. D+E veri ekranları ve template kullanımını tamamlar; F kalite iddialarını doğrular.

Chart/editor/virtualization gibi ileri parçalar temel kullanımın önüne alınmaz. Buna karşılık task listesinde yer aldıkları için ilk tam sürümden gerekçesiz düşürülmezler. Yeni ihtiyaç gelirse hangi kabul ölçütünü etkilediği ve hangi görevden sonra yapılacağı kaydedilir.

Plan kişisel hız, ekip veya günlük kapasite varsaymadığı için takvim süresi taahhüt etmez. İlk aşamanın gerçek baseline sonuçlarından sonra görevlerin boyutu ve kalan iş yeniden tahmin edilir. Durum raporları tamamlanan görev, çalışan kullanıcı akışı, geçen kapı ve açık engeli gösterir.

## Tasarımdan görevlere kapsama kontrolü

| Tasarım gereksinimi                               | Sahip görevler              |
| ------------------------------------------------- | --------------------------- |
| Backend'siz template ve ilk açılış                | 1–3, 17, 20, 24             |
| Düzenlenebilir shadcn ve tek tasarım dili         | 4–7, 18, 21                 |
| Kolay doğrulamalı form ve ileri akışlar           | 10–11, 15, 19               |
| Yeni dil/namespace, çeviri kalitesi ve RTL        | 8–9, 19, 21, 24             |
| Ortak frontend veri/URL/tablo sözleşmeleri        | 12–14                       |
| Dosya ve ileri UI hazır parçaları                 | 15–16                       |
| İşlevsel demo, katalog ve geliştirici deneyimi    | 17–20                       |
| Test, erişilebilirlik ve görsel kanıt             | Her davranış görevi, 21, 24 |
| Bundle/dış etki/hosting                           | 22–23                       |
| Dokümantasyon, migration ve temiz tüketici kabulü | 18–20, 23–24                |

## Planın kendi kontrolü

- [x] Kullanıcının frontend-only ve template seçimi açıkça işlendi.
- [x] Tasarımda geçen her ana gereksinim bir veya daha fazla göreve bağlandı.
- [x] Üreticilerin tükettiği route/form/i18n sözleşmeleri önce tanımlandı.
- [x] Dil/form/URL/storage/odak/dosya/kurulum sınır durumları sahip görevlere bağlandı.
- [x] Basit stil değişiklikleri için gereksiz unit test zorunlu kılınmadı.
- [x] İleri parçaların bundle'a etkisi ve backend sınırı tanımlandı.
- [x] Uygulama testi veya build çalıştırılmadığı açıkça belirtildi.
- [x] Tasarım bağımsız builder-check incelemesinde önemli açık soru bırakmadı.

## Uygulama sırasında tutulacak kanıt

Her görev için commit, ilgili test/build komutu ve sonucu, gözlenen kullanıcı akışı, varsa screenshot ve açık limit kısa bir görev kaydına yazılır. Bir görev yalnız arayüzü oluşturuldu diye tamamlanmaz; kendi kabulü doğrulanır. Bekleyen testler ve yapılmayan canlı/cihaz kontrolleri açık kalır. Planın hazırlanması, bu görevlerin uygulandığı anlamına gelmez.
