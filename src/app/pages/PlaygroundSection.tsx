import { useState } from 'react'

import {
  Sparkles,
  Terminal,
  Layers,
  Box,
  Copy,
  Check,
  Database,
  FileText,
  ShieldCheck,
  Zap,
  Trash2,
  FileIcon,
} from 'lucide-react'

import { Chart } from '@/core/charts/Chart'
import type { ChartDataPoint } from '@/core/charts/types'
import { FileDropzone } from '@/core/files/FileDropzone'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/core/ui/components/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/core/ui/components/alert-dialog'
import { Avatar, AvatarFallback } from '@/core/ui/components/avatar'
import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'
import { Checkbox } from '@/core/ui/components/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/ui/components/dialog'
import { Input } from '@/core/ui/components/input'
import { Label } from '@/core/ui/components/label'
import { Progress } from '@/core/ui/components/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/components/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/core/ui/components/sheet'
import { Slider } from '@/core/ui/components/slider'
import { toast } from '@/core/ui/components/sonner'
import { Spinner } from '@/core/ui/components/spinner'
import { Switch } from '@/core/ui/components/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/ui/components/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/core/ui/components/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/core/ui/components/tooltip'

// Copy snippet helper hook
function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      toast.success('Komut panoya kopyalandı!')
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  return { copiedKey, copy }
}

const sampleChartData: ChartDataPoint[] = [
  { label: 'Oca', value: 34 },
  { label: 'Şub', value: 48 },
  { label: 'Mar', value: 65 },
  { label: 'Nis', value: 52 },
  { label: 'May', value: 89 },
  { label: 'Haz', value: 110 },
]

interface SampleTableRow {
  id: string
  name: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  commits: number
}

const sampleTableData: SampleTableRow[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    role: 'Frontend Lead',
    status: 'active',
    commits: 142,
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    role: 'UI/UX Designer',
    status: 'active',
    commits: 89,
  },
  {
    id: '3',
    name: 'Can Demir',
    role: 'Fullstack Dev',
    status: 'pending',
    commits: 64,
  },
  {
    id: '4',
    name: 'Elif Şahin',
    role: 'QA Engineer',
    status: 'inactive',
    commits: 38,
  },
]

export function PlaygroundSection() {
  const { copiedKey, copy } = useCopy()

  // Sandbox states
  const [sliderVal, setSliderVal] = useState<number[]>([65])
  const [btnLoading, setBtnLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [tableFilter, setTableFilter] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Mini Form states
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formNotif, setFormNotif] = useState(true)
  const [formAgreed, setFormAgreed] = useState(false)

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Lütfen bir isim belirtin!')
      return
    }
    if (!formAgreed) {
      toast.error('Kullanım şartlarını onaylamalısınız!')
      return
    }

    toast.success('Form başarıyla simüle edildi!', {
      description: `İsim: ${formName} | Rol: ${formRole || 'Belirtilmedi'} | Bildirimler: ${formNotif ? 'Açık' : 'Kapalı'}`,
    })
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === sampleTableData.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(sampleTableData.map((d) => d.id))
    }
  }

  const filteredRows = sampleTableData.filter(
    (row) =>
      row.name.toLowerCase().includes(tableFilter.toLowerCase()) ||
      row.role.toLowerCase().includes(tableFilter.toLowerCase())
  )

  return (
    <div className="space-y-24 py-12">
      {/* 1. ARCHITECTURE & WHAT'S INSIDE */}
      <section id="architecture" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Layers className="size-4" />
            <span>KATMANLI MİMARİ VE İÇERİK</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Projenin İçinde Neler Var?
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Launchpad, ölçeklenebilir ve backend&apos;e bağımlı olmadan çalışan
            tek yönlü (unidirectional) katı bir modül sınırına sahiptir.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  src/core/
                </span>
                <Badge variant="outline">Çekirdek Sistemler</Badge>
              </div>
              <CardTitle className="text-lg">
                Tekrar Kullanılabilir Altyapı
              </CardTitle>
              <CardDescription>
                UI Primitive&apos;leri, RHF Form Motoru, Axios API İstemcisi,
                Tema Token&apos;ları ve Layout Şablonları.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Hiçbir feature veya app dosyasını import edemez. Tamamen izole ve
              saf tutulur.
            </CardContent>
          </Card>

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  src/features/
                </span>
                <Badge variant="outline">Ürün Özellikleri</Badge>
              </div>
              <CardTitle className="text-lg">
                Modüler Feature Paketleri
              </CardTitle>
              <CardDescription>
                Auth, Dashboard, Users, Settings ve Examples vitrini. Her biri
                bağımsız rotalarını export eder.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Feature&apos;lar birbirinin özel dosyalarını import edemez;
              yalnızca public index üzerinden paylaşım yapar.
            </CardContent>
          </Card>

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  src/app/
                </span>
                <Badge variant="outline">Orkestrasyon</Badge>
              </div>
              <CardTitle className="text-lg">Uygulama Birleştirme</CardTitle>
              <CardDescription>
                Dinamik route keşfi (feature-routes.ts), AppProviders (Tema,
                i18n, Query, Auth) ve Shell kabuğu.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Core ve Feature katmanlarını tek çatı altında bağlayan tek
              birleştirici katmandır.
            </CardContent>
          </Card>

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  src/i18n/
                </span>
                <Badge variant="outline">Çoklu Dil</Badge>
              </div>
              <CardTitle className="text-lg">Dinamik Çeviri Motoru</CardTitle>
              <CardDescription>
                Vite glob ile otomatik keşfedilen _meta.json dosyaları, lazy
                namespace yükleyicisi ve çoğul kuralları.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Yeni bir dil veya namespace eklendiğinde merkezi konfigürasyon
              kodunu elle değiştirmek gerekmez.
            </CardContent>
          </Card>

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  scripts/
                </span>
                <Badge variant="outline">Kalite & Üreticiler</Badge>
              </div>
              <CardTitle className="text-lg">
                Otomasyon & CLI Araçları
              </CardTitle>
              <CardDescription>
                check-boundaries (AST kontrolü), check-bundle (200KiB bütçesi),
                verify-template ve Plop jeneratörleri.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Tüm üretimler dry-run ve atomik geri alma (rollback) yeteneğine
              sahiptir.
            </CardContent>
          </Card>

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">
                  .storybook/
                </span>
                <Badge variant="outline">Bileşen Kataloğu</Badge>
              </div>
              <CardTitle className="text-lg">
                Etkileşimli Storybook 10
              </CardTitle>
              <CardDescription>
                37 public bileşen ve 45 alt primitive %100 kapsama oranıyla test
                edilmiş ve belgelenmiştir.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Kural: </span>
              Global toolbar ile tema, dil, yön (RTL/LTR) ve viewport testleri
              yapılabilir.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. CORE FEATURES & CAPABILITIES */}
      <section id="features" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            <span>SAĞLADIĞI YETENEKLER</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Neden Bu Şablonu Kullanmalısınız?
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Sıradan bir frontend boilerplate&apos;inden öte, kurumsal ölçekte
            test edilmiş mimari güvenceler sunar.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                Backend&apos;siz Çalışma Garantisi
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hiçbir .env, veritabanı veya API sunucusu olmadan ilk saniyede
                derlenir ve deterministik çalışır.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">200 KiB Gzip Başlangıç Bütçesi</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ağır grafik, editör ve vitrin sayfaları otomatik lazy yüklenir;
                başlangıç rotası sadece 176 KiB&apos;dir.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Box className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                20+ Erişilebilir Radix Primitive
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Klavye odağı (focus trap), Escape ile çıkış ve ARIA etiketleri
                WCAG 2.2 standartlarında hazırdır.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">Reaktif & Çevrilebilir Formlar</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kullanıcı formu doldururken dil değiştirse bile yazılanlar ve
                odak kaybolmaz; hata mesajları anında çevrilir.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">Çift Modlu DataTable</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                İster istemci taraflı anlık arama/sıralama, ister sunucu taraflı
                kontrollü sayfalama modunda kullanılabilir.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/50">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Terminal className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">Güvenli CLI & Kod Üretimi</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Yeni feature, form, sayfa ve diller tek komutla şablonlanır; tek
                tıkla örnekler projeden temizlenebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE COMPONENT PLAYGROUND */}
      <section id="playground" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Box className="size-4" />
            <span>CANLI BİLEŞEN DENEYİM ALANI</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            İnteraktif Playground
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Bileşenleri, formları, tabloları ve bildirimleri doğrudan bu sayfa
            üzerinden canlı olarak test edin.
          </p>
        </div>

        <Tabs defaultValue="primitives" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 gap-1">
            <TabsTrigger value="primitives" className="py-2 text-xs md:text-sm">
              UI Primitives
            </TabsTrigger>
            <TabsTrigger value="forms" className="py-2 text-xs md:text-sm">
              Form Deneyimi
            </TabsTrigger>
            <TabsTrigger value="tables" className="py-2 text-xs md:text-sm">
              Veri Tablosu
            </TabsTrigger>
            <TabsTrigger value="overlays" className="py-2 text-xs md:text-sm">
              Modallar & Toasts
            </TabsTrigger>
            <TabsTrigger value="charts" className="py-2 text-xs md:text-sm">
              Grafikler
            </TabsTrigger>
            <TabsTrigger value="files" className="py-2 text-xs md:text-sm">
              Dosya Yükleme
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UI PRIMITIVES */}
          <TabsContent value="primitives" className="space-y-6 pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Buttons Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Buton Varyantları & Durumları
                  </CardTitle>
                  <CardDescription>
                    Semantic token&apos;larla uyumlu Tailwind v4 buton stilleri.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      disabled={btnLoading}
                      onClick={() => {
                        setBtnLoading(true)
                        setTimeout(() => setBtnLoading(false), 1500)
                      }}
                    >
                      {btnLoading && <Spinner className="mr-2 size-4" />}
                      {btnLoading ? 'İşleniyor...' : 'Loading Simülasyonu'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Tıklayarak test edin
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Avatars */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Rozetler, Avatarlar & Tooltip
                  </CardTitle>
                  <CardDescription>
                    Durum göstergeleri ve erişilebilir ipuçları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-3 cursor-pointer">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                LP
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                Launchpad User
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Üzerine gelin
                              </p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Radix Tooltip bileşeni aktif!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>

              {/* Sliders & Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Slider & Canlı Progress Senkronizasyonu
                  </CardTitle>
                  <CardDescription>
                    Slider&apos;ı kaydırarak Progress bar&apos;ın nasıl canlı
                    tepki verdiğini gözlemleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Değer Seçici</Label>
                      <span className="font-mono font-medium">
                        %{sliderVal[0]}
                      </span>
                    </div>
                    <Slider
                      value={sliderVal}
                      onValueChange={setSliderVal}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Bağlı İlerleme Çubuğu
                    </Label>
                    <Progress value={sliderVal[0]} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Accordion */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Akordiyon (Accordion)
                  </CardTitle>
                  <CardDescription>
                    Klavye navigasyonu ve animasyonlu açılır kapanır bölümler.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Backend olmadan nasıl test yapılıyor?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        In-memory demoAuth ve deterministic fixture&apos;lar
                        sayesinde ağ istekleri taklit edilir.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        Hangi CSS mimarisi kullanılıyor?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Tailwind CSS v4 ve semantik CSS custom properties
                        (tokens.css) kullanılmaktadır.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: FORMS */}
          <TabsContent value="forms" className="pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      İnteraktif Canlı Form Simülasyonu
                    </CardTitle>
                    <CardDescription>
                      Alan kontrolleri, seçim kutuları ve submit bildirimleri.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    RHF + Zod Uyumu
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSimulatedSubmit}
                  className="max-w-xl space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="demo-name">Tam Adınız</Label>
                    <Input
                      id="demo-name"
                      placeholder="Örn: Aybars Gök"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-role">Rol / Uzmanlık</Label>
                    <Select value={formRole} onValueChange={setFormRole}>
                      <SelectTrigger id="demo-role">
                        <SelectValue placeholder="Rolünüzü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">
                          Frontend Geliştirici
                        </SelectItem>
                        <SelectItem value="backend">Backend Mimarı</SelectItem>
                        <SelectItem value="designer">
                          UI/UX Tasarımcı
                        </SelectItem>
                        <SelectItem value="lead">Proje Yöneticisi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="demo-notif" className="text-sm">
                        E-Posta Bildirimleri
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Güncellemeler için sistem bildirimleri gönderilsin.
                      </p>
                    </div>
                    <Switch
                      id="demo-notif"
                      checked={formNotif}
                      onCheckedChange={setFormNotif}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="demo-agree"
                      checked={formAgreed}
                      onCheckedChange={(checked) =>
                        setFormAgreed(Boolean(checked))
                      }
                    />
                    <label
                      htmlFor="demo-agree"
                      className="text-xs leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Kullanım koşullarını ve gizlilik sözleşmesini kabul
                      ediyorum.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit">Formu Gönder ve Doğrula</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormName('')
                        setFormRole('')
                        setFormAgreed(false)
                        toast.info('Form temizlendi.')
                      }}
                    >
                      Temizle
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: TABLES */}
          <TabsContent value="tables" className="pt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      İnteraktif Veri Tablosu
                    </CardTitle>
                    <CardDescription>
                      Filtreleme, çoklu satır seçimi ve durum etiketleri.
                    </CardDescription>
                  </div>
                  <Input
                    placeholder="Tabloda ara..."
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedRows.length === sampleTableData.length &&
                              sampleTableData.length > 0
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label="Tümünü seç"
                          />
                        </TableHead>
                        <TableHead>Ad Soyad</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">Commit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-muted-foreground"
                          >
                            Aramaya uygun kayıt bulunamadı.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => {
                          const isSelected = selectedRows.includes(row.id)
                          return (
                            <TableRow
                              key={row.id}
                              data-state={isSelected ? 'selected' : undefined}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleSelectRow(row.id)
                                  }
                                  aria-label={`Seç: ${row.name}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {row.name}
                              </TableCell>
                              <TableCell>{row.role}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.status === 'active'
                                      ? 'default'
                                      : row.status === 'pending'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs">
                                {row.commits}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {selectedRows.length > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 p-3 text-sm">
                    <span>
                      <strong>{selectedRows.length}</strong> satır seçildi.
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        toast.success(
                          `${selectedRows.length} kayıt üzerinde işlem simüle edildi.`
                        )
                        setSelectedRows([])
                      }}
                    >
                      Seçilenleri İşle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: OVERLAYS & TOASTS */}
          <TabsContent value="overlays" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Diyaloglar & Drawer (Sheet)
                  </CardTitle>
                  <CardDescription>
                    Erişilebilir Radix dialog ve yan panel modalları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {/* Standard Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Modal Diyaloğu Aç</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modal Penceresi</DialogTitle>
                          <DialogDescription>
                            Bu diyalog klavye Escape tuşuyla kapatılabilir ve
                            odak yönetimini otomatik yapar.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 text-sm text-muted-foreground">
                          Modal pencereleri arka planı kilitler ve ekran
                          okuyucular için ARIA tanımlarını tam uygular.
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => toast.info('Diyalog onaylandı.')}
                          >
                            Anladım
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Sheet Drawer */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="secondary">
                          Yan Paneli Aç (Sheet)
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Yan Panel (Drawer)</SheetTitle>
                          <SheetDescription>
                            Mobil menüler, detay filtreleri veya sepetler için
                            idealdir.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-4 text-sm">
                          <p className="text-muted-foreground">
                            Sağ taraftan açılan yumuşak geçişli responsive
                            çekmece bileşeni.
                          </p>
                          <Button
                            className="w-full"
                            onClick={() => toast.success('İşlem tamam!')}
                          >
                            Eylemi Gerçekleştir
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* Alert Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Onay Diyaloğu</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            İşlemi onaylıyor musunuz?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem simülatif olarak geri alınamaz bir aksiyonu
                            temsil eder.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              toast.error('Kayıt silme işlemi simüle edildi!')
                            }
                          >
                            Evet, Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Sonner Toast Bildirimleri
                  </CardTitle>
                  <CardDescription>
                    Kullanıcı eylemlerine anlık geri bildirim sağlayın.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                      onClick={() =>
                        toast.success('İşlem başarıyla tamamlandı!')
                      }
                    >
                      Başarılı Bildirim
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                      onClick={() =>
                        toast.error('Bir hata oluştu, lütfen tekrar deneyin!')
                      }
                    >
                      Hata Bildirimi
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                      onClick={() => toast.info('Yeni bir güncelleme mevcut.')}
                    >
                      Bilgi Bildirimi
                    </Button>
                    <Button
                      variant="outline"
                      className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() =>
                        toast('Geri alma seçeneği', {
                          action: {
                            label: 'Geri Al',
                            onClick: () => toast.info('Geri alındı!'),
                          },
                        })
                      }
                    >
                      Eylemli Toast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 5: CHARTS */}
          <TabsContent value="charts" className="pt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      SVG Veri Görselleştirme (Chart)
                    </CardTitle>
                    <CardDescription>
                      Erişilebilir, hafif, harici ağır kütüphane istemeyen SVG
                      grafik motoru.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      onClick={() => setChartType('bar')}
                    >
                      Bar Grafiği
                    </Button>
                    <Button
                      size="sm"
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      onClick={() => setChartType('line')}
                    >
                      Çizgi Grafiği
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 bg-card/60">
                  <Chart
                    data={sampleChartData}
                    config={{
                      type: chartType,
                      title: 'Aylık Aktivite Dağılımı',
                      description:
                        'Son 6 ayın simüle edilmiş aktivite verileri',
                      formatValue: (v) => `${v} adet`,
                      height: 240,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: FILES */}
          <TabsContent value="files" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Dosya Yükleme & Önizleme (FileDropzone)
                </CardTitle>
                <CardDescription>
                  Sürükle-bırak desteği, boyut/MIME kontrolü ve bellek
                  sızıntısını önleyen unmount temizliği.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileDropzone
                  onFilesSelected={(files) => {
                    setUploadedFiles((prev) => [...prev, ...files])
                    toast.success(`${files.length} dosya seçildi.`)
                  }}
                  policy={{
                    maxFiles: 5,
                    maxSizeBytes: 5 * 1024 * 1024,
                  }}
                  title="Dosyaları buraya sürükleyin veya tıklayarak seçin"
                  subtitle="Maksimum 5 dosya (Her biri en fazla 5MB)"
                />

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Seçilen Dosyalar ({uploadedFiles.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setUploadedFiles([])
                          toast.info('Tüm dosyalar kaldırıldı.')
                        }}
                      >
                        Tümünü Temizle
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={`${file.name}-${idx}`}
                          className="flex items-center justify-between rounded-lg border p-2.5 bg-muted/40 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileIcon className="size-4 shrink-0 text-primary" />
                            <span className="truncate font-medium">
                              {file.name}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setUploadedFiles((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* 4. DEVELOPER RECIPES (HOW-TO & CLI) */}
      <section id="how-to" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Terminal className="size-4" />
            <span>GELİŞTİRİCİ REHBERİ</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Neyi Nasıl Yaparım?
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Tekrarlayan işleri sıfırdan yazmayın; Launchpad&apos;in yerleşik CLI
            komutları ve şablonları sizin yerinize halletsin.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Recipe 1 */}
          <div className="rounded-xl border border-border/70 p-5 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                01. Yeni Feature Üretimi
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono"
                onClick={() => copy('r1', 'pnpm generate:feature blog')}
              >
                {copiedKey === 'r1' ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                Kopyala
              </Button>
            </div>
            <h3 className="font-semibold text-foreground">
              Yeni bir modüler ürün özelliği ekleyin
            </h3>
            <p className="text-xs text-muted-foreground">
              Sayfası, tipleri, rotaları ve TR/EN i18n iskeletiyle eksiksiz bir
              feature oluşturur.
            </p>
            <pre className="rounded-md bg-muted p-2.5 font-mono text-xs overflow-x-auto text-primary">
              pnpm generate:feature blog
            </pre>
          </div>

          {/* Recipe 2 */}
          <div className="rounded-xl border border-border/70 p-5 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                02. Doğrulamalı Form Üretimi
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono"
                onClick={() =>
                  copy('r2', 'pnpm generate:form contact --feature blog')
                }
              >
                {copiedKey === 'r2' ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                Kopyala
              </Button>
            </div>
            <h3 className="font-semibold text-foreground">
              Zod şemalı erişilebilir form ekleyin
            </h3>
            <p className="text-xs text-muted-foreground">
              RHF sarmalayıcısı, Zod doğrulama şeması, test dosyası ve Storybook
              hikayesi otomatik üretilir.
            </p>
            <pre className="rounded-md bg-muted p-2.5 font-mono text-xs overflow-x-auto text-primary">
              pnpm generate:form contact --feature blog
            </pre>
          </div>

          {/* Recipe 3 */}
          <div className="rounded-xl border border-border/70 p-5 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                03. Yeni Dil (Locale) Eklemek
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono"
                onClick={() =>
                  copy(
                    'r3',
                    'pnpm generate:locale de --name Deutsch --direction ltr'
                  )
                }
              >
                {copiedKey === 'r3' ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                Kopyala
              </Button>
            </div>
            <h3 className="font-semibold text-foreground">
              Tüm namespace&apos;ler için taslak dil iskeleti
            </h3>
            <p className="text-xs text-muted-foreground">
              Canonical EN kaynaklarından tüm anahtarları kopyalar ve draft
              modunda güvenle açar.
            </p>
            <pre className="rounded-md bg-muted p-2.5 font-mono text-xs overflow-x-auto text-primary">
              pnpm generate:locale de --name Deutsch --direction ltr
            </pre>
          </div>

          {/* Recipe 4 */}
          <div className="rounded-xl border border-border/70 p-5 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                04. Örnekleri Temizleme (Clean Template)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono"
                onClick={() => copy('r4', 'pnpm examples:remove')}
              >
                {copiedKey === 'r4' ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                Kopyala
              </Button>
            </div>
            <h3 className="font-semibold text-foreground">
              Üretime hazır temiz şablona geçiş
            </h3>
            <p className="text-xs text-muted-foreground">
              Manifest kurallarına göre demo ekranları ve rotaları güvenle
              kaldırır; kod tabanını tertemiz bırakır.
            </p>
            <pre className="rounded-md bg-muted p-2.5 font-mono text-xs overflow-x-auto text-primary">
              pnpm examples:remove
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
