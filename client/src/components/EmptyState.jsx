import { Inbox } from 'lucide-react'

export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <Inbox className="mx-auto h-10 w-10 text-slate-400" />
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {message ? <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
