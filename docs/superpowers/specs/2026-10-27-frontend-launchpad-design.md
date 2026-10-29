# Frontend Launchpad — Ürün ve Mimari Tasarımı

Tarih: 27 Ekim 2026
Durum: Kullanıcının istediği uygulama planının tasarım dayanağı; henüz uygulamaya geçirilmedi.

## 1. Amaç ve kullanıcı

Bu repo, yeni bir React frontend projesini GitHub template olarak başlatan geliştiriciye tasarım sistemini, bileşenleri, sayfa düzenlerini, form ve çeviri altyapısını, frontend veri katmanını ve doğrulama araçlarını birlikte sağlar. Hedef, geliştiricinin her projede aynı entegrasyonları yeniden kurmadan ürünün kendisine odaklanmasıdır.

Kullanıcının kesinleştirdiği sınırlar:

- Ana dağıtım şekli bu repodan yeni proje başlatmaktır.
- Kapsam yalnız frontend'dir; çalışan backend, veritabanı veya auth servisi teslim edilmez.
- Shadcn tabanlı bileşenlerin kaynak kodu projede bulunur ve değiştirilebilir.
- Form kurma, doğrulama, çeviri kullanma ve yeni dil ekleme kolaylığı temel ürün özellikleridir.
- Bu aşamada yalnız plan ve tasarım belgeleri hazırlanır; uygulama kodu değiştirilmez.

## 2. Yaklaşımlar ve seçim

| Yaklaşım                                | Kazanç                                                                | Bedel                                                                                          | Karar                                                                     |
| --------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Bütünleşik GitHub template              | Mimari, bileşenler, örnekler ve kalite araçları tek başlangıçta hazır | Demo ile ürün kodu iyi ayrılmalı; template güncellemeleri kopyalara kendiliğinden ulaşmaz      | Kullanıcının seçtiği ana yaklaşım                                         |
| Bileşen registry'si / bağımsız paketler | Mevcut projelere parça taşımak ve merkezi sürüm dağıtmak kolay        | Yeni projenin başlangıç mimarisini tek başına sağlamaz; ayrı dağıtım ve bakım maliyeti yaratır | İlk teslimin dışında; dosya sınırları ileride çıkarmaya elverişli tutulur |
| Sıfırdan framework değişimi / monorepo  | Farklı render modellerine genişleme sağlar                            | Mevcut temeli ve tüketici deneyimini gereksiz büyütür                                          | İlk teslimde uygulanmaz                                                   |

## 3. İncelenen mevcut durum

Dayanak commit: `0400a23600d8ddf1161175ab663eed733ee9d6cd`. Kanıtlar kaynak incelemesi ve mevcut Graphify haritasıdır. Bu plan hazırlanırken uygulama kurulumu, build, unit test veya tarayıcı akışları çalıştırılmamıştır.

| Alan       | Mevcut temel                                             | Çözülmesi gereken durum                                                                            |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Teknoloji  | React 19, TypeScript 5, Vite, Tailwind 4, pnpm           | Sürümler ve Node/CI/Docker ortamları tek sözleşmede sabitlenmeli                                   |
| Mimari     | `app`, `core`, `features`; ESLint sınır kuralları        | Sınırlar göreli importlarla da doğrulanmalı; demo ve tüketici kodu ayrılmalı                       |
| UI         | Shadcn/Radix bileşenleri, özel form ve modal bileşenleri | Aynı iş için iki API var; `Modal` alias'ı ile özel modal sistemi karışabiliyor                     |
| Tema       | CSS değişkenleri, UI store ve theme hook                 | `--color-*` ile shadcn semantik token tanımları birlikte kullanılıyor                              |
| Form       | RHF, Zod ve login/register örnekleri                     | Alan/hata/çeviri bağlantıları elle; doğrulama metinleri İngilizce sabit                            |
| Çeviri     | i18next, `en/tr`, common/users namespace                 | Diller ve namespace'ler elle import/kayıt ediliyor; eksik anahtar denetimi yok                     |
| Veri       | Axios, TanStack Query, ayrıca OpenAPI fetch istemcisi    | İki transport davranışı ayrışıyor; tek hata/auth/iptal sözleşmesi gerekiyor                        |
| Tablo      | TanStack Table üzerinde temel DataTable                  | Filtre/URL/selection/manual pagination sözleşmeleri tamamlanmalı                                   |
| Üreticiler | Plop feature/component/hook üreticileri                  | Yeni feature yalnız sabit `en/tr` dosyaları üretiyor; route/namespace bağları eksik                |
| Katalog    | Storybook ve üç temel story dosyası                      | Ortak tema/dil/router/form provider'ları ve durum kapsamı eksik                                    |
| Kalite     | Vitest, Playwright, CI dosyaları                         | Test dosyası varlığı işlev kanıtı değil; root typecheck kapsamı doğrulanmalı                       |
| Dağıtım    | Vite build, nginx/Docker, deploy workflow                | Node 20 tabanı ve kayan pnpm sürümü gözden geçirilmeli; workflow build'i gerçek deploy sayılmamalı |

## 4. Genel mimari kararları

- Tek repo ve tek frontend uygulaması korunur. `src/app` birleştirme/route/provider; `src/core` tekrar kullanılabilir sistemler; `src/features` ürün özellikleri içindir.
- `core` hiçbir `feature` veya `app` dosyasını import etmez. Feature'lar birbirinin iç dosyalarını import etmez. `app` bağımlılıkları birleştirir.
- Bileşenler JSX ile birleştirilebilir. Formlar ve layout'lar kapalı bir JSON renderer'a veya görsel sürükle-bırak editörüne mecbur bırakılmaz.
- Mevcut React/Vite/TypeScript/Tailwind/Radix temeli korunur. Tamamı için toplu major sürüm yükseltmesi yapılmaz. Kurulum anındaki güvenlik ve uyumluluk incelemesiyle gerekli yükseltmeler ayrı kaydedilir.
- Plan varsayımı: Node 24 LTS geliştirme/CI/Docker tabanı; pnpm 10 ailesinden doğrulanmış tam sürüm `packageManager` alanında sabitlenir. Patch sürümleri uygulamanın ilk görevinde seçilip kilitlenir.
- Başlangıç CSS ve JS dosyaları çalışma anında CDN'den yüklenmez. Gerekli font/ikon/tema varlıkları yerel veya paketlenmiş olur.
- React SPA ve statik hosting ilk render modelidir. Public sayfa blokları ve metadata yardımcıları sağlanır; SSR/SSG, sunucuda SEO üretimi ve içerik backend'i bu teslimin parçası değildir. Bunlar ayrı bir render preset'i gerektirir.

## 5. Başlangıç ve örnek uygulama

- Template'in varsayılan açılışı backend istemeyen bir başlangıç sayfasıdır; zorunlu giriş ekranı veya çalışan localhost API şartı yoktur.
- Örnek uygulama, public sayfa, dashboard, kullanıcı listesi/düzenleme, ayarlar, form laboratuvarı ve hata durumlarını içerir.
- Örnekler `src/features/examples` altında ve ayrı lazy route dalında tutulur. Katalog Storybook'tadır; ürün bundle'ına girmez.
- `pnpm setup:project` proje adı, marka, varsayılan dil ve örnekleri tutma tercihini sorar; dry-run ve çakışma kontrolü vardır.
- Örnekleri kaldırma yalnız tanımlı örnek dosyalarını ve route kaydını etkiler; uygulama koduna geniş regex patch'leri uygulanmaz.
- `pnpm doctor` desteklenen araç sürümlerini, env dosyalarını, dil/namespace tutarlılığını ve gerekli yerel asset'leri denetler. Sağlayıcı hesabı veya anahtar istemez.

## 6. Tasarım sistemi ve UI kapsamı

Tek semantik token kaynağı: arka plan, metin, primary/secondary, muted, accent, destructive, border/input/ring, success/warning/info, chart ve sidebar. Renklerin yanında font, radius, spacing, density, shadow ve motion değiştirilebilir.

Tema tek provider'dan yönetilir; light/dark/system seçenekleri, ilk açılışta doğru tema ve bozuk/erişilemeyen storage için güvenli fallback bulunur. Layout ve bileşenler kendi marka renklerini sabitlemez.

İlk tam sürümde hazır olacak UI grupları:

| Grup           | Bileşenler / davranış                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Temel          | Button, button group, icon button, link, badge, avatar, card, typography, separator, skeleton, spinner, empty/error state                   |
| Alanlar        | Input, textarea, password, number, checkbox, radio, switch, select, searchable combobox, multi-select, slider, date/date-range, file picker |
| Etkileşim      | Dialog, alert dialog/confirm, sheet/drawer, popover, tooltip, dropdown/context menu, hover card, toast                                      |
| Navigasyon     | Sidebar, navbar, breadcrumb, tabs, pagination, command palette, collapsible/accordion, scroll area                                          |
| Görsel veri    | Table/DataTable, chart wrapper ve durumları, progress, carousel, resizable panel                                                            |
| Sayfa blokları | AppShell, SiteShell, AuthLayout, PageHeader, PageSection, toolbar, filter bar, stat card, hero, feature grid, pricing, FAQ, CTA, footer     |

Shadcn/Radix davranışları korunur. İlave bağımlılık yalnız somut bileşen ihtiyacı ve lisans/uyumluluk kontrolüyle eklenir. Kullanılmayan gelişmiş bileşenler ve örnekler başlangıç chunk'ına yüklenmez.

## 7. Form ürünü

- `useAppForm` RHF/Zod entegrasyonunu; `FormField` ve alan bileşenleri label/id/hint/error/required bağlantısını standartlaştırır. Geliştirici RHF'nin asıl API'sine erişebilir.
- Şema formun veri tipini belirler; aynı form tipi elle ikinci kez yazılmaz. Girdi ve dönüştürülmüş çıktı tipleri ayrılır.
- Doğrulama hataları anahtar ve parametrelerle temsil edilir; görüntülenirken aktif dile çevrilir. Dil değişimi alan değerlerini, dirty/touched durumunu veya dosya seçimini sıfırlamaz.
- Ortak kurallar required/email/min/max/range/url ve alanlar arası doğrulamayı kapsar. Telefon ve para gibi ülkeye bağlı kurallar yapılandırılabilir; tek ülke formatı dayatılmaz.
- Sunucu benzeri alan ve form hataları bir adapter üzerinden gösterilir. Her backend'in hata formatı aynı kabul edilmez.
- Create/edit, async seçenekler, iptal edilen veya geç dönen istekler, tekrarlı submit engelleme, nested alanlar, field array, koşullu alanlar ve çok adım örnekleri hazır gelir.
- Kirli formdan ayrılma uyarısı router ve tarayıcı kapanışı için kapsanır; taslak saklama opt-in'dir ve parola/dosya gibi alanları varsayılan olarak saklamaz.
- Form üreticisi çalışır kod, şema, çeviri anahtarları, story ve davranış testi iskeleti üretir; yapay zekâ API'si kullanmaz.

## 8. Çeviri ve yerelleştirme

- Canonical dil `en`; `en` ve `tr` başlangıçta tamdır. Yeni dil klasörleri ve namespace dosyaları keşfedilir; merkezî import listesi elle büyütülmez.
- Her dilde `_meta.json` dosyası dil kodu, görünen ad ve `ltr/rtl` yönünü taşır. Runtime registry Vite glob ile, üretici/check araçları dosya sistemi üzerinden aynı kuralla keşfeder.
- Canonical dosyalar type-safe anahtarların kaynağıdır. Dil ve namespace dosyaları ihtiyaca göre yüklenir; tüm diller initial bundle'a eklenmez.
- `generate:locale` canonical anahtar iskeletlerini üretir; gerçek tercüme yapılmış gibi işaretlemez. `generate:namespace` etkin dillerin tamamına dosya ekler.
- `i18n:check` eksik/fazla anahtar, bozuk JSON, tür farkı, interpolation değişkeni ve ilgili dilin plural biçimlerini kontrol eder. Anahtar birebir eşitliği plural doğrulamasının yerine geçmez.
- Desteklenen locale'ler tek manifest'tedir. Taslak diller eksikleri raporlanarak geliştirilebilir; etkin dile alınan eksik çeviri CI'ı durdurur.
- `Intl` tabanlı sayı, para, tarih ve göreli zaman yardımcıları bulunur. Tarih-only değer ile timestamp ayrılır; saat dilimi açıkça yapılandırılır.
- Dil değişimi `html.lang/dir`, form hataları, tablo metinleri, toast'lar ve sayfa başlıklarına yansır. RTL ve uzun çeviri görsel kontrolleri yapılır.

## 9. Veri, URL ve backend sınırı

- Ortak frontend HTTP transport'u Axios olarak kalır; TanStack Query cache ve mutation durumlarını yönetir. OpenAPI type üretimi opsiyoneldir; ayrı auth/retry davranışı olan ikinci istemci bırakılmaz.
- `ApiError`, `PageResult`, `AuthAdapter`, token/header sağlama, abort ve request ID sözleşmeleri backend'den bağımsızdır. İstemciye secret gömülmez.
- Otomatik retry varsayılan olarak güvenli read isteklerine uygulanır; POST/PATCH/DELETE tekrarları açık idempotency kararı gerektirir.
- Demo oturumu memory/mock adapter'dır ve güvenlik garantisi olarak sunulmaz. Frontend route/menu izinleri yalnız görünüm ve navigasyon davranışıdır.
- API base URL tanımlanmamışken starter açılır. API kullanan ekran veri adapter'ı verilmediğini açık bir durumla gösterir.
- Arama/filtre/sıralama/sayfa URL'de paylaşılabilir; geçersiz parametreler normalize edilir. Router yeniden yükleme ve back/forward davranışı korunur.
- DataTable client ve manual/server modlarını açıkça ayırır. Büyük listelerde sanallaştırma ayrı bir opt-in örnektir.
- Dosya bileşenleri seçim/önizleme/istemci doğrulaması/ilerleme ve iptal sözleşmesi sağlar. Gerçek upload servisi verilmez; object URL'ler temizlenir, `accept` güvenlik doğrulaması sayılmaz.

## 10. Opsiyonel ileri parçalar

İlk tam sürümde ayrı import noktaları ve örnekleriyle chart, sanallaştırılmış liste, rich text editörü, command palette ve file upload akışı bulunur. Editör için ücretsiz Tiptap core önerilir; ekleme öncesi bundle/lisans/React uyumluluğu doğrulanır. HTML dışa aktarma/gösterme için güvenli render sınırı ve sanitization gerekir. Bu parçalar ana route'ta eager import edilmez.

Sentry/PostHog adaptörleri ve PWA isteğe bağlıdır. Varsayılan başlangıçta dışarı veri göndermez, service worker kaydetmez ve özel API verisini cache'lemez. PWA tercih edilirse güncelleme ve eski cache davranışı ayrıca test edilir.

## 11. Kanıtlanabilir kalite ve bitiş koşulları

WCAG 2.2 AA hedeflenir; otomatik kontroller erişilebilirlik sertifikası sayılmaz. Kritik akışlarda klavye, odak dönüşü ve ekran okuyucu kontrolü ayrıca yapılır.

| Kontrol             | Tamamlanma ölçütü                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Temiz template      | Node/pnpm kurulu yeni klasörde frozen install, dev, typecheck, lint, test, app build ve Storybook build başarılı; backend/API anahtarı gerekmez |
| Tipler              | App ve araç kodu gerçekten typecheck edilir; bilerek eklenen hatalı fixture denetimin hata yakaladığını gösterir                                |
| Form                | Basit/edit/koşullu/array/wizard örnekleri; dil değişimi veri kaybettirmez; submit/error/focus davranışı testle doğrulanır                       |
| Dil                 | Üçüncü dil ve namespace üretimi merkez dosya editi istemez; eksik çeviri CI'da yakalanır; ar RTL fixture'ı kullanılır                           |
| Görsel              | 360, 768 ve 1440 px; light/dark; en/tr; ayrıca uzun metin ve RTL senaryoları onaylı screenshot'larla karşılaştırılır                            |
| Veri                | Geçerli/geçersiz URL filtreleri, empty/error/loading, iptal ve stale response, client/manual tablo modları doğrulanır                           |
| Mimari              | Relative import kaçakları, örneklerin core'a sızması ve provider ihtiyacı olan bileşenlerin eksik kurulumları tespit edilir                     |
| Bundle              | Varsayılan route'un toplam initial JS hedefi en fazla 200 KiB gzip; heavy örnekler lazy; bütçe aşımı ölçülür ve açıklanmadan geçilmez           |
| Template ergonomisi | Setup dry-run, ikinci çalıştırma, çakışma, rollback ve örnek kaldırma testleri geçer; iki bağımsız tüketici senaryosu çalışır                   |
| Dış etki            | Varsayılan starter açılışında API/analytics/telemetry/CDN isteği yok; testte dış origin istekleri kaydedilir ve kontrol edilir                  |

İlk temiz baseline alınmadan bu ölçütlerden herhangi biri geçmiş kabul edilmez. Geliştirici kurulum süresi için 10 dakika, basit bir doğrulamalı form için 15 dakika ve üçüncü dil iskeleti için 5 dakika kullanılabilirlik hedefidir; ölçülerek raporlanır, ağ hızı dahil sabit süre garantisi verilmez.

## 12. Uygulama sırası

1. Araç/CI baseline ve backend gerektirmeyen açılış.
2. Tek tasarım sistemi, shadcn standardizasyonu ve ortak layout'lar.
3. Ölçeklenen i18n, temel ve gelişmiş form sistemi.
4. Veri/URL sözleşmeleri, tablolar, dosya ve gelişmiş UI parçaları.
5. Template setup/üreticiler, örnek uygulama ve katalog bütünlüğü.
6. Görsel/erişilebilirlik/bundle/temiz template kabulü ve dokümantasyon.

Her dilim kendi davranış testleri ve story'leriyle teslim edilir. Eski bileşenler call site'lar taşınmadan silinmez. Tüm aşamalar bitmeden proje için 10/10 veya eksiksiz prod hazır iddiası kullanılmaz.

## 13. Kapsam dışında

Backend servisleri, veritabanı/migration, gerçek auth/ödeme/mail servisi, cloud hesabı açma, production deploy, merkezi registry yayını, no-code sayfa/form editörü ve otomatik AI çevirisi. Bunlar için frontend sözleşmeleri veya örnek UI bulunabilir; çalışan hizmet gibi sunulmaz.

## 14. Başvuru kaynakları

- [shadcn açık bileşen yaklaşımı](https://ui.shadcn.com/docs)
- [shadcn tema token'ları](https://ui.shadcn.com/docs/theming)
- [Mevcut Radix temeliyle sidebar](https://ui.shadcn.com/docs/components/radix/sidebar)
- [React Hook Form ileri örüntüleri](https://react-hook-form.com/advanced-usage)
- [i18next namespace'ler](https://www.i18next.com/principles/namespaces)
- [i18next TypeScript](https://www.i18next.com/overview/typescript)
- [TanStack Table client/manual sayfalama](https://tanstack.com/table/v8/docs/guide/pagination)
- [Storybook erişilebilirlik kontrolleri](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Node destek politikası](https://nodejs.org/en/about/previous-releases)

Kaynaklar 27 Ekim 2026 tarihinde kontrol edildi. Sürüm özelinde API'ler uygulama aşamasında kilitlenen sürümle tekrar doğrulanır.
