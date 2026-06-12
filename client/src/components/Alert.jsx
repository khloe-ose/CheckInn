import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Alert({ type = 'info', children }) {
  if (!children) return null

  const isError = type === 'error'
  const Icon = isError ? AlertCircle : CheckCircle2

  return (
    <div
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
        isError
          ? 'border-rose-200 bg-rose-50 text-rose-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
