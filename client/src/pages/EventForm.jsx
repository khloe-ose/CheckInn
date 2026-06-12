import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../components/Alert'
import LoadingState from '../components/LoadingState'
import { useAuth } from '../context/useAuth'
import api, { getApiError } from '../services/api'
import { toInputTime } from '../utils/format'

const emptyForm = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  capacity: 50,
  registration_deadline: '',
  status: 'Draft',
  organizer_id: '',
}

export default function EventForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdmin) {
      api.get('/users?role=organizer').then(({ data }) => setOrganizers(data.users || [])).catch(() => {})
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isEditing) {
      setForm({ ...emptyForm, organizer_id: user?.id || '' })
      return
    }

    api
      .get(`/events/${id}`)
      .then(({ data }) => {
        const event = data.event
        setForm({
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          time: toInputTime(event.time),
          venue: event.venue || '',
          capacity: event.capacity || 50,
          registration_deadline: event.registration_deadline || '',
          status: event.status || 'Draft',
          organizer_id: event.organizer_id || user?.id || '',
        })
      })
      .catch((err) => setError(getApiError(err, 'Unable to load event.')))
      .finally(() => setLoading(false))
  }, [id, isEditing, user?.id])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (new Date(form.registration_deadline) > new Date(form.date)) {
      setError('Registration deadline must be on or before the event date.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        organizer_id: isAdmin ? Number(form.organizer_id || user.id) : undefined,
      }
      const { data } = isEditing
        ? await api.put(`/events/${id}`, payload)
        : await api.post('/events', payload)

      navigate(`/events/${isEditing ? id : data.id}`)
    } catch (err) {
      setError(getApiError(err, 'Unable to save event.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Loading event..." />

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">
          {isEditing ? 'Edit event' : 'Create event'}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          {isEditing ? 'Update event details' : 'New event'}
        </h1>
      </div>

      <form className="panel grid gap-5 p-5 lg:grid-cols-2" onSubmit={submit}>
        <div className="lg:col-span-2">
          <Alert type="error">{error}</Alert>
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="title">
            Event title
          </label>
          <input
            id="title"
            className="input mt-1"
            required
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="input mt-1 min-h-28"
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            className="input mt-1"
            type="date"
            required
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="time">
            Time
          </label>
          <input
            id="time"
            className="input mt-1"
            type="time"
            required
            value={form.time}
            onChange={(event) => update('time', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="venue">
            Venue
          </label>
          <input
            id="venue"
            className="input mt-1"
            required
            value={form.venue}
            onChange={(event) => update('venue', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="capacity">
            Capacity
          </label>
          <input
            id="capacity"
            className="input mt-1"
            type="number"
            min="1"
            required
            value={form.capacity}
            onChange={(event) => update('capacity', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="deadline">
            Registration deadline
          </label>
          <input
            id="deadline"
            className="input mt-1"
            type="date"
            required
            value={form.registration_deadline}
            onChange={(event) => update('registration_deadline', event.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="input mt-1"
            value={form.status}
            onChange={(event) => update('status', event.target.value)}
          >
            <option>Draft</option>
            <option>Published</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
        {isAdmin ? (
          <div className="lg:col-span-2">
            <label className="label" htmlFor="organizer">
              Organizer
            </label>
            <select
              id="organizer"
              className="input mt-1"
              value={form.organizer_id}
              onChange={(event) => update('organizer_id', event.target.value)}
            >
              {organizers.map((organizer) => (
                <option key={organizer.id} value={organizer.id}>
                  {organizer.name} - {organizer.organization}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end lg:col-span-2">
          <Link className="btn-secondary" to={isEditing ? `/events/${id}` : '/events'}>
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save event'}
          </button>
        </div>
      </form>
    </div>
  )
}
