/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { X, RefreshCw, History } from 'lucide-react'
import { useRunHistory } from '../../hooks/useRunHistory.js'
import { RunRecord } from './RunRecord.jsx'
import { LoadingSpinner } from '../ui/LoadingSpinner.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Button } from '../ui/Button.jsx'
import { Tooltip } from '../ui/Tooltip.jsx'

export function RunHistoryPanel({ job, onClose }) {
  const { runs, total, isLoading, error, loadMore, hasMore, refresh } = useRunHistory(job?.id)

  return (
    <div className="flex flex-col h-full bg-[#161616]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] shrink-0 bg-[#0d0d0d]">
        <div className="flex items-center gap-2.5">
          <History size={14} className="text-red-400/60" />
          <div>
            <h2 className="text-sm font-semibold text-[#efefef] leading-none">{job?.name}</h2>
            <p className="text-[11px] text-[#505050] mt-0.5">{total} run{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip label="Refresh">
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refresh} />
          </Tooltip>
          <Tooltip label="Close">
            <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
          </Tooltip>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && runs.length === 0 && (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        )}
        {error && <p className="text-xs text-rose-400 text-center py-4">{error}</p>}
        {!isLoading && runs.length === 0 && !error && (
          <EmptyState icon={History} title="No runs yet" description="This job has not run yet." />
        )}
        {runs.map(run => <RunRecord key={run.id} run={run} />)}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button variant="secondary" size="sm" onClick={loadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
