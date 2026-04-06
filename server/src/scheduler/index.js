import cron from 'node-cron'
import { getDb } from '../db/index.js'
import { run as executeJob } from './executor.js'
import { logger } from '../logger.js'

export function createScheduler() {
  const activeTasks = new Map()

  function scheduleJob(job) {
    if (activeTasks.has(job.id)) {
      activeTasks.get(job.id).stop()
      activeTasks.delete(job.id)
    }

    if (!job.enabled) return

    if (!cron.validate(job.cron_expr)) {
      logger.error({ jobId: job.id, expr: job.cron_expr }, 'Invalid cron expression')
      return
    }

    const task = cron.schedule(job.cron_expr, () => {
      const current = getDb().prepare('SELECT * FROM jobs WHERE id = ? AND enabled = 1').get(job.id)
      if (current) executeJob(current, 'scheduler')
    })

    activeTasks.set(job.id, task)
  }

  function unscheduleJob(jobId) {
    if (activeTasks.has(jobId)) {
      activeTasks.get(jobId).stop()
      activeTasks.delete(jobId)
    }
  }

  function init() {
    const jobs = getDb().prepare('SELECT * FROM jobs WHERE enabled = 1').all()
    for (const job of jobs) scheduleJob(job)
    logger.info({ count: jobs.length }, 'Scheduler initialized')
  }

  return { scheduleJob, unscheduleJob, init }
}
