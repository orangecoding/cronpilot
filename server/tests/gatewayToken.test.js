/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { makeDb, makeApp } from './setup.js'

let app

beforeEach(() => {
  makeDb()
  app = makeApp()
  process.env.GATEWAY_TOKEN = 'secret123'
})

afterEach(() => {
  delete process.env.GATEWAY_TOKEN
})

describe('gatewayTokenMiddleware with query param', () => {
  it('accepts valid token from x-gateway-token header', async () => {
    const res = await request(app)
      .get('/api/jobs')
      .set('X-Gateway-Token', 'secret123')
    expect(res.status).toBe(200)
  })

  it('accepts valid token from ?token query param', async () => {
    const res = await request(app)
      .get('/api/jobs?token=secret123')
    expect(res.status).toBe(200)
  })

  it('rejects wrong token from query param', async () => {
    const res = await request(app)
      .get('/api/jobs?token=wrong')
    expect(res.status).toBe(401)
  })

  it('rejects request with no token at all', async () => {
    const res = await request(app).get('/api/jobs')
    expect(res.status).toBe(401)
  })
})
