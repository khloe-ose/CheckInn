import {
  CalendarDays,
  Copy,
  Edit3,
  MapPin,
  QrCode,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../components/Alert'
import LoadingState from '../components/LoadingState'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import api, { getApiError } from '../services/api'
import { formatDate, formatTime } from '../utils/format'

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then(({ data }) => setEvent(data.event))
      .catch((err) => setError(getApiError(err, 'Unable to load event.')))
      .finally(() => setLoading(false))
  }, [id])

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/register/${event.slug}`)
    setSuccess('Public registration link copied.')
  }

  if (loading) return <LoadingState label="Loading event details..." />

  if (!event) {
    return <Alert type="error">{error || 'Event not found.'}</Alert>
  }

  const attendanceRate = event.registrations
    ? Math.round((Number(event.attendees || 0) / Number(event.registrations)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Event details</p>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{event.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{event.description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn-secondary" onClick={copyLink}>
            <Copy className="h-4 w-4" />
            Copy link
          </button>
          <Link className="btn-secondary" to={`/events/${event.id}/edit`}>
            <Edit3 className="h-4 w-4" />
            Edit
          </Link>
          <Link className="btn-primary" to={`/events/${event.id}/participants`}>
            <UsersRound className="h-4 w-4" />
            Participants
          </Link>
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert>{success}</Alert>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard icon={UsersRound} label="Registrations" value={`${event.registrations || 0}/${event.capacity}`} />
        <StatCard icon={QrCode} label="Attendees" value={event.attendees || 0} />
        <StatCard icon={CalendarDays} label="Attendance rate" value={`${attendanceRate}%`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950">Event information</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-ocean-50 p-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-ocean-700">
                <CalendarDays className="h-4 w-4" />
                Schedule
              </dt>
              <dd className="mt-2 text-slate-800">
                {formatDate(event.date)} at {formatTime(event.time)}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="h-4 w-4" />
                Venue
              </dt>
              <dd className="mt-2 text-slate-800">{event.venue}</dd>
            </div>
            <div className="rounded-md bg-emerald-50 p-4">
              <dt className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <UserRound className="h-4 w-4" />
                Organizer
              </dt>
              <dd className="mt-2 text-slate-800">{event.organization || event.organizer_name}</dd>
            </div>
            <div className="rounded-md bg-amber-50 p-4">
              <dt className="text-sm font-semibold text-amber-700">Registration deadline</dt>
              <dd className="mt-2 text-slate-800">{formatDate(event.registration_deadline)}</dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950">Public registration</h2>
          <p className="mt-1 text-sm text-slate-500">
            This link will allow participants to register.
          </p>
          <p className="mt-2 break-all rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {window.location.origin}/register/{event.slug}
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <a className="btn-secondary" href={`/register/${event.slug}`} target="_blank" rel="noreferrer">
              Open form
            </a>
            <Link className="btn-primary" to="/check-in">
              <QrCode className="h-4 w-4" />
              Check in
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
