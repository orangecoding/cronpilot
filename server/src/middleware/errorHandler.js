/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { logger } from '../logger.js'

export function errorHandler(err, req, res, _next) {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')
  const status = err.status || err.statusCode || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}
