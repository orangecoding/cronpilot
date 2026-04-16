/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCronValidation } from '../src/hooks/useCronValidation.js'

// Mock api
vi.mock('../src/api/client.js', () => ({
  api: {
    validateCron: vi.fn().mockResolvedValue({
      valid: true,
      human: 'Every minute',
      next_runs: ['2026-01-01T00:01:00.000Z']
    })
  }
}))

import { api } from '../src/api/client.js'

beforeEach(() => {
  vi.useFakeTimers()
  api.validateCron.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useCronValidation', () => {
  it('does not call fetch for empty string', async () => {
    const { result } = renderHook(() => useCronValidation(''))
    act(() => vi.runAllTimers())
    expect(api.validateCron).not.toHaveBeenCalled()
    expect(result.current.valid).toBeNull()
  })

  it('does not call fetch immediately for a non-empty string', () => {
    renderHook(() => useCronValidation('* * * * *'))
    expect(api.validateCron).not.toHaveBeenCalled()
  })

  it('calls fetch after 350ms debounce', async () => {
    renderHook(() => useCronValidation('* * * * *'))
    expect(api.validateCron).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(350))
    expect(api.validateCron).toHaveBeenCalledWith('* * * * *')
  })

  it('returns valid result after fetch completes', async () => {
    const { result } = renderHook(() => useCronValidation('* * * * *'))
    await act(async () => {
      vi.advanceTimersByTime(350)
      await Promise.resolve()
    })
    expect(result.current.valid).toBe(true)
    expect(result.current.human).toBe('Every minute')
  })
})
