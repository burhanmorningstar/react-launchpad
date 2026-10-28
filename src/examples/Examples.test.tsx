import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import FormsPage from '@/features/examples/pages/FormsPage'
import OverviewPage from '@/features/examples/pages/OverviewPage'
import TablesPage from '@/features/examples/pages/TablesPage'
import i18n from '@/i18n'

import { demoAuth } from './adapters/demoAuth'
import { demoData } from './adapters/demoData'

describe('Integrated Backend-Free Examples Application', () => {
  beforeEach(() => {
    demoData.reset()
    demoAuth.reset()
    i18n.changeLanguage('en')
  })

  it('handles user creation and simulates 422 server conflict on duplicate email', async () => {
    render(
      <MemoryRouter>
        <FormsPage />
      </MemoryRouter>
    )

    // Form inputs exist
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitBtn = screen.getByRole('button', { name: /submit profile/i })

    // 1. Submit with duplicate / conflict email
    fireEvent.change(firstNameInput, { target: { value: 'Conflict' } })
    fireEvent.change(lastNameInput, { target: { value: 'User' } })
    fireEvent.change(emailInput, { target: { value: 'taken@example.com' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/validation failed for one or more fields/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/email is already in use/i)).toBeInTheDocument()
    })

    // 2. Submit with valid unique email
    fireEvent.change(emailInput, {
      target: { value: 'unique.dev@example.com' },
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(
        screen.getByText(/profile created successfully/i)
      ).toBeInTheDocument()
    })

    // User is now in memory demoData
    const found = demoData
      .listUsers({ search: 'unique.dev' })
      .items.find((u) => u.email === 'unique.dev@example.com')
    expect(found).toBeDefined()
    expect(found?.firstName).toBe('Conflict')
  })

  it('manages data table filtering, user editing, and deletion confirmation', async () => {
    // Add a specific target user to demo data
    const target = demoData.createUser({
      firstName: 'Katherine',
      lastName: 'Johnson',
      email: 'katherine.johnson@example.com',
      role: 'moderator',
      status: 'active',
    })

    render(
      <MemoryRouter initialEntries={['/examples/tables']}>
        <TablesPage />
      </MemoryRouter>
    )

    // Verify user is visible in table
    expect(screen.getByText('Katherine Johnson')).toBeInTheDocument()

    // Filter table by search
    const searchInput = screen.getByPlaceholderText(/search users/i)
    fireEvent.change(searchInput, { target: { value: 'Katherine' } })

    expect(screen.getByText('Katherine Johnson')).toBeInTheDocument()

    // Click delete on Katherine Johnson row
    const deleteBtn = screen.getByLabelText(/delete katherine johnson/i)
    fireEvent.click(deleteBtn)

    // Confirm alert dialog appears
    const confirmModal = screen.getByRole('alertdialog')
    expect(confirmModal).toBeInTheDocument()

    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(confirmDeleteBtn)

    // Verify user is removed from demoData
    await waitFor(() => {
      expect(demoData.getUserById(target.id)).toBeNull()
    })
  })

  it('supports role switching in-memory without persistent token storage', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    )

    // Starts as admin by default in demoAuth
    expect(screen.getByText(/switch to user/i)).toBeInTheDocument()

    // Switch to standard user
    fireEvent.click(screen.getByRole('button', { name: /switch to user/i }))
    expect(demoAuth.getSession()?.user?.role).toBe('user')

    // Switch back to admin
    fireEvent.click(screen.getByRole('button', { name: /switch to admin/i }))
    expect(demoAuth.getSession()?.user?.role).toBe('admin')
  })

  it('preserves localized translations and switches dynamically between en and tr', async () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Frontend Examples')).toBeInTheDocument()

    // Switch language to Turkish
    await act(async () => {
      await i18n.changeLanguage('tr')
    })

    await waitFor(() => {
      expect(screen.getByText('Frontend Örnekleri')).toBeInTheDocument()
    })
  })
})
