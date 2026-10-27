import { Input } from '../input'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    'aria-label': 'Text',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-80">
      <label htmlFor="input-1" className="block text-sm font-medium mb-2">
        Email Address
      </label>
      <Input id="input-1" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    'aria-label': 'Password',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    'aria-label': 'Disabled input',
    disabled: true,
  },
}

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <label htmlFor="input-2" className="block text-sm font-medium mb-2">
        Email
      </label>
      <Input
        id="input-2"
        type="email"
        placeholder="you@example.com"
        aria-invalid="true"
        aria-describedby="input-2-error"
      />
      <p id="input-2-error" role="alert" className="text-error text-sm mt-1">
        Please enter a valid email address
      </p>
    </div>
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <div className="w-80">
      <label htmlFor="input-3" className="block text-sm font-medium mb-2">
        Username
      </label>
      <Input
        aria-describedby="input-3-help"
        id="input-3"
        type="text"
        placeholder="johndoe"
      />
      <p id="input-3-help" className="text-text-secondary text-sm mt-1">
        Choose a unique username for your account
      </p>
    </div>
  ),
}
