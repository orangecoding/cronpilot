/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { Router } from 'express'
import { getDb } from '../db/index.js'
import { validate as validateCron, nextRun } from '../services/cronUtils.js'
import { run as executeJob } from '../scheduler/executor.js'

function formatJob(row) {
  const cronResult = validateCron(row.cron_expr)
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    cron_expr: row.cron_expr,
    cron_human: cronResult.valid ? cronResult.human : row.cron_expr,
    next_run_at: nextRun(row.cron_expr),
    command_type: row.command_type,
    command: row.command,
    enabled: row.enabled === 1,
    ntfy_enabled: row.ntfy_enabled === 1,
    ntfy_server: row.ntfy_server,
    ntfy_topic: row.ntfy_topic,
    ntfy_on_run: row.ntfy_on_run === 1,
    ntfy_on_error: row.ntfy_on_error === 1,
    last_run_at: row.last_run_at || null,
    last_run_status: row.last_run_status || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function validateBody(body) {
  const fields = {}
  if (!body.name || !body.name.trim()) {
    fields.name = 'Name is required'
  } else if (body.name.trim().length > 100) {
    fields.name = 'Name must be 100 characters or fewer'
  }
  if (!body.cron_expr || !body.cron_expr.trim()) {
    fields.cron_expr = 'Cron expression is required'
  } else {
    const result = validateCron(body.cron_expr)
    if (!result.valid) fields.cron_expr = result.error || 'Invalid cron expression'
  }
  if (!body.command_type || !['shell', 'inline'].includes(body.command_type)) {
    fields.command_type = 'Command type must be "shell" or "inline"'
  }
  if (!body.command || !body.command.trim()) {
    fields.command = 'Command is required'
  }
  if (body.ntfy_enabled && !body.ntfy_topic) {
    fields.ntfy_topic = 'ntfy topic is required when notifications are enabled'
  }
  return Object.keys(fields).length > 0 ? fields : null
}

const WITH_LAST_RUN = `
  SELECT j.*,
    r.status AS last_run_status,
    r.started_at AS last_run_at
  FROM jobs j
  LEFT JOIN runs r ON r.id = (
    SELECT id FROM runs WHERE job_id = j.id ORDER BY started_at DESC LIMIT 1
  )
`

export function createJobsRouter(scheduler) {
  const router = Router()

  router.get('/validate', (req, res) => {
    res.json(validateCron(req.query.expr || ''))
  })

  router.get('/', (_req, res) => {
    const rows = getDb().prepare(`${WITH_LAST_RUN} ORDER BY j.name COLLATE NOCASE`).all()
    res.json({ data: rows.map(formatJob), total: rows.length })
  })

  router.post('/', (req, res) => {
    const errors = validateBody(req.body)
    if (errors) return res.status(400).json({ error: 'Validation failed', fields: errors })

    const {
      name, description = '', cron_expr, command_type, command,
      enabled = true, ntfy_enabled = false, ntfy_server = 'https://ntfy.sh',
      ntfy_topic = '', ntfy_on_run = false, ntfy_on_error = true,
    } = req.body

    const db = getDb()
    const result = db.prepare(`
      INSERT INTO jobs (name, description, cron_expr, command_type, command, enabled,
        ntfy_enabled, ntfy_server, ntfy_topic, ntfy_on_run, ntfy_on_error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(), description.trim(), cron_expr.trim(), command_type, command.trim(),
      enabled ? 1 : 0, ntfy_enabled ? 1 : 0, ntfy_server || 'https://ntfy.sh',
      ntfy_topic || '', ntfy_on_run ? 1 : 0, ntfy_on_error ? 1 : 0,
    )

    const job = db.prepare(`${WITH_LAST_RUN} WHERE j.id = ?`).get(result.lastInsertRowid)
    scheduler.scheduleJob(job)
    res.status(201).json({ data: formatJob(job) })
  })

  router.get('/:id', (req, res) => {
    const row = getDb().prepare(`${WITH_LAST_RUN} WHERE j.id = ?`).get(req.params.id)
    if (!row) return res.status(404).json({ error: 'Job not found' })
    res.json({ data: formatJob(row) })
  })

  router.put('/:id', (req, res) => {
    const db = getDb()
    if (!db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id)) {
      return res.status(404).json({ error: 'Job not found' })
    }
    const errors = validateBody(req.body)
    if (errors) return res.status(400).json({ error: 'Validation failed', fields: errors })

    const {
      name, description = '', cron_expr, command_type, command,
      enabled = true, ntfy_enabled = false, ntfy_server = 'https://ntfy.sh',
      ntfy_topic = '', ntfy_on_run = false, ntfy_on_error = true,
    } = req.body

    db.prepare(`
      UPDATE jobs SET name=?, description=?, cron_expr=?, command_type=?, command=?,
        enabled=?, ntfy_enabled=?, ntfy_server=?, ntfy_topic=?, ntfy_on_run=?, ntfy_on_error=?
      WHERE id=?
    `).run(
      name.trim(), description.trim(), cron_expr.trim(), command_type, command.trim(),
      enabled ? 1 : 0, ntfy_enabled ? 1 : 0, ntfy_server || 'https://ntfy.sh',
      ntfy_topic || '', ntfy_on_run ? 1 : 0, ntfy_on_error ? 1 : 0,
      req.params.id,
    )

    const job = db.prepare(`${WITH_LAST_RUN} WHERE j.id = ?`).get(req.params.id)
    scheduler.scheduleJob(job)
    res.json({ data: formatJob(job) })
  })

  router.delete('/:id', (req, res) => {
    const db = getDb()
    if (!db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id)) {
      return res.status(404).json({ error: 'Job not found' })
    }
    scheduler.unscheduleJob(Number(req.params.id))
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id)
    res.status(204).send()
  })

  router.patch('/:id/toggle', (req, res) => {
    const db = getDb()
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    const newEnabled = job.enabled === 1 ? 0 : 1
    db.prepare('UPDATE jobs SET enabled = ? WHERE id = ?').run(newEnabled, req.params.id)
    const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)
    scheduler.scheduleJob(updated)
    res.json({ data: { id: updated.id, enabled: updated.enabled === 1 } })
  })

  router.post('/:id/run', (req, res) => {
    const job = getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id)
    if (!job) return res.status(404).json({ error: 'Job not found' })
    const runId = executeJob(job, 'manual')
    res.status(202).json({ data: { run_id: runId } })
  })

  router.get('/:id/runs', (req, res) => {
    const db = getDb()
    if (!db.prepare('SELECT id FROM jobs WHERE id = ?').get(req.params.id)) {
      return res.status(404).json({ error: 'Job not found' })
    }
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const offset = Number(req.query.offset) || 0
    const total = db.prepare('SELECT COUNT(*) AS count FROM runs WHERE job_id = ?').get(req.params.id).count
    const rows = db.prepare(
      'SELECT * FROM runs WHERE job_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?',
    ).all(req.params.id, limit, offset)
    res.json({ data: rows, total, limit, offset })
  })

  return router
}
