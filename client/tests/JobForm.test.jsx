/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobForm } from '../src/components/jobs/JobForm.jsx'

// Mock useCronValidation to avoid real API calls
vi.mock('../src/hooks/useCronValidation.js', () => ({
  useCronValidation: () => ({
    valid: true,
    human: 'Every minute',
    next_runs: [],
    error: null,
    isLoading: false
  })
}))

// Mock api for validation
vi.mock('../src/api/client.js', () => ({
  api: {
    validateCron: vi.fn().mockResolvedValue({ valid: true, human: 'Every minute', next_runs: [] })
  }
}))

describe('JobForm', () => {
  it('renders with default values for create mode', () => {
    render(<JobForm onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Daily backup')).toHaveValue('')
    expect(screen.getByText('Inline command')).toBeInTheDocument()
    expect(screen.getByText('Shell script')).toBeInTheDocument()
  })

  it('populates fields from initialValues in edit mode', () => {
    const job = {
      name: 'Test job',
      description: 'A test',
      cron_expr: '0 * * * *',
      command_type: 'inline',
      command: 'echo hi',
      enabled: true,
      ntfy_enabled: false,
      ntfy_server: 'https://ntfy.sh',
      ntfy_topic: '',
      ntfy_on_run: false,
      ntfy_on_error: true
    }
    render(<JobForm initialValues={job} onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Daily backup')).toHaveValue('Test job')
    expect(screen.getByPlaceholderText('Optional description')).toHaveValue('A test')
  })

  it('shows ntfy fields when ntfy is enabled', async () => {
    const user = userEvent.setup()
    render(<JobForm onSubmit={vi.fn()} />)

    // Open ntfy section
    await user.click(screen.getByText('Notifications (ntfy)'))
    // Enable ntfy
    const toggle = screen.getAllByRole('switch')[1]
    await user.click(toggle)

    expect(screen.getByPlaceholderText('my-cron-alerts')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('https://ntfy.sh')).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const { container } = render(<JobForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('Daily backup'), 'My job')
    await user.type(screen.getByPlaceholderText(/echo/), 'echo test')

    fireEvent.submit(container.querySelector('form'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My job', command: 'echo test' })
      )
    })
  })

  it('shows field errors passed as props', () => {
    render(
      <JobForm
        onSubmit={vi.fn()}
        fieldErrors={{ name: 'Name is required', cron_expr: 'Invalid expression' }}
      />
    )
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Invalid expression')).toBeInTheDocument()
  })
})
