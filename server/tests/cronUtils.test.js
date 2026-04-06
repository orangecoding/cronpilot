import { describe, it, expect } from 'vitest'
import { validate } from '../src/services/cronUtils.js'

describe('cronUtils.validate', () => {
  it('returns valid=true for a valid expression', () => {
    const result = validate('* * * * *')
    expect(result.valid).toBe(true)
    expect(result.human).toBeTruthy()
    expect(result.next_runs).toHaveLength(3)
    expect(result.next_runs[0]).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('returns a human-readable description', () => {
    const result = validate('0 2 * * *')
    expect(result.valid).toBe(true)
    expect(result.human.toLowerCase()).toContain('2:00')
  })

  it('returns valid=false for an invalid expression', () => {
    const result = validate('not a cron')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns valid=false for an empty string', () => {
    const result = validate('')
    expect(result.valid).toBe(false)
  })

  it('returns valid=false for null/undefined', () => {
    expect(validate(null).valid).toBe(false)
    expect(validate(undefined).valid).toBe(false)
  })

  it('returns 3 distinct next run times', () => {
    const result = validate('0 * * * *')
    expect(result.valid).toBe(true)
    const times = result.next_runs
    expect(new Set(times).size).toBe(3)
  })
})
