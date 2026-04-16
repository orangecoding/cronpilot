/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { createJobsRouter } from './routes/jobs.js'
import { createRunsRouter } from './routes/runs.js'
import { errorHandler } from './middleware/errorHandler.js'
import { gatewayTokenMiddleware } from './middleware/gatewayToken.js'

const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))

export function createApp(scheduler) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, secured: Boolean(process.env.GATEWAY_TOKEN) })
  })

  app.get('/api/version', (_req, res) => {
    res.json({ version: pkg.version })
  })

  app.use('/api', gatewayTokenMiddleware)

  app.use('/api/jobs', createJobsRouter(scheduler))
  app.use('/api/runs', createRunsRouter())

  app.get('/api/validate-path', (req, res) => {
    const filePath = req.query.path || ''
    if (!filePath.trim()) return res.json({ exists: false, isFile: false, executable: false })
    try {
      fs.accessSync(filePath, fs.constants.F_OK)
      const stat = fs.statSync(filePath)
      const isFile = stat.isFile()
      let executable = false
      if (isFile) {
        try { fs.accessSync(filePath, fs.constants.X_OK); executable = true } catch { /* not executable */ }
      }
      res.json({ exists: true, isFile, executable })
    } catch {
      res.json({ exists: false, isFile: false, executable: false })
    }
  })

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
  })

  app.use(errorHandler)

  return app
}
