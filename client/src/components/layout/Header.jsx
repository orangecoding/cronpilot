import { Plus, CalendarClock } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

export function Header({ onNew }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-8 py-3 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#2a2a2a]">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-xl bg-red-500/15 border border-red-500/40" />
          <CalendarClock size={18} className="relative z-10 text-red-400" />
        </div>
        <div className="flex flex-col gap-0.5 leading-none">
          <div className="flex items-baseline gap-0 text-xl font-bold tracking-tight">
            <span className="text-white">Cron</span>
            <span className="text-red-400">Pilot</span>
          </div>
          <span className="text-[9px] font-semibold text-[#505050] uppercase tracking-[0.18em]">job scheduler</span>
        </div>
      </div>
      <Button icon={Plus} onClick={onNew} size="sm">
        <span className="hidden sm:inline">New Job</span>
      </Button>
    </header>
  )
}
