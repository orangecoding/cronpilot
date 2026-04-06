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
      <div className="flex rounded-lg border border-[#1a2540] p-0.5 bg-[#080b14] w-fit">
        {['builder', 'manual'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              mode === m
                ? 'bg-[#1a2540] text-[#e1e7f0] shadow-sm'
                : 'text-[#3d5070] hover:text-[#8899bb]'
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
