/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useRunHistory(jobId) {
  const [runs, setRuns] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchRuns = useCallback(async (newOffset = 0) => {
    if (!jobId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.getRuns(jobId, { limit, offset: newOffset })
      if (newOffset === 0) {
        setRuns(res.data)
      } else {
        setRuns(prev => [...prev, ...res.data])
      }
      setTotal(res.total)
      setOffset(newOffset)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    setRuns([])
    setTotal(0)
    setOffset(0)
    fetchRuns(0)
  }, [jobId, fetchRuns])

  const loadMore = useCallback(() => {
    fetchRuns(offset + limit)
  }, [fetchRuns, offset, limit])

  return { runs, total, isLoading, error, loadMore, hasMore: runs.length < total, refresh: () => fetchRuns(0) }
}
