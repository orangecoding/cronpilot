/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import http from 'http'
import { makeApp } from './setup.js'
import { eventBus } from '../src/services/eventBus.js'

let server
let port

beforeEach(() => {
  server = makeApp().listen(0)
  port = server.address().port
})

afterEach(async () => {
  await new Promise(r => server.close(r))
})

function connectSSE() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/api/events`, (res) => {
      resolve({ req, res })
    })
    req.on('error', (e) => { if (e.code !== 'ECONNRESET') reject(e) })
    setTimeout(() => reject(new Error('SSE connect timeout')), 2000)
  })
}

function collectData(res, count = 1, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const timer = setTimeout(() => reject(new Error('collectData timeout')), timeoutMs)
    res.on('data', (chunk) => {
      chunks.push(chunk.toString())
      if (chunks.length >= count) { clearTimeout(timer); resolve(chunks.join('')) }
    })
  })
}

describe('GET /api/events', () => {
  it('responds with SSE headers', async () => {
    const { req, res } = await connectSSE()
    expect(res.headers['content-type']).toBe('text/event-stream')
    expect(res.headers['cache-control']).toBe('no-cache')
    req.destroy()
  })

  it('sends run:started event when bus emits', async () => {
    const { req, res } = await connectSSE()
    const dataPromise = collectData(res)
    await new Promise(r => setTimeout(r, 30))
    eventBus.emit('run:started', { jobId: 1, runId: 42, triggeredBy: 'manual' })
    const raw = await dataPromise
    expect(raw).toContain('event: run:started')
    expect(raw).toContain('"jobId":1')
    expect(raw).toContain('"runId":42')
    req.destroy()
  })

  it('sends run:finished event when bus emits', async () => {
    const { req, res } = await connectSSE()
    const dataPromise = collectData(res)
    await new Promise(r => setTimeout(r, 30))
    eventBus.emit('run:finished', { jobId: 2, runId: 7, status: 'success', exitCode: 0, duration_ms: 500 })
    const raw = await dataPromise
    expect(raw).toContain('event: run:finished')
    expect(raw).toContain('"status":"success"')
    req.destroy()
  })

  it('removes bus listeners when client disconnects', async () => {
    const listenersBefore = eventBus.listenerCount('run:started')
    const { req, res } = await connectSSE()
    expect(eventBus.listenerCount('run:started')).toBe(listenersBefore + 1)
    req.destroy()
    res.resume()
    await new Promise(r => setTimeout(r, 50))
    expect(eventBus.listenerCount('run:started')).toBe(listenersBefore)
  })
})
