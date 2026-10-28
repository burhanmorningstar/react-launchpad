import type { Preview } from '@storybook/react-vite'

import { withGlobalProviders } from './decorators'
import '../src/styles/globals.css'

const preview: Preview = {
  decorators: [withGlobalProviders],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global interface theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      name: 'Locale',
      description: 'Active language locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'tr', title: 'Türkçe' },
        ],
        dynamicTitle: true,
      },
    },
    direction: {
      name: 'Direction',
      description: 'Text and layout direction',
      defaultValue: 'ltr',
      toolbar: {
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR (Left-to-Right)' },
          { value: 'rtl', title: 'RTL (Right-to-Left)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
}

export default preview
