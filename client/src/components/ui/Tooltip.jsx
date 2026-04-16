/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export function Tooltip({ children, label }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  function show() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    })
    setVisible(true)
  }

  function hide() {
    setVisible(false)
  }

  return (
    <div ref={triggerRef} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && createPortal(
        <span
          style={{
            position: 'fixed',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            transform: 'translate(-50%, calc(-100% - 6px))',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="px-2 py-1 text-[11px] font-medium text-[#efefef] bg-[#2a2a2a] border border-[#383838] rounded-md whitespace-nowrap shadow-lg"
        >
          {label}
        </span>,
        document.body
      )}
    </div>
  )
}
