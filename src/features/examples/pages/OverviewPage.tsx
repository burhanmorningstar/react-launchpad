import * as React from 'react'

import { FileText, Files, LayoutDashboard, Shield, Table } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PageHeader } from '@/core/blocks'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'
import { demoAuth } from '@/examples/adapters/demoAuth'

export default function OverviewPage() {
  const { t } = useTranslation('examples')
  const [session, setSession] = React.useState(demoAuth.getSession())

  React.useEffect(() => {
    return demoAuth.subscribe((state) => {
      setSession(state)
    })
  }, [])

  const currentRole = session?.user?.role || 'user'

  const exampleCards = [
    {
      title: t('cards.forms', 'Forms & Validation'),
      description: t(
        'cards.formsDesc',
        'Accessible forms, schema validation, step wizard and 422 error simulation'
      ),
      href: '/examples/forms',
      icon: FileText,
    },
    {
      title: t('cards.tables', 'Data Table & URL State'),
      description: t(
        'cards.tablesDesc',
        'Interactive list with filtering, pagination, sorting and modal workflows'
      ),
      href: '/examples/tables',
      icon: Table,
    },
    {
      title: t('cards.files', 'File Upload & Preview'),
      description: t(
        'cards.filesDesc',
        'Dropzone, file validation, upload queues and image previews'
      ),
      href: '/examples/files',
      icon: Files,
    },
    {
      title: t('cards.content', 'Rich Content & Analytics'),
      description: t(
        'cards.contentDesc',
        'Sanitized rich text editor, virtual list and accessible SVG charts'
      ),
      href: '/examples/content',
      icon: LayoutDashboard,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('title', 'Frontend Examples')}
        description={t(
          'description',
          'Explore working interactive workflows with zero backend dependencies'
        )}
      />

      {/* Role / Auth Demo Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>
              {t('auth.title', 'In-Memory Auth & Role Switching')}
            </CardTitle>
          </div>
          <CardDescription>
            {t(
              'auth.description',
              'Test different application perspectives without touching local storage or remote servers.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm text-muted-foreground mr-2">
              {t('auth.currentRole', 'Current Role')}:
            </span>
            <span className="font-semibold capitalize px-2 py-1 bg-background rounded-md border text-sm">
              {currentRole === 'admin'
                ? t('auth.admin', 'Administrator')
                : t('auth.user', 'Standard User')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {currentRole === 'user' ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => demoAuth.switchRole('admin')}
              >
                {t('auth.switchToAdmin', 'Switch to Admin')}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => demoAuth.switchRole('user')}
              >
                {t('auth.switchToUser', 'Switch to User')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Example Navigation Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {exampleCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.href}
              className="hover:border-primary/50 transition-colors flex flex-col justify-between"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
                <CardDescription className="pt-2">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link to={card.href}>Open Example</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
