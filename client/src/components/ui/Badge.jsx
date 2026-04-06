export function Badge({ children, variant = 'neutral', size = 'sm' }) {
  const variants = {
    success: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    error:   'bg-rose-400/10 text-rose-400 border border-rose-400/20',
    warning: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    neutral: 'bg-[#1a2540] text-[#8899bb] border border-[#253660]',
    info:    'bg-red-400/10 text-red-400 border border-red-400/20',
    running: 'bg-amber-400/10 text-amber-400 border border-amber-400/20 animate-pulse',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
