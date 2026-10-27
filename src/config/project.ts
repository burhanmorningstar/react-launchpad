import { env } from './env'

export interface ProjectConfig {
  name: string
  brand: { mark: string; tagline: string }
  defaultLocale: string
  homePath: `/${string}`
  examplesEnabled: boolean
  apiUrl?: string
}

// Customize the starter here. All VITE_* values are public browser data.
export const projectConfig: ProjectConfig = {
  name: 'React Launchpad',
  brand: {
    mark: 'RL',
    tagline: 'A clear starting point for your next idea.',
  },
  defaultLocale: 'en',
  homePath: '/',
  examplesEnabled: true,
  apiUrl: env.API_URL,
}
