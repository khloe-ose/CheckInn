import {
  Activity,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Alert from '../components/Alert'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import api, { getApiError } from '../services/api'

const pieColors = ['#2f80ed', '#10b981', '#f59e0b', '#ef4444']

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/analytics/overview')
      .then(({ data }) => setData(data))
      .catch((err) => setError(getApiError(err, 'Unable to load analytics.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState label="Loading dashboard..." />

  const totals = data?.totals || {}
  const statusData = data?.status_breakdown || []
  const attendedEvents = data?.most_attended_events || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">
            {user?.role === 'admin' ? 'Admin overview' : 'Organizer overview'}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-600">Good to see you, {user?.name}.</p>
        </div>
      </div>

      <Alert type="error">{error}</Alert>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CalendarDays} label="Total events" value={totals.total_events || 0} />
        <StatCard icon={CalendarCheck} label="Published" value={totals.published_events || 0} />
        <StatCard icon={ClipboardList} label="Registrations" value={totals.total_registrations || 0} />
        <StatCard icon={UsersRound} label="Attendees" value={totals.total_attendees || 0} />
        <StatCard icon={Activity} label="Attendance rate" value={`${totals.attendance_rate || 0}%`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">Most attended events</h2>
            <p className="text-sm text-slate-500">Based on checked-in participants</p>
          </div>
          {attendedEvents.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendedEvents}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 12 }} interval={0} angle={-12} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#2f80ed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No attendance yet" message="Checked-in participants will appear here." />
          )}
        </div>

        <div className="panel p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">Event status</h2>
            <p className="text-sm text-slate-500">Draft, published, completed, and cancelled events</p>
          </div>
          {statusData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={58} outerRadius={100}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.status} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No events yet" message="Create your first event to start tracking progress." />
          )}
        </div>
      </section>
    </div>
  )
}
