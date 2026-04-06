import { useEffect, useState, useRef } from 'react'
import { api } from '../api/client.js'

export function useCronValidation(expr) {
  const [result, setResult] = useState({ valid: null, human: null, next_runs: [], error: null })
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!expr || !expr.trim()) {
      setResult({ valid: null, human: null, next_runs: [], error: null })
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    timerRef.current = setTimeout(async () => {
      try {
        const data = await api.validateCron(expr)
        setResult(data)
      } catch {
        setResult({ valid: false, human: null, next_runs: [], error: 'Validation failed' })
      } finally {
        setIsLoading(false)
      }
    }, 350)

    return () => clearTimeout(timerRef.current)
  }, [expr])

  return { ...result, isLoading }
}
