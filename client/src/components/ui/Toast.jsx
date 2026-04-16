/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)
let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = ++idCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />)}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const isSuccess = toast.type === 'success'
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto border backdrop-blur-sm ${
      isSuccess
        ? 'bg-[#0a1a14]/95 border-emerald-400/20 shadow-emerald-900/30'
        : 'bg-[#1a0a0e]/95 border-rose-400/20 shadow-rose-900/30'
    }`}>
      {isSuccess
        ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        : <XCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
      }
      <p className={`flex-1 text-sm font-medium ${isSuccess ? 'text-emerald-300' : 'text-rose-300'}`}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`shrink-0 p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
