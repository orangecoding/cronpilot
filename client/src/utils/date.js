/**
 * Parses a date string as UTC and formats it in the browser's locale and timezone.
 * Handles both ISO 8601 strings (with 'Z') and SQLite datetime strings (without timezone info).
 */
export function formatLocalDate(value) {
  if (!value) return ''
  // SQLite datetime('now') returns "YYYY-MM-DD HH:MM:SS" without timezone.
  // Replace the space with 'T' and append 'Z' to mark it explicitly as UTC.
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(' ', 'T') + 'Z'
    : value
  return new Date(normalized).toLocaleString()
}
