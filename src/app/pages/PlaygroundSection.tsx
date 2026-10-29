import { useState, useId } from 'react'

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
  Search,
  ArrowUpDown,
  MoreHorizontal,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle2,
  User,
  Mail,
  Briefcase,
  Download,
  FileCode,
  ImageIcon,
  SlidersHorizontal,
  Code2,
  CheckCircle,
  RefreshCw,
  Activity,
  Bot,
  Gauge,
  Globe2,
  Send,
  Eye,
  RotateCcw,
  Server,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { trackEvent, identifyUser, trackPageView } from '@/core/analytics'
import { Chart } from '@/core/charts/Chart'
import type { ChartDataPoint } from '@/core/charts/types'
import { useFeatureFlagStore } from '@/core/feature-flags'
import { FileDropzone } from '@/core/files/FileDropzone'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/core/ui/components/accordion'
import { Alert, AlertTitle, AlertDescription } from '@/core/ui/components/alert'
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/core/ui/components/avatar'
import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/core/ui/components/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/core/ui/components/empty'
import { Input } from '@/core/ui/components/input'
import { Label } from '@/core/ui/components/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/core/ui/components/popover'
import { Progress } from '@/core/ui/components/progress'
import { RadioGroup, RadioGroupItem } from '@/core/ui/components/radio-group'
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
import { Skeleton } from '@/core/ui/components/skeleton'
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
import { Textarea } from '@/core/ui/components/textarea'
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

// Chart dataset presets
const chartDatasets: Record<
  string,
  { title: string; description: string; data: ChartDataPoint[]; unit: string }
> = {
  users: {
    title: 'Aylık Aktif Kullanıcılar (MAU)',
    description: 'Son 6 ayın aktif kullanıcı büyüme grafiği',
    unit: 'kullanıcı',
    data: [
      { label: 'Oca', value: 1240 },
      { label: 'Şub', value: 1850 },
      { label: 'Mar', value: 2420 },
      { label: 'Nis', value: 3100 },
      { label: 'May', value: 4250 },
      { label: 'Haz', value: 5800 },
    ],
  },
  requests: {
    title: 'Haftalık API Çağrı Dağılımı',
    description: 'Mikroservisler arası günlük istek adetleri',
    unit: 'bin istek',
    data: [
      { label: 'Pzt', value: 142 },
      { label: 'Sal', value: 198 },
      { label: 'Çar', value: 235 },
      { label: 'Per', value: 280 },
      { label: 'Cum', value: 320 },
      { label: 'Cmt', value: 110 },
      { label: 'Paz', value: 85 },
    ],
  },
  sprints: {
    title: 'Sprint Tamamlama Skoru (%)',
    description: 'Son sprintlerde teslim edilen hikaye puanları',
    unit: '%',
    data: [
      { label: 'Sprint 21', value: 78 },
      { label: 'Sprint 22', value: 85 },
      { label: 'Sprint 23', value: 92 },
      { label: 'Sprint 24', value: 89 },
      { label: 'Sprint 25', value: 97 },
    ],
  },
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  commits: number
  avatarFallback: string
}

interface AnalyticsEventLog {
  id: string
  time: string
  type: 'track' | 'identify' | 'pageview'
  name: string
  payload: Record<string, unknown>
}

const initialTeamData: TeamMember[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@launchpad.dev',
    role: 'Frontend Lead',
    status: 'active',
    commits: 342,
    avatarFallback: 'AY',
  },
  {
    id: '2',
    name: 'Zeynep Kaya',
    email: 'zeynep.kaya@launchpad.dev',
    role: 'Product Designer',
    status: 'active',
    commits: 189,
    avatarFallback: 'ZK',
  },
  {
    id: '3',
    name: 'Can Demir',
    email: 'can.demir@launchpad.dev',
    role: 'Fullstack Dev',
    status: 'pending',
    commits: 94,
    avatarFallback: 'CD',
  },
  {
    id: '4',
    name: 'Elif Şahin',
    email: 'elif.sahin@launchpad.dev',
    role: 'QA Automation',
    status: 'inactive',
    commits: 62,
    avatarFallback: 'EŞ',
  },
  {
    id: '5',
    name: 'Mehmet Çelik',
    email: 'mehmet.celik@launchpad.dev',
    role: 'DevOps & SRE',
    status: 'active',
    commits: 215,
    avatarFallback: 'MÇ',
  },
  {
    id: '6',
    name: 'Selin Acar',
    email: 'selin.acar@launchpad.dev',
    role: 'Security Specialist',
    status: 'active',
    commits: 148,
    avatarFallback: 'SA',
  },
  {
    id: '7',
    name: 'Burak Yıldız',
    email: 'burak.yildiz@launchpad.dev',
    role: 'Backend Architect',
    status: 'pending',
    commits: 110,
    avatarFallback: 'BY',
  },
]

interface PlaygroundSectionProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function PlaygroundSection({
  activeTab: controlledTab,
  onTabChange,
}: PlaygroundSectionProps = {}) {
  const { copiedKey, copy } = useCopy()
  const formNameId = useId()
  const formEmailId = useId()
  const formRoleId = useId()
  const formBioId = useId()
  const formNotifId = useId()
  const formAgreeId = useId()

  // Tab State (Uncontrolled or Controlled)
  const [internalTab, setInternalTab] = useState('primitives')
  const currentTab = controlledTab ?? internalTab
  const handleTabChange = (val: string) => {
    setInternalTab(val)
    onTabChange?.(val)
  }

  // Primitives Sandbox States
  const [sliderVal, setSliderVal] = useState<number[]>([65])
  const [btnLoading, setBtnLoading] = useState(false)
  const [demoSwitch, setDemoSwitch] = useState(true)
  const [skeletonSimulating, setSkeletonSimulating] = useState(false)

  // Form States
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formWorkMode, setFormWorkMode] = useState('remote')
  const [formBio, setFormBio] = useState('')
  const [formNotif, setFormNotif] = useState(true)
  const [formAgreed, setFormAgreed] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Table States
  const [teamData, setTeamData] = useState<TeamMember[]>(initialTeamData)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [tableFilter, setTableFilter] = useState('')
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<keyof TeamMember>('commits')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tablePage, setTablePage] = useState(1)
  const pageSize = 4

  // Overlays States
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('developer')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [telemetryEnabled, setTelemetryEnabled] = useState(true)

  // Chart States
  const [activeChartKey, setActiveChartKey] = useState<string>('users')
  const [chartLoading, setChartLoading] = useState(false)
  const [chartEmpty, setChartEmpty] = useState(false)

  // Files States
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // Enterprise Stack & Capabilities States
  const { t, i18n } = useTranslation(['common', 'examples'])
  const flagStore = useFeatureFlagStore()

  const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsEventLog[]>([
    {
      id: 'evt-init',
      time: '14:20:00',
      type: 'track',
      name: 'app_session_started',
      payload: { platform: 'web', version: '1.0.0', headless_mode: true },
    },
    {
      id: 'evt-view',
      time: '14:20:01',
      type: 'pageview',
      name: 'page_view',
      payload: { path: '/', title: 'Welcome & Enterprise Showcase' },
    },
  ])

  // Feature Flag Local States (synced with store overrides)
  const [flagBetaAI, setFlagBetaAI] = useState<boolean>(
    () =>
      flagStore.overrides['beta-features'] ??
      flagStore.flags['beta-features'] ??
      false
  )
  const [flagNewDashboard, setFlagNewDashboard] = useState<boolean>(
    () =>
      flagStore.overrides['new-dashboard'] ??
      flagStore.flags['new-dashboard'] ??
      false
  )
  const [flagMaintenance, setFlagMaintenance] = useState<boolean>(
    () =>
      flagStore.overrides['maintenance-mode'] ??
      flagStore.flags['maintenance-mode'] ??
      false
  )

  // API Resilience Simulator State
  const [apiSimulating, setApiSimulating] = useState(false)
  const [apiResult, setApiResult] = useState<{
    endpoint: string
    idempotencyKey: string
    latencyMs: number
    status: number
    retriesAttempted: number
  } | null>(null)

  // Form Validation logic
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isFormValid = Boolean(
    formName.trim() && isEmailValid(formEmail) && formRole && formAgreed
  )

  const handleFillDemoForm = () => {
    setFormName('Aybars Gök')
    setFormEmail('aybars@launchpad.dev')
    setFormRole('frontend')
    setFormWorkMode('remote')
    setFormBio(
      'Launchpad starter üzerinde ölçeklenebilir kurumsal mimari geliştiricisi.'
    )
    setFormNotif(true)
    setFormAgreed(true)
    setFormSubmitted(false)
    toast.info('Form demo verisiyle otomatik dolduruldu!')
  }

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!formName.trim()) {
      toast.error('Lütfen adınızı ve soyadınızı belirtin!')
      return
    }
    if (!isEmailValid(formEmail)) {
      toast.error('Lütfen geçerli bir kurumsal e-posta adresi girin!')
      return
    }
    if (!formRole) {
      toast.error('Lütfen bir uzmanlık rolü seçin!')
      return
    }
    if (!formAgreed) {
      toast.error(
        'Kullanım şartlarını ve gizlilik sözleşmesini onaylamalısınız!'
      )
      return
    }

    setFormSubmitting(true)
    setTimeout(() => {
      setFormSubmitting(false)
      toast.success('Form başarıyla doğrulandı ve gönderildi!', {
        description: `${formName} (${formEmail}) - Rol: ${formRole.toUpperCase()}`,
      })
    }, 700)
  }

  // Table filtering and sorting
  const filteredRows = teamData
    .filter((row) => {
      const matchesSearch =
        row.name.toLowerCase().includes(tableFilter.toLowerCase()) ||
        row.email.toLowerCase().includes(tableFilter.toLowerCase()) ||
        row.role.toLowerCase().includes(tableFilter.toLowerCase())
      const matchesStatus =
        tableStatusFilter === 'all' || row.status === tableStatusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB), 'tr')
        : String(valB).localeCompare(String(valA), 'tr')
    })

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const paginatedRows = filteredRows.slice(
    (tablePage - 1) * pageSize,
    tablePage * pageSize
  )

  const handleSort = (key: keyof TeamMember) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAllPage = () => {
    const pageIds = paginatedRows.map((r) => r.id)
    const isAllSelected = pageIds.every((id) => selectedRows.includes(id))
    if (isAllSelected) {
      setSelectedRows((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...pageIds])))
    }
  }

  const handleDeleteUser = (id: string, name: string) => {
    setTeamData((prev) => prev.filter((u) => u.id !== id))
    setSelectedRows((prev) => prev.filter((r) => r !== id))
    toast.success(`${name} başarıyla listeden kaldırıldı.`)
  }

  // Invite Modal Submission
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailValid(inviteEmail)) {
      toast.error('Lütfen geçerli bir e-posta adresi girin!')
      return
    }
    setInviteLoading(true)
    setTimeout(() => {
      setInviteLoading(false)
      setInviteModalOpen(false)
      setInviteEmail('')
      toast.success('Davet e-postası başarıyla iletildi!', {
        description: `${inviteEmail} adresine aktivasyon linki gönderildi.`,
      })
    }, 600)
  }

  // File upload simulation
  const handleFilesChosen = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setUploadProgress(15)
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval)
          setTimeout(() => setUploadProgress(null), 1200)
          toast.success(
            `${files.length} dosya başarıyla doğrulandı ve yüklendi!`
          )
          return 100
        }
        return p + 25
      })
    }, 150)
  }

  // Enterprise Stack Actions
  const handleTrackEventDemo = (
    name: string,
    payload: Record<string, unknown>
  ) => {
    trackEvent(name, payload)
    const newEntry: AnalyticsEventLog = {
      id: `evt-${Date.now().toString(36)}`,
      time: new Date().toLocaleTimeString(),
      type: 'track',
      name,
      payload,
    }
    setAnalyticsLogs((prev) => [newEntry, ...prev.slice(0, 5)])
    toast.info(`PostHog Olayı Yakalandı: ${name}`, {
      description: 'Payload başarıyla yakalandı ve log terminaline işlendi.',
    })
  }

  const handleIdentifyDemo = () => {
    const userId = 'usr_enterprise_882'
    const props = { plan: 'enterprise', role: 'tech_lead', mfa: true }
    identifyUser(userId, props)
    const newEntry: AnalyticsEventLog = {
      id: `evt-${Date.now().toString(36)}`,
      time: new Date().toLocaleTimeString(),
      type: 'identify',
      name: `identifyUser(${userId})`,
      payload: props,
    }
    setAnalyticsLogs((prev) => [newEntry, ...prev.slice(0, 5)])
    toast.success('Kullanıcı Kimliği İletildi', {
      description:
        'PostHog oturum kaydı ve kullanıcı profili ilişkilendirildi.',
    })
  }

  const handlePageViewDemo = () => {
    trackPageView(window.location.href)
    const newEntry: AnalyticsEventLog = {
      id: `evt-${Date.now().toString(36)}`,
      time: new Date().toLocaleTimeString(),
      type: 'pageview',
      name: 'page_view',
      payload: { path: window.location.pathname, title: document.title },
    }
    setAnalyticsLogs((prev) => [newEntry, ...prev.slice(0, 5)])
    toast.info('Sayfa Ziyareti Kaydedildi', {
      description: `${window.location.pathname} adresi SPA analiz motoruna iletildi.`,
    })
  }

  const handleToggleFlag = (
    key: 'beta-features' | 'new-dashboard' | 'maintenance-mode',
    currentVal: boolean,
    setter: (v: boolean) => void
  ) => {
    const nextVal = !currentVal
    setter(nextVal)
    flagStore.setOverride(key, nextVal)
    toast.info(`Bayrak Değiştirildi: ${key} -> ${nextVal ? 'Açık' : 'Kapalı'}`)
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    try {
      localStorage.setItem('preferred-locale', lang)
    } catch {
      // safe
    }
    toast.success(
      lang === 'tr'
        ? 'Uygulama dili Türkçe (TR) olarak seçildi.'
        : 'Application language set to English (EN).'
    )
  }

  const handleSimulateApiCall = () => {
    setApiSimulating(true)
    const idempotencyKey = `req_${Math.random().toString(36).substring(2, 9)}`
    setTimeout(() => {
      setApiSimulating(false)
      setApiResult({
        endpoint: 'POST /api/v1/orders/checkout',
        idempotencyKey,
        latencyMs: 184,
        status: 200,
        retriesAttempted: 0,
      })
      toast.success('API İsteği Başarılı (200 OK)', {
        description: `Idempotency anahtarı doğrulandı. Gecikme: 184ms`,
      })
    }, 600)
  }

  const getFileBadgeColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || ''))
      return 'text-blue-500 bg-blue-500/10'
    if (['pdf'].includes(ext || '')) return 'text-red-500 bg-red-500/10'
    if (['ts', 'tsx', 'js', 'json'].includes(ext || ''))
      return 'text-amber-500 bg-amber-500/10'
    return 'text-primary bg-primary/10'
  }

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
          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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

          <Card className="border-border/60 transition-all hover:border-primary/50 hover:shadow-md">
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
          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
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

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">200 KiB Gzip Başlangıç Bütçesi</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ağır grafik ve form modülleri otomatik lazy yüklenir; başlangıç
                paketi 182 KiB ile bütçe altında kalır.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Box className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                35+ Erişilebilir Radix Primitive
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Klavye odağı (focus trap), Escape ile çıkış ve ARIA etiketleri
                WCAG 2.2 standartlarında hazırdır.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
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

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
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

          <div className="flex gap-4 rounded-xl border border-border/60 p-5 bg-card/60 transition-all hover:border-primary/40">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
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

        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto p-1.5 gap-1.5 bg-muted/60 border border-border/40 rounded-xl">
            <TabsTrigger
              value="primitives"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <Box className="size-4" />
              <span>UI Primitives</span>
            </TabsTrigger>
            <TabsTrigger
              value="forms"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <FileText className="size-4" />
              <span>Form Deneyimi</span>
            </TabsTrigger>
            <TabsTrigger
              value="tables"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <Database className="size-4" />
              <span>Veri Tablosu</span>
            </TabsTrigger>
            <TabsTrigger
              value="overlays"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <Layers className="size-4" />
              <span>Modallar & Toasts</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <SlidersHorizontal className="size-4" />
              <span>Grafikler</span>
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer"
            >
              <Download className="size-4" />
              <span>Dosya Yükleme</span>
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="py-2.5 gap-2 text-xs md:text-sm cursor-pointer font-semibold text-primary"
            >
              <Activity className="size-4" />
              <span>Kurumsal Stack</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UI PRIMITIVES */}
          <TabsContent value="primitives" className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Buttons Card */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">
                    Buton Varyantları & Boyutları
                  </CardTitle>
                  <CardDescription>
                    Tailwind v4 token&apos;larıyla uyumlu, erişilebilir buton
                    setleri.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Varyantlar
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Boyutlar ve İkonlar
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm">Küçük (sm)</Button>
                      <Button size="default">Standart</Button>
                      <Button size="lg">Büyük (lg)</Button>
                      <Button size="icon" aria-label="Yıldızla">
                        <Sparkles className="size-4" />
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="size-4" />
                        İndir
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                    <Button
                      disabled={btnLoading}
                      onClick={() => {
                        setBtnLoading(true)
                        setTimeout(() => {
                          setBtnLoading(false)
                          toast.success('İşlem tamamlandı!')
                        }, 1200)
                      }}
                    >
                      {btnLoading && <Spinner className="mr-2 size-4" />}
                      {btnLoading ? 'İşleniyor...' : 'Loading Simülasyonu'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Spinner durumunu test edin
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Avatars */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">
                    Rozetler, Avatarlar & Tooltip
                  </CardTitle>
                  <CardDescription>
                    Durum göstergeleri, avatarlar ve erişilebilir ipuçları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Rozet (Badge) Stilleri
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Canlı Aktif
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Avatarlar ve Avatar Grubu
                    </span>
                    <div className="flex items-center justify-between">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-3 cursor-pointer rounded-lg p-1 hover:bg-muted/50 transition-colors">
                              <div className="relative">
                                <Avatar className="size-10 border-2 border-primary/20">
                                  <AvatarImage src="" alt="Launchpad User" />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                    LP
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  Launchpad User
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  İpucu için üzerine gelin
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Radix Tooltip & Çevrim İçi Durum
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Avatar Group */}
                      <div className="flex -space-x-2.5 overflow-hidden">
                        <Avatar className="inline-block size-8 ring-2 ring-background">
                          <AvatarFallback className="bg-blue-500/20 text-blue-600 font-bold text-xs">
                            AY
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="inline-block size-8 ring-2 ring-background">
                          <AvatarFallback className="bg-green-500/20 text-green-600 font-bold text-xs">
                            ZK
                          </AvatarFallback>
                        </Avatar>
                        <Avatar className="inline-block size-8 ring-2 ring-background">
                          <AvatarFallback className="bg-purple-500/20 text-purple-600 font-bold text-xs">
                            CD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[11px] font-semibold text-muted-foreground">
                          +4
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sliders & Progress */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">
                    Slider & Canlı Progress Senkronizasyonu
                  </CardTitle>
                  <CardDescription>
                    Slider&apos;ı kaydırarak Progress bar&apos;ın reaktif
                    tepkisini gözlemleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label
                        htmlFor="slider-control"
                        className="cursor-pointer"
                      >
                        Değer Seçici
                      </Label>
                      <span className="font-mono font-bold text-primary">
                        %{sliderVal[0]}
                      </span>
                    </div>
                    <Slider
                      id="slider-control"
                      value={sliderVal}
                      onValueChange={setSliderVal}
                      max={100}
                      step={1}
                      className="cursor-pointer"
                      aria-label="Değer Seçici"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bağlı İlerleme Çubuğu</span>
                      <span>100 üzerinden {sliderVal[0]}</span>
                    </div>
                    <Progress value={sliderVal[0]} className="h-2.5" />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/30">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="demo-toggle"
                        className="text-sm font-medium"
                      >
                        Canlı Bildirimler
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Sistem arka plan dinleyicisi
                      </p>
                    </div>
                    <Switch
                      id="demo-toggle"
                      checked={demoSwitch}
                      onCheckedChange={setDemoSwitch}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Alerts & Skeleton Showcase */}
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Sistem Bildirimleri & Yükleme Durumları
                      </CardTitle>
                      <CardDescription>
                        Kullanıcıya bilgi veren Alert ve Skeleton yapıları.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 gap-1"
                      onClick={() => {
                        setSkeletonSimulating(true)
                        setTimeout(() => setSkeletonSimulating(false), 1500)
                      }}
                    >
                      <RefreshCw className="size-3" />
                      Skeleton Testi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skeletonSimulating ? (
                    <div className="space-y-3 p-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert className="border-blue-500/20 bg-blue-500/5">
                        <Info className="size-4 text-blue-500" />
                        <AlertTitle className="text-blue-600 dark:text-blue-400 font-semibold">
                          Launchpad v1.0 Hazır
                        </AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground">
                          Tüm kalite kapıları, tip kontrolleri ve AST kuralları
                          başarıyla doğrulandı.
                        </AlertDescription>
                      </Alert>

                      <Alert
                        variant="destructive"
                        className="border-destructive/30 bg-destructive/5"
                      >
                        <AlertTriangle className="size-4" />
                        <AlertTitle className="font-semibold">
                          Güvenlik Standardı
                        </AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground">
                          Özel API gizli anahtarlarını client tarafında
                          bırakmayın; proxy veya .env kullanın.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Accordion Card */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">
                  Akordiyon (Accordion & FAQ)
                </CardTitle>
                <CardDescription>
                  WAI-ARIA uyumlu, klavye ile açılıp kapanabilen semantik içerik
                  panelleri.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      Backend olmadan nasıl test ve geliştirme yapılıyor?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      In-memory demoAuth, MSW ağ yakalayıcıları ve deterministic
                      fixture&apos;lar sayesinde hiçbir harici sunucuya
                      bağlanmadan tam işlevsel çalışır.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      Hangi CSS ve tasarım token mimarisi kullanılıyor?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Tailwind CSS v4 ve semantik CSS custom properties
                      (tokens.css) kullanılmaktadır. Karanlık mod ve marka
                      temaları tek CSS haritasından yönetilir.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      Paket boyutu (Initial JS Closure) nasıl bu kadar küçük
                      kalıyor?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      Tüm feature sayfaları ve vitrin alanları dynamic import
                      (lazy) ile ayrılmıştır; ana sayfa başlangıç yükü sıkı
                      kalite kapısıyla 200 KiB altında tutulur.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: FORMS */}
          <TabsContent value="forms" className="pt-6">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Card className="border-border/60">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          İnteraktif Form Deneyimi
                        </CardTitle>
                        <CardDescription>
                          Doğrulama durumları, erişilebilir etiketler ve submit
                          akışı.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs gap-1.5 h-8 shrink-0"
                        onClick={handleFillDemoForm}
                      >
                        <Sparkles className="size-3.5 text-primary" />
                        Demo Verisi Doldur
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSimulatedSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      {/* Name Field */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={formNameId}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <User className="size-3.5 text-muted-foreground" />
                          <span>Tam Adınız</span>
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={formNameId}
                          placeholder="Örn: Aybars Gök"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          aria-invalid={formSubmitted && !formName.trim()}
                          className={
                            formSubmitted && !formName.trim()
                              ? 'border-destructive focus-visible:ring-destructive'
                              : ''
                          }
                        />
                        {formSubmitted && !formName.trim() && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="size-3" />
                            Lütfen adınızı ve soyadınızı belirtin.
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={formEmailId}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span>Kurumsal E-Posta</span>
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={formEmailId}
                          type="email"
                          placeholder="ad.soyad@sirket.com"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          aria-invalid={
                            formSubmitted && !isEmailValid(formEmail)
                          }
                          className={
                            formSubmitted && !isEmailValid(formEmail)
                              ? 'border-destructive focus-visible:ring-destructive'
                              : ''
                          }
                        />
                        {formSubmitted && !isEmailValid(formEmail) && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="size-3" />
                            Geçerli bir e-posta formatı giriniz (örn:
                            info@domain.com).
                          </p>
                        )}
                      </div>

                      {/* Role Select Field */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={formRoleId}
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <Briefcase className="size-3.5 text-muted-foreground" />
                          <span>Uzmanlık Rolü</span>
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formRole} onValueChange={setFormRole}>
                          <SelectTrigger
                            id={formRoleId}
                            aria-invalid={formSubmitted && !formRole}
                            className={
                              formSubmitted && !formRole
                                ? 'border-destructive focus-visible:ring-destructive'
                                : ''
                            }
                          >
                            <SelectValue placeholder="Rolünüzü seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frontend">
                              Frontend Geliştirici
                            </SelectItem>
                            <SelectItem value="backend">
                              Backend Mimarı
                            </SelectItem>
                            <SelectItem value="designer">
                              UI/UX Tasarımcı
                            </SelectItem>
                            <SelectItem value="devops">
                              DevOps & Cloud Mühendisi
                            </SelectItem>
                            <SelectItem value="lead">
                              Proje & Ürün Yöneticisi
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {formSubmitted && !formRole && (
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <AlertCircle className="size-3" />
                            Lütfen bir rol seçiniz.
                          </p>
                        )}
                      </div>

                      {/* Work Mode Radio Cards */}
                      <div className="space-y-2 pt-1">
                        <Label className="text-sm">Çalışma Tercihi</Label>
                        <RadioGroup
                          value={formWorkMode}
                          onValueChange={setFormWorkMode}
                          className="grid grid-cols-3 gap-2"
                        >
                          <Label
                            htmlFor="mode-remote"
                            className={`flex flex-col items-center justify-between rounded-lg border p-3 cursor-pointer text-center text-xs font-medium transition-all ${
                              formWorkMode === 'remote'
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                : 'border-border/60 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem
                              value="remote"
                              id="mode-remote"
                              className="sr-only"
                            />
                            <span className="font-semibold">Uzaktan</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              100% Remote
                            </span>
                          </Label>

                          <Label
                            htmlFor="mode-hybrid"
                            className={`flex flex-col items-center justify-between rounded-lg border p-3 cursor-pointer text-center text-xs font-medium transition-all ${
                              formWorkMode === 'hybrid'
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                : 'border-border/60 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem
                              value="hybrid"
                              id="mode-hybrid"
                              className="sr-only"
                            />
                            <span className="font-semibold">Hibrit</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              2 Gün Ofis
                            </span>
                          </Label>

                          <Label
                            htmlFor="mode-office"
                            className={`flex flex-col items-center justify-between rounded-lg border p-3 cursor-pointer text-center text-xs font-medium transition-all ${
                              formWorkMode === 'office'
                                ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                : 'border-border/60 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem
                              value="office"
                              id="mode-office"
                              className="sr-only"
                            />
                            <span className="font-semibold">Ofis</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Tam Zamanlı
                            </span>
                          </Label>
                        </RadioGroup>
                      </div>

                      {/* Bio Field */}
                      <div className="space-y-1.5">
                        <Label htmlFor={formBioId} className="text-sm">
                          Kısa Biyografi / Not
                        </Label>
                        <Textarea
                          id={formBioId}
                          placeholder="Deneyimlerinizden veya proje beklentilerinizden kısaca bahsedin..."
                          value={formBio}
                          onChange={(e) => setFormBio(e.target.value)}
                          className="min-h-20 text-sm"
                        />
                      </div>

                      {/* Notifications Switch */}
                      <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor={formNotifId}
                            className="text-sm cursor-pointer"
                          >
                            Sistem & E-Posta Bildirimleri
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Önemli durum güncellemelerinde e-posta bildirimi al.
                          </p>
                        </div>
                        <Switch
                          id={formNotifId}
                          checked={formNotif}
                          onCheckedChange={setFormNotif}
                        />
                      </div>

                      {/* Terms Checkbox */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-start space-x-2.5">
                          <Checkbox
                            id={formAgreeId}
                            checked={formAgreed}
                            onCheckedChange={(checked) =>
                              setFormAgreed(Boolean(checked))
                            }
                            aria-invalid={formSubmitted && !formAgreed}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={formAgreeId}
                            className="text-xs font-normal leading-relaxed text-muted-foreground cursor-pointer"
                          >
                            Kullanım koşullarını ve kişisel veri işleme
                            sözleşmesini okudum, kabul ediyorum.
                          </Label>
                        </div>
                        {formSubmitted && !formAgreed && (
                          <p className="text-xs text-destructive flex items-center gap-1 ml-6">
                            <AlertCircle className="size-3" />
                            Devam etmek için sözleşmeyi onaylamanız
                            gerekmektedir.
                          </p>
                        )}
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 pt-3 border-t border-border/40">
                        <Button
                          type="submit"
                          disabled={formSubmitting}
                          className="gap-2"
                        >
                          {formSubmitting && <Spinner className="size-4" />}
                          {formSubmitting
                            ? 'Doğrulanıyor...'
                            : 'Formu Gönder ve Doğrula'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormName('')
                            setFormEmail('')
                            setFormRole('')
                            setFormWorkMode('remote')
                            setFormBio('')
                            setFormAgreed(false)
                            setFormSubmitted(false)
                            toast.info('Form temizlendi.')
                          }}
                        >
                          Temizle
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Live Form State Inspector */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border-border/60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code2 className="size-4 text-primary" />
                        <span>Canlı State Takipçisi</span>
                      </CardTitle>
                      {isFormValid ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[11px]">
                          <CheckCircle className="size-3" />
                          Geçerli
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-500 border-amber-500/30 text-[11px]"
                        >
                          Eksik Alanlar Var
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      React state değerlerinin anlık JSON yansıması.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="rounded-lg bg-muted/80 p-3.5 font-mono text-xs overflow-x-auto text-foreground leading-relaxed border border-border/40">
                      {JSON.stringify(
                        {
                          name: formName || null,
                          email: formEmail || null,
                          role: formRole || null,
                          workMode: formWorkMode,
                          bioLength: formBio.length,
                          notifications: formNotif,
                          agreed: formAgreed,
                          isValid: isFormValid,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground border-t border-border/40 py-3">
                    Form alanları değiştikçe state anında yeniden hesaplanır.
                  </CardFooter>
                </Card>

                {/* Form Features List */}
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">
                      Launchpad Form Mimarisi Özellikleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                      <span>Tam klavye odağı (Tab / Shift+Tab) desteği</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                      <span>
                        Ekran okuyucular için ARIA Invalid ve Açıklama eşleşmesi
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                      <span>
                        Çoklu dil geçişlerinde form alan değerlerini koruma
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                      <span>
                        Zod şeması ve React Hook Form hazır entegrasyonu
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: TABLES */}
          <TabsContent value="tables" className="pt-6">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      İnteraktif Veri Tablosu
                    </CardTitle>
                    <CardDescription>
                      Filtreleme, sütun sıralama, sayfalama ve çoklu satır
                      seçimi.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="İsim, rol veya e-posta..."
                        value={tableFilter}
                        onChange={(e) => {
                          setTableFilter(e.target.value)
                          setTablePage(1)
                        }}
                        className="pl-8 h-9 text-xs w-44 sm:w-56"
                      />
                    </div>
                    <Select
                      value={tableStatusFilter}
                      onValueChange={(val) => {
                        setTableStatusFilter(val)
                        setTablePage(1)
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs w-32">
                        <SelectValue placeholder="Durum Filtresi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="pending">Beklemede</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Floating Multi-Select Toolbar */}
                {selectedRows.length > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-xs">
                    <span className="font-semibold text-primary">
                      {selectedRows.length} satır seçildi
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          toast.success(
                            `${selectedRows.length} kullanıcıya bildirim gönderildi.`
                          )
                          setSelectedRows([])
                        }}
                      >
                        Toplu E-Posta
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => {
                          setTeamData((prev) =>
                            prev.filter((r) => !selectedRows.includes(r.id))
                          )
                          toast.error(`${selectedRows.length} kayıt silindi.`)
                          setSelectedRows([])
                        }}
                      >
                        Seçilenleri Sil
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setSelectedRows([])}
                      >
                        Seçimi Temizle
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-12 text-center">
                          <Checkbox
                            checked={
                              paginatedRows.length > 0 &&
                              paginatedRows.every((r) =>
                                selectedRows.includes(r.id)
                              )
                            }
                            onCheckedChange={toggleSelectAllPage}
                            aria-label="Bu sayfadaki tümünü seç"
                          />
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 gap-1 text-xs font-semibold"
                            onClick={() => handleSort('name')}
                          >
                            <span>Ekip Üyesi</span>
                            <ArrowUpDown className="size-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Rol & Uzmanlık</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 gap-1 text-xs font-semibold"
                            onClick={() => handleSort('status')}
                          >
                            <span>Durum</span>
                            <ArrowUpDown className="size-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-mr-3 ml-auto h-8 gap-1 text-xs font-semibold"
                            onClick={() => handleSort('commits')}
                          >
                            <span>Commit</span>
                            <ArrowUpDown className="size-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-12 text-right">
                          Eylemler
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-44 text-center">
                            <Empty className="py-6">
                              <EmptyHeader>
                                <EmptyMedia variant="icon">
                                  <Search className="size-5 text-muted-foreground" />
                                </EmptyMedia>
                                <EmptyTitle className="text-sm font-semibold">
                                  Kayıt bulunamadı
                                </EmptyTitle>
                                <EmptyDescription className="text-xs">
                                  Arama kriterlerinizle eşleşen bir ekip üyesi
                                  bulunamadı.
                                </EmptyDescription>
                              </EmptyHeader>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => {
                                  setTableFilter('')
                                  setTableStatusFilter('all')
                                }}
                              >
                                Filtreleri Temizle
                              </Button>
                            </Empty>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((row) => {
                          const isSelected = selectedRows.includes(row.id)
                          return (
                            <TableRow
                              key={row.id}
                              data-state={isSelected ? 'selected' : undefined}
                              className="transition-colors"
                            >
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleSelectRow(row.id)
                                  }
                                  aria-label={`Seç: ${row.name}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8">
                                    <AvatarFallback className="text-xs font-semibold bg-muted">
                                      {row.avatarFallback}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm leading-none">
                                      {row.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {row.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-medium text-muted-foreground">
                                {row.role}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.status === 'active'
                                      ? 'default'
                                      : row.status === 'pending'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                  className="text-[11px] capitalize"
                                >
                                  {row.status === 'active'
                                    ? 'Aktif'
                                    : row.status === 'pending'
                                      ? 'Beklemede'
                                      : 'Pasif'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold">
                                {row.commits}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      aria-label={`Eylemler: ${row.name}`}
                                    >
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-40"
                                  >
                                    <DropdownMenuLabel className="text-xs">
                                      Kullanıcı İşlemleri
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        toast.info(
                                          `${row.name} profili görüntülendi.`
                                        )
                                      }
                                      className="text-xs cursor-pointer"
                                    >
                                      Profili Görüntüle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        toast.info(
                                          `${row.name} e-posta panoya kopyalandı.`
                                        )
                                      }
                                      className="text-xs cursor-pointer"
                                    >
                                      E-Posta Kopyala
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteUser(row.id, row.name)
                                      }
                                      className="text-xs text-destructive cursor-pointer"
                                    >
                                      Listeden Kaldır
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>
                    Toplam <strong>{filteredRows.length}</strong> kayıttan{' '}
                    <strong>
                      {Math.min(
                        (tablePage - 1) * pageSize + 1,
                        filteredRows.length
                      )}
                      -{Math.min(tablePage * pageSize, filteredRows.length)}
                    </strong>{' '}
                    arası gösteriliyor
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tablePage <= 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      className="h-8 text-xs"
                    >
                      Önceki
                    </Button>
                    <span className="font-mono px-1">
                      {tablePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tablePage >= totalPages}
                      onClick={() =>
                        setTablePage((p) => Math.min(totalPages, p + 1))
                      }
                      className="h-8 text-xs"
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: OVERLAYS & TOASTS */}
          <TabsContent value="overlays" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Modals & Drawers */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">
                    Diyaloglar, Çekmeceler & Onaylar
                  </CardTitle>
                  <CardDescription>
                    Erişilebilir Radix dialog, sheet (drawer) ve alert dialog
                    modalları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {/* Controlled Dialog */}
                    <Dialog
                      open={inviteModalOpen}
                      onOpenChange={setInviteModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <User className="size-4" />
                          Kullanıcı Davet Et (Modal)
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Yeni Ekip Üyesi Davet Et</DialogTitle>
                          <DialogDescription>
                            Ekibe katılacak kişinin kurumsal e-posta adresini ve
                            başlangıç rolünü belirleyin.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleInviteSubmit}
                          className="space-y-4 py-2"
                        >
                          <div className="space-y-1.5">
                            <Label htmlFor="invite-email" className="text-xs">
                              E-Posta Adresi
                            </Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="ad.soyad@launchpad.dev"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="invite-role" className="text-xs">
                              Erişim Yetkisi
                            </Label>
                            <Select
                              value={inviteRole}
                              onValueChange={setInviteRole}
                            >
                              <SelectTrigger id="invite-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="developer">
                                  Geliştirici (Read/Write)
                                </SelectItem>
                                <SelectItem value="admin">
                                  Yönetici (Full Access)
                                </SelectItem>
                                <SelectItem value="viewer">
                                  Gözlemci (Read-only)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter className="pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setInviteModalOpen(false)}
                            >
                              Vazgeç
                            </Button>
                            <Button
                              type="submit"
                              disabled={inviteLoading}
                              className="gap-2"
                            >
                              {inviteLoading && <Spinner className="size-4" />}
                              Davet Bağlantısı Gönder
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Controlled Sheet Drawer */}
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="secondary" className="gap-2">
                          <SlidersHorizontal className="size-4" />
                          Yan Paneli Aç (Sheet)
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-md">
                        <SheetHeader>
                          <SheetTitle>Kullanıcı Tercihleri</SheetTitle>
                          <SheetDescription>
                            Güvenlik ve telemetri ayarlarını bu yan panel
                            üzerinden güncelleyin.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6 text-sm">
                          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                            <Avatar className="size-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                LP
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">
                                Launchpad Admin
                              </p>
                              <p className="text-xs text-muted-foreground">
                                admin@launchpad.dev
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="sheet-2fa"
                                  className="text-xs font-semibold cursor-pointer"
                                >
                                  İki Adımlı Doğrulama (2FA)
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                  Girişlerde SMS veya Authenticator onayı iste.
                                </p>
                              </div>
                              <Switch
                                id="sheet-2fa"
                                checked={twoFactorEnabled}
                                onCheckedChange={setTwoFactorEnabled}
                              />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <Label
                                  htmlFor="sheet-telemetry"
                                  className="text-xs font-semibold cursor-pointer"
                                >
                                  Anonim Telemetri & Loglar
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                  Hata tespitini hızlandırmak için crash
                                  raporları gönder.
                                </p>
                              </div>
                              <Switch
                                id="sheet-telemetry"
                                checked={telemetryEnabled}
                                onCheckedChange={setTelemetryEnabled}
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            onClick={() => {
                              setSheetOpen(false)
                              toast.success('Kullanıcı tercihleri kaydedildi!')
                            }}
                          >
                            Kaydet ve Paneli Kapat
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>

                    {/* Destructive Alert Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <Trash2 className="size-4" />
                          Onay Diyaloğu
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bu işlemi kalıcı olarak onaylıyor musunuz?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu aksiyon seçilen veriyi sunucudan kalıcı olarak
                            kaldıracaktır. Bu işlem geri alınamaz bir aksiyonu
                            temsil eder.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              toast.error(
                                'Kayıt silme işlemi başarıyla simüle edildi!'
                              )
                            }
                          >
                            Evet, Kalıcı Olarak Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Quick Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <MoreHorizontal className="size-4" />
                          Hızlı Eylemler (Dropdown)
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-52">
                        <DropdownMenuLabel className="text-xs">
                          Genel İşlemler
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info('Profil sekmesine yönlendirildi.')
                          }
                          className="text-xs cursor-pointer"
                        >
                          <User className="mr-2 size-3.5 text-muted-foreground" />
                          <span>Profil Detayları</span>
                          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.info('Rapor indiriliyor...')}
                          className="text-xs cursor-pointer"
                        >
                          <Download className="mr-2 size-3.5 text-muted-foreground" />
                          <span>CSV Raporu Al</span>
                          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            toast.error('Hesap askıya alma tetiklendi!')
                          }
                          className="text-xs text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          <span>Hesabı Askıya Al</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Accessible Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Info className="size-4 text-blue-500" />
                          Hızlı Bilgi (Popover)
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-xs space-y-2">
                        <div className="font-semibold text-sm text-foreground">
                          Proje Altyapı Sağlığı
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Sistem son 30 gündür %99.98 uptime oranıyla çalışmakta
                          ve tüm bundle bütçeleri yeşil kalmaktadır.
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
                          <span>Sürüm: v1.0.0</span>
                          <span>Ortam: Mock / Local</span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Sonner Toast Feedback Lab */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">
                    Sonner Toast Bildirim Laboratuvarı
                  </CardTitle>
                  <CardDescription>
                    Kullanıcı etkileşimlerine gerçek zamanlı görsel geri
                    bildirimler verin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      variant="outline"
                      className="border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10 text-xs"
                      onClick={() =>
                        toast.success('İşlem başarıyla tamamlandı!', {
                          description: 'Veriler yerel önbelleğe kaydedildi.',
                        })
                      }
                    >
                      Başarı Bildirimi
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs"
                      onClick={() =>
                        toast.error('Bağlantı hatası oluştu!', {
                          description:
                            'Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
                        })
                      }
                    >
                      Hata Bildirimi
                    </Button>

                    <Button
                      variant="outline"
                      className="border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-xs"
                      onClick={() =>
                        toast.info('Yeni sürüm güncellemesi mevcut.', {
                          description:
                            'Değişiklik günlüğünü inceleyebilirsiniz.',
                        })
                      }
                    >
                      Bilgi Bildirimi
                    </Button>

                    <Button
                      variant="outline"
                      className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
                      onClick={() =>
                        toast('Kayıt arşive taşındı', {
                          action: {
                            label: 'Geri Al',
                            onClick: () => toast.success('İşlem geri alındı!'),
                          },
                        })
                      }
                    >
                      Eylemli / Geri Al
                    </Button>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      className="w-full text-xs gap-2"
                      onClick={() => {
                        const asyncAction = new Promise<string>((resolve) =>
                          setTimeout(
                            () => resolve('Veriler başarıyla eşitlendi!'),
                            1400
                          )
                        )
                        toast.promise(asyncAction, {
                          loading: 'Bulut sunucuyla eşitleniyor...',
                          success: (msg) => `${msg}`,
                          error: 'Senkronizasyon başarısız oldu.',
                        })
                      }}
                    >
                      <Sparkles className="size-3.5 text-primary" />
                      Asenkron Promise Toast Simülasyonu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 5: CHARTS */}
          <TabsContent value="charts" className="pt-6">
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      SVG Veri Görselleştirme (Chart)
                    </CardTitle>
                    <CardDescription>
                      Erişilebilir, harici ağır kütüphane istemeyen, DOM dostu
                      SVG grafik bileşeni.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={
                        activeChartKey === 'users' ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setActiveChartKey('users')
                        setChartEmpty(false)
                      }}
                      className="h-8 text-xs"
                    >
                      Kullanıcılar
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        activeChartKey === 'requests' ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setActiveChartKey('requests')
                        setChartEmpty(false)
                      }}
                      className="h-8 text-xs"
                    >
                      API İstekleri
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        activeChartKey === 'sprints' ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setActiveChartKey('sprints')
                        setChartEmpty(false)
                      }}
                      className="h-8 text-xs"
                    >
                      Sprint Skoru
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setChartLoading(true)
                        setTimeout(() => setChartLoading(false), 1200)
                      }}
                      className="h-8 text-xs gap-1"
                    >
                      <RefreshCw className="size-3" />
                      Yükleme Testi
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/60 p-4 bg-card/60">
                  <Chart
                    data={chartEmpty ? [] : chartDatasets[activeChartKey].data}
                    isLoading={chartLoading}
                    emptyMessage="Bu zaman aralığında gösterilecek veri noktası bulunamadı."
                    config={{
                      title: chartDatasets[activeChartKey].title,
                      description: chartDatasets[activeChartKey].description,
                      formatValue: (v) =>
                        `${v.toLocaleString('tr-TR')} ${chartDatasets[activeChartKey].unit}`,
                      height: 250,
                      showTableAlternative: true,
                    }}
                    className="border-0 shadow-none p-0 bg-transparent"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 py-3">
                <span>
                  Sağ üstteki &quot;View Table&quot; butonuna tıklayarak ekran
                  okuyucular için tablo formatına geçebilirsiniz.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartEmpty((prev) => !prev)}
                  className="h-7 text-xs"
                >
                  {chartEmpty ? 'Verileri Geri Yükle' : 'Boş Durumu Simüle Et'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 6: FILES */}
          <TabsContent value="files" className="pt-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">
                  Dosya Yükleme & Yönetim (FileDropzone)
                </CardTitle>
                <CardDescription>
                  Sürükle-bırak desteği, dosya tipi kontrolü, boyut limiti ve
                  güvenli bellek temizliği.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <FileDropzone
                  onFilesSelected={handleFilesChosen}
                  policy={{
                    maxFiles: 5,
                    maxSizeBytes: 5 * 1024 * 1024,
                  }}
                  title="Dosyaları bu alana sürükleyip bırakın veya seçin"
                  subtitle="PNG, JPG, PDF veya JSON (Maksimum 5 dosya, her biri en fazla 5MB)"
                />

                {/* Upload Progress Bar */}
                {uploadProgress !== null && (
                  <div className="space-y-1.5 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Dosyalar işleniyor ve doğrulanıyor...</span>
                      <span>%{uploadProgress}</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Uploaded Files Grid */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Yüklenen Belgeler ({uploadedFiles.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:bg-destructive/10 h-7"
                        onClick={() => {
                          setUploadedFiles([])
                          toast.info('Tüm dosyalar listeden kaldırıldı.')
                        }}
                      >
                        Tümünü Temizle
                      </Button>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {uploadedFiles.map((file, idx) => {
                        const badgeStyle = getFileBadgeColor(file.name)
                        return (
                          <div
                            key={`${file.name}-${idx}`}
                            className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/30 text-xs transition-all hover:border-primary/40"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div
                                className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${badgeStyle}`}
                              >
                                {file.name.match(
                                  /\.(png|jpg|jpeg|svg|webp)$/i
                                ) ? (
                                  <ImageIcon className="size-4" />
                                ) : file.name.match(/\.(ts|tsx|js|json)$/i) ? (
                                  <FileCode className="size-4" />
                                ) : (
                                  <FileIcon className="size-4" />
                                )}
                              </div>
                              <div className="truncate">
                                <p className="truncate font-medium text-foreground">
                                  {file.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB · Hazır
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                              aria-label={`Dosyayı kaldır: ${file.name}`}
                              onClick={() =>
                                setUploadedFiles((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: KURUMSAL ALTYAPI & YETENEKLER (ENTERPRISE STACK) */}
          <TabsContent value="enterprise" className="space-y-8 pt-6">
            {/* Header Callout */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground font-semibold"
                    >
                      README.md Kurumsal Altyapı Standartları
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      Full Production Stack
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Launchpad yalnızca bir UI kütüphanesi değil; PostHog
                    analitiği, react-i18next dinamik dil motoru, Zustand Feature
                    Flags, Axios ağ dayanıklılığı ve Sentry/Web Vitals ile
                    birlikte gelen komple bir kurumsal pakettir.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-green-500/40 text-green-600 dark:text-green-400 font-mono text-xs shrink-0"
                >
                  ● 9/9 Kalite Kapısı Yeşil
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* 1. POSTHOG ANALYTICS LAB */}
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="size-4 text-primary" />
                      <span>PostHog Kullanıcı Analitiği</span>
                    </CardTitle>
                    <Badge variant="outline">src/core/analytics</Badge>
                  </div>
                  <CardDescription>
                    Olay takibi, sayfa görüntüleme ve kullanıcı profilleme.
                    Geliştirme ortamında sessiz çalışır, hata fırlatmaz.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 cursor-pointer"
                      onClick={() =>
                        handleTrackEventDemo('demo_cta_clicked', {
                          location: 'enterprise_tab',
                          action: 'user_action_test',
                          timestamp: Date.now(),
                        })
                      }
                    >
                      <Send className="size-3.5" />
                      <span>Olay Gönder (trackEvent)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 cursor-pointer"
                      onClick={handleIdentifyDemo}
                    >
                      <User className="size-3.5" />
                      <span>Kullanıcı Kimliği (identifyUser)</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 cursor-pointer"
                      onClick={handlePageViewDemo}
                    >
                      <Eye className="size-3.5" />
                      <span>SPA Ziyaret (trackPageView)</span>
                    </Button>
                  </div>

                  {/* Dark Mode Terminal Console */}
                  <div className="rounded-lg border border-border/80 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-300">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <div className="size-2.5 rounded-full bg-red-500/80" />
                        <div className="size-2.5 rounded-full bg-yellow-500/80" />
                        <div className="size-2.5 rounded-full bg-green-500/80" />
                        <span className="ml-2 text-[11px] text-zinc-400">
                          POSTHOG CANLI OLAY LOGLARI
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-2 cursor-pointer"
                        onClick={() => setAnalyticsLogs([])}
                      >
                        <RotateCcw className="size-3 mr-1" />
                        Temizle
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {analyticsLogs.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4 text-[11px]">
                          Henüz olay kaydedilmedi. Yukarıdaki butonlarla olay
                          tetikleyin.
                        </p>
                      ) : (
                        analyticsLogs.map((log) => (
                          <div
                            key={log.id}
                            className="space-y-1 rounded bg-zinc-900/80 p-2 border border-zinc-800/80"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-primary font-semibold">
                                [{log.time}] {log.name}
                              </span>
                              <span className="text-zinc-400 text-[10px] uppercase">
                                {log.type}
                              </span>
                            </div>
                            <pre className="text-[10px] text-zinc-400 overflow-x-auto whitespace-pre">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. FEATURE FLAGS & DEVTOOLS */}
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="size-4 text-amber-500" />
                      <span>Dinamik Feature Flags & DevTools</span>
                    </CardTitle>
                    <Badge variant="outline">src/core/feature-flags</Badge>
                  </div>
                  <CardDescription>
                    Yeni özellikleri çalışma zamanında (runtime) deploy etmeden
                    açıp kapatın veya yerel olarak test edin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 rounded-lg border border-border/60 p-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold cursor-pointer">
                          Yapay Zeka Asistanı & Öneri Motoru (Beta)
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          flag: &quot;beta-features&quot;
                        </p>
                      </div>
                      <Switch
                        checked={flagBetaAI}
                        onCheckedChange={() =>
                          handleToggleFlag(
                            'beta-features',
                            flagBetaAI,
                            setFlagBetaAI
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold cursor-pointer">
                          Sistem Planlı Bakım Modu Uyarısı
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          flag: &quot;maintenance-mode&quot;
                        </p>
                      </div>
                      <Switch
                        checked={flagMaintenance}
                        onCheckedChange={() =>
                          handleToggleFlag(
                            'maintenance-mode',
                            flagMaintenance,
                            setFlagMaintenance
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold cursor-pointer">
                          Modern V2 Dashboard Görünümü
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          flag: &quot;new-dashboard&quot;
                        </p>
                      </div>
                      <Switch
                        checked={flagNewDashboard}
                        onCheckedChange={() =>
                          handleToggleFlag(
                            'new-dashboard',
                            flagNewDashboard,
                            setFlagNewDashboard
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Reactive Output Box */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Canlı Bayrak Önizlemesi
                    </Label>
                    <div className="min-h-24 rounded-lg border border-dashed border-border/80 p-3 bg-muted/10 space-y-2">
                      {flagBetaAI && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-xs text-purple-700 dark:text-purple-300">
                          <Bot className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">
                              AI Copilot Asistanı Devrede:
                            </span>{' '}
                            9 kalite kapısı doğrulandı. 35+ bileşen %100 test
                            kapsamına sahip, başlangıç bütçesi 181.55 KiB. Kod
                            üretime hazır!
                          </div>
                        </div>
                      )}

                      {flagMaintenance && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">
                              Sistem Bakım Modu Aktif:
                            </span>{' '}
                            Sunucu istekleri salt okunur modda işlenir.
                            Kullanıcı oturumları güvendedir.
                          </div>
                        </div>
                      )}

                      {flagNewDashboard && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-700 dark:text-blue-300">
                          <Sparkles className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">
                              V2 Dashboard Teması:
                            </span>{' '}
                            WebSocket gerçek zamanlı analitik paneli
                            etkinleştirildi.
                          </div>
                        </div>
                      )}

                      {!flagBetaAI && !flagMaintenance && !flagNewDashboard && (
                        <p className="text-xs text-muted-foreground py-4 text-center">
                          Varsayılan kararlı çekirdek aktif. Özellikleri canlıda
                          test etmek için yukarıdaki anahtarları açın.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. i18n DYNAMIC ENGINE */}
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe2 className="size-4 text-blue-500" />
                      <span>react-i18next Çoklu Dil Motoru</span>
                    </CardTitle>
                    <Badge variant="outline">src/i18n</Badge>
                  </div>
                  <CardDescription>
                    Vite glob ile otomatik keşfedilen _meta.json dosyaları ve
                    lazy namespace yükleyicisi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Canlı Dil Değiştirici:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={
                          i18n.language.startsWith('tr') ? 'default' : 'outline'
                        }
                        size="sm"
                        className="text-xs h-8 cursor-pointer"
                        onClick={() => handleLanguageChange('tr')}
                      >
                        🇹🇷 Türkçe (TR)
                      </Button>
                      <Button
                        variant={
                          i18n.language.startsWith('en') ? 'default' : 'outline'
                        }
                        size="sm"
                        className="text-xs h-8 cursor-pointer"
                        onClick={() => handleLanguageChange('en')}
                      >
                        🇺🇸 English (EN)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/60 p-3 bg-muted/20 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground border-b border-border/40 pb-1.5">
                      <span>Anahtar (Key)</span>
                      <span>Dinamik Çeviri Değeri</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-muted-foreground">
                        common.actions.submit
                      </span>
                      <span className="font-semibold text-primary">
                        &quot;{t('actions.submit')}&quot;
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-muted-foreground">
                        common.navigation.dashboard
                      </span>
                      <span className="font-semibold text-primary">
                        &quot;{t('navigation.dashboard')}&quot;
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-muted-foreground">
                        common.validation.required
                      </span>
                      <span className="font-semibold text-primary">
                        &quot;{t('validation.required')}&quot;
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-muted-foreground">
                        common.errors.network
                      </span>
                      <span className="font-semibold text-primary truncate max-w-[200px]">
                        &quot;{t('errors.network')}&quot;
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Aktif: {i18n.language.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Namespaces: common, examples, users
                    </Badge>
                    <span className="text-[11px]">
                      ✓ Dil değişiminde form verileri asla kaybolmaz.
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 4. RESILIENT API CLIENT (AXIOS + MSW) */}
              <Card className="border-border/60">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="size-4 text-emerald-500" />
                      <span>Dayanıklı Axios İstemcisi & MSW</span>
                    </CardTitle>
                    <Badge variant="outline">src/core/api</Badge>
                  </div>
                  <CardDescription>
                    Ağ hatalarında üstel geri çekilme (exponential backoff) ve
                    çifte istek önleyici Idempotency anahtarları.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-2 cursor-pointer"
                    disabled={apiSimulating}
                    onClick={handleSimulateApiCall}
                  >
                    {apiSimulating ? (
                      <>
                        <Spinner className="size-3.5" />
                        <span>İstek gönderiliyor ve doğrulanıyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>
                          Simüle Edilmiş API İsteği Gönder (POST /orders)
                        </span>
                      </>
                    )}
                  </Button>

                  <div className="rounded-lg border border-border/60 p-3 bg-muted/20 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono">
                        Ağ Politikası:
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        2 Retry · Üstel Gecikme (300ms)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono">
                        Idempotency Header:
                      </span>
                      <span className="font-mono text-[11px] text-foreground">
                        {apiResult
                          ? apiResult.idempotencyKey
                          : 'X-Idempotency-Key: req_auto'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-mono">
                        Son İstek Durumu:
                      </span>
                      <span
                        className={`font-semibold ${
                          apiResult
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {apiResult
                          ? `${apiResult.status} OK (${apiResult.latencyMs}ms)`
                          : 'Beklemede'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    MSW (Mock Service Worker) entegrasyonu sayesinde gerçek
                    backend olmadan tüm REST istekleri deterministik olarak test
                    edilebilir.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 5. CORE WEB VITALS & OBSERVABILITY */}
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gauge className="size-4 text-primary" />
                    <span>Core Web Vitals & Gözlemlenebilirlik Metrikleri</span>
                  </CardTitle>
                  <Badge variant="outline">src/core/monitoring</Badge>
                </div>
                <CardDescription>
                  Google Core Web Vitals eşikleri ve Sentry hata izleme
                  standartları.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>LCP (Yükleme Hızı)</span>
                      <span className="text-green-600 font-semibold">
                        Hedef &lt; 2.5s
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      0.78s
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Largest Contentful Paint
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>CLS (Düzen Kayması)</span>
                      <span className="text-green-600 font-semibold">
                        Hedef &lt; 0.1
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      0.000
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Cumulative Layout Shift
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>INP (Tepki Süresi)</span>
                      <span className="text-green-600 font-semibold">
                        Hedef &lt; 200ms
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      11ms
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Interaction to Next Paint
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>JS Başlangıç Paketi</span>
                      <span className="text-green-600 font-semibold">
                        Bütçe &lt; 200 KiB
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      181.55 KiB
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Gzip Sıkıştırılmış Kapanış
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 p-3 bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-green-500 shrink-0" />
                    <span>
                      <strong>Sentry Error Boundary:</strong> Üretim ortamında
                      beklenmeyen runtime hatalarını filtreler ve güvenli
                      fallback ekranı sunar.
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Sentry v9 Ready
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 6. FULL README CAPABILITIES MATRIX TABLE */}
            <Card className="border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <span>README.md Kurumsal Teknoloji ve Yetenek Matrisi</span>
                  </CardTitle>
                  <Badge variant="outline">16 Çekirdek Yetenek</Badge>
                </div>
                <CardDescription>
                  Proje dokümantasyonunda yer alan tüm kurumsal altyapı
                  modüllerinin güncel hazır olma durumu.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-semibold text-xs">
                          Kategori
                        </TableHead>
                        <TableHead className="font-semibold text-xs">
                          Teknoloji
                        </TableHead>
                        <TableHead className="font-semibold text-xs">
                          Mimari Kapsam
                        </TableHead>
                        <TableHead className="font-semibold text-xs text-right">
                          Durum
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      <TableRow>
                        <TableCell className="font-medium">
                          Frontend Motoru
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          React 19 + Vite 7
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Strict TypeScript 5.9, Tailwind CSS v4
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Durum Yönetimi
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          TanStack Query v5 + Zustand
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Sunucu önbellekleme + hafif istemci durumları
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Davranış Analitiği
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          PostHog SDK
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Olay yakalama, oturum kaydı ve huni analizi
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Çoklu Dil (i18n)
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          react-i18next
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Lazy namespace yükleyicisi, EN/TR tam destek
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Özellik Bayrakları
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          Built-in + DevTools
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Çalışma zamanında runtime override ve PostHog senkronu
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Ağ İstemcisi
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          Axios + Idempotency
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Otomatik retry (üstel geri çekilme) ve token yenileme
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Hata ve Performans
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          Sentry + Web Vitals
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          LCP, CLS, INP takibi ve gürültüsüz hata raporlama
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Test ve Kalite
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          Vitest + Playwright + MSW
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          9 zorunlu kalite kapısı (Boundary, Bundle, Unit, E2E)
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Bileşen Dokümantasyonu
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          Storybook 10
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          37 public UI bileşeni, 45 primitive, %100 kapsama
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Çevrimdışı & PWA
                        </TableCell>
                        <TableCell className="font-mono text-primary">
                          vite-plugin-pwa
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          Service worker önbellekleme ve offline-first desteği
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="default" className="text-[10px]">
                            Hazır
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
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
                aria-label="Feature üretim komutunu kopyala"
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
                aria-label="Form üretim komutunu kopyala"
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
                aria-label="Dil ekleme komutunu kopyala"
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
                04. Kalite Kapıları &amp; Kontrol
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs font-mono"
                aria-label="Kalite kontrol komutunu kopyala"
                onClick={() => copy('r4', 'pnpm check')}
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
              Tüm statik kapıları tek seferde çalıştırın
            </h3>
            <p className="text-xs text-muted-foreground">
              Tip kontrolü, katman sınırları, bundle bütçesi, linting, prettier
              ve 177+ testi çalıştırır.
            </p>
            <pre className="rounded-md bg-muted p-2.5 font-mono text-xs overflow-x-auto text-primary">
              pnpm check
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
