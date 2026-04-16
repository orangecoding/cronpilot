/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

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
