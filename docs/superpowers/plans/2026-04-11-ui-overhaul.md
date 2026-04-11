# UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blue-tinted dark theme with neutral dark grey, sort jobs by runtime, fix tooltip clipping via portals, improve text visibility, add ntfy topic validation, and detect directories in the script path checker.

**Architecture:** All visual changes are confined to client-side CSS variables and component files. Sorting requires a new `next_run_at` field from the server (`cron-parser` already present). The Tooltip is refactored to use `ReactDOM.createPortal` to escape `overflow-hidden`/`overflow-y-auto` ancestors. Validation logic lives entirely on the client with no new API endpoints.

**Tech Stack:** React 18, Tailwind CSS v4 (CSS `@theme` variables), Vite, `cron-parser` (server-side, already installed), `react-dom` `createPortal` (already in project), Node.js `fs.statSync`.

---

## Color Substitution Reference

These exact replacements are used in Tasks 3 and 7. Memorize this table — every file change refers back to it.

| Old (blue-tinted) | New (neutral grey) |
|---|---|
| `#080b14` | `#0d0d0d` |
| `#0a0d18` | `#111111` |
| `#0d1120` | `#161616` |
| `#111314` | `#0d0d0d` |
| `#121828` | `#1e1e1e` |
| `#141e33` | `#222222` |
| `#151618` | `#161616` |
| `#1a2540` | `#2a2a2a` |
| `#1c1e20` | `#1e1e1e` |
| `#252729` | `#2a2a2a` |
| `#253660` | `#383838` |
| `#302c42` | `#2a2a2a` |
| `#3d5070` | `#505050` |
| `#4a4560` | `#383838` |
| `#8899bb` | `#909090` |
| `#e1e7f0` | `#efefef` |

---

## Task 1: Server — Add `next_run_at` to job responses

**Files:**
- Modify: `server/src/services/cronUtils.js`
- Modify: `server/src/routes/jobs.js`

- [ ] **Step 1: Add `nextRun` helper to cronUtils.js**

  Open `server/src/services/cronUtils.js`. Add this export after the existing `validate` function:

  ```js
  export function nextRun(expr) {
    if (!expr || !expr.trim()) return null
    try {
      return CronExpressionParser.parse(expr.trim()).next().toISOString()
    } catch {
      return null
    }
  }
  ```

- [ ] **Step 2: Import `nextRun` in jobs router and add to `formatJob`**

  Open `server/src/routes/jobs.js`. Change the import on line 3:

  ```js
  import { validate as validateCron, nextRun } from '../services/cronUtils.js'
  ```

  In `formatJob`, add `next_run_at` to the returned object (after `cron_human`):

  ```js
  function formatJob(row) {
    const cronResult = validateCron(row.cron_expr)
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      cron_expr: row.cron_expr,
      cron_human: cronResult.valid ? cronResult.human : row.cron_expr,
      next_run_at: nextRun(row.cron_expr),
      command_type: row.command_type,
      command: row.command,
      enabled: row.enabled === 1,
      ntfy_enabled: row.ntfy_enabled === 1,
      ntfy_server: row.ntfy_server,
      ntfy_topic: row.ntfy_topic,
      ntfy_on_run: row.ntfy_on_run === 1,
      ntfy_on_error: row.ntfy_on_error === 1,
      last_run_at: row.last_run_at || null,
      last_run_status: row.last_run_status || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }
  ```

- [ ] **Step 3: Verify server starts without error**

  ```bash
  cd /Users/chriz/dev/private/cronpilot/server && node --input-type=module <<'EOF'
  import { nextRun } from './src/services/cronUtils.js'
  console.log(nextRun('0 0 * * *'))   // should print a future ISO date
  console.log(nextRun('0 2 * * *'))   // should print a later ISO date
  console.log(nextRun('bad expr'))    // should print null
  EOF
  ```

  Expected: two ISO timestamps (midnight before 2am) and `null`.

- [ ] **Step 4: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add server/src/services/cronUtils.js server/src/routes/jobs.js
  git commit -m "feat: add next_run_at to job API responses for client-side sorting"
  ```

---

## Task 2: Server — validate-path detects directories

**Files:**
- Modify: `server/src/app.js`

- [ ] **Step 1: Update the `/api/validate-path` handler**

  Open `server/src/app.js`. Replace the existing `app.get('/api/validate-path', ...)` handler (lines 24-35) with:

  ```js
  app.get('/api/validate-path', (req, res) => {
    const filePath = req.query.path || ''
    if (!filePath.trim()) return res.json({ exists: false, isFile: false, executable: false })
    try {
      fs.accessSync(filePath, fs.constants.F_OK)
      const stat = fs.statSync(filePath)
      const isFile = stat.isFile()
      let executable = false
      if (isFile) {
        try { fs.accessSync(filePath, fs.constants.X_OK); executable = true } catch { /* not executable */ }
      }
      res.json({ exists: true, isFile, executable })
    } catch {
      res.json({ exists: false, isFile: false, executable: false })
    }
  })
  ```

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add server/src/app.js
  git commit -m "feat: validate-path now reports isFile so client can reject directories"
  ```

---

## Task 3: Client — New neutral grey color palette

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/src/components/layout/Header.jsx`
- Modify: `client/src/components/layout/Footer.jsx`
- Modify: `client/src/components/layout/AppShell.jsx`
- Modify: `client/src/components/ui/Button.jsx`
- Modify: `client/src/components/ui/Badge.jsx`
- Modify: `client/src/components/ui/EnableToggle.jsx`
- Modify: `client/src/components/ui/EmptyState.jsx`
- Modify: `client/src/components/ui/Dialog.jsx`
- Modify: `client/src/components/runs/RunHistoryPanel.jsx`
- Modify: `client/src/components/jobs/JobListItem.jsx` (colors only — overflow-hidden fix is in Task 6)

- [ ] **Step 1: Update CSS variables in index.css**

  Replace the entire `@theme` block and `html, body` rule:

  ```css
  @theme {
    --color-base:          #0d0d0d;
    --color-surface:       #161616;
    --color-elevated:      #1e1e1e;
    --color-border:        #2a2a2a;
    --color-border-bright: #383838;
    --color-accent:        #e04a38;
    --color-accent-dim:    #c13827;
    --color-accent-glow:   #e04a3820;
    --color-text:          #efefef;
    --color-muted:         #909090;
    --color-faint:         #505050;
    --color-success:       #34d399;
    --color-success-dim:   #065f46;
    --color-error:         #fb7185;
    --color-error-dim:     #881337;
    --color-warning:       #fbbf24;
  }
  ```

  Replace the `html, body` background-image line with:

  ```css
  background-image: radial-gradient(ellipse at 60% 0%, rgba(224, 74, 56, 0.05) 0%, transparent 55%);
  ```

  Keep all other rules (`*, #root, scrollbar, dialog, code, .glow-accent, .border-glow`) unchanged.

- [ ] **Step 2: Update Header.jsx**

  Apply color substitution table. Full file after changes:

  ```jsx
  import { Plus, CalendarClock } from 'lucide-react'
  import { Button } from '../ui/Button.jsx'

  export function Header({ onNew }) {
    return (
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-8 py-3 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-xl bg-red-500/15 border border-red-500/40" />
            <CalendarClock size={18} className="relative z-10 text-red-400" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <div className="flex items-baseline gap-0 text-xl font-bold tracking-tight">
              <span className="text-white">Cron</span>
              <span className="text-red-400">Pilot</span>
            </div>
            <span className="text-[9px] font-semibold text-[#505050] uppercase tracking-[0.18em]">job scheduler</span>
          </div>
        </div>
        <Button icon={Plus} onClick={onNew} size="sm">
          <span className="hidden sm:inline">New Job</span>
        </Button>
      </header>
    )
  }
  ```

- [ ] **Step 3: Update Footer.jsx**

  Full file after changes:

  ```jsx
  const VERSION = '1.0.0'

  export function Footer() {
    return (
      <footer className="mt-auto border-t border-[#2a2a2a] bg-[#0d0d0d]/60 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-xs text-[#505050] font-mono">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] text-[#909090]">
            <span className="text-[#505050]">v</span>{VERSION}
          </span>
        </span>
        <span className="text-xs text-[#505050]">
          Made with{' '}
          <span className="text-rose-400">&#10084;&#65039;</span>
          {' '}by{' '}
          <a
            href="https://github.com/orangecoding"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#909090] hover:text-red-400 transition-colors duration-150 underline underline-offset-2 decoration-[#383838] hover:decoration-red-400/50"
          >
            Christian Kellner
          </a>
        </span>
      </footer>
    )
  }
  ```

- [ ] **Step 4: Update AppShell.jsx**

  Full file after changes:

  ```jsx
  import { Header } from './Header.jsx'
  import { Footer } from './Footer.jsx'

  export function AppShell({ onNew, sidebar, onCloseSidebar, children }) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onNew={onNew} />
        <div className="flex flex-1">
          {sidebar && (
            <>
              <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[#2a2a2a] bg-[#161616] min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
                {sidebar}
              </aside>
              <div className="fixed inset-0 z-40 lg:hidden">
                <div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={onCloseSidebar}
                />
                <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl overflow-hidden border-t border-[#383838] shadow-2xl">
                  {sidebar}
                </div>
              </div>
            </>
          )}
          <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    )
  }
  ```

- [ ] **Step 5: Update Button.jsx**

  Full file after changes:

  ```jsx
  export function Button({ children, variant = 'primary', size = 'md', icon: Icon, disabled, onClick, type = 'button', className = '', ...rest }) {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#161616] disabled:opacity-40 disabled:cursor-not-allowed'

    const variants = {
      primary:   'bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 shadow-lg shadow-red-500/20',
      secondary: 'bg-[#1e1e1e] text-[#efefef] border border-[#383838] hover:bg-[#2a2a2a] hover:border-red-500/40 focus:ring-red-500',
      ghost:     'text-[#909090] hover:bg-[#2a2a2a] hover:text-[#efefef] focus:ring-red-500',
      danger:    'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-400/50 focus:ring-rose-500',
    }

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    }

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...rest}
      >
        {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
        {children}
      </button>
    )
  }
  ```

- [ ] **Step 6: Update Badge.jsx**

  Full file after changes:

  ```jsx
  export function Badge({ children, variant = 'neutral', size = 'sm' }) {
    const variants = {
      success: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
      error:   'bg-rose-400/10 text-rose-400 border border-rose-400/20',
      warning: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
      neutral: 'bg-[#2a2a2a] text-[#909090] border border-[#383838]',
      info:    'bg-red-400/10 text-red-400 border border-red-400/20',
      running: 'bg-amber-400/10 text-amber-400 border border-amber-400/20 animate-pulse',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    }

    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
        {children}
      </span>
    )
  }
  ```

- [ ] **Step 7: Update EnableToggle.jsx**

  Full file after changes:

  ```jsx
  export function EnableToggle({ enabled, onChange, disabled }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-[#161616] disabled:opacity-40 disabled:cursor-not-allowed ${
          enabled ? 'bg-red-500 shadow-lg shadow-red-500/25' : 'bg-[#2a2a2a]'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    )
  }
  ```

- [ ] **Step 8: Update EmptyState.jsx**

  Full file after changes:

  ```jsx
  export function EmptyState({ icon: Icon, title, description, action }) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {Icon && (
          <div className="mb-4 p-4 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a]">
            <Icon size={28} className="text-[#505050]" />
          </div>
        )}
        <h3 className="text-base font-semibold text-[#efefef] mb-1">{title}</h3>
        {description && <p className="text-sm text-[#909090] mb-6 max-w-sm">{description}</p>}
        {action}
      </div>
    )
  }
  ```

- [ ] **Step 9: Update Dialog.jsx**

  Replace all inline style color values using the substitution table. The `background: '#151618'` → `'#161616'`, `border: '1px solid #252729'` → `'1px solid #2a2a2a'`, gradient uses `#1c1e20` → `#1e1e1e` and `#151618` → `#161616`, the accent bar gradient `#4a4560` → `#383838` and `#302c42` → `#2a2a2a`, title color `#e1e7f0` → `#efefef`, close button color `#3d5070` → `#505050`, hover color `#252729` → `#2a2a2a` and `#e1e7f0` → `#efefef` and `#333638` → `#383838`, footer `#111314` → `#0d0d0d`.

  Full file after changes:

  ```jsx
  import { useEffect, useRef } from 'react'
  import { X } from 'lucide-react'

  export function Dialog({ open, onClose, title, children, footer }) {
    const ref = useRef(null)

    useEffect(() => {
      const el = ref.current
      if (!el) return
      if (open) {
        if (!el.open) el.showModal()
      } else {
        if (el.open) el.close()
      }
    }, [open])

    useEffect(() => {
      const el = ref.current
      if (!el) return
      const handler = (e) => { if (e.target === el) onClose() }
      el.addEventListener('click', handler)
      return () => el.removeEventListener('click', handler)
    }, [onClose])

    useEffect(() => {
      const el = ref.current
      if (!el) return
      const handler = () => onClose()
      el.addEventListener('cancel', handler)
      return () => el.removeEventListener('cancel', handler)
    }, [onClose])

    return (
      <dialog
        ref={ref}
        style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', borderRadius: '16px', overflow: 'hidden', background: '#161616', border: '1px solid #2a2a2a', boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #2a2a2a', background: 'linear-gradient(135deg, #1e1e1e 0%, #161616 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '3px', height: '20px', background: 'linear-gradient(180deg, #383838, #2a2a2a)', borderRadius: '2px' }} />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#efefef', fontFamily: 'Outfit, sans-serif' }}>{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: 'transparent', border: '1px solid transparent', color: '#505050', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#efefef'; e.currentTarget.style.borderColor = '#383838' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#505050'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {children}
          </div>
          {footer && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #2a2a2a', background: '#0d0d0d' }}>
              {footer}
            </div>
          )}
        </div>
      </dialog>
    )
  }
  ```

- [ ] **Step 10: Update RunHistoryPanel.jsx**

  Full file after changes:

  ```jsx
  import { X, RefreshCw, History } from 'lucide-react'
  import { useRunHistory } from '../../hooks/useRunHistory.js'
  import { RunRecord } from './RunRecord.jsx'
  import { LoadingSpinner } from '../ui/LoadingSpinner.jsx'
  import { EmptyState } from '../ui/EmptyState.jsx'
  import { Button } from '../ui/Button.jsx'
  import { Tooltip } from '../ui/Tooltip.jsx'

  export function RunHistoryPanel({ job, onClose }) {
    const { runs, total, isLoading, error, loadMore, hasMore, refresh } = useRunHistory(job?.id)

    return (
      <div className="flex flex-col h-full bg-[#161616]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] shrink-0 bg-[#0d0d0d]">
          <div className="flex items-center gap-2.5">
            <History size={14} className="text-red-400/60" />
            <div>
              <h2 className="text-sm font-semibold text-[#efefef] leading-none">{job?.name}</h2>
              <p className="text-[11px] text-[#505050] mt-0.5">{total} run{total !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip label="Refresh">
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={refresh} />
            </Tooltip>
            <Tooltip label="Close">
              <Button variant="ghost" size="sm" icon={X} onClick={onClose} />
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading && runs.length === 0 && (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          )}
          {error && <p className="text-xs text-rose-400 text-center py-4">{error}</p>}
          {!isLoading && runs.length === 0 && !error && (
            <EmptyState icon={History} title="No runs yet" description="This job has not run yet." />
          )}
          {runs.map(run => <RunRecord key={run.id} run={run} />)}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="secondary" size="sm" onClick={loadMore} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 11: Update JobListItem.jsx colors** (overflow-hidden fix is in Task 6)

  Apply color substitution table. Change:
  - `bg-[#0d1120]` → `bg-[#161616]`
  - `border-[#1a2540]` → `border-[#2a2a2a]`
  - `hover:border-[#253660]` → `hover:border-[#383838]`
  - `bg-[#0a0d18]/60` → `bg-[#111111]/60`
  - `border-[#141e33]` → `border-[#222222]`
  - `text-[#e1e7f0]` → `text-[#efefef]`
  - `text-[#3d5070]` → `text-[#505050]`
  - `bg-[#080b14]` → `bg-[#0d0d0d]`

  The accent bar and structural code stays the same for now.

- [ ] **Step 12: Commit all color changes**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/index.css \
    client/src/components/layout/Header.jsx \
    client/src/components/layout/Footer.jsx \
    client/src/components/layout/AppShell.jsx \
    client/src/components/ui/Button.jsx \
    client/src/components/ui/Badge.jsx \
    client/src/components/ui/EnableToggle.jsx \
    client/src/components/ui/EmptyState.jsx \
    client/src/components/ui/Dialog.jsx \
    client/src/components/runs/RunHistoryPanel.jsx \
    client/src/components/jobs/JobListItem.jsx
  git commit -m "feat: replace blue-tinted theme with neutral dark grey palette"
  ```

---

## Task 4: Client — Sort jobs by next_run_at

**Files:**
- Modify: `client/src/components/jobs/JobList.jsx`

- [ ] **Step 1: Add sort logic before rendering**

  Open `client/src/components/jobs/JobList.jsx`. Add a sorted copy of `jobs` before the `return` at line 35. The full file becomes:

  ```jsx
  import { Timer, Plus } from 'lucide-react'
  import { LoadingSpinner } from '../ui/LoadingSpinner.jsx'
  import { EmptyState } from '../ui/EmptyState.jsx'
  import { Button } from '../ui/Button.jsx'
  import { JobListItem } from './JobListItem.jsx'

  export function JobList({ jobs, isLoading, error, onNew, onEdit, onDelete, onToggle, onTrigger, onHistory }) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <p className="text-rose-400/80 text-sm">{error}</p>
        </div>
      )
    }

    if (jobs.length === 0) {
      return (
        <EmptyState
          icon={Timer}
          title="No jobs configured"
          description="Create your first cron job to get started scheduling tasks."
          action={<Button icon={Plus} onClick={onNew}>Create job</Button>}
        />
      )
    }

    const sorted = [...jobs].sort((a, b) => {
      if (!a.next_run_at && !b.next_run_at) return 0
      if (!a.next_run_at) return 1
      if (!b.next_run_at) return -1
      return new Date(a.next_run_at) - new Date(b.next_run_at)
    })

    return (
      <div className="space-y-2.5">
        {sorted.map(job => (
          <JobListItem
            key={job.id}
            job={job}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onTrigger={onTrigger}
            onHistory={onHistory}
          />
        ))}
      </div>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/jobs/JobList.jsx
  git commit -m "feat: sort jobs by next scheduled run time"
  ```

---

## Task 5: Client — Portal-based Tooltip (fixes clipping)

**Files:**
- Modify: `client/src/components/ui/Tooltip.jsx`

The current tooltip uses CSS `position: absolute` inside the trigger wrapper, which gets clipped by `overflow-hidden` (JobListItem cards) and `overflow-y-auto` (sidebar). The fix renders the tooltip into `document.body` via `createPortal`, positioned with `getBoundingClientRect()`.

- [ ] **Step 1: Rewrite Tooltip.jsx**

  Full file:

  ```jsx
  import { useState, useRef } from 'react'
  import { createPortal } from 'react-dom'

  export function Tooltip({ children, label }) {
    const [visible, setVisible] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const triggerRef = useRef(null)

    function show() {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      })
      setVisible(true)
    }

    function hide() {
      setVisible(false)
    }

    return (
      <div ref={triggerRef} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
        {children}
        {visible && createPortal(
          <span
            style={{
              position: 'absolute',
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              transform: 'translate(-50%, calc(-100% - 6px))',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="px-2 py-1 text-[11px] font-medium text-[#efefef] bg-[#2a2a2a] border border-[#383838] rounded-md whitespace-nowrap shadow-lg"
          >
            {label}
          </span>,
          document.body
        )}
      </div>
    )
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/ui/Tooltip.jsx
  git commit -m "fix: use createPortal for Tooltip to prevent clipping by overflow containers"
  ```

---

## Task 6: Client — Fix JobListItem overflow-hidden

**Files:**
- Modify: `client/src/components/jobs/JobListItem.jsx`

The card has `overflow-hidden` to clip the absolutely-positioned left accent bar. Now that tooltips use portals, we can remove `overflow-hidden`. Replace the accent bar with a `border-l` approach instead of an absolute element.

- [ ] **Step 1: Rewrite JobListItem.jsx**

  Full file after all changes (colors from Task 3 + overflow fix):

  ```jsx
  import { Pencil, Trash2, Play, History, CheckCircle, XCircle, Clock, Minus } from 'lucide-react'
  import { Badge } from '../ui/Badge.jsx'
  import { EnableToggle } from './EnableToggle.jsx'
  import { Button } from '../ui/Button.jsx'
  import { Tooltip } from '../ui/Tooltip.jsx'

  function StatusBadge({ status }) {
    if (!status) return <Badge variant="neutral">Never run</Badge>
    const map = {
      success: { variant: 'success', icon: CheckCircle, label: 'Success' },
      error:   { variant: 'error',   icon: XCircle,      label: 'Failed'  },
      running: { variant: 'running', icon: Clock,         label: 'Running' },
    }
    const { variant, icon: Icon, label } = map[status] || { variant: 'neutral', icon: Minus, label: status }
    return (
      <Badge variant={variant}>
        <Icon size={10} />
        {label}
      </Badge>
    )
  }

  export function JobListItem({ job, onEdit, onDelete, onToggle, onTrigger, onHistory }) {
    return (
      <div className={`group relative rounded-xl border transition-all duration-200 ${
        job.enabled
          ? 'bg-[#161616] border-[#2a2a2a] hover:border-[#383838] hover:shadow-xl hover:shadow-black/30 border-l-2 border-l-red-500/40'
          : 'bg-[#111111]/60 border-[#222222] opacity-60'
      }`}>
        <div className="flex items-start gap-4 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#efefef] truncate text-sm">{job.name}</h3>
              {!job.enabled && <Badge variant="neutral">Disabled</Badge>}
            </div>

            {job.description && (
              <p className="text-xs text-[#505050] truncate mb-2">{job.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <code className="text-xs bg-[#0d0d0d] text-red-400/80 px-2 py-0.5 rounded-md font-mono border border-[#2a2a2a]">
                {job.cron_expr}
              </code>
              <span className="text-xs text-[#505050]">{job.cron_human}</span>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={job.last_run_status} />
              {job.last_run_at && (
                <span className="text-xs text-[#505050]">
                  {new Date(job.last_run_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <Tooltip label={job.enabled ? 'Disable job' : 'Enable job'}>
              <EnableToggle enabled={job.enabled} onChange={() => onToggle(job.id)} />
            </Tooltip>
            <div className="flex items-center gap-0.5">
              <Tooltip label="Run cron now">
                <Button variant="ghost" size="sm" icon={Play} onClick={() => onTrigger(job.id)} />
              </Tooltip>
              <Tooltip label="Show history">
                <Button variant="ghost" size="sm" icon={History} onClick={() => onHistory(job)} />
              </Tooltip>
              <Tooltip label="Edit cron">
                <Button variant="ghost" size="sm" icon={Pencil} onClick={() => onEdit(job)} />
              </Tooltip>
              <Tooltip label="Delete cron">
                <Button
                  variant="ghost" size="sm" icon={Trash2}
                  onClick={() => onDelete(job)}
                  className="text-rose-400/50 hover:text-rose-400 hover:bg-rose-400/10"
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    )
  }
  ```

  Note: The left accent bar is now achieved with Tailwind's `border-l-2 border-l-red-500/40` directly on the card border, which avoids the need for `overflow-hidden`.

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/jobs/JobListItem.jsx
  git commit -m "fix: remove overflow-hidden from job cards; use border-l for accent bar"
  ```

---

## Task 7: Client — ntfy topic validation + PathChecker directory check

**Files:**
- Modify: `client/src/components/jobs/JobForm.jsx`

Two changes in this file:
1. Live validation of `ntfy_topic` against `[a-zA-Z0-9_-]` (1-64 chars).
2. `PathChecker` shows an error when the path exists but is a directory (`isFile === false`).

- [ ] **Step 1: Update PathChecker to handle isFile**

  In `JobForm.jsx`, replace the `PathChecker` component (lines 42-85) with:

  ```jsx
  function PathChecker({ path }) {
    const [status, setStatus] = useState(null) // null | 'checking' | 'ok' | 'error'
    const [message, setMessage] = useState('')
    const timerRef = useRef(null)

    useEffect(() => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (!path || !path.trim()) { setStatus(null); return }

      setStatus('checking')
      timerRef.current = setTimeout(async () => {
        try {
          const res = await api.validatePath(path.trim())
          if (!res.exists) {
            setStatus('error')
            setMessage('File not found')
          } else if (!res.isFile) {
            setStatus('error')
            setMessage('Path is a directory, must be a file')
          } else {
            setStatus('ok')
            setMessage(res.executable ? 'File found and executable' : 'File found (not executable)')
          }
        } catch {
          setStatus('error')
          setMessage('Could not check file')
        }
      }, 500)

      return () => clearTimeout(timerRef.current)
    }, [path])

    if (!status) return null

    return (
      <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${
        status === 'ok'    ? 'text-emerald-400' :
        status === 'error' ? 'text-rose-400' :
        'text-[#505050]'
      }`}>
        {status === 'checking' && <Loader size={11} className="animate-spin" />}
        {status === 'ok'       && <CheckCircle size={11} />}
        {status === 'error'    && <XCircle size={11} />}
        {status === 'checking' ? 'Checking...' : message}
      </div>
    )
  }
  ```

- [ ] **Step 2: Add ntfy topic validation**

  In `JobForm.jsx`, add this pure helper function after the `segmentCls` helper (after line 90):

  ```js
  const NTFY_TOPIC_RE = /^[a-zA-Z0-9_-]{1,64}$/

  function ntfyTopicError(topic) {
    if (!topic) return null
    if (topic.length > 64) return 'Topic must be 64 characters or fewer'
    if (!NTFY_TOPIC_RE.test(topic)) return 'Topic may only contain letters, numbers, hyphens, and underscores'
    return null
  }
  ```

  Then in the `<Field label="Topic" ...>` section (around line 187), replace:

  ```jsx
  <Field label="Topic" required error={fieldErrors.ntfy_topic}>
    <input type="text" value={form.ntfy_topic} onChange={e => set('ntfy_topic', e.target.value)}
      placeholder="my-cron-alerts" className={inputCls(fieldErrors.ntfy_topic)} />
  </Field>
  ```

  With:

  ```jsx
  <Field label="Topic" required error={fieldErrors.ntfy_topic || ntfyTopicError(form.ntfy_topic)}>
    <input type="text" value={form.ntfy_topic} onChange={e => set('ntfy_topic', e.target.value)}
      placeholder="my-cron-alerts" className={inputCls(fieldErrors.ntfy_topic || ntfyTopicError(form.ntfy_topic))}
      maxLength={64} />
  </Field>
  ```

- [ ] **Step 3: Apply color substitution to JobForm.jsx**

  Apply the substitution table to all hardcoded color values in `JobForm.jsx`:
  - `#080b14` → `#0d0d0d`
  - `#0a0d18` → `#111111`
  - `#1a2540` → `#2a2a2a`
  - `#253660` → `#383838`
  - `#3d5070` → `#505050`
  - `#8899bb` → `#909090`
  - `#e1e7f0` → `#efefef`
  - `#0d1120` → `#161616`

  The `inputCls` function, `segmentCls` function, all `<Field>` label styles, the ntfy section container, and checkbox styling all contain these values.

- [ ] **Step 4: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/jobs/JobForm.jsx
  git commit -m "feat: ntfy topic validation + directory detection in script path checker"
  ```

---

## Self-Review Notes

- Task 1 adds `next_run_at` to the server response; Task 4 consumes it on the client — consistent field name.
- Task 2 adds `isFile` to server response; Task 7 consumes it in `PathChecker` — consistent field name.
- Task 5 (portal Tooltip) must be done before Task 6 (remove `overflow-hidden`) since Task 6 relies on tooltips no longer needing the overflow escape.
- Color table is defined once at the top and referenced by Tasks 3, 6, and 7 — no drift risk.
- No new dependencies added.
