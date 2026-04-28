/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client.js'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.getJobs()
      setJobs(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const createJob = useCallback(async (body) => {
    const res = await api.createJob(body)
    await fetchJobs()
    return res.data
  }, [fetchJobs])

  const updateJob = useCallback(async (id, body) => {
    const res = await api.updateJob(id, body)
    await fetchJobs()
    return res.data
  }, [fetchJobs])

  const deleteJob = useCallback(async (id) => {
    await api.deleteJob(id)
    await fetchJobs()
  }, [fetchJobs])

  const toggleJob = useCallback(async (id) => {
    const res = await api.toggleJob(id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, enabled: res.data.enabled } : j))
    return res.data
  }, [])

  const triggerRun = useCallback(async (id) => {
    const res = await api.triggerRun(id)
    return res.data
  }, [])

  const updateRunStarted = useCallback(({ jobId }) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, last_run_status: 'running' } : j))
  }, [])

  const updateRunFinished = useCallback(({ jobId, status }) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, last_run_status: status } : j))
  }, [])

  return {
    jobs, isLoading, error,
    createJob, updateJob, deleteJob, toggleJob, triggerRun,
    refresh: fetchJobs,
    updateRunStarted, updateRunFinished,
  }
}
