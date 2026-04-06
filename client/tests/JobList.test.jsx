import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JobList } from '../src/components/jobs/JobList.jsx'

const noop = () => {}

const mockJobs = [
  {
    id: 1,
    name: 'Daily backup',
    description: 'Backs up the database',
    cron_expr: '0 2 * * *',
    cron_human: 'At 02:00 AM',
    command_type: 'shell',
    command: '/opt/backup.sh',
    enabled: true,
    last_run_status: 'success',
    last_run_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Hourly cleanup',
    description: '',
    cron_expr: '0 * * * *',
    cron_human: 'Every hour',
    command_type: 'inline',
    command: 'rm -f /tmp/*.log',
    enabled: false,
    last_run_status: null,
    last_run_at: null
  }
]

describe('JobList', () => {
  it('shows loading spinner when isLoading is true', () => {
    render(
      <JobList
        jobs={[]}
        isLoading={true}
        error={null}
        onNew={noop}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onTrigger={noop}
        onHistory={noop}
      />
    )
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('shows empty state when jobs array is empty', () => {
    render(
      <JobList
        jobs={[]}
        isLoading={false}
        error={null}
        onNew={noop}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onTrigger={noop}
        onHistory={noop}
      />
    )
    expect(screen.getByText('No jobs configured')).toBeInTheDocument()
  })

  it('renders correct number of job items', () => {
    render(
      <JobList
        jobs={mockJobs}
        isLoading={false}
        error={null}
        onNew={noop}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onTrigger={noop}
        onHistory={noop}
      />
    )
    expect(screen.getByText('Daily backup')).toBeInTheDocument()
    expect(screen.getByText('Hourly cleanup')).toBeInTheDocument()
  })

  it('shows error message when error is set', () => {
    render(
      <JobList
        jobs={[]}
        isLoading={false}
        error="Network error"
        onNew={noop}
        onEdit={noop}
        onDelete={noop}
        onToggle={noop}
        onTrigger={noop}
        onHistory={noop}
      />
    )
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
