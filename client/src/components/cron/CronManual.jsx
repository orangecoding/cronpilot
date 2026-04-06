import { CheckCircle, XCircle } from 'lucide-react'

export function CronManual({ value, onChange, validation }) {
  const { valid, isLoading } = validation

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="* * * * *"
          className="w-full px-3 py-2.5 pr-9 rounded-lg bg-[#080b14] border border-[#1a2540] text-sm font-mono text-red-300 placeholder-[#253660] focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-colors"
          aria-label="Cron expression"
        />
        {!isLoading && valid !== null && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {valid
              ? <CheckCircle size={14} className="text-emerald-400" />
              : <XCircle size={14} className="text-rose-400" />
            }
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#3d5070] font-mono">minute &bull; hour &bull; day-of-month &bull; month &bull; day-of-week</p>
    </div>
  )
}
