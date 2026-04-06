import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CronBuilder } from '../src/components/cron/CronBuilder.jsx'

describe('CronBuilder', () => {
  it('shows * * * * * expression by default', () => {
    render(<CronBuilder value="* * * * *" onChange={vi.fn()} />)
    expect(screen.getByText('* * * * *')).toBeInTheDocument()
  })

  it('calls onChange when a preset is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CronBuilder value="* * * * *" onChange={onChange} />)
    // Get the preset buttons specifically (they're in the flex flex-wrap gap-2 container)
    const presetButtons = screen.getAllByText('Every hour')
    // The first one is the preset chip button
    await user.click(presetButtons[0])
    expect(onChange).toHaveBeenCalledWith('0 * * * *')
  })

  it('highlights the active preset', () => {
    render(<CronBuilder value="0 * * * *" onChange={vi.fn()} />)
    const hourlyBtns = screen.getAllByText('Every hour')
    expect(hourlyBtns[0].className).toContain('bg-red-500')
  })

  it('calls onChange with correct expression for Daily preset', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CronBuilder value="* * * * *" onChange={onChange} />)
    await user.click(screen.getByText('Daily'))
    expect(onChange).toHaveBeenCalledWith('0 0 * * *')
  })
})
