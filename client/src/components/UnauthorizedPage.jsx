import { ShieldOff } from 'lucide-react'

export function UnauthorizedPage() {
  const exampleUrl = `${window.location.origin}?token=YOUR_TOKEN`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#e04a38]" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#e1e7f0]">Cron</span>
            <span className="text-[#e04a38]">Pilot</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border border-[#1a2540] bg-[#0d1120] overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(224,74,56,0.06)' }}
        >
          {/* Red top bar */}
          <div className="h-0.5 bg-[#e04a38]" />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[#121828] border border-[#1a2540] flex items-center justify-center">
              <ShieldOff size={26} className="text-[#e04a38]" />
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-lg font-semibold text-[#e1e7f0] mb-1.5">Access Denied</h1>
              <p className="text-sm text-[#8899bb] leading-relaxed">
                This CronPilot instance is protected by a gateway token.
                Include your token as a URL query parameter to continue.
              </p>
            </div>

            {/* URL hint */}
            <div className="w-full rounded-lg border border-[#1a2540] bg-[#080b14] px-4 py-3 text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#3d5070] mb-1.5 font-medium">Required URL format</p>
              <code className="text-xs text-[#8899bb] break-all font-mono">{exampleUrl}</code>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#3d5070] mt-6">
          Contact your administrator if you do not have a token.
        </p>
      </div>
    </div>
  )
}
