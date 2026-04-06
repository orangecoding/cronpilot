import { useState, useEffect, useRef } from 'react'
import { CronInput } from '../cron/CronInput.jsx'
import { EnableToggle } from './EnableToggle.jsx'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Loader } from 'lucide-react'
import { api } from '../../api/client.js'

const DEFAULT_FORM = {
  name: '',
  description: '',
  cron_expr: '* * * * *',
  command_type: 'inline',
  command: '',
  enabled: true,
  ntfy_enabled: false,
  ntfy_server: 'https://ntfy.sh',
  ntfy_topic: '',
  ntfy_on_run: false,
  ntfy_on_error: true
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-[#8899bb] uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-400 normal-case tracking-normal">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-[#3d5070]">{hint}</p>}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  )
}

const inputCls = (error) =>
  `w-full px-3 py-2.5 rounded-lg bg-[#080b14] border text-sm text-[#e1e7f0] placeholder-[#253660] focus:outline-none focus:ring-1 transition-colors ${
    error
      ? 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500/50'
      : 'border-[#1a2540] focus:ring-red-500/30 focus:border-red-500/40'
  }`

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
        if (res.exists) {
          setStatus('ok')
          setMessage(res.executable ? 'File found and executable' : 'File found (not executable)')
        } else {
          setStatus('error')
          setMessage('File not found')
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
      status === 'ok'       ? 'text-emerald-400' :
      status === 'error'    ? 'text-rose-400' :
      'text-[#3d5070]'
    }`}>
      {status === 'checking' && <Loader size={11} className="animate-spin" />}
      {status === 'ok'       && <CheckCircle size={11} />}
      {status === 'error'    && <XCircle size={11} />}
      {status === 'checking' ? 'Checking...' : message}
    </div>
  )
}

const segmentCls = (active) =>
  `px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
    active ? 'bg-[#1a2540] text-[#e1e7f0] shadow-sm' : 'text-[#3d5070] hover:text-[#8899bb]'
  }`

export function JobForm({ initialValues, onSubmit, fieldErrors = {} }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues })
  const [ntfyOpen, setNtfyOpen] = useState(form.ntfy_enabled)

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form id="job-form" onSubmit={handleSubmit} className="space-y-5">
      <Field label="Name" required error={fieldErrors.name}>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Daily backup"
          className={inputCls(fieldErrors.name)}
          maxLength={100}
        />
      </Field>

      <Field label="Description" error={fieldErrors.description}>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Optional description"
          rows={2}
          className={`${inputCls(fieldErrors.description)} resize-none`}
        />
      </Field>

      <Field label="Schedule" required error={fieldErrors.cron_expr}>
        <CronInput value={form.cron_expr} onChange={v => set('cron_expr', v)} />
      </Field>

      <Field label="Command type" required error={fieldErrors.command_type}>
        <div className="flex rounded-lg border border-[#1a2540] p-0.5 bg-[#080b14] w-fit">
          <button type="button" onClick={() => set('command_type', 'inline')} className={segmentCls(form.command_type === 'inline')}>
            Inline command
          </button>
          <button type="button" onClick={() => set('command_type', 'shell')} className={segmentCls(form.command_type === 'shell')}>
            Shell script
          </button>
        </div>
      </Field>

      <Field
        label={form.command_type === 'shell' ? 'Script path' : 'Command'}
        required
        error={fieldErrors.command}
        hint={form.command_type === 'shell' ? undefined : 'Executed via /bin/sh -c'}
      >
        <textarea
          value={form.command}
          onChange={e => set('command', e.target.value)}
          placeholder={form.command_type === 'shell' ? '/opt/scripts/backup.sh' : 'echo "Hello world"\nls -la /tmp'}
          rows={form.command_type === 'shell' ? 2 : 4}
          className={`${inputCls(fieldErrors.command)} font-mono text-xs resize-none`}
        />
        {form.command_type === 'shell' && <PathChecker path={form.command} />}
      </Field>

      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-semibold text-[#8899bb] uppercase tracking-wide">Enabled</span>
        <EnableToggle enabled={form.enabled} onChange={v => set('enabled', v)} />
      </div>

      {/* ntfy section */}
      <div className="rounded-xl border border-[#1a2540] overflow-hidden">
        <button
          type="button"
          onClick={() => setNtfyOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#080b14] hover:bg-[#0d1120] transition-colors text-xs font-semibold text-[#8899bb] uppercase tracking-wide"
        >
          <span>Notifications (ntfy)</span>
          {ntfyOpen ? <ChevronUp size={14} className="text-[#3d5070]" /> : <ChevronDown size={14} className="text-[#3d5070]" />}
        </button>

        {ntfyOpen && (
          <div className="px-4 py-4 space-y-4 border-t border-[#1a2540] bg-[#0a0d18]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8899bb]">Enable notifications</span>
              <EnableToggle enabled={form.ntfy_enabled} onChange={v => set('ntfy_enabled', v)} />
            </div>

            {form.ntfy_enabled && (
              <>
                <Field label="ntfy server" error={fieldErrors.ntfy_server}>
                  <input type="url" value={form.ntfy_server} onChange={e => set('ntfy_server', e.target.value)}
                    placeholder="https://ntfy.sh" className={inputCls(fieldErrors.ntfy_server)} />
                </Field>

                <Field label="Topic" required error={fieldErrors.ntfy_topic}>
                  <input type="text" value={form.ntfy_topic} onChange={e => set('ntfy_topic', e.target.value)}
                    placeholder="my-cron-alerts" className={inputCls(fieldErrors.ntfy_topic)} />
                </Field>

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#8899bb] uppercase tracking-wide">Notify when</p>
                  {[
                    { key: 'ntfy_on_error', label: 'Job fails (exits with error)' },
                    { key: 'ntfy_on_run',   label: 'Job runs (every execution)' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={form[key]}
                          onChange={e => set(key, e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 rounded border border-[#253660] bg-[#080b14] peer-checked:bg-red-500 peer-checked:border-red-500 transition-all" />
                        {form[key] && (
                          <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-[#8899bb] group-hover:text-[#e1e7f0] transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
