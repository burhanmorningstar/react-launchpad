import { expect, it } from 'vitest'

import { createCustomClient } from '@/core/api/client'

import { projectConfig } from './project'

it('uses the project API setting for the shared HTTP client', () => {
  const previous = projectConfig.apiUrl
  projectConfig.apiUrl = 'https://api.example.test/project'
  try {
    expect(createCustomClient().defaults.baseURL).toBe(
      'https://api.example.test/project'
    )
  } finally {
    projectConfig.apiUrl = previous
  }
})
