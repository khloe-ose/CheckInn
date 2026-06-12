import { CalendarPlus, Copy, Eye, Pencil, Search, Trash2, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionIconButton, ActionIconLink } from '../components/ActionIcon'
import Alert from '../components/Alert'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import api, { getApiError } from '../services/api'
import { formatDate, formatTime } from '../utils/format'

export default function Events() {
  const [events, setEvents] = useState([])
  const [filters, setFilters] = useState({ q: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    return params.toString()
  }, [filters])

  const loadEvents = useCallback(() => {
    setLoading(true)
    api
      .get(`/events${query ? `?${query}` : ''}`)
      .then(({ data }) => setEvents(data.events || []))
      .catch((err) => setError(getApiError(err, 'Unable to load events.')))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const removeEvent = async () => {
    if (!selected) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/events/${selected.id}`)
      setSuccess('Event deleted.')
      setSelected(null)
      loadEvents()
    } catch (err) {
      setError(getApiError(err, 'Unable to delete event.'))
    } finally {
      setDeleting(false)
    }
  }

  const copyPublicLink = async (event) => {
    const link = `${window.location.origin}/register/${event.slug}`
    await navigator.clipboard.writeText(link)
    setSuccess('Public registration link copied.')
  }

  const openEvent = (event) => {
    navigate(`/events/${event.id}`)
  }

  const openEventFromKeyboard = (keyboardEvent, event) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault()
      openEvent(event)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Events</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Event management</h1>
          <p className="mt-2 text-slate-600">Create, publish, monitor, and close registrations.</p>
        </div>
        <Link className="btn-primary" to="/events/new">
          <CalendarPlus className="h-4 w-4" />
          Create event
        </Link>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert>{success}</Alert>

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label>
            <span className="label">Search Events</span>
            <span className="relative mt-1 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search by title or venue"
                value={filters.q}
                onChange={(event) => setFilters({ ...filters, q: event.target.value })}
              />
            </span>
          </label>
          <label>
            <span className="label">Filter Status</span>
            <select
              className="input mt-1"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            >
              <option value="">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <LoadingState label="Loading events..." />
      ) : events.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
	                <th>Date</th>
	                <th>Status</th>
	                <th>Registered</th>
	                <th>Attended</th>
	                <th>Organizer</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="cursor-pointer transition hover:bg-ocean-50/60"
                  tabIndex={0}
                  onClick={() => openEvent(event)}
                  onKeyDown={(keyboardEvent) => openEventFromKeyboard(keyboardEvent, event)}
                >
                  <td>
                    <div>
                      <p className="font-semibold text-slate-950">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.venue}</p>
                    </div>
                  </td>
                  <td>
                    <p>{formatDate(event.date)}</p>
                    <p className="text-xs text-slate-500">{formatTime(event.time)}</p>
                  </td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
	                  <td>
	                    <span className="font-semibold text-slate-950">{event.registrations || 0}</span>
	                    <span className="text-slate-500">/{event.capacity}</span>
	                    <p className="text-xs text-slate-500">capacity used</p>
	                  </td>
	                  <td>
	                    <span className="font-semibold text-slate-950">{event.attendees || 0}</span>
	                    <p className="text-xs text-slate-500">checked in</p>
	                  </td>
                  <td>{event.organization || event.organizer_name}</td>
                  <td
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                    onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                  >
                    <div className="flex justify-end gap-2">
                      <ActionIconLink label="View Event" to={`/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                      </ActionIconLink>
                      <ActionIconLink label="View Participants" to={`/events/${event.id}/participants`}>
                        <Users className="h-4 w-4" />
                      </ActionIconLink>
                      <ActionIconButton
                        label="Copy Registration Link"
                        onClick={() => copyPublicLink(event)}
                      >
                        <Copy className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconLink label="Edit Event" to={`/events/${event.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </ActionIconLink>
                      <ActionIconButton
                        label="Delete Event"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setSelected(event)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No events found"
          message="Create an event or adjust your filters."
          action={
            <Link className="btn-primary" to="/events/new">
              <CalendarPlus className="h-4 w-4" />
              Create event
            </Link>
          }
        />
      )}

      <ConfirmModal
        open={Boolean(selected)}
        title="Delete event"
        message={`Delete "${selected?.title}" and all related participants, attendance logs, and certificates?`}
        onClose={() => setSelected(null)}
        onConfirm={removeEvent}
        loading={deleting}
      />
    </div>
  )
}
