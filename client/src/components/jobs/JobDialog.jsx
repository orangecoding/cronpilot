import { useState } from 'react'
import { Dialog } from '../ui/Dialog.jsx'
import { Button } from '../ui/Button.jsx'
import { JobForm } from './JobForm.jsx'
import { Save } from 'lucide-react'

export function JobDialog({ mode, job, onSave, onClose }) {
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setFieldErrors({})
    try {
      await onSave(formData)
      onClose()
    } catch (e) {
      if (e.fields) setFieldErrors(e.fields)
      else throw e
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={mode === 'create' ? 'New Job' : `Edit: ${job?.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="job-form" icon={Save} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save job'}
          </Button>
        </>
      }
    >
      <JobForm
        initialValues={job}
        onSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  )
}
