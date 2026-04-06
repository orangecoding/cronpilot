import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Dialog({ open, onClose, title, children, footer }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e) => { if (e.target === el) onClose() }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [onClose])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => onClose()
    el.addEventListener('cancel', handler)
    return () => el.removeEventListener('cancel', handler)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', background: '#151618', border: '1px solid #252729', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #252729', background: 'linear-gradient(135deg, #1c1e20 0%, #151618 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '20px', background: 'linear-gradient(180deg, #4a4560, #302c42)', borderRadius: '2px' }} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#e1e7f0', fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: 'transparent', border: '1px solid transparent', color: '#3d5070', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#252729'; e.currentTarget.style.color = '#e1e7f0'; e.currentTarget.style.borderColor = '#333638' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3d5070'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #252729', background: '#111314' }}>
            {footer}
          </div>
        )}
      </div>
    </dialog>
  )
}
