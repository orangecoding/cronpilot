import Database from 'better-sqlite3'
import { runMigrations } from './migrations.js'

let db

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

export function initDb(dbPath) {
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return db
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
