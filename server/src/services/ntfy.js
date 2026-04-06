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
  } catch {
    // ntfy errors must never affect job execution
  }
}
