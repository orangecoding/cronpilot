export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      description   TEXT    NOT NULL DEFAULT '',
      cron_expr     TEXT    NOT NULL,
      command_type  TEXT    NOT NULL CHECK(command_type IN ('shell', 'inline')),
      command       TEXT    NOT NULL,
      enabled       INTEGER NOT NULL DEFAULT 1,
      ntfy_enabled  INTEGER NOT NULL DEFAULT 0,
      ntfy_server   TEXT    NOT NULL DEFAULT 'https://ntfy.sh',
      ntfy_topic    TEXT    NOT NULL DEFAULT '',
      ntfy_on_run   INTEGER NOT NULL DEFAULT 0,
      ntfy_on_error INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS jobs_updated_at
    AFTER UPDATE ON jobs
    BEGIN
      UPDATE jobs SET updated_at = datetime('now') WHERE id = OLD.id;
    END;

    CREATE TABLE IF NOT EXISTS runs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id       INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      triggered_by TEXT    NOT NULL DEFAULT 'scheduler',
      status       TEXT    NOT NULL CHECK(status IN ('running', 'success', 'error')),
      exit_code    INTEGER,
      stdout       TEXT    NOT NULL DEFAULT '',
      stderr       TEXT    NOT NULL DEFAULT '',
      started_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      finished_at  TEXT,
      duration_ms  INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_runs_job_id ON runs(job_id);
    CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);
  `)
}
