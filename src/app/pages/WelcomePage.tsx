import { Suspense, lazy, useContext, useState, useEffect } from 'react'

import {
  Sparkles,
  Box,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Command,
} from 'lucide-react'
import { Link } from 'react-router'

import { projectConfig } from '@/config/project'
import type { ProjectConfig } from '@/config/project'
import type { CommandPaletteItem } from '@/core/blocks/CommandPalette'
import { ThemeContext } from '@/core/theme/context'
import { Badge } from '@/core/ui/components/badge'
import { Button, buttonVariants } from '@/core/ui/components/button'
import { toast } from '@/core/ui/components/sonner'
import { ThemeToggle } from '@/core/ui/components/theme-switcher'

const PlaygroundSection = lazy(() =>
  import('./PlaygroundSection').then((mod) => ({
    default: mod.PlaygroundSection,
  }))
)

const CommandPalette = lazy(() =>
  import('@/core/blocks/CommandPalette').then((mod) => ({
    default: mod.CommandPalette,
  }))
)

function SafeThemeToggle() {
  const theme = useContext(ThemeContext)
  if (!theme) return null
  return <ThemeToggle />
}

export function WelcomePage({
  config = projectConfig,
}: {
  config?: ProjectConfig
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [playgroundTab, setPlaygroundTab] = useState('primitives')

  // Global keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const jumpToTab = (tabName: string) => {
    setPlaygroundTab(tabName)
    document
      .getElementById('playground')
      ?.scrollIntoView({ behavior: 'smooth' })
    setPaletteOpen(false)
  }

  const paletteItems: CommandPaletteItem[] = [
    {
      id: 'jump-arch',
      title: 'Mimari ve Katmanlar',
      description: 'Projenin iç yapısı ve dosya sınırları',
      group: 'Gezinme',
      onSelect: () => {
        document
          .getElementById('architecture')
          ?.scrollIntoView({ behavior: 'smooth' })
        setPaletteOpen(false)
      },
    },
    {
      id: 'jump-features',
      title: 'Sağlanan Yetenekler',
      description: 'Sıfır backend, token sistemi ve kalite kapıları',
      group: 'Gezinme',
      onSelect: () => {
        document
          .getElementById('features')
          ?.scrollIntoView({ behavior: 'smooth' })
        setPaletteOpen(false)
      },
    },
    {
      id: 'jump-playground',
      title: 'Canlı Bileşen Deneyim Alanı',
      description: 'Butonlar, formlar, tablolar ve modallar',
      group: 'Gezinme',
      onSelect: () => jumpToTab('primitives'),
    },
    {
      id: 'jump-forms',
      title: 'Formlar ve Doğrulama Simülasyonu',
      description: 'Zod uyumlu dinamik form kontrolleri ve state takipçisi',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('forms'),
    },
    {
      id: 'jump-tables',
      title: 'İnteraktif Veri Tablosu',
      description: 'Sıralama, sayfalama ve satır seçimi kontrolleri',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('tables'),
    },
    {
      id: 'jump-overlays',
      title: 'Modallar, Yan Paneller & Toasts',
      description: 'Radix Dialog, Sheet, AlertDialog ve Sonner bildirimleri',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('overlays'),
    },
    {
      id: 'jump-charts',
      title: 'SVG Veri Grafikleri',
      description: 'Hafif ve erişilebilir SVG görselleştirme',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('charts'),
    },
    {
      id: 'jump-files',
      title: 'Dosya Yükleme (Dropzone)',
      description: 'Sürükle bırak dosya yükleme ve doğrulama',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('files'),
    },
    {
      id: 'jump-enterprise',
      title: 'Kurumsal Altyapı & Yetenekler (Enterprise Stack)',
      description: 'PostHog Analytics, i18n, Feature Flags ve Web Vitals',
      group: 'Playground Sekmeleri',
      onSelect: () => jumpToTab('enterprise'),
    },
    {
      id: 'jump-howto',
      title: 'Geliştirici Rehberi & CLI',
      description: 'Feature, form ve dil üretme komutları',
      group: 'Gezinme',
      onSelect: () => {
        document
          .getElementById('how-to')
          ?.scrollIntoView({ behavior: 'smooth' })
        setPaletteOpen(false)
      },
    },
    {
      id: 'cmd-copy-check',
      title: 'Kalite Kontrol Komutunu Kopyala (pnpm check)',
      description: 'Tüm statik kapıları ve testleri çalıştırır',
      group: 'Hızlı Eylemler',
      onSelect: () => {
        navigator.clipboard.writeText('pnpm check')
        toast.success('`pnpm check` panoya kopyalandı!')
        setPaletteOpen(false)
      },
    },
    {
      id: 'cmd-copy-gen-feature',
      title: 'Yeni Feature Üretme Komutunu Kopyala',
      description: 'pnpm generate:feature <isim>',
      group: 'Hızlı Eylemler',
      onSelect: () => {
        navigator.clipboard.writeText('pnpm generate:feature blog')
        toast.success('Komut panoya kopyalandı!')
        setPaletteOpen(false)
      },
    },
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 sm:px-10">
      {/* GLOBAL COMMAND PALETTE (CTRL+K) */}
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            items={paletteItems}
            placeholder="Bir komut veya bölüm arayın..."
            emptyMessage="Eşleşen komut bulunamadı."
          />
        </Suspense>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/40 bg-background/85 py-4 backdrop-blur-md">
        <Link
          to={config.homePath}
          className="flex items-center gap-3 font-semibold transition-opacity hover:opacity-90"
        >
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs"
          >
            {config.brand.mark}
          </span>
          <span className="text-lg tracking-tight">{config.name}</span>
        </Link>

        {/* Navigation Anchors */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a
            href="#architecture"
            className="transition-colors hover:text-foreground"
          >
            Mimari
          </a>
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Yetenekler
          </a>
          <a
            href="#playground"
            className="transition-colors hover:text-foreground"
          >
            Playground
          </a>
          <a href="#how-to" className="transition-colors hover:text-foreground">
            Rehberler
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 items-center gap-2 text-xs text-muted-foreground sm:inline-flex cursor-pointer"
            onClick={() => setPaletteOpen(true)}
            aria-label="Komut arama paletini aç"
          >
            <Command className="size-3.5" />
            <span>Ara...</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </Button>

          <SafeThemeToggle />

          <span className="hidden rounded-full border border-border/80 px-2.5 py-1 text-xs text-muted-foreground lg:inline-flex">
            Ready to make yours
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main
        id="main-content"
        className="flex flex-1 flex-col justify-center pt-16 pb-12 sm:pt-24 sm:pb-16"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            No backend required
          </p>
          <Badge variant="outline" className="text-[11px] font-mono">
            v1.0 Certified
          </Badge>
        </div>

        <h1 className="mt-4 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          Your next frontend starts here.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {config.brand.tagline} Your frontend is running. No account, API key,
          or environment file needed.
        </p>

        {/* Key Stats Ribbon */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-3xl">
          <div className="rounded-xl border border-border/60 p-3 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-green-500" />
              <span>Sıfır Backend</span>
            </div>
            <div className="mt-1 text-lg font-bold">100% Bağımsız</div>
          </div>
          <div className="rounded-xl border border-border/60 p-3 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="size-4 text-amber-500" />
              <span>Initial JS Closure</span>
            </div>
            <div className="mt-1 text-lg font-bold">182 KiB Gzip</div>
          </div>
          <div className="rounded-xl border border-border/60 p-3 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Box className="size-4 text-primary" />
              <span>UI Primitives</span>
            </div>
            <div className="mt-1 text-lg font-bold">35+ Bileşen</div>
          </div>
          <div className="rounded-xl border border-border/60 p-3 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe2 className="size-4 text-blue-500" />
              <span>Çoklu Dil (i18n)</span>
            </div>
            <div className="mt-1 text-lg font-bold">Dinamik & Lazy</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#playground" className={buttonVariants({ size: 'lg' })}>
            <Sparkles className="mr-2 size-4" />
            Canlı Playground&apos;u Aç
          </a>
          <a
            href="#make-it-yours"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Make it yours
          </a>
          {config.examplesEnabled && (
            <Link
              to="/login"
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              Explore example screens
              <ArrowRight className="ml-2 size-4" />
            </Link>
          )}
        </div>

        {/* 2. THE COMPREHENSIVE PLAYGROUND SECTION */}
        <Suspense
          fallback={
            <div className="py-16 text-center text-sm text-muted-foreground">
              Bileşen ve mimari deneyim alanı yükleniyor...
            </div>
          }
        >
          <PlaygroundSection
            activeTab={playgroundTab}
            onTabChange={setPlaygroundTab}
          />
        </Suspense>

        {/* 3. MAKE IT YOURS (01 / 02 / 03 STEPS) */}
        <section
          id="make-it-yours"
          aria-labelledby="customize-title"
          className="mt-12 grid gap-8 border-t pt-12 sm:grid-cols-3"
        >
          <div className="space-y-3">
            <h2
              id="customize-title"
              className="font-semibold text-lg flex items-center gap-2"
            >
              <span className="font-mono text-sm text-primary">01 /</span>
              Set your identity
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Choose your name, brand, and starting page in{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
                src/config/project.ts
              </code>
              .
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="font-mono text-sm text-primary">02 /</span>
              Build your first screen
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Start with the shared components and add your product in{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                src/features
              </code>
              .
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="font-mono text-sm text-primary">03 /</span>
              Connect when ready
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Keep building locally. Add a public API URL when your product
              needs one. Example screens may require a configured API.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-col gap-4 border-t py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>{config.name} · Built to be your starting point.</div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <a
            href="#architecture"
            className="transition-colors hover:text-foreground"
          >
            Mimari
          </a>
          <a
            href="#playground"
            className="transition-colors hover:text-foreground"
          >
            Playground
          </a>
          {config.examplesEnabled && (
            <Link
              to="/login"
              className="transition-colors hover:text-foreground"
            >
              Örnek Ekranlar
            </Link>
          )}
        </div>
      </footer>
    </div>
  )
}
