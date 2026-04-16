/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { logger } from '../logger.js'
export async function send(job, context) {
  if (!job.ntfy_enabled || !job.ntfy_topic) return
  try {
    const isError = context.status === 'error'
    const title = isError
      ? `CronPilot: "${job.name}" failed`
      : `CronPilot: "${job.name}" succeeded`
    const body = isError
      ? `Exit code: ${context.exitCode}\n${(context.stderr || '').slice(0, 500)}`
      : 'Finished successfully'

    await fetch(`${job.ntfy_server}/${job.ntfy_topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Title': title,
        'Priority': isError ? 'high' : 'default',
        'Tags': isError ? 'warning' : 'white_check_mark'
      },
      body
    })
  } catch (error) {
    logger.error({error}, 'Failed to send notification to ntfy')
    // ntfy errors must never affect job execution
  }
}
