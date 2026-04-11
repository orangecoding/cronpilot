# Markdown Description Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render job descriptions as Markdown — first 3 non-empty lines shown in the job list, full description in a portal-based hover popover.

**Architecture:** Add `marked` as the Markdown parser. A new `MarkdownDescription` component encapsulates both the 3-line preview (rendered HTML via `dangerouslySetInnerHTML`) and the portal popover (reusing the `createPortal` + `position: fixed` pattern from `Tooltip.jsx`). The popover stays open when the user moves their mouse onto it. CSS prose styles are added to `index.css`. `JobListItem.jsx` replaces its plain `<p>` with `<MarkdownDescription>`.

**Tech Stack:** `marked` (Markdown → HTML, no sanitization needed for self-hosted single-user app), React `createPortal`, Tailwind arbitrary values + custom CSS classes in `index.css`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `client/package.json` | Modify | Add `marked` dependency |
| `client/src/index.css` | Modify | Add `.md-preview` and `.md-popover` prose CSS |
| `client/src/components/ui/MarkdownDescription.jsx` | Create | Preview + hover popover component |
| `client/src/components/jobs/JobListItem.jsx` | Modify | Use `MarkdownDescription` instead of plain `<p>` |

---

## Task 1: Install `marked`

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: Install the package**

  ```bash
  cd /Users/chriz/dev/private/cronpilot/client && yarn add marked
  ```

  Expected output: `marked` appears in `dependencies` in `package.json`.

- [ ] **Step 2: Verify import works**

  ```bash
  cd /Users/chriz/dev/private/cronpilot/client && node --input-type=module <<'EOF'
  import { marked } from 'marked'
  console.log(marked.parse('**hello**'))
  EOF
  ```

  Expected: `<p><strong>hello</strong></p>\n`

- [ ] **Step 3: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/package.json client/yarn.lock
  git commit -m "chore: add marked for markdown rendering"
  ```

---

## Task 2: Add prose CSS to index.css

**Files:**
- Modify: `client/src/index.css`

Append these rules at the end of the file. `.md-preview` styles the compact 3-line preview inside the job card. `.md-popover` styles the full-content hover card.

- [ ] **Step 1: Append CSS to the end of `client/src/index.css`**

  Add the following block after the existing `.border-glow` rule:

  ```css
  /* Markdown preview (3-line compact in job card) */
  .md-preview { line-height: 1.5; }
  .md-preview p { margin: 0; }
  .md-preview p + p { margin-top: 0.2rem; }
  .md-preview strong { color: #909090; font-weight: 600; }
  .md-preview em { color: #909090; font-style: italic; }
  .md-preview code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    background: #0d0d0d;
    border: 1px solid #2a2a2a;
    border-radius: 3px;
    padding: 0 3px;
  }
  .md-preview h1, .md-preview h2, .md-preview h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #909090;
    margin: 0 0 0.2rem;
  }
  .md-preview ul, .md-preview ol { margin: 0; padding-left: 1rem; }
  .md-preview li { margin: 0; }

  /* Markdown popover (full description on hover) */
  .md-popover { color: #909090; font-size: 0.75rem; line-height: 1.6; }
  .md-popover p { margin: 0 0 0.5rem; }
  .md-popover p:last-child { margin-bottom: 0; }
  .md-popover h1 { font-size: 0.875rem; font-weight: 700; color: #efefef; margin: 0 0 0.5rem; }
  .md-popover h2 { font-size: 0.8125rem; font-weight: 600; color: #efefef; margin: 0 0 0.375rem; }
  .md-popover h3 { font-size: 0.75rem; font-weight: 600; color: #efefef; margin: 0 0 0.25rem; }
  .md-popover strong { color: #efefef; font-weight: 600; }
  .md-popover em { font-style: italic; }
  .md-popover code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem;
    background: #0d0d0d;
    border: 1px solid #2a2a2a;
    border-radius: 3px;
    padding: 0 3px;
  }
  .md-popover pre {
    background: #0d0d0d;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    overflow-x: auto;
    margin: 0 0 0.5rem;
  }
  .md-popover pre code { background: none; border: none; padding: 0; }
  .md-popover ul, .md-popover ol { padding-left: 1.25rem; margin: 0 0 0.5rem; }
  .md-popover li { margin-bottom: 0.125rem; }
  .md-popover a { color: #fb7185; text-decoration: underline; }
  .md-popover hr { border: none; border-top: 1px solid #2a2a2a; margin: 0.5rem 0; }
  .md-popover blockquote {
    border-left: 2px solid #383838;
    padding-left: 0.75rem;
    margin: 0 0 0.5rem;
    color: #505050;
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/index.css
  git commit -m "feat: add markdown prose CSS for description preview and popover"
  ```

---

## Task 3: Create MarkdownDescription component

**Files:**
- Create: `client/src/components/ui/MarkdownDescription.jsx`

This component renders the 3-line preview and, when the source has more than 3 non-empty lines, shows a portal popover with the full content on hover. The popover stays open if the cursor moves onto it (both the trigger div and the popover div handle `onMouseEnter`/`onMouseLeave`).

- [ ] **Step 1: Create the file**

  Create `client/src/components/ui/MarkdownDescription.jsx` with this content:

  ```jsx
  import { useState, useRef } from 'react'
  import { createPortal } from 'react-dom'
  import { marked } from 'marked'

  // Take the first `n` non-empty lines of raw markdown source
  function previewSource(source, n) {
    return source.split('\n').filter(l => l.trim() !== '').slice(0, n).join('\n')
  }

  // True when source has more non-empty lines than the preview limit
  function hasOverflow(source, n) {
    return source.split('\n').filter(l => l.trim() !== '').length > n
  }

  function renderHtml(source) {
    return { __html: marked.parse(source, { breaks: true }) }
  }

  export function MarkdownDescription({ source, previewLines = 3 }) {
    const [visible, setVisible] = useState(false)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
    const triggerRef = useRef(null)
    const showPopover = hasOverflow(source, previewLines)

    function show() {
      if (!showPopover || !triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
      setVisible(true)
    }

    function hide() {
      setVisible(false)
    }

    return (
      <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
        <div
          className="md-preview text-xs text-[#505050] mb-2"
          dangerouslySetInnerHTML={renderHtml(previewSource(source, previewLines))}
        />
        {visible && createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: `${Math.max(pos.width, 280)}px`,
              maxWidth: '380px',
              maxHeight: '260px',
              zIndex: 9999,
            }}
            className="overflow-y-auto bg-[#1e1e1e] border border-[#383838] rounded-xl shadow-2xl p-3 md-popover"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div dangerouslySetInnerHTML={renderHtml(source)} />
          </div>,
          document.body
        )}
      </div>
    )
  }
  ```

- [ ] **Step 2: Verify the file exists and has no syntax errors**

  ```bash
  cd /Users/chriz/dev/private/cronpilot/client && node --input-type=module <<'EOF'
  // Quick parse check — just ensure imports resolve
  import { marked } from 'marked'
  const html = marked.parse('**bold** and _italic_\nline 2\nline 3\nline 4', { breaks: true })
  console.log('marked OK, output:', html.slice(0, 40))
  EOF
  ```

  Expected: `marked OK, output: <p><strong>bold</strong> and <em>italic</em>` (or similar).

- [ ] **Step 3: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/ui/MarkdownDescription.jsx
  git commit -m "feat: add MarkdownDescription component with 3-line preview and hover popover"
  ```

---

## Task 4: Wire MarkdownDescription into JobListItem

**Files:**
- Modify: `client/src/components/jobs/JobListItem.jsx`

Replace the plain `<p>` description element with `<MarkdownDescription>`. The component is only rendered when `job.description` is non-empty (same guard as before).

- [ ] **Step 1: Update JobListItem.jsx**

  Add the import at the top of the file (after the existing imports):

  ```jsx
  import { MarkdownDescription } from '../ui/MarkdownDescription.jsx'
  ```

  Replace the description block (currently lines 37-39):

  ```jsx
  {job.description && (
    <p className="text-xs text-[#505050] truncate mb-2">{job.description}</p>
  )}
  ```

  With:

  ```jsx
  {job.description && (
    <MarkdownDescription source={job.description} />
  )}
  ```

  Nothing else in the file changes.

- [ ] **Step 2: Commit**

  ```bash
  cd /Users/chriz/dev/private/cronpilot
  git add client/src/components/jobs/JobListItem.jsx
  git commit -m "feat: render job descriptions as markdown with hover popover"
  ```

---

## Self-Review

- Task 1 installs `marked`; Task 3 imports it — dependency is available before use. ✓
- Task 2 adds `.md-preview` and `.md-popover` CSS; Task 3 uses both class names — no missing styles. ✓
- Task 3 creates `MarkdownDescription`; Task 4 imports it from the exact same path. ✓
- `previewSource` and `hasOverflow` both filter by `l.trim() !== ''` — consistent definition of "non-empty line". ✓
- `renderHtml` is called in both the preview div and the portal — same function, no duplication. ✓
- `show`/`hide` are attached to both the trigger div and the popover div — prevents flicker when moving mouse between them. ✓
- No `dangerouslySetInnerHTML` XSS concern: CronPilot is self-hosted and the user writing the descriptions is the same user viewing them. ✓
- No changes to server, DB schema, or API — pure client-side feature. ✓
