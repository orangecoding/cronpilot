import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { createJobsRouter } from './routes/jobs.js'
import { createRunsRouter } from './routes/runs.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp(scheduler) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api/jobs', createJobsRouter(scheduler))
  app.use('/api/runs', createRunsRouter())

  app.get('/api/validate-path', (req, res) => {
    const filePath = req.query.path || ''
    if (!filePath.trim()) return res.json({ exists: false, executable: false })
    try {
      fs.accessSync(filePath, fs.constants.F_OK)
      let executable = false
      try { fs.accessSync(filePath, fs.constants.X_OK); executable = true } catch { /* not executable */ }
      res.json({ exists: true, executable })
    } catch {
      res.json({ exists: false, executable: false })
    }
  })

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
  })

  app.use(errorHandler)

  return app
}
