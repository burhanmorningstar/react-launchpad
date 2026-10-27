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

| Kapı | Değişiklik öncesi | Görev 1 sonu |
| --- | --- | --- |
| Frozen install | Geçti | Geçti |
| `pnpm typecheck` | Exit 0; boş kök proje nedeniyle yanıltıcı | Geçti; app, araçlar ve testler gerçekten denetleniyor |
| `pnpm lint` | Geçti; 3 uyarı | Geçti; aynı 3 uyarı |
| `pnpm format:check` | Başarısız; 158 dosya | Başarısız; aynı 158 dosya |
| `pnpm test:unit` | Script yoktu; eşdeğer `pnpm exec vitest run`: 5/5 | 5/5 geçti |
| `pnpm test:tooling` | Script yoktu; yeni fixture testi eski komutta 0/8 | 8/8 geçti |
| `pnpm build` | Geçti | Geçti |
| `pnpm build-storybook` | Başarısız; Workbox boyut sınırı | Aynı hata ile başarısız |
| `pnpm check` | Script yoktu | Biçim kapısında exit 1; sonraki testler ayrıca çalıştırıldı |
| `docker compose config --quiet` | Çalıştırılmadı | Geçti; eski `version` alanı uyarısı var |

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

| Bulgu | Kanıt / etkisi | Sahip görev |
| --- | --- | --- |
| 158 kaynak dosyasında biçim farkı | `format:check` exit 1; `check` ve CI lint kapısı kırmızı kalır | İlgili dosya taşınırken 2–20; kalan ortak biçim borcunun kapanış sahibi 21 |
| Storybook PWA eklentisini miras alıyor | `sb-manager/globals-runtime.js` 3.15 MB; Workbox varsayılan 2 MiB sınırında build exit 1 | 2: varsayılan PWA'yı opt-in yapma; 18: katalog build kabulü |
| Fast refresh uyarıları | `badge.tsx:47`, `breadcrumbs.tsx:123`, `button.tsx:99`; 0 lint hatası, 3 uyarı | 5: primitive API/export standardizasyonu |
| Eski Browserslist verisi, MDX eşleşmesi yok, büyük Storybook chunk'ları | Storybook build uyarıları; mevcut major'lar yükseltilmedi | 18 ve 22 |
| Compose üst düzey `version: '3.8'` eski | Config geçerli; Compose uyarı veriyor | 23: hosting/Docker rehberleri |

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

| Kontrol | Güncel sonuç |
| --- | --- |
| `pnpm typecheck` | Geçti |
| `pnpm lint` | Geçti; aynı 3 eski fast-refresh uyarısı |
| `pnpm test:unit` | 4 dosyada 15/15 geçti |
| `pnpm test:tooling` | 8/8 geçti |
| `pnpm build` | Geçti; varsayılan çıktıda service worker yok |
| `pnpm build-storybook` | Geçti |
| `pnpm exec playwright test --project=chromium` | Geliştirme sunucusunda 5/5 geçti |
| `PLAYWRIGHT_PREVIEW=true pnpm exec playwright test --project=chromium --project=mobile-chrome --workers=2` | Üretim build'inin yerel preview'ında 10/10 geçti |
| `pnpm format:check` | Mevcut biçim borcu nedeniyle exit 1; 148 dosya kaldı |

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
