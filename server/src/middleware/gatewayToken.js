/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { timingSafeEqual } from 'crypto'

export function gatewayTokenMiddleware(req, res, next) {
  const token = process.env.GATEWAY_TOKEN
  if (!token) return next()

  const provided = req.headers['x-gateway-token']
  if (!provided) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing gateway token' })
  }

  const a = Buffer.from(provided)
  const b = Buffer.from(token)
  const match = a.length === b.length && timingSafeEqual(a, b)
  if (!match) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing gateway token' })
  }
  next()
}
