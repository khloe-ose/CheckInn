const eventStyles = {
  Draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  Published: 'bg-ocean-50 text-ocean-700 ring-ocean-100',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
  attended: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  registered: 'bg-amber-50 text-amber-700 ring-amber-100',
}

export default function StatusBadge({ status }) {
  const label = status === 'registered' ? 'Not attended' : status

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${
        eventStyles[status] || 'bg-slate-100 text-slate-700 ring-slate-200'
      }`}
    >
      {label}
    </span>
  )
}
