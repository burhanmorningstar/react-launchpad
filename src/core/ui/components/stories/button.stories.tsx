import { Button } from '../button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'outline',
        'ghost',
        'destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'destructive',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'default',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    className: 'w-full',
  },
  parameters: {
    layout: 'padded',
  },
}

export const Link: Story = {
  render: () => (
    <Button asChild>
      <a href="#details">View details</a>
    </Button>
  ),
}

export const IconOnly: Story = {
  args: {
    size: 'icon',
    'aria-label': 'Open settings',
    children: <span aria-hidden="true">⚙</span>,
  },
}
