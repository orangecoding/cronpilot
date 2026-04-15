import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react'
import { Badge } from '../ui/Badge.jsx'
import { formatLocalDate } from '../../utils/date.js'

function formatDuration(ms) {
  if (!ms) return null
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function RunRecord({ run }) {
  const [expanded, setExpanded] = useState(false)
  const hasOutput = run.stdout || run.stderr

  const statusConfig = {
    success: { variant: 'success', icon: CheckCircle },
    error:   { variant: 'error',   icon: XCircle      },
    running: { variant: 'running', icon: Clock        },
  }
  const { variant, icon: Icon } = statusConfig[run.status] || { variant: 'neutral', icon: Clock }

  return (
    <div className="rounded-lg border border-[#2a2a2a] overflow-hidden">
      <button
        type="button"
        onClick={() => hasOutput && setExpanded(e => !e)}
        className={`w-full flex items-center gap-3 p-3 text-left bg-[#161616] transition-colors ${
          hasOutput ? 'hover:bg-[#1e1e1e] cursor-pointer' : 'cursor-default'
        }`}
      >
        <Badge variant={variant}>
          <Icon size={10} />
          {run.status}
        </Badge>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#909090]">
            {formatLocalDate(run.started_at)}
            {run.duration_ms != null && (
              <span className="ml-2 text-[#505050]">{formatDuration(run.duration_ms)}</span>
            )}
          </p>
          <p className="text-[11px] text-[#505050]">
            {run.triggered_by === 'manual' ? 'Manual trigger' : 'Scheduled'}
            {run.exit_code != null && (
              <span className="ml-2 font-mono">exit {run.exit_code}</span>
            )}
          </p>
        </div>
        {hasOutput && (
          <span className="text-[#505050] shrink-0">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        )}
      </button>

      {expanded && hasOutput && (
        <div className="border-t border-[#2a2a2a] bg-[#0d0d0d] p-3 space-y-3">
          {run.stdout && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Terminal size={11} className="text-emerald-400/60" />
                <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-widest">stdout</span>
              </div>
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto leading-relaxed">
                {run.stdout}
              </pre>
            </div>
          )}
          {run.stderr && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Terminal size={11} className="text-rose-400/60" />
                <span className="text-[10px] font-mono text-rose-400/60 uppercase tracking-widest">stderr</span>
              </div>
              <pre className="text-xs text-rose-400 font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto leading-relaxed">
                {run.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
