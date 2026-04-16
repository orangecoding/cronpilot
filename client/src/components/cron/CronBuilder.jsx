/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useState, useEffect } from 'react'

const FIELDS = [
  { key: 'minute',     label: 'Minute',      min: 0,  max: 59, options: Array.from({ length: 60 }, (_, i) => i) },
  { key: 'hour',       label: 'Hour',        min: 0,  max: 23, options: Array.from({ length: 24 }, (_, i) => i) },
  { key: 'dayOfMonth', label: 'Day (Month)', min: 1,  max: 31, options: Array.from({ length: 31 }, (_, i) => i + 1) },
  {
    key: 'month', label: 'Month', min: 1, max: 12,
    options: [
      { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
      { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
      { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
      { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
    ]
  },
  {
    key: 'dayOfWeek', label: 'Day (Week)', min: 0, max: 6,
    options: [
      { value: 0, label: 'Sun' }, { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' },
      { value: 3, label: 'Wed' }, { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' },
      { value: 6, label: 'Sat' }
    ]
  }
]

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour',   expr: '0 * * * *' },
  { label: 'Daily',        expr: '0 0 * * *' },
  { label: 'Every Sunday', expr: '0 0 * * 0' },
  { label: '1st of month', expr: '0 0 1 * *' },
  { label: 'Weekdays',     expr: '0 9 * * 1-5' }
]

function defaultFieldState() {
  return { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
}

function stateToExpr(state) {
  return `${state.minute} ${state.hour} ${state.dayOfMonth} ${state.month} ${state.dayOfWeek}`
}

const inputCls = 'w-16 px-2 py-1.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-center text-xs text-[#efefef] font-mono focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-colors'

function FieldEditor({ field, value, onChange }) {
  const isEvery = value === '*'
  const isRange = !isEvery && value.includes('-')
  const mode = isEvery ? 'every' : isRange ? 'range' : 'specific'

  const getValues = () => mode === 'specific' ? value.split(',').map(Number) : []
  const getRangeFrom = () => isRange ? Number(value.split('-')[0]) : field.min
  const getRangeTo   = () => isRange ? Number(value.split('-')[1]) : field.max

  const setMode = (m) => {
    if (m === 'every') onChange('*')
    else if (m === 'range') onChange(`${field.min}-${field.max}`)
    else onChange(String(field.options[0]?.value ?? field.options[0]))
  }

  const toggleSpecific = (v) => {
    const current = getValues()
    const next = current.includes(v) ? current.filter(x => x !== v) : [...current, v].sort((a, b) => a - b)
    onChange(next.length === 0 ? '*' : next.join(','))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#909090]">{field.label}</span>
        <div className="flex rounded-md overflow-hidden border border-[#2a2a2a] text-[11px]">
          {['every', 'specific', 'range'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 capitalize transition-colors ${
                mode === m
                  ? 'bg-bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-[#0d0d0d] text-[#505050] hover:text-[#909090]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'every' && (
        <p className="text-[11px] text-[#505050]">Every {field.label.toLowerCase()}</p>
      )}

      {mode === 'specific' && (
        <div className="flex flex-wrap gap-1">
          {field.options.map(opt => {
            const v = opt.value ?? opt
            const l = opt.label ?? String(opt).padStart(2, '0')
            const selected = getValues().includes(v)
            return (
              <button
                key={v}
                type="button"
                onClick={() => toggleSpecific(v)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border transition-all ${
                  selected
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-[#0d0d0d] text-[#505050] border-[#2a2a2a] hover:text-[#909090] hover:border-[#383838]'
                }`}
              >
                {l}
              </button>
            )
          })}
        </div>
      )}

      {mode === 'range' && (
        <div className="flex items-center gap-2 text-xs">
          <input type="number" min={field.min} max={field.max} value={getRangeFrom()}
            onChange={e => onChange(`${e.target.value}-${getRangeTo()}`)}
            className={inputCls} />
          <span className="text-[#505050]">to</span>
          <input type="number" min={field.min} max={field.max} value={getRangeTo()}
            onChange={e => onChange(`${getRangeFrom()}-${e.target.value}`)}
            className={inputCls} />
        </div>
      )}
    </div>
  )
}

export function CronBuilder({ value, onChange }) {
  const [state, setState] = useState(defaultFieldState)

  useEffect(() => {
    if (!value) return
    const parts = value.trim().split(/\s+/)
    if (parts.length === 5) {
      setState({ minute: parts[0], hour: parts[1], dayOfMonth: parts[2], month: parts[3], dayOfWeek: parts[4] })
    }
  }, [value])

  const updateField = (key, val) => {
    const next = { ...state, [key]: val }
    setState(next)
    onChange(stateToExpr(next))
  }

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-[10px] font-semibold text-[#505050] uppercase tracking-widest mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button
              key={p.expr}
              type="button"
              onClick={() => onChange(p.expr)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                value === p.expr
                  ? 'bg-red-500/15 text-red-400 border-red-500/40'
                  : 'bg-[#0d0d0d] text-[#505050] border-[#2a2a2a] hover:text-[#909090] hover:border-[#383838]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Field editors */}
      <div className="space-y-3 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] p-4">
        {FIELDS.map(field => (
          <FieldEditor key={field.key} field={field} value={state[field.key]} onChange={val => updateField(field.key, val)} />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#505050]">Expression:</span>
        <code className="text-xs font-mono bg-[#0d0d0d] border border-[#2a2a2a] px-2 py-0.5 rounded-md text-red-400">
          {stateToExpr(state)}
        </code>
      </div>
    </div>
  )
}
