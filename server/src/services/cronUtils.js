/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { CronExpressionParser } from 'cron-parser'
import { toString as cronstrueToString } from 'cronstrue'

export function validate(expr) {
  if (!expr || !expr.trim()) {
    return { valid: false, error: 'Cron expression is required' }
  }
  try {
    const interval = CronExpressionParser.parse(expr.trim())
    const human = cronstrueToString(expr.trim(), { throwExceptionOnParseError: true })
    const next_runs = [
      interval.next().toISOString(),
      interval.next().toISOString(),
      interval.next().toISOString()
    ]
    return { valid: true, human, next_runs }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}

export function nextRun(expr) {
  if (!expr || !expr.trim()) return null
  try {
    return CronExpressionParser.parse(expr.trim()).next().toISOString()
  } catch {
    return null
  }
}
