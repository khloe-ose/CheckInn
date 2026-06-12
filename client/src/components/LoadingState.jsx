export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ocean-200 border-t-ocean-600" />
        {label}
      </div>
    </div>
  )
}
