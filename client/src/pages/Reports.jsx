import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import api, { getApiError } from '../services/api'

export default function Reports() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/events')
      .then(({ data }) => {
        const list = data.events || []
        setEvents(list)
        if (list.length) setSelectedEventId(String(list[0].id))
      })
      .catch((err) => setError(getApiError(err, 'Unable to load events.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    setLoading(true)
    api
      .get(`/reports/events/${selectedEventId}/summary`)
      .then(({ data }) => setReport(data))
      .catch((err) => setError(getApiError(err, 'Unable to load report.')))
      .finally(() => setLoading(false))
  }, [selectedEventId])

  const exportCsv = async () => {
    setError('')
    try {
      const { data } = await api.get(`/reports/events/${selectedEventId}/attendance.csv`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${report?.event?.slug || 'attendance'}-attendance.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(getApiError(err, 'Unable to export CSV.'))
    }
  }

  const chartData = report
    ? [
        { name: 'Registered', value: report.summary.total_registrations },
        { name: 'Attended', value: report.summary.total_attendees },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Reports</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Attendance reporting</h1>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={exportCsv}
          disabled={!report}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <Alert type="error">{error}</Alert>

      <section className="panel p-4">
        <label className="block max-w-xl">
          <span className="label">Choose Event to View</span>
          <select
            className="input mt-1"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
          >
            <option value="">Select event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      {loading ? (
        <LoadingState label="Loading report..." />
      ) : report ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={FileText}
              label="Registrations"
              value={report.summary.total_registrations}
            />
            <StatCard icon={FileText} label="Attendees" value={report.summary.total_attendees} />
            <StatCard icon={FileText} label="Attendance rate" value={`${report.summary.attendance_rate}%`} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="panel p-5">
              <h2 className="text-lg font-semibold text-slate-950">Attendance comparison</h2>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2f80ed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.participants.map((participant) => (
                    <tr key={`${participant.email}-${participant.student_number}`}>
                      <td>{participant.full_name}</td>
                      <td>{participant.email}</td>
                      <td>{participant.student_number}</td>
                      <td className="capitalize">{participant.attendance_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <EmptyState title="No report selected" message="Choose an event to view attendance metrics." />
      )}
    </div>
  )
}
