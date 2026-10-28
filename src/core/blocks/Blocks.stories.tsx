import {
  ActivityIcon,
  ArrowRightIcon,
  DollarSignIcon,
  DownloadIcon,
  LayersIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react'

import { Badge } from '@/core/ui/components/badge'
import { Button } from '@/core/ui/components/button'
import { Input } from '@/core/ui/components/input'

import {
  CallToAction,
  FaqSection,
  FeatureGrid,
  FilterBar,
  HeroSection,
  PageHeader,
  PageSection,
  PageToolbar,
  PricingSection,
  SiteFooter,
  StatCard,
} from './index'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Core/Blocks',
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj

export const PageHeaders: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      {/* 1. List Page Header */}
      <div>
        <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          1. List Page Header
        </span>
        <PageHeader
          breadcrumbs={<span>Dashboard / Team / Members</span>}
          title="Team Members"
          description="Manage who has access to this workspace and their respective roles."
          meta={<Badge variant="secondary">24 Active</Badge>}
          actions={
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </Button>
              <Button size="sm" className="gap-1.5">
                <PlusIcon className="h-4 w-4" />
                Invite Member
              </Button>
            </>
          }
        />
      </div>

      {/* 2. Detail Page Header */}
      <div>
        <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          2. Detail Page Header
        </span>
        <PageHeader
          breadcrumbs={<span>Projects / Launchpad Alpha</span>}
          title="Launchpad Alpha"
          headingLevel={2}
          description="Production deployment branch connected to main cluster."
          meta={<Badge variant="default">Online</Badge>}
          actions={
            <Button variant="destructive" size="sm">
              Archive Project
            </Button>
          }
        />
      </div>

      {/* 3. Settings Page Header */}
      <div>
        <span className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          3. Settings Page Header
        </span>
        <PageHeader
          title="Security Settings"
          description="Configure authentication rules, session expiry, and audit policies."
          actions={<Button size="sm">Save Changes</Button>}
        />
      </div>
    </div>
  ),
}

export const ToolbarAndFilterBar: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <PageToolbar
        search={<Input placeholder="Search orders..." className="h-9" />}
        filters={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Status: All
            </Button>
            <Button variant="outline" size="sm">
              Role: Member
            </Button>
          </div>
        }
        actions={
          <Button size="sm" className="gap-1.5">
            <PlusIcon className="h-4 w-4" />
            Add Order
          </Button>
        }
      />

      <FilterBar
        activeFilters={
          <>
            <Badge variant="secondary" className="gap-1">
              Status: Pending
            </Badge>
            <Badge variant="secondary" className="gap-1">
              Priority: High
            </Badge>
          </>
        }
        onReset={() => {}}
      />
    </div>
  ),
}

export const StatCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value="$45,231.89"
        icon={<DollarSignIcon className="h-4 w-4" />}
        change={{ value: '+20.1%', trend: 'up', label: 'from last month' }}
      />
      <StatCard
        title="Active Users"
        value="2,350"
        icon={<UsersIcon className="h-4 w-4" />}
        change={{ value: '+180.1%', trend: 'up', label: 'from last month' }}
      />
      <StatCard
        title="Server Latency"
        value="38ms"
        icon={<ActivityIcon className="h-4 w-4" />}
        change={{ value: '-4.5%', trend: 'down', label: 'improved' }}
      />
      <StatCard
        title="Deployment Uptime"
        value="99.98%"
        icon={<ShieldCheckIcon className="h-4 w-4" />}
        change={{ value: '0.0%', trend: 'neutral', label: 'same as yesterday' }}
      />
    </div>
  ),
}

export const PageSections: Story = {
  render: () => (
    <PageSection
      title="Active Workspaces"
      description="Workspaces currently running within your organization subscription."
      actions={
        <Button variant="outline" size="sm">
          View All Workspaces
        </Button>
      }
    >
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Workspace list and operational monitors render inside this section
        block.
      </div>
    </PageSection>
  ),
}

export const PublicLandingBlocks: Story = {
  render: () => (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <HeroSection
        badge={
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 text-sm font-medium"
          >
            <SparklesIcon className="h-3.5 w-3.5 text-primary" />
            Launchpad Starter v1.0
          </Badge>
        }
        title="Build your next React application with unmatched momentum."
        description="A completely typed, accessible, and backend-free production starter featuring modern shadcn primitives, dynamic localization, and modular architecture."
        actions={
          <>
            <Button size="lg" className="gap-2">
              Get Started Free
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </>
        }
      />

      {/* Feature Grid */}
      <FeatureGrid
        badge={<Badge variant="secondary">Key Features</Badge>}
        title="Engineered for Scalability and Delight"
        description="Everything you need to launch enterprise-grade single-page apps without boilerplate hassle."
        columns={3}
        features={[
          {
            icon: <ZapIcon className="h-5 w-5" />,
            title: 'Ultra-Fast Vite Setup',
            description:
              'Optimized bundler configuration, instant HMR, and deterministic reproducible toolchain gates.',
          },
          {
            icon: <ShieldCheckIcon className="h-5 w-5" />,
            title: 'Radix & Shadcn Primitives',
            description:
              'Fully editable, theme-synchronized accessible components built directly in your repository.',
          },
          {
            icon: <LayersIcon className="h-5 w-5" />,
            title: 'Scalable Architecture',
            description:
              'Enforced boundaries between core, app, and feature modules prevents architectural drift.',
          },
        ]}
      />

      {/* Pricing */}
      <PricingSection
        badge={<Badge variant="secondary">Pricing</Badge>}
        title="Transparent Plans for Every Team"
        description="Choose the plan that suits your team size and scaling demands."
        tiers={[
          {
            id: 'starter',
            name: 'Starter',
            price: '$0',
            interval: '/ month',
            description: 'Perfect for prototyping and personal projects.',
            features: [
              'Up to 3 projects',
              'Core UI primitives',
              'Community support',
            ],
            action: (
              <Button variant="outline" className="w-full">
                Start Free
              </Button>
            ),
          },
          {
            id: 'pro',
            name: 'Professional',
            price: '$49',
            interval: '/ month',
            description: 'For growing products requiring advanced modules.',
            features: [
              'Unlimited projects',
              'Advanced data table & filters',
              'Localization automation',
              'Priority assistance',
            ],
            highlighted: true,
            badge: <Badge>Popular</Badge>,
            action: <Button className="w-full">Upgrade to Pro</Button>,
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Custom',
            description:
              'Dedicated infrastructure, custom SLAs, and security reviews.',
            features: [
              'Custom boundary rules',
              'Dedicated audit pipelines',
              '24/7 incident response',
              'Single Sign-On (SSO)',
            ],
            action: (
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            ),
          },
        ]}
      />

      {/* FAQ */}
      <FaqSection
        title="Frequently Asked Questions"
        description="Answers to common questions about setup, architecture, and deployment."
        items={[
          {
            id: 'faq-1',
            question: 'Can I use this without a backend?',
            answer:
              'Yes! The starter is designed to boot cleanly without any API keys, env variables, or running backend services.',
          },
          {
            id: 'faq-2',
            question: 'Can I add a third language or custom namespace?',
            answer:
              'The i18n subsystem discovers new locale folders and namespaces automatically at runtime without manual barrel imports.',
          },
        ]}
      />

      {/* Call To Action */}
      <CallToAction
        title="Ready to accelerate your product delivery?"
        description="Start your project with our robust architecture and prebuilt accessible page blocks today."
        actions={
          <Button size="lg" className="gap-2">
            Clone Repository
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        }
      />

      {/* Footer */}
      <SiteFooter
        brand={<span className="text-lg font-bold">React Launchpad</span>}
        description="The modern, backend-free enterprise frontend launchpad."
        copyright="© 2026 React Launchpad. All rights reserved."
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Overview', href: '#' },
              { label: 'Components', href: '#' },
              { label: 'Pricing', href: '#' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '#' },
              { label: 'GitHub', href: 'https://github.com', external: true },
            ],
          },
        ]}
      />
    </div>
  ),
}
