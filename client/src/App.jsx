import { useState, useEffect } from 'react'
import { AppShell } from './components/layout/AppShell.jsx'
import { JobList } from './components/jobs/JobList.jsx'
import { JobDialog } from './components/jobs/JobDialog.jsx'
import { DeleteConfirm } from './components/jobs/DeleteConfirm.jsx'
import { RunHistoryPanel } from './components/runs/RunHistoryPanel.jsx'
import { UnauthorizedPage } from './components/UnauthorizedPage.jsx'
import { useJobs } from './hooks/useJobs.js'
import { useToast } from './components/ui/Toast.jsx'

export default function App() {
  const [authState, setAuthState] = useState('loading') // 'loading' | 'ok' | 'unauthorized'

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(({ secured }) => {
        if (!secured) return setAuthState('ok')
        const token = new URLSearchParams(window.location.search).get('token')
        setAuthState(token ? 'ok' : 'unauthorized')
      })
      .catch(() => setAuthState('ok'))
  }, [])

  const { jobs, isLoading, error, createJob, updateJob, deleteJob, toggleJob, triggerRun } = useJobs()
  const { addToast } = useToast()

  const [dialogState, setDialogState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [historyJob, setHistoryJob] = useState(null)

  const handleNew    = () => setDialogState({ mode: 'create' })
  const handleEdit   = (job) => setDialogState({ mode: 'edit', job })
  const handleDelete = (job) => setDeleteTarget(job)
  const handleHistory = (job) => setHistoryJob(job)

  const handleSave = async (formData) => {
    if (dialogState.mode === 'create') {
      await createJob(formData)
      addToast('Job created')
    } else {
      await updateJob(dialogState.job.id, formData)
      addToast('Job updated')
    }
  }

  const handleToggle = async (id) => {
    try { await toggleJob(id) } catch (e) { addToast(e.message, 'error') }
  }

  const handleTrigger = async (id) => {
    try { await triggerRun(id); addToast('Job triggered') } catch (e) { addToast(e.message, 'error') }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteJob(deleteTarget.id)
      addToast(`"${deleteTarget.name}" deleted`)
      if (historyJob?.id === deleteTarget.id) setHistoryJob(null)
      setDeleteTarget(null)
    } catch (e) {
      addToast(e.message, 'error')
    }
  }

  if (authState === 'loading') return null
  if (authState === 'unauthorized') return <UnauthorizedPage />

  const sidebar = historyJob ? (
    <RunHistoryPanel job={historyJob} onClose={() => setHistoryJob(null)} />
  ) : null

  return (
    <>
      <AppShell onNew={handleNew} sidebar={sidebar} onCloseSidebar={() => setHistoryJob(null)}>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#e1e7f0] tracking-tight">Jobs</h1>
          <p className="text-sm text-[#3d5070] mt-0.5">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} configured
          </p>
        </div>
        <JobList
          jobs={jobs}
          isLoading={isLoading}
          error={error}
          onNew={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onTrigger={handleTrigger}
          onHistory={handleHistory}
        />
      </AppShell>

      {dialogState && (
        <JobDialog
          mode={dialogState.mode}
          job={dialogState.job}
          onSave={handleSave}
          onClose={() => setDialogState(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          job={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
