export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-2xl bg-[#121828] border border-[#1a2540]">
          <Icon size={28} className="text-[#3d5070]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#e1e7f0] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#8899bb] mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
