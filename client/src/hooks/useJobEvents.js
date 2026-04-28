/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function getToken() {
  return new URLSearchParams(window.location.search).get('token') ?? ''
}

export function useJobEvents({ onRunStarted, onRunFinished }) {
  const [connected, setConnected] = useState(false)
  const onStartedRef = useRef(onRunStarted)
  const onFinishedRef = useRef(onRunFinished)

  useEffect(() => {
    onStartedRef.current = onRunStarted
    onFinishedRef.current = onRunFinished
  })

  useEffect(() => {
    const token = getToken()
    const url = `${BASE}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`
    const es = new EventSource(url)

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.addEventListener('run:started', (e) => onStartedRef.current(JSON.parse(e.data)))
    es.addEventListener('run:finished', (e) => onFinishedRef.current(JSON.parse(e.data)))

    return () => {
      es.close()
      setConnected(false)
    }
  }, [])

  return { connected }
}
