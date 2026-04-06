import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { makeDb } from './setup.js'

let db

beforeEach(() => {
  db = makeDb()
  // Insert a test job
  db.prepare(`
    INSERT INTO jobs (name, cron_expr, command_type, command, enabled, ntfy_enabled, ntfy_on_error)
    VALUES ('Test', '* * * * *', 'inline', 'echo hello', 1, 0, 1)
  `).run()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function getJob(id = 1) {
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id)
}

function waitForRunStatus(db, runId, maxMs = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const row = db.prepare('SELECT * FROM runs WHERE id = ?').get(runId)
      if (row && row.status !== 'running') {
        resolve(row)
      } else if (Date.now() - start > maxMs) {
        reject(new Error('Timed out waiting for run to complete'))
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  })
}

describe('executor.run', () => {
  it('runs echo hello and produces success status', async () => {
    const { run } = await import('../src/scheduler/executor.js')
    const job = getJob()
    const runId = run(job, 'manual')
    expect(runId).toBeTypeOf('number')
    const result = await waitForRunStatus(db, runId)
    expect(result.status).toBe('success')
    expect(result.exit_code).toBe(0)
    expect(result.stdout.trim()).toBe('hello')
    expect(result.triggered_by).toBe('manual')
    expect(result.duration_ms).toBeGreaterThan(0)
  })

  it('records error status for failing command', async () => {
    const { run } = await import('../src/scheduler/executor.js')
    db.prepare(`
      INSERT INTO jobs (name, cron_expr, command_type, command, enabled, ntfy_enabled, ntfy_on_error)
      VALUES ('Fail', '* * * * *', 'inline', 'exit 1', 1, 0, 1)
    `).run()
    const job = db.prepare('SELECT * FROM jobs WHERE name = ?').get('Fail')
    const runId = run(job, 'manual')
    const result = await waitForRunStatus(db, runId)
    expect(result.status).toBe('error')
    expect(result.exit_code).not.toBe(0)
  })

  it('calls ntfy.send on error when ntfy_on_error=1', async () => {
    const ntfy = await import('../src/services/ntfy.js')
    const sendSpy = vi.spyOn(ntfy, 'send').mockResolvedValue(undefined)

    db.prepare(`
      INSERT INTO jobs (name, cron_expr, command_type, command, enabled,
        ntfy_enabled, ntfy_topic, ntfy_server, ntfy_on_error, ntfy_on_run)
      VALUES ('Ntfy fail', '* * * * *', 'inline', 'exit 2', 1, 1, 'test-topic', 'https://ntfy.sh', 1, 0)
    `).run()
    const job = db.prepare("SELECT * FROM jobs WHERE name = 'Ntfy fail'").get()

    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ntfy fail' }),
      expect.objectContaining({ status: 'error' })
    )
  })

  it('does not call ntfy.send when ntfy_enabled=0', async () => {
    const ntfy = await import('../src/services/ntfy.js')
    const sendSpy = vi.spyOn(ntfy, 'send').mockResolvedValue(undefined)

    const job = getJob()
    expect(job.ntfy_enabled).toBe(0)

    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(sendSpy).not.toHaveBeenCalled()
  })
})

describe('run history pruning', () => {
  function insertCompletedRun(db, jobId, stdout = 'ok') {
    db.prepare(`
      INSERT INTO runs (job_id, triggered_by, status, exit_code, stdout, stderr, finished_at, duration_ms)
      VALUES (?, 'scheduler', 'success', 0, ?, '', datetime('now'), 10)
    `).run(jobId, stdout)
  }

  function runCount(db, jobId) {
    return db.prepare('SELECT COUNT(*) as n FROM runs WHERE job_id = ?').get(jobId).n
  }

  afterEach(() => {
    delete process.env.KEEP_MAX_FOR_HISTORY
  })

  it('keeps exactly KEEP_MAX_FOR_HISTORY runs after the limit is reached', async () => {
    process.env.KEEP_MAX_FOR_HISTORY = '3'
    const job = getJob()

    // Insert 3 pre-existing completed runs
    insertCompletedRun(db, job.id, 'run-1')
    insertCompletedRun(db, job.id, 'run-2')
    insertCompletedRun(db, job.id, 'run-3')
    expect(runCount(db, job.id)).toBe(3)

    // A 4th run should trigger pruning - only 3 should remain
    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(runCount(db, job.id)).toBe(3)
  })

  it('removes the oldest runs and retains the most recent ones', async () => {
    process.env.KEEP_MAX_FOR_HISTORY = '2'
    const job = getJob()

    // Insert 2 older runs with identifiable stdout
    insertCompletedRun(db, job.id, 'oldest')
    insertCompletedRun(db, job.id, 'middle')

    // A 3rd run (newest) triggers pruning - oldest should be gone
    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(runCount(db, job.id)).toBe(2)

    const remaining = db.prepare('SELECT stdout FROM runs WHERE job_id = ? ORDER BY id ASC').all(job.id)
    expect(remaining.map((r) => r.stdout)).not.toContain('oldest')
    expect(remaining.map((r) => r.stdout)).toContain('middle')
  })

  it('does not prune when run count is below the limit', async () => {
    process.env.KEEP_MAX_FOR_HISTORY = '5'
    const job = getJob()

    // Only 2 runs - well below the limit of 5
    insertCompletedRun(db, job.id)
    insertCompletedRun(db, job.id)

    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(runCount(db, job.id)).toBe(3)
  })

  it('defaults to keeping 5 runs when KEEP_MAX_FOR_HISTORY is not set', async () => {
    const job = getJob()

    for (let i = 0; i < 5; i++) insertCompletedRun(db, job.id, `run-${i}`)

    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    expect(runCount(db, job.id)).toBe(5)
  })

  it('prunes independently per job - does not affect other jobs runs', async () => {
    process.env.KEEP_MAX_FOR_HISTORY = '2'

    // Create a second job
    db.prepare(`
      INSERT INTO jobs (name, cron_expr, command_type, command, enabled, ntfy_enabled, ntfy_on_error)
      VALUES ('Other job', '* * * * *', 'inline', 'echo other', 1, 0, 0)
    `).run()
    const otherJob = db.prepare("SELECT * FROM jobs WHERE name = 'Other job'").get()

    const job = getJob()
    insertCompletedRun(db, job.id)
    insertCompletedRun(db, job.id)

    // Insert runs for the other job - these must not be pruned
    insertCompletedRun(db, otherJob.id, 'other-1')
    insertCompletedRun(db, otherJob.id, 'other-2')

    const { run } = await import('../src/scheduler/executor.js')
    const runId = run(job, 'manual')
    await waitForRunStatus(db, runId)

    // job pruned to 2
    expect(runCount(db, job.id)).toBe(2)
    // other job untouched
    expect(runCount(db, otherJob.id)).toBe(2)
  })
})
