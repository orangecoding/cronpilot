import { Router } from 'express'
import { getDb } from '../db/index.js'

export function createRunsRouter() {
  const router = Router()

  router.get('/:runId', (req, res) => {
    const row = getDb().prepare('SELECT * FROM runs WHERE id = ?').get(req.params.runId)
    if (!row) return res.status(404).json({ error: 'Run not found' })
    res.json({ data: row })
  })

  return router
}
