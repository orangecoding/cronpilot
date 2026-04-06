export function Button({ children, variant = 'primary', size = 'md', icon: Icon, disabled, onClick, type = 'button', className = '', ...rest }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0d1120] disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 shadow-lg shadow-red-500/20',
    secondary: 'bg-[#121828] text-[#e1e7f0] border border-[#253660] hover:bg-[#1a2540] hover:border-red-500/40 focus:ring-red-500',
    ghost:     'text-[#8899bb] hover:bg-[#1a2540] hover:text-[#e1e7f0] focus:ring-red-500',
    danger:    'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-400/50 focus:ring-rose-500',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}
