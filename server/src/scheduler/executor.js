/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { spawn } from 'child_process'
import { getDb } from '../db/index.js'
import { send as ntfySend } from '../services/ntfy.js'
import { logger } from '../logger.js'
import { eventBus } from '../services/eventBus.js'

const MAX_OUTPUT_BYTES = 512 * 1024

export function run(job, triggeredBy = 'scheduler') {
  const db = getDb()
  const startTime = Date.now()

  const runResult = db.prepare(`
    INSERT INTO runs (job_id, triggered_by, status, started_at)
    VALUES (?, ?, 'running', datetime('now'))
  `).run(job.id, triggeredBy)

  const runId = runResult.lastInsertRowid
  logger.info({ jobId: job.id, runId, triggeredBy }, `Job "${job.name}" started`)
  eventBus.emit('run:started', { jobId: job.id, runId, triggeredBy })

  const child = job.command_type === 'inline'
    ? spawn('/bin/sh', ['-c', job.command], { stdio: ['ignore', 'pipe', 'pipe'] })
    : spawn(job.command, [], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] })

  const timeoutMs = Number(process.env.EXEC_TIMEOUT_MS) || 1800000
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    child.kill('SIGTERM')
    setTimeout(() => child.kill('SIGKILL'), 5000)
  }, timeoutMs)

  const stdoutChunks = []
  const stderrChunks = []
  let stdoutBytes = 0
  let stderrBytes = 0

  child.stdout.on('data', (chunk) => {
    if (stdoutBytes < MAX_OUTPUT_BYTES) {
      stdoutChunks.push(chunk)
      stdoutBytes += chunk.length
    }
  })

  child.stderr.on('data', (chunk) => {
    if (stderrBytes < MAX_OUTPUT_BYTES) {
      stderrChunks.push(chunk)
      stderrBytes += chunk.length
    }
  })

  child.on('close', (code) => {
    clearTimeout(timer)
    const duration = Date.now() - startTime
    const stdout = Buffer.concat(stdoutChunks).toString('utf8')
    const stderr = Buffer.concat(stderrChunks).toString('utf8')
    const exitCode = timedOut ? -1 : (code ?? -1)
    const status = exitCode === 0 ? 'success' : 'error'

    db.prepare(`
      UPDATE runs
      SET status = ?, exit_code = ?, stdout = ?, stderr = ?, finished_at = datetime('now'), duration_ms = ?
      WHERE id = ?
    `).run(status, exitCode, stdout, stderr, duration, runId)

    db.prepare(`
      DELETE FROM runs
      WHERE job_id = ? AND id NOT IN (
        SELECT id FROM runs WHERE job_id = ? ORDER BY id DESC LIMIT ?
      )
    `).run(job.id, job.id, Number(process.env.KEEP_MAX_FOR_HISTORY) || 5)

    if (status === 'error' && job.ntfy_enabled && job.ntfy_on_error) {
      ntfySend(job, { status, exitCode, stderr }).catch((e) => logger.error({ error: e }, 'ntfy send failed'))
    } else if (status === 'success' && job.ntfy_enabled && job.ntfy_on_run) {
      ntfySend(job, { status, exitCode }).catch((e) => logger.error({ error: e }, 'ntfy send failed'))
    }

    eventBus.emit('run:finished', { jobId: job.id, runId, status, exitCode, duration_ms: duration })
    logger.info({ jobId: job.id, runId, status, exitCode, duration }, `Job "${job.name}" finished`)
  })

  return runId
}
