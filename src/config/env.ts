import { z } from 'zod'

/**
 * Environment variable schema with validation
 * Validates public runtime configuration when the app module loads.
 */
const envSchema = z.object({
  // API
  VITE_API_URL: z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().url().optional()
  ),

  // App
  VITE_APP_NAME: z.string().default('Boilerplate'),
  VITE_APP_VERSION: z.string().default('0.0.0'),
  VITE_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // MSW
  VITE_MSW_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Sentry (optional)
  VITE_SENTRY_DSN: z.string().optional(),

  // Analytics (optional)
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
  VITE_ANALYTICS_ENABLED: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  // Vite built-in
  MODE: z.string(),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),
})

/**
 * Parse and validate environment variables
 * Throws an error if validation fails
 */
function parseEnv() {
  const parsed = envSchema.safeParse(import.meta.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

const parsedEnv = parseEnv()

/**
 * Type-safe environment variables
 */
export const env = {
  // API
  API_URL: parsedEnv.VITE_API_URL,

  // App
  APP_NAME: parsedEnv.VITE_APP_NAME,
  APP_VERSION: parsedEnv.VITE_APP_VERSION,
  APP_ENV: parsedEnv.VITE_APP_ENV,

  // Feature flags
  MSW_ENABLED: parsedEnv.VITE_MSW_ENABLED,

  // Monitoring
  SENTRY_DSN: parsedEnv.VITE_SENTRY_DSN,

  // Analytics
  POSTHOG_KEY: parsedEnv.VITE_POSTHOG_KEY,
  POSTHOG_HOST: parsedEnv.VITE_POSTHOG_HOST,
  ANALYTICS_ENABLED: parsedEnv.VITE_ANALYTICS_ENABLED,

  // Environment checks
  IS_DEV: parsedEnv.DEV,
  IS_PROD: parsedEnv.PROD,
  IS_STAGING: parsedEnv.VITE_APP_ENV === 'staging',
} as const

export type Env = typeof env
