/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import express from 'express'
import { initDb, closeDb } from './db/index.js'
import { createApp } from './app.js'
import { createScheduler } from './scheduler/index.js'
import { logger } from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.join(__dirname, '../..')

// Load .env from the project root regardless of cwd
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'

// Resolve DB_PATH relative to the project root so relative paths in .env work correctly
const DB_PATH = path.resolve(PROJECT_ROOT, process.env.DB_PATH || 'cronpilot.db')

// Ensure the target directory exists before opening the database
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

initDb(DB_PATH)

const scheduler = createScheduler()
scheduler.init()

const app = createApp(scheduler)

const clientDist = path.join(__dirname, '../../client/dist')
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist))
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
  logger.info(`Serving frontend from ${clientDist}`)
} else {
  app.get('/', (_req, res) => {
    res.send('CronPilot API is running. Run yarn build then yarn start to serve the frontend.')
  })
}

app.listen(PORT, HOST, () => {
  logger.info(`CronPilot server running on http://localhost:${PORT}`)
})

function shutdown() {
  logger.info('Shutting down')
  closeDb()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
