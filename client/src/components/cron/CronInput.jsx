/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useState } from 'react'
import { CronBuilder } from './CronBuilder.jsx'
import { CronManual } from './CronManual.jsx'
import { CronExplanation } from './CronExplanation.jsx'
import { useCronValidation } from '../../hooks/useCronValidation.js'

export function CronInput({ value, onChange }) {
  const [mode, setMode] = useState('builder')
  const validation = useCronValidation(value)

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg border border-[#2a2a2a] p-0.5 bg-[#0d0d0d] w-fit">
        {['builder', 'manual'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              mode === m
                ? 'bg-[#2a2a2a] text-[#efefef] shadow-sm'
                : 'text-[#505050] hover:text-[#909090]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'builder'
        ? <CronBuilder value={value} onChange={onChange} />
        : <CronManual value={value} onChange={onChange} validation={validation} />
      }

      <CronExplanation validation={validation} />
    </div>
  )
}
