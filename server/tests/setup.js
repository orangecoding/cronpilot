/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { initDb } from '../src/db/index.js'
import { createApp } from '../src/app.js'

export function makeDb() {
  return initDb(':memory:')
}

export function makeScheduler() {
  return {
    scheduleJob: () => {},
    unscheduleJob: () => {},
    init: () => {},
  }
}

export function makeApp() {
  return createApp(makeScheduler())
}
