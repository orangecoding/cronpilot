import { Clock, AlertCircle, Loader } from 'lucide-react'
import { formatLocalDate } from '../../utils/date.js'

export function CronExplanation({ validation }) {
  const { valid, human, next_runs, error, isLoading } = validation

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#505050] py-1.5">
        <Loader size={12} className="animate-spin text-red-400/50" />
        Validating...
      </div>
    )
  }

  if (valid === null) return null

  if (!valid) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-400/5 border border-rose-400/20 text-xs text-rose-400">
        <AlertCircle size={13} className="shrink-0 mt-0.5" />
        <span>{error || 'Invalid cron expression'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-400/5 border border-red-400/15">
        <Clock size={13} className="text-red-400 shrink-0" />
        <span className="text-xs font-medium text-red-300">{human}</span>
      </div>
      {next_runs && next_runs.length > 0 && (
        <p className="text-xs text-[#505050] leading-relaxed">
          <span className="text-[#909090] font-medium">Next: </span>
          {next_runs.map((t, i) => (
            <span key={t}>
              {formatLocalDate(t)}
              {i < next_runs.length - 1 ? <span className="text-[#383838]"> &bull; </span> : ''}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
