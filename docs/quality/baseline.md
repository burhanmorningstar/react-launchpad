# Frontend Launchpad — Görev 1 baseline

Ölçüm: 27 Ekim 2026, Windows/PowerShell. Başlangıç commit'i:
`0400a23600d8ddf1161175ab663eed733ee9d6cd`.
Dal: `chore/frontend-toolchain-baseline`.

Bu görev tekrarlanabilir araç zincirini ve gerçek kalite kapılarını kurar.
Başarısız başlangıç kapıları aşağıda açıkça korunmuştur; ürünün veya bütün
planın tamamlandığı anlamına gelmez.

## Ortam ve kurulum

- Geliştirme tabanı: Node **24.20.0**, pnpm **10.29.2**. Yerelde bu sürümler
  kullanıldı. `.node-version` tam Node sürümünü; `packageManager` tam pnpm
  sürümünü belirtir. Engines Node 24 ailesini ve tam pnpm sürümünü sınırlar.
- Node sürümü [resmî sürüm dosyasında](https://nodejs.org/dist/v24.20.0/SHASUMS256.txt),
  pnpm sürümü ve Node gereksinimi
  [npm metadata'sında](https://registry.npmjs.org/pnpm/10.29.2), Docker etiketi
  [resmî Node imajının etiket kaydında](https://hub.docker.com/v2/repositories/library/node/tags/24.20.0-alpine)
  kontrol edildi. Bu seçim “en son sürüm” iddiası değildir.
- CI ve mevcut deploy workflow'u `.node-version` / `packageManager` kullanır.
  Docker, `node:24.20.0-alpine` ve package metadata'sından pnpm yükleyen Corepack
  kullanır. Deploy tetikleyicileri ve hedefleri değiştirilmedi.
- `pnpm install --frozen-lockfile` değişikliklerden önce ve sonra **exit 0**.
  Mevcut bağımlılık major'ları ve `pnpm-lock.yaml` baytları değiştirilmedi.
- pnpm; core-js, esbuild, msw, protobufjs ve unrs-resolver kurulum script'lerinin
  çalıştırılmadığını bildirdi. Bu ortamda unit/app build kapıları yine geçti;
  tüm dependency script'lerine genel izin verilmedi.
- Başlangıçta yalnız `.gitignore` kullanıcı değişikliği vardı; aynen korundu.
  Mevcut ignore kuralları nedeniyle bu rapor commit'e açık dosya seçimiyle eklenir.

## Graphify incelemesi

Mevcut `graphify-out/graph.json`: 1041 düğüm. Grafiğin kendi sözcüklerinden
`config vite vitest playwright storybook test build` sorgusu çalıştırıldı.
BFS sonucu 52 düğüm / 68 bağlantı gösterdi; araç yaklaşık 3168 çıktı token'ı
raporladı. Çıkarım için haricî AI API çağrısı yapılmadı.

Grafikte `vitest.config.ts:L3`, `src/test/setup.ts:L3`,
`src/core/ui/utils/cn.test.ts:L1` ve `.github/workflows/ci.yml:L1` bağlantıları
araç/test katmanlarını bulmak için kullanıldı. Ardından gerçek dosyalar ve
komut çıktıları kontrol edildi. Grafik çalışma öncesine aittir; yeni dosyaların
yeniden indekslendiği iddia edilmez.

## Komut sonuçları

| Kapı                            | Değişiklik öncesi                                 | Görev 1 sonu                                                |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| Frozen install                  | Geçti                                             | Geçti                                                       |
| `pnpm typecheck`                | Exit 0; boş kök proje nedeniyle yanıltıcı         | Geçti; app, araçlar ve testler gerçekten denetleniyor       |
| `pnpm lint`                     | Geçti; 3 uyarı                                    | Geçti; aynı 3 uyarı                                         |
| `pnpm format:check`             | Başarısız; 158 dosya                              | Başarısız; aynı 158 dosya                                   |
| `pnpm test:unit`                | Script yoktu; eşdeğer `pnpm exec vitest run`: 5/5 | 5/5 geçti                                                   |
| `pnpm test:tooling`             | Script yoktu; yeni fixture testi eski komutta 0/8 | 8/8 geçti                                                   |
| `pnpm build`                    | Geçti                                             | Geçti                                                       |
| `pnpm build-storybook`          | Başarısız; Workbox boyut sınırı                   | Aynı hata ile başarısız                                     |
| `pnpm check`                    | Script yoktu                                      | Biçim kapısında exit 1; sonraki testler ayrıca çalıştırıldı |
| `docker compose config --quiet` | Çalıştırılmadı                                    | Geçti; eski `version` alanı uyarısı var                     |

Değiştirilen JSON/YAML/TypeScript/JavaScript dosyaları ayrıca doğrudan
Prettier kontrolünden geçti. `format:check` kapsamı daraltılmadı.

## Gerçek typecheck kanıtı

Eski `tsc --noEmit`, `files: []` olan kök config'in references projelerini
denetlemiyordu. Yeni `scripts/check-typecheck.mjs`, gerçek TypeScript CLI'ını
`--build --force` ile çalıştırır; her config'te `noEmit` korunur. Build modu
[TypeScript references sözleşmesine](https://www.typescriptlang.org/docs/handbook/project-references.html)
uygundur. Force, eski incremental çıktının hata gizlemesini önler.

`scripts/tests/typecheck.test.mjs` gerçek package komutunu, gerçek config'lerin
kopyalarıyla `.tmp/typecheck-*` altındaki izole fixture'larda çalıştırır.
Uygulama, Vite, Vitest, Playwright, Storybook main/preview, tooling script ve
unit test dosyası için ayrı vakalar vardır. Her vaka:

1. Geçerli fixture'ın geçtiğini doğrular.
2. `string = 123` tür hatası ekler; komutun TS2322 ile başarısız olduğunu doğrular.
3. Hatayı düzeltir; komutun yeniden geçtiğini doğrular.

Sekiz vaka da uygulama değişikliğinden önce eski komutun hatayı kaçırdığını
göstererek başarısız oldu; yeni komutla sekizi de geçti. Gerçek `src` dosyaları
değiştirilmez; fixture'lar test sonunda temizlenir.

- `tsconfig.app.json`: browser kodu ve Storybook preview; test dosyaları hariç.
- `tsconfig.node.json`: Vite/Vitest/Playwright/Storybook main ve yeni `.mjs`
  script'leri; JavaScript için `checkJs` açık.
- `tsconfig.test.json`: unit/test yardımcıları ve E2E testleri. Vitest globals
  yalnız bu config'te; uygulamanın tamamına eklenmez.
- Mevcut `.js` üreticilerin strict JS dönüşümü bu görevin dışında; Görev 19–20.

## Açık başlangıç bulguları ve sahipleri

| Bulgu                                                                   | Kanıt / etkisi                                                                           | Sahip görev                                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 158 kaynak dosyasında biçim farkı                                       | `format:check` exit 1; `check` ve CI lint kapısı kırmızı kalır                           | İlgili dosya taşınırken 2–20; kalan ortak biçim borcunun kapanış sahibi 21 |
| Storybook PWA eklentisini miras alıyor                                  | `sb-manager/globals-runtime.js` 3.15 MB; Workbox varsayılan 2 MiB sınırında build exit 1 | 2: varsayılan PWA'yı opt-in yapma; 18: katalog build kabulü                |
| Fast refresh uyarıları                                                  | `badge.tsx:47`, `breadcrumbs.tsx:123`, `button.tsx:99`; 0 lint hatası, 3 uyarı           | 5: primitive API/export standardizasyonu                                   |
| Eski Browserslist verisi, MDX eşleşmesi yok, büyük Storybook chunk'ları | Storybook build uyarıları; mevcut major'lar yükseltilmedi                                | 18 ve 22                                                                   |
| Compose üst düzey `version: '3.8'` eski                                 | Config geçerli; Compose uyarı veriyor                                                    | 23: hosting/Docker rehberleri                                              |

Görev 1'in kabulü araçların sabitlenmesi, gerçek hata yakalama kanıtı ve açık
baseline listesidir. Yukarıdaki kırmızı kapıları yeşil göstermek için test
atlanmadı, limit yükseltilmedi veya ürün dosyalarında toplu biçim düzeltmesi yapılmadı.

## Kanıt sınırı ve yeniden çalıştırma

Bu rapor yerel kurulum/typecheck/test/build çıktısını kaydeder. GitHub Actions
çalıştırılmadı; Docker imajı build edilmedi ve container başlatılmadı. E2E komutu
korundu ve Chromium CI işi görünür; bu görevde tarayıcı testi/deploy yapılmadı.

Yerel ham kayıtlar `.tmp/task-1/` altında `install-before.log`,
`install-after.log`, `before-*.log`, `typecheck-red.log`, `typecheck-green.log`,
`after-*.log` ve `after-*.exit` dosyalarındadır. Bunlar geçici/ignored kanıtlardır;
kalıcı sonuç özeti bu rapordur.

Yeniden çalıştırma: `pnpm install --frozen-lockfile`, `pnpm check`,
`pnpm build`, `pnpm build-storybook`. `check` ilk hatada durduğu için
`pnpm test:unit` ve `pnpm test:tooling` kırmızı biçim kapısı kapanana kadar
ayrıca çalıştırılmalıdır.

## Görev 2 sonrası doğrulama — 27 Ekim 2026

Bu bölüm, yukarıdaki Görev 1 ölçümünü tarihsel kayıt olarak korur; güncel
durumda değişen kapıları belirtir.

- Varsayılan `/` route'u artık backend, hesap, API anahtarı veya `.env`
  gerektirmeyen Welcome ekranıdır. Bilinmeyen route için 404; render hatası
  için özel bilgi göstermeyen, ana sayfaya dönüşlü hata ekranı vardır.
- `src/config/project.ts`: isim, marka, varsayılan locale, `homePath`,
  `examplesEnabled` ve isteğe bağlı public API adresi. İki mevcut HTTP
  istemcisi aynı `apiUrl` ayarını tüketir; transport birleştirmesi Görev 12'de.
  Boş/eksik/yalnız boşluk içeren API env değeri artık başlangıcı bozmaz.
- Eski korumalı örnek route'lar `example-routes.tsx` içinde korunur;
  layout ve sayfaları lazy'dir. Örnekler kapatıldığında route'ları da kalkar.
  Özelleştirilmiş marka/ana yol ve örneksiz kurulum unit testinde doğrulandı.
- Tema mevcut Zustand kaynağında kalır; tema senkronizasyonu, i18n, query,
  auth, tooltip ve toast birleşimi `AppProviders` içindedir. Görev 4 öncesinde
  ikinci bir tema state'i eklenmedi. Varsayılan performans overlay'i kaldırıldı;
  performans yardımcıları isteğe bağlı kullanım için korunur.
- PWA yalnız açık `VITE_PWA_ENABLED=true` tercihiyle eklenir. Varsayılan build
  service worker üretmez/kaydetmez; Sentry/PostHog başlangıcı yapılmaz.
  Bu değişiklik, önceki Storybook Workbox boyut hatasını da giderdi.

| Kontrol                                                                                                    | Güncel sonuç                                         |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm typecheck`                                                                                           | Geçti                                                |
| `pnpm lint`                                                                                                | Geçti; aynı 3 eski fast-refresh uyarısı              |
| `pnpm test:unit`                                                                                           | 4 dosyada 15/15 geçti                                |
| `pnpm test:tooling`                                                                                        | 8/8 geçti                                            |
| `pnpm build`                                                                                               | Geçti; varsayılan çıktıda service worker yok         |
| `pnpm build-storybook`                                                                                     | Geçti                                                |
| `pnpm exec playwright test --project=chromium`                                                             | Geliştirme sunucusunda 5/5 geçti                     |
| `PLAYWRIGHT_PREVIEW=true pnpm exec playwright test --project=chromium --project=mobile-chrome --workers=2` | Üretim build'inin yerel preview'ında 10/10 geçti     |
| `pnpm format:check`                                                                                        | Mevcut biçim borcu nedeniyle exit 1; 148 dosya kaldı |

Yeni başlangıç testi; ilk açılış, yenileme, 404 ve ana sayfaya dönüş boyunca
dış origin girişimlerini, aynı origin dahil fetch/XHR/veri isteklerini,
HTTP hatalarını, konsol uyarı/hatalarını ve pageerror olaylarını denetler.
Dev ile production preview'da bunlar boş; service worker kaydı 0 bulundu.
Masaüstü ve mobil Welcome ekran görüntüleri ayrıca gözle incelendi.
Firefox/WebKit, canlı deployment ve erişilebilirlik sertifikası bu kanıtın
parçası değildir. Playwright config'ine preview seçeneği eklendi; başka bir
yerel sunucuyu yanlışlıkla test etmemek için test sunucusu yeniden kullanılmaz.

TDD kaydı: İlk koşuda 6 beklenen unit hata / 2 geçen mevcut davranış vardı;
başlangıç E2E'si eski giriş yönlendirmesinde başarısız oldu. Ek bir test,
HTTP istemcisinin proje ayarını kullanmadığını göstererek önce başarısız oldu;
istemciler bağlandıktan sonra geçti. Ham kayıtlar `.tmp/task-2/` altındadır.

Kod incelemesinde önemli/kritik bulgu yok. Küçük bulgu olarak korunan dashboard
başlığının hâlâ eski `t('app.name')` değerini kullanması Görev 6'ya bırakıldı.
Yeni sayfalardaki bağlantılar `buttonVariants` ile stillenir: mevcut
`Button asChild` kullanımı `React.Children.only` hatası veriyor; primitive
düzeltmesi Görev 5'in kapsamındadır. Bu görevde primitive API'si değiştirilmedi.

## Görev 3 sonrası doğrulama — 27 Ekim 2026

Route sözleşmesi `src/core/routing/types.ts` içindedir. App loader'ı
`src/features/*/routes.tsx` dosyalarını keşfeder; sayfalar `route.lazy` ile
ziyaret anında yüklenir. Eski `_registry.ts` kopyası kaldırıldı. Mevcut
auth/dashboard/users/settings URL'leri ve guard'ları korundu; app'in layout
slot'ları core'a taşınmadı. Hiç feature bulunmaması ve örneklerin kapatılması
kayıt testlerinde geçer. Menü katkıları registry sonucunda hazırdır; shell'de
tüketimi Görev 6'da yapılır.

`pnpm check:boundaries` ve ESLint aynı TypeScript AST/modül çözümleyicisini
kullanır. Alias, relative yol, Vite `/src/...` yolu, re-export, literal dynamic
import, import-type, custom alias ve `.js` → `.ts` çözümü kapsanır. Core'un
app/feature import'u ve feature'ların birbirinin iç dosyasına erişimi reddedilir;
feature public API'si ve kendi iç import'ları geçer. Mevcut kaynakta taşınması
gereken cross-feature iç import bulunmadı. `pnpm check` sınır kapısını içerir.

Kayıtta yinelenen feature id, route id, nested/normalize path ve reserved home
kontrol edilir. Sayfa modüllerinin ana sayfada yüklenmediği, ilgili route'a
geçilince yüklendiği gerçek memory router testiyle doğrulanır.

Tarayıcıda ilk denemede doğrudan `/login` ve admin adreslerinde takılı kalan
yükleme ekranı yakalandı. Router hazır olurken, Suspense altındaki
`RouterProvider` henüz abone olmadığı için ilk state güncellemesini
kaçırıyordu. App, ilk router state'i hazır olduktan sonra provider'ı mount
eder. Aynı gerçek tarayıcı testleri düzeltmeden önce kırmızı, sonra yeşil oldu;
timeout artırılarak geçirilmedi.

Bağımsız incelemedeki tek önemli bulgu, Vite root-absolute import'larının
sınır denetimini atlamasıydı. `/src/features/...` fixture'ı önce başarısız
oldu; proje köküne göre çözüm eklendikten sonra geçti. Ertelenen yeni bulgu yok.

| Kontrol                                         | Güncel sonuç                                     |
| ----------------------------------------------- | ------------------------------------------------ |
| `pnpm check:boundaries`                         | Geçti                                            |
| `pnpm typecheck`                                | Geçti                                            |
| `pnpm lint`                                     | Geçti; aynı 3 eski fast-refresh uyarısı          |
| `pnpm test:unit`                                | 5 dosyada 24/24 geçti                            |
| `pnpm test:tooling`                             | 14 sınır + 8 typecheck = 22/22 geçti             |
| `pnpm build`                                    | Geçti                                            |
| `pnpm build-storybook`                          | Geçti                                            |
| Geliştirme Chromium E2E                         | 6/6 geçti                                        |
| Production preview Chromium + mobile-chrome E2E | 12/12 geçti                                      |
| `pnpm format:check`                             | Önceden var olan biçim borcu; 145 dosyada exit 1 |

Başlangıç dış istek/veri/console/pageerror/service worker kontrolleri yeşil
kaldı. Yeni auth E2E; giriş formunu ve `/dashboard`, `/admin/users`,
`/admin/settings` adreslerinin girişe dönüşünü içerik seviyesinde kontrol eder.
Canlı backend veya gerçek auth hizmeti doğrulanmadı. Ham kayıtlar
`.tmp/task-3/` altında; kullanım sözleşmesi [mimari rehberde](../ARCHITECTURE.md).

## Görev 4 sonrası doğrulama — 27 Ekim 2026

Tema seçiminin tek sahibi next-themes tabanlı `src/core/theme/ThemeProvider.tsx`.
`useTheme` seçimi, çözümlenmiş light/dark görünümü ve `setTheme` işlemini sunar;
`ThemeMode` light/dark/system sözleşmesidir. Zustand UI store'undan tema,
persist katmanı ve eski `useThemeSync` kaldırıldı. Switcher, toggle, ayarlar
ekranı ve toast aynı provider'ı tüketir.

Canonical localStorage anahtarı `theme` olur. Geçerli eski `ui-storage` tercihi
yalnız canonical değer yokken taşınır; eski kayıt veya ilgisiz kullanıcı
storage verisi silinmez. Bozuk değer, storage erişiminin reddi ve salt okunur
storage güvenli fallback ile çalışır; seçim bellekte de değiştirilebilir.
Başlangıcın bozulmaması için auth provider'ın ilk storage okumasına da dar
bir hata sınırı eklendi; gerçek auth hizmeti veya oturum sözleşmesi değiştirilmedi.

Vite, `initialize-theme.ts` içindeki aynı fonksiyonu HTML'in charset metası
sonrasına inline eder. Böylece React yüklenmeden doğru class/color-scheme
uygulanır; başlangıç ve React için farklı tema algoritmaları tutulmaz.
İlk-çerçeve testinde uygulama JavaScript'i bekletilir ve üç animation frame'de
class kontrol edilir. System, light, dark, geçersiz ve engelli storage
durumları; normal açılış ve refresh ile doğrulandı. Bu, ölçülen tarayıcı
senaryolarının kanıtıdır; bütün cihazlarda fiziksel ekran sertifikası değildir.

`tokens.css` tek semantik renk/ölçü/motion kaynağıdır. `globals.css` shadcn ve
eski utility adlarını bu değerlere bağlar; eski adlarda ikinci renk paleti yoktur.
Renk, radius, font, spacing, density, shadow ve motion buradan değiştirilir.
Default/small/large button ve input/select yükseklikleri density token'larını
tüketir. Hover, disabled opacity ve solid focus ring token'lara bağlıdır;
primitive API değişimi ve mevcut `asChild` sorunu Görev 5'te kalır.

`typography.css`, yerel Inter Variable WOFF2'yi ve sistem font fallback'lerini
tanımlar. Font [Inter'in kendi deposundan](https://github.com/rsms/inter/tree/master/docs/font-files)
alındı; SIL OFL 1.1 lisansı fontun yanında bulunur. Runtime font/CDN isteği yoktur.
352240 byte font dosyasının SHA-256 değeri:
`693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`.

Tarayıcı testleri light/dark için dokuz semantik metin/zemin çiftinde en az
4.5:1 kontrast, yerel font yükleme, primary değişiminin buton ve focus'a
yansıması, density değişiminin kontrol yüksekliğine etkisi, reduced-motion
ve 360 px'de uzun metnin taşmamasını doğrular. Bunlar WCAG sertifikası değildir;
tam görsel/klavye/erişilebilirlik kabulü Görev 21'de sürer.

`Foundation/Theme` light/dark/system story'leri eklendi. Üretilen Storybook
yerel statik sunucuda açıldı; light/dark geçişleri çalıştırıldı, iki ekran
görüntüsü gözle karşılaştırıldı. Yeni dependency veya global font kurulmadı.

Bağımsız inceleme, bozuk salt okunur kayıttan kurtulurken system modunun DOM'a
işletim sistemi değişimini uygulamadığını buldu. Regresyon önce başarısız oldu;
geçici guard kaldırılmadan next-themes'in bellek tercihi onarıldıktan sonra
geçti. İkinci canlı tema state'i veya ayrı DOM senkronizasyon hook'u eklenmedi.

| Kontrol                                                 | Güncel sonuç                                     |
| ------------------------------------------------------- | ------------------------------------------------ |
| `pnpm typecheck`, `pnpm check:boundaries`               | Geçti                                            |
| `pnpm lint`                                             | Geçti; aynı 3 eski fast-refresh uyarısı          |
| `pnpm test:unit`                                        | 7 dosyada 35/35 geçti                            |
| `pnpm test:tooling`                                     | 22/22 geçti                                      |
| `pnpm build`, `pnpm build-storybook`                    | Geçti                                            |
| Dev Chromium, tek worker / CI'ya eşdeğer sıra           | 14/14 geçti                                      |
| Production preview Chromium + mobile-chrome, iki worker | 28/28 geçti                                      |
| `pnpm format:check`                                     | Önceden var olan biçim borcu; 134 dosyada exit 1 |

Paralel build'lerle aynı anda iki worker dev koşusunda
`Authentication › should load login page` beş saniyelik görünürlük sınırını
aşıp Loading ekranında zaman aşımı yaptı. İzole, tek worker'lı tam dev koşusu
aynı assertion ve timeout ile geçti; production preview iki worker ile geçti.
Bu paralel dev zamanlaması kapanmış bir performans garantisi sayılmaz;
fixture/çalıştırma kararlılığı Görev 21'de yeniden değerlendirilir.

Ham kayıtlar `.tmp/task-4/` altında. Font, CSS ve bootstrap dahil varsayılan
backend'siz başlangıç dış istek/veri/console/pageerror/SW kontrolleri yeşil kaldı.

## Task 5 - editable Radix/shadcn primitives (2026-10-27)

The API inventory, package versions, MIT attribution and consumer migrations are
documented in [primitives.md](../guides/primitives.md). Twenty missing primitives
were added without switching the Radix interaction foundation. The unused custom
Form/Modal implementations and duplicate toast wrapper were removed after consumer
migration. React Hook Form products and advanced composites remain with their
planned later tasks.

Behavior regressions were observed failing before their fixes: slotted/loading
buttons, the missing modal provider in user deletion, progress ARIA forwarding,
slider thumb names, custom progress maximum, focus after a deleted row disappears,
and explicit child attributes overriding disabled Slot behavior. The final review
findings were fixed with regression tests. A controlled user confirmation now
returns Cancel focus to its trigger and successful deletion focus to the persistent
table region.

| Check                                            | Result                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Frozen pnpm install                              | Passed; existing blocked dependency build-script warnings unchanged                                             |
| Typecheck and module boundaries                  | Passed                                                                                                          |
| Lint                                             | Passed, 0 errors / 7 fast-refresh warnings; 3 existing plus shared variant/toast exports in 4 new/updated files |
| Unit tests                                       | 49/49 across 9 files                                                                                            |
| Tooling regression tests                         | 22/22                                                                                                           |
| App build and Storybook build                    | Passed; Storybook retains its large-catalog chunk warning                                                       |
| Dev Chromium, one worker                         | 14/14                                                                                                           |
| Production preview desktop + mobile, two workers | 28/28                                                                                                           |
| Built Storybook browser smoke                    | 51 stories, 10 interaction flows; console warnings/errors and page errors empty                                 |
| Light/dark field screenshots at 1280 and 360 px  | Inspected; labels, invalid descriptions and disabled state fit without horizontal overflow                      |
| Whole-source format check                        | Still fails on 110 existing files; changed source files formatted                                               |

The browser smoke covers modal focus trapping, Escape/outside dismissal and focus
return; sheet dismissal; Select keyboard/reset/disabled options; searchable
combobox and command selection; slider keyboard/range labels; calendar single/range
and month navigation; drawer closing; and keyboard resizing. Story play assertions
wait for focus restoration rather than sampling during close animations. Physical
outside-click checks wait for entry animation completion. This is local Chromium
evidence, not a live backend or screen-reader certification. Full-catalog/a11y gates
remain Tasks 18 and 21.

Raw logs, browser results and screenshots: `.tmp/task-5/`. Graphify's existing
1041-node graph identified the legacy component relationships; current source
reads were used to confirm the migration because the graph predates these edits.

## Task 6 - configurable application shell (2026-10-28)

Dashboard and admin now use the same AppShell and application adapter. Brand,
navigation, account actions and footer are data/slots. Core has no auth/session or
product-name dependency. Each shell owns separate desktop-collapse and initially
closed mobile state. The former global `sidebarOpen` API was removed after its
consumers migrated. [Application shell](../guides/application-shell.md) documents
the public API, dimensions, state lifetime and migration.

The app now consumes discovered feature menu descriptors, preserving their route
mount ownership and app role filtering. New destinations do not need a central
list edit. A Reports fixture failed before this integration and passed after it;
its lazy page loader was never called. The final review reported no important
shell defects and identified this previously promised integration, which was
completed in the same batch.

| Check                                            | Result                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Typecheck and module boundaries                  | Passed                                                                                                 |
| Lint                                             | Passed; same 7 fast-refresh warnings as Task 5                                                         |
| Unit suite, one worker                           | 60/60 in 11 files                                                                                      |
| Tooling regressions                              | 22/22                                                                                                  |
| App and Storybook builds                         | Passed; existing Storybook large-chunk warning                                                         |
| Dev Chromium, one worker                         | 22/22                                                                                                  |
| Production preview desktop + mobile, two workers | 44/44                                                                                                  |
| Built shell stories                              | 24 cases: 4 fixtures × 3 widths × 2 themes; console warnings/errors and page errors empty              |
| Responsive visuals                               | 360/768/1440 px, light/dark, long/unbroken/nested menus, second product and collapsed layout inspected |
| Dimension tokens                                 | Collapsed sidebar 72 px and header 64 px verified against default token values                         |
| Whole-source formatting                          | Existing 110-file debt remains; changed source is formatted                                            |

Regression tests cover route specificity without query-string inflation, nested
branches, independent shell instances, hidden footer keyboard targets, mobile
trigger ARIA state, Escape/focus trapping, route/breakpoint closure, focus recovery
when a desktop sidebar disappears, and skip-link/main behavior. Mobile dismissal
assertions wait for the closing Sheet to unmount before screenshots.

The first cold dev shell run, started with other checks, exceeded the existing
five-second initial main-landmark assertion and separately exposed the missing
mobile `aria-expanded` attribute. The attribute override was reproduced in a unit
test and fixed. Isolated final dev22/22 passed with unchanged timeouts; the known
cold-run scheduling concern remains with Task 21. A cold parallel Task 5 completion
audit similarly missed its existing four-second protected-route assertion; the
unchanged full suite passed serially. These results do not claim that fixture
timing debt is resolved.

Raw logs, screenshots and Graphify relationship query: `.tmp/task-6/`. Sessions
are local fixtures; no backend login, deployment or global tool installation was
performed. Language/RTL expansion and whole-app accessibility coverage remain
with their planned later tasks.
