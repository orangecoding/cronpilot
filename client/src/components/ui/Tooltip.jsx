export function Tooltip({ children, label }) {
  return (
    <div className="relative group/tip inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[11px] font-medium text-[#e1e7f0] bg-[#1a2540] border border-[#253660] rounded-md whitespace-nowrap z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg">
        {label}
      </span>
    </div>
  )
}
