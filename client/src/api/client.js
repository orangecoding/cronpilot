/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function getToken() {
  return new URLSearchParams(window.location.search).get('token') ?? ''
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'X-Gateway-Token': getToken(), ...options.headers },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({ error: res.statusText }))

  if (!res.ok) {
    const err = new Error(data.error || 'Request failed')
    err.status = res.status
    err.fields = data.fields
    throw err
  }

  return data
}

export const api = {
  getJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (body) => request('/jobs', { method: 'POST', body }),
  updateJob: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
  toggleJob: (id) => request(`/jobs/${id}/toggle`, { method: 'PATCH' }),
  triggerRun: (id) => request(`/jobs/${id}/run`, { method: 'POST' }),
  getRuns: (id, params = {}) => request(`/jobs/${id}/runs?${new URLSearchParams(params)}`),
  getRun: (runId) => request(`/runs/${runId}`),
  validateCron: (expr) => request(`/jobs/validate?expr=${encodeURIComponent(expr)}`),
  validatePath: (path) => request(`/validate-path?path=${encodeURIComponent(path)}`),
  getVersion: () => request('/version')
}
