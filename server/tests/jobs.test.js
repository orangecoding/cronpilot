import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { makeDb, makeApp } from './setup.js'

let app

beforeEach(() => {
  makeDb()
  app = makeApp()
})

const validJob = {
  name: 'Test job',
  cron_expr: '* * * * *',
  command_type: 'inline',
  command: 'echo hello'
}

describe('GET /api/jobs', () => {
  it('returns empty array on fresh DB', async () => {
    const res = await request(app).get('/api/jobs')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
  })
})

describe('POST /api/jobs', () => {
  it('creates a job with valid payload', async () => {
    const res = await request(app).post('/api/jobs').send(validJob)
    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Test job')
    expect(res.body.data.cron_expr).toBe('* * * * *')
    expect(res.body.data.enabled).toBe(true)
    expect(res.body.data.cron_human).toBeTruthy()
    expect(res.body.data.id).toBeTypeOf('number')
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/jobs').send({ ...validJob, name: '' })
    expect(res.status).toBe(400)
    expect(res.body.fields.name).toBeTruthy()
  })

  it('returns 400 when cron_expr is invalid', async () => {
    const res = await request(app).post('/api/jobs').send({ ...validJob, cron_expr: 'not valid' })
    expect(res.status).toBe(400)
    expect(res.body.fields.cron_expr).toBeTruthy()
  })

  it('returns 400 when command_type is invalid', async () => {
    const res = await request(app).post('/api/jobs').send({ ...validJob, command_type: 'bad' })
    expect(res.status).toBe(400)
    expect(res.body.fields.command_type).toBeTruthy()
  })

  it('returns 400 when ntfy_enabled without ntfy_topic', async () => {
    const res = await request(app).post('/api/jobs').send({ ...validJob, ntfy_enabled: true })
    expect(res.status).toBe(400)
    expect(res.body.fields.ntfy_topic).toBeTruthy()
  })
})

describe('GET /api/jobs/:id', () => {
  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/jobs/999')
    expect(res.status).toBe(404)
  })

  it('returns the job by id', async () => {
    const create = await request(app).post('/api/jobs').send(validJob)
    const id = create.body.data.id
    const res = await request(app).get(`/api/jobs/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(id)
  })
})

describe('PUT /api/jobs/:id', () => {
  it('updates job fields', async () => {
    const create = await request(app).post('/api/jobs').send(validJob)
    const id = create.body.data.id
    const res = await request(app).put(`/api/jobs/${id}`).send({ ...validJob, name: 'Updated name' })
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Updated name')
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).put('/api/jobs/999').send(validJob)
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/jobs/:id/toggle', () => {
  it('toggles enabled from true to false', async () => {
    const create = await request(app).post('/api/jobs').send({ ...validJob, enabled: true })
    const id = create.body.data.id
    const res = await request(app).patch(`/api/jobs/${id}/toggle`)
    expect(res.status).toBe(200)
    expect(res.body.data.enabled).toBe(false)
  })

  it('toggles enabled back to true', async () => {
    const create = await request(app).post('/api/jobs').send({ ...validJob, enabled: false })
    const id = create.body.data.id
    const res = await request(app).patch(`/api/jobs/${id}/toggle`)
    expect(res.status).toBe(200)
    expect(res.body.data.enabled).toBe(true)
  })
})

describe('DELETE /api/jobs/:id', () => {
  it('deletes the job and returns 204', async () => {
    const create = await request(app).post('/api/jobs').send(validJob)
    const id = create.body.data.id
    const del = await request(app).delete(`/api/jobs/${id}`)
    expect(del.status).toBe(204)
    const get = await request(app).get(`/api/jobs/${id}`)
    expect(get.status).toBe(404)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/jobs/999')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/jobs/validate', () => {
  it('returns valid=true for a valid expression', async () => {
    const res = await request(app).get('/api/jobs/validate?expr=*+*+*+*+*')
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
    expect(res.body.human).toBeTruthy()
  })

  it('returns valid=false for an invalid expression', async () => {
    const res = await request(app).get('/api/jobs/validate?expr=invalid')
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(false)
  })
})
