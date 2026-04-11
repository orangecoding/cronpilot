import { Timer, Plus } from 'lucide-react'
import { LoadingSpinner } from '../ui/LoadingSpinner.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Button } from '../ui/Button.jsx'
import { JobListItem } from './JobListItem.jsx'

export function JobList({ jobs, isLoading, error, onNew, onEdit, onDelete, onToggle, onTrigger, onHistory }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-400/80 text-sm">{error}</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Timer}
        title="No jobs configured"
        description="Create your first cron job to get started scheduling tasks."
        action={<Button icon={Plus} onClick={onNew}>Create job</Button>}
      />
    )
  }

  const sorted = [...jobs].sort((a, b) => {
    if (!a.next_run_at && !b.next_run_at) return 0
    if (!a.next_run_at) return 1
    if (!b.next_run_at) return -1
    return new Date(a.next_run_at) - new Date(b.next_run_at)
  })

  return (
    <div className="space-y-2.5">
      {sorted.map(job => (
        <JobListItem
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onTrigger={onTrigger}
          onHistory={onHistory}
        />
      ))}
    </div>
  )
}
