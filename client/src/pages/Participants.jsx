import { Award, CheckCircle2, Search, Trash2, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ActionIconButton } from '../components/ActionIcon'
import Alert from '../components/Alert'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import api, { getApiError } from '../services/api'
import { formatDateTime } from '../utils/format'

export default function Participants() {
  const { eventId } = useParams()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(eventId || '')
  const [participants, setParticipants] = useState([])
  const [filters, setFilters] = useState({ q: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)
  const [working, setWorking] = useState(false)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.status) params.set('status', filters.status)
    return params.toString()
  }, [filters])

  useEffect(() => {
    api
      .get('/events')
      .then(({ data }) => {
        const list = data.events || []
        setEvents(list)
        if (!eventId && list.length) setSelectedEventId(String(list[0].id))
      })
      .catch((err) => setError(getApiError(err, 'Unable to load events.')))
  }, [eventId])

  const loadParticipants = useCallback(() => {
    if (!selectedEventId) {
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get(`/participants/event/${selectedEventId}${query ? `?${query}` : ''}`)
      .then(({ data }) => setParticipants(data.participants || []))
      .catch((err) => setError(getApiError(err, 'Unable to load participants.')))
      .finally(() => setLoading(false))
  }, [query, selectedEventId])

  useEffect(() => {
    loadParticipants()
  }, [loadParticipants])

  const checkIn = async (participant) => {
    setWorking(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/attendance/manual', { participantId: participant.id })
      setSuccess(data.message)
      loadParticipants()
    } catch (err) {
      setError(getApiError(err, 'Unable to check in participant.'))
    } finally {
      setWorking(false)
    }
  }

  const removeParticipant = async () => {
    if (!selected) return
    setWorking(true)
    try {
      await api.delete(`/participants/${selected.id}`)
      setSuccess('Participant deleted.')
      setSelected(null)
      loadParticipants()
    } catch (err) {
      setError(getApiError(err, 'Unable to delete participant.'))
    } finally {
      setWorking(false)
    }
  }

  const certificate = async (participant) => {
    setWorking(true)
    setError('')
    try {
      const { data } = await api.get(`/certificates/participants/${participant.id}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${participant.full_name.replace(/[^a-z0-9]/gi, '-')}-certificate.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(getApiError(err, 'Unable to generate certificate.'))
    } finally {
      setWorking(false)
    }
  }

  const currentEvent = events.find((event) => String(event.id) === String(selectedEventId))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Participants</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Registration list</h1>
          <p className="mt-2 text-slate-600">{currentEvent?.title || 'Select an event to begin.'}</p>
        </div>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert>{success}</Alert>

      <section className="panel grid gap-3 p-4 lg:grid-cols-[280px_1fr_220px]">
        <label>
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
        <label>
          <span className="label">Search Participants</span>
          <span className="relative mt-1 block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, email, or ID"
              value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            />
          </span>
        </label>
        <label>
          <span className="label">Filter Attendance</span>
          <select
            className="input mt-1"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">All attendance</option>
            <option value="attended">Attended</option>
            <option value="not_attended">Not attended</option>
          </select>
        </label>
      </section>

      {loading ? (
        <LoadingState label="Loading participants..." />
      ) : participants.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Student</th>
                <th>Registration</th>
                <th>Attendance Status</th>
                <th>Check-In Time</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ocean-50 text-ocean-700">
                        <UsersRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{participant.full_name}</p>
                        <p className="text-xs text-slate-500">{participant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p>{participant.student_number}</p>
                    <p className="text-xs text-slate-500">{participant.course_department}</p>
	                  </td>
	                  <td>{formatDateTime(participant.registration_date)}</td>
	                  <td>
	                    <StatusBadge status={participant.attendance_status} />
	                  </td>
	                  <td>
	                    <span className="text-sm text-slate-700">
	                      {formatDateTime(participant.check_in_time)}
	                    </span>
	                  </td>
	                  <td>
                    <div className="flex justify-end gap-2">
                      <ActionIconButton
                        label="Manual Check-In"
                        onClick={() => checkIn(participant)}
                        disabled={working}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Generate Certificate"
                        onClick={() => certificate(participant)}
                        disabled={participant.attendance_status !== 'attended' || working}
                      >
                        <Award className="h-4 w-4" />
                      </ActionIconButton>
                      <ActionIconButton
                        label="Delete Participant"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setSelected(participant)}
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
          title="No participants found"
          message={selectedEventId ? 'Registrations will appear here.' : 'Choose an event first.'}
        />
      )}

      <ConfirmModal
        open={Boolean(selected)}
        title="Delete participant"
        message={`Delete ${selected?.full_name || 'this participant'} from the registration list?`}
        onClose={() => setSelected(null)}
        onConfirm={removeParticipant}
        loading={working}
      />
    </div>
  )
}
