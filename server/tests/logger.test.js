/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = path.join(__dirname, '..')

describe('logger', () => {
  it('loads LOG_LEVEL from dotenv before creating the logger', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronpilot-env-'))
    const envFile = path.join(tempDir, '.env')

    try {
      fs.writeFileSync(envFile, 'LOG_LEVEL=warn\n')

      const env = { ...process.env, DOTENV_CONFIG_PATH: envFile, NODE_ENV: 'production' }
      delete env.LOG_LEVEL

      const result = spawnSync(
        process.execPath,
        ['--input-type=module', '-e', "const { logger } = await import('./src/logger.js'); console.log(logger.level)"],
        {
          cwd: SERVER_ROOT,
          env,
          encoding: 'utf8',
        }
      )

      expect(result.stderr).toBe('')
      expect(result.status).toBe(0)
      expect(result.stdout.trim()).toBe('warn')
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
