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
