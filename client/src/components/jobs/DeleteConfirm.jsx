/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

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
      <p className="text-sm text-[#909090] leading-relaxed">
        Are you sure you want to delete <span className="text-[#efefef] font-medium">"{job.name}"</span>?
        This will also remove all run history. This action cannot be undone.
      </p>
    </Dialog>
  )
}
