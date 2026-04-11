import { Pencil, Trash2, Play, History, CheckCircle, XCircle, Clock, Minus } from 'lucide-react'
import { Badge } from '../ui/Badge.jsx'
import { EnableToggle } from './EnableToggle.jsx'
import { Button } from '../ui/Button.jsx'
import { Tooltip } from '../ui/Tooltip.jsx'
import { MarkdownDescription } from '../ui/MarkdownDescription.jsx'

function StatusBadge({ status }) {
  if (!status) return <Badge variant="neutral">Never run</Badge>
  const map = {
    success: { variant: 'success', icon: CheckCircle, label: 'Success' },
    error:   { variant: 'error',   icon: XCircle,      label: 'Failed'  },
    running: { variant: 'running', icon: Clock,         label: 'Running' },
  }
  const { variant, icon: Icon, label } = map[status] || { variant: 'neutral', icon: Minus, label: status }
  return (
    <Badge variant={variant}>
      <Icon size={10} />
      {label}
    </Badge>
  )
}

export function JobListItem({ job, onEdit, onDelete, onToggle, onTrigger, onHistory }) {
  return (
    <div className={`group relative rounded-xl border transition-all duration-200 ${
      job.enabled
        ? 'bg-[#161616] border-[#2a2a2a] border-l-[3px] border-l-red-500/40 hover:border-t-[#383838] hover:border-r-[#383838] hover:border-b-[#383838] hover:border-l-red-500/60 hover:shadow-xl hover:shadow-black/30'
        : 'bg-[#111111]/60 border-[#222222] opacity-60'
    }`}>
      <div className="flex items-start gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#efefef] truncate text-sm">{job.name}</h3>
            {!job.enabled && <Badge variant="neutral">Disabled</Badge>}
          </div>

          {job.description && (
            <MarkdownDescription source={job.description} />
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <code className="text-xs bg-[#0d0d0d] text-red-400/80 px-2 py-0.5 rounded-md font-mono border border-[#2a2a2a]">
              {job.cron_expr}
            </code>
            <span className="text-xs text-[#505050]">{job.cron_human}</span>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={job.last_run_status} />
            {job.last_run_at && (
              <span className="text-xs text-[#505050]">
                {new Date(job.last_run_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <Tooltip label={job.enabled ? 'Disable job' : 'Enable job'}>
            <EnableToggle enabled={job.enabled} onChange={() => onToggle(job.id)} />
          </Tooltip>
          <div className="flex items-center gap-0.5">
            <Tooltip label="Run cron now">
              <Button variant="ghost" size="sm" icon={Play} onClick={() => onTrigger(job.id)} />
            </Tooltip>
            <Tooltip label="Show history">
              <Button variant="ghost" size="sm" icon={History} onClick={() => onHistory(job)} />
            </Tooltip>
            <Tooltip label="Edit cron">
              <Button variant="ghost" size="sm" icon={Pencil} onClick={() => onEdit(job)} />
            </Tooltip>
            <Tooltip label="Delete cron">
              <Button
                variant="ghost" size="sm" icon={Trash2}
                onClick={() => onDelete(job)}
                className="text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
