/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'

// Take the first `n` non-empty lines of raw markdown source
function previewSource(source, n) {
  return source.split('\n').filter(l => l.trim() !== '').slice(0, n).join('\n')
}

// True when source has more non-empty lines than the preview limit
function hasOverflow(source, n) {
  return source.split('\n').filter(l => l.trim() !== '').length > n
}

function renderHtml(source) {
  return { __html: marked.parse(source, { breaks: true }) }
}

export function MarkdownDescription({ source, previewLines = 3 }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)
  const showPopover = hasOverflow(source, previewLines)

  function show() {
    if (!showPopover || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setVisible(true)
  }

  function hide() {
    setVisible(false)
  }

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
      <div
        className="md-preview text-xs text-[#505050] mb-2"
        dangerouslySetInnerHTML={renderHtml(previewSource(source, previewLines))}
      />
      {visible && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: `${Math.max(pos.width, 280)}px`,
            maxWidth: '380px',
            maxHeight: '260px',
            zIndex: 9999,
          }}
          className="overflow-y-auto bg-[#1e1e1e] border border-[#383838] rounded-xl shadow-2xl p-3 md-popover"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div dangerouslySetInnerHTML={renderHtml(source)} />
        </div>,
        document.body
      )}
    </div>
  )
}
