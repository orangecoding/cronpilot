/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

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
      style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid #2a2a2a', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #2a2a2a', background: 'linear-gradient(135deg, #1e1e1e 0%, #161616 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '3px', height: '20px', background: 'linear-gradient(180deg, #383838, #2a2a2a)', borderRadius: '2px' }} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#efefef', fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: 'transparent', border: '1px solid transparent', color: '#505050', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#efefef'; e.currentTarget.style.borderColor = '#383838' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#505050'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #2a2a2a', background: '#0d0d0d' }}>
            {footer}
          </div>
        )}
      </div>
    </dialog>
  )
}
