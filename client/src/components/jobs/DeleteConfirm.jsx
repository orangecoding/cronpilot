import { Button } from '../ui/Button.jsx'
import { Dialog } from '../ui/Dialog.jsx'
import { Trash2 } from 'lucide-react'

export function DeleteConfirm({ job, onConfirm, onCancel }) {
  return (
    <Dialog
      open={true}
      onClose={onCancel}
      title="Delete job"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" icon={Trash2} onClick={onConfirm}>Delete</Button>
        </>
      }
    >
      <p className="text-sm text-[#8899bb] leading-relaxed">
        Are you sure you want to delete <span className="text-[#e1e7f0] font-medium">"{job.name}"</span>?
        This will also remove all run history. This action cannot be undone.
      </p>
    </Dialog>
  )
}
