/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CronManual } from '../src/components/cron/CronManual.jsx'

const validValidation = {
  valid: true,
  human: 'Every minute',
  next_runs: [],
  error: null,
  isLoading: false
}

const loadingValidation = {
  valid: null,
  human: null,
  next_runs: [],
  error: null,
  isLoading: true
}

describe('CronManual', () => {
  it('renders the input with the provided value', () => {
    render(<CronManual value="* * * * *" onChange={vi.fn()} validation={validValidation} />)
    expect(screen.getByRole('textbox')).toHaveValue('* * * * *')
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CronManual value="" onChange={onChange} validation={loadingValidation} />)
    await user.type(screen.getByRole('textbox'), '0')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows a checkmark icon when validation is valid', () => {
    render(<CronManual value="* * * * *" onChange={vi.fn()} validation={validValidation} />)
    // CheckCircle from lucide renders as an SVG
    const input = screen.getByRole('textbox')
    const wrapper = input.parentElement
    expect(wrapper.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show icon when isLoading', () => {
    render(<CronManual value="x" onChange={vi.fn()} validation={loadingValidation} />)
    const input = screen.getByRole('textbox')
    // The status icon span should not be rendered
    expect(input.nextElementSibling).toBeNull()
  })
})
