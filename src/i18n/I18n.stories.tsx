import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/core/ui/components/card'

import i18n, {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  getLocales,
} from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Localization',
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj

export const FormattingRuntime: Story = {
  render: () => {
    const today = '2026-10-28'
    const now = new Date()

    return (
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Active Locale Formatting
          </h2>
          <p className="text-sm text-muted-foreground">
            Formatting results automatically adapt to the user's active locale
            and formatting conventions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Numbers & Percent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Numbers & Percentages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Number (1234567.89):
                </span>
                <span className="font-semibold">
                  {formatNumber(1234567.89)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Percentage (0.785):
                </span>
                <span className="font-semibold">
                  {formatPercent(0.785, { minimumFractionDigits: 1 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Currency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USD ($49.99):</span>
                <span className="font-semibold">
                  {formatCurrency(49.99, 'USD')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TRY (₺1,250.00):</span>
                <span className="font-semibold">
                  {formatCurrency(1250, 'TRY')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendar & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Date-Only (2026-10-28):
                </span>
                <span className="font-semibold">{formatDateOnly(today)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date-Time:</span>
                <span className="font-semibold">{formatDateTime(now)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Relative (-1 day):
                </span>
                <span className="font-semibold">
                  {formatRelativeTime(-1, 'day')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Relative (+2 hours):
                </span>
                <span className="font-semibold">
                  {formatRelativeTime(2, 'hour')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Locales Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discovered Locales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {getLocales({ includeDrafts: true }).map((loc) => (
                <div
                  key={loc.code}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">
                    {loc.name} ({loc.code})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline">
                      {loc.direction.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        loc.status === 'enabled' ? 'default' : 'secondary'
                      }
                    >
                      {loc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
}

export const LanguageSwitching: Story = {
  render: () => {
    const { t } = useTranslation(['common', 'validation'])
    const [, setCurrentLang] = useState(i18n.language)

    const switchLanguage = (code: string) => {
      i18n.changeLanguage(code).then(() => {
        setCurrentLang(code)
      })
    }

    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Select Language:</span>
          {getLocales().map((locale) => (
            <Button
              key={locale.code}
              size="sm"
              variant={i18n.language === locale.code ? 'default' : 'outline'}
              onClick={() => switchLanguage(locale.code)}
            >
              {locale.name}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Translations ({i18n.language})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Navigation (Home):</span>
              <span className="font-semibold">{t('navigation.home')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actions (Submit):</span>
              <span className="font-semibold">{t('actions.submit')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Validation (Required):
              </span>
              <span className="font-semibold">{t('validation:required')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
}
