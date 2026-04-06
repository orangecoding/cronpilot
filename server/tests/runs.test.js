import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { makeDb, makeApp } from './setup.js'

// Mock executor to avoid running real shell commands in route tests
vi.mock('../src/scheduler/executor.js', async () => {
  const { getDb } = await import('../src/db/index.js')
  return {
    run: (job, triggeredBy) => {
      const result = getDb().prepare(`
        INSERT INTO runs (job_id, triggered_by, status, exit_code, stdout, stderr, finished_at, duration_ms)
        VALUES (?, ?, 'success', 0, 'mocked', '', datetime('now'), 0)
      `).run(job.id, triggeredBy)
      return result.lastInsertRowid
    },
  }
})

let db
let app

beforeEach(() => {
  db = makeDb()
  app = makeApp()
})

function createJob(app) {
  return request(app).post('/api/jobs').send({
    name: 'Test job',
    cron_expr: '* * * * *',
    command_type: 'inline',
    command: 'echo hello'
  })
}

function insertRun(db, jobId, overrides = {}) {
  const { status = 'success', exit_code = 0, stdout = 'ok', stderr = '', triggered_by = 'scheduler' } = overrides
  db.prepare(`
    INSERT INTO runs (job_id, triggered_by, status, exit_code, stdout, stderr, finished_at, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 100)
  `).run(jobId, triggered_by, status, exit_code, stdout, stderr)
}

describe('GET /api/jobs/:id/runs', () => {
  it('returns empty array for job with no runs', async () => {
    const job = await createJob(app)
    const id = job.body.data.id
    const res = await request(app).get(`/api/jobs/${id}/runs`)
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
  })

  it('returns runs for a job', async () => {
    const job = await createJob(app)
    const id = job.body.data.id
    insertRun(db, id)
    insertRun(db, id, { status: 'error', exit_code: 1 })
    const res = await request(app).get(`/api/jobs/${id}/runs`)
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.total).toBe(2)
  })

  it('returns 404 for unknown job', async () => {
    const res = await request(app).get('/api/jobs/999/runs')
    expect(res.status).toBe(404)
  })

  it('supports pagination with limit and offset', async () => {
    const job = await createJob(app)
    const id = job.body.data.id
    for (let i = 0; i < 5; i++) insertRun(db, id)
    const page1 = await request(app).get(`/api/jobs/${id}/runs?limit=2&offset=0`)
    expect(page1.body.data).toHaveLength(2)
    expect(page1.body.total).toBe(5)
    const page2 = await request(app).get(`/api/jobs/${id}/runs?limit=2&offset=2`)
    expect(page2.body.data).toHaveLength(2)
  })
})

describe('GET /api/runs/:runId', () => {
  it('returns run by id', async () => {
    const job = await createJob(app)
    const id = job.body.data.id
    insertRun(db, id, { stdout: 'hello' })
    const runId = db.prepare('SELECT id FROM runs WHERE job_id = ?').get(id).id
    const res = await request(app).get(`/api/runs/${runId}`)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(runId)
    expect(res.body.data.stdout).toBe('hello')
  })

  it('returns 404 for unknown run', async () => {
    const res = await request(app).get('/api/runs/999')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/jobs/:id/run', () => {
  it('creates a run and returns run_id', async () => {
    const job = await createJob(app)
    const id = job.body.data.id
    const res = await request(app).post(`/api/jobs/${id}/run`)
    expect(res.status).toBe(202)
    expect(res.body.data.run_id).toBeTypeOf('number')
  })

  it('returns 404 for unknown job', async () => {
    const res = await request(app).post('/api/jobs/999/run')
    expect(res.status).toBe(404)
  })
})
