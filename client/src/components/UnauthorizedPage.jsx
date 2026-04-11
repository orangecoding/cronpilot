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
            <span className="text-[#efefef]">Cron</span>
            <span className="text-[#e04a38]">Pilot</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border border-[#2a2a2a] bg-[#161616] overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(224,74,56,0.06)' }}
        >
          {/* Red top bar */}
          <div className="h-0.5 bg-[#e04a38]" />

          <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center">
              <ShieldOff size={26} className="text-[#e04a38]" />
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-lg font-semibold text-[#efefef] mb-1.5">Access Denied</h1>
              <p className="text-sm text-[#909090] leading-relaxed">
                This CronPilot instance is protected by a gateway token.
                Include your token as a URL query parameter to continue.
              </p>
            </div>

            {/* URL hint */}
            <div className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 text-left">
              <p className="text-[10px] uppercase tracking-widest text-[#505050] mb-1.5 font-medium">Required URL format</p>
              <code className="text-xs text-[#909090] break-all font-mono">{exampleUrl}</code>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#505050] mt-6">
          Contact your administrator if you do not have a token.
        </p>
      </div>
    </div>
  )
}
