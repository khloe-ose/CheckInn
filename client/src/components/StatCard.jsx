export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ocean-50 text-ocean-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {hint ? <p className="mt-4 text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}
