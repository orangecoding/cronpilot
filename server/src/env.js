/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PROJECT_ROOT = path.join(__dirname, '../..')
export const ENV_FILE = process.env.DOTENV_CONFIG_PATH || path.join(PROJECT_ROOT, '.env')

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: ENV_FILE, quiet: true })
}
