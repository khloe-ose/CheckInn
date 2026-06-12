import { CalendarDays, CheckCircle2, MapPin, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../components/Alert'
import BrandLogo from '../components/BrandLogo'
import LoadingState from '../components/LoadingState'
import api, { getApiError } from '../services/api'
import { formatDate, formatTime } from '../utils/format'

const emptyForm = {
  full_name: '',
  email: '',
  student_number: '',
  course_department: '',
}

export default function PublicRegistration() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/events/public/${slug}`)
      .then(({ data }) => setEvent(data.event))
      .catch((err) => setError(getApiError(err, 'Event registration is unavailable.')))
      .finally(() => setLoading(false))
  }, [slug])

  const submit = async (submitEvent) => {
    submitEvent.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/participants/public/${slug}`, form)
      setParticipant(data.participant)
      setForm(emptyForm)
    } catch (err) {
      setError(getApiError(err, 'Unable to complete registration.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ocean-50 p-4">
        <div className="mx-auto max-w-3xl">
          <LoadingState label="Loading registration form..." />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ocean-50 via-white to-hearth-50 px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link to="/login" className="text-slate-950">
            <BrandLogo variant="compact" />
          </Link>
          <Link className="btn-secondary" to="/login">
            Organizer login
          </Link>
        </header>

        <Alert type="error">{error}</Alert>

        {event ? (
          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="panel p-5">
              <StatusLine icon={CalendarDays} label={`${formatDate(event.date)} at ${formatTime(event.time)}`} />
              <StatusLine icon={MapPin} label={event.venue} />
              <div className="mt-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">
                  {event.organization || event.organizer_name}
                </p>
                <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950">{event.title}</h1>
                <p className="mt-4 text-slate-600">{event.description}</p>
              </div>
              <div className="mt-6 rounded-md bg-ocean-50 p-4 text-sm text-slate-700">
                <p className="font-semibold">{event.registrations || 0}/{event.capacity} registered</p>
                <p className="mt-1">Deadline: {formatDate(event.registration_deadline)}</p>
              </div>
            </aside>

            <section className="panel p-5 sm:p-6">
              {participant ? (
                <div className="text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                  <h2 className="mt-4 text-2xl font-bold text-slate-950">Registration confirmed</h2>
                  <p className="mt-2 text-slate-600">{participant.full_name}</p>
                  <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
                    Please show the QR code to an event organizer to confirm your attendance.
                  </p>
                  <img
                    className="mx-auto mt-6 h-64 w-64 rounded-lg border border-slate-200 bg-white p-3"
                    src={participant.qr_code}
                    alt="Participant QR code"
                  />
                  <p className="mx-auto mt-4 max-w-md break-all rounded-md bg-slate-50 p-3 text-xs text-slate-500">
                    {participant.qr_token}
                  </p>
                </div>
              ) : (
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
                  <div className="sm:col-span-2">
                    <h2 className="text-xl font-bold text-slate-950">Participant registration</h2>
                    <p className="mt-1 text-sm text-slate-500">Your QR code is generated after registration.</p>
                  </div>
                  <Field
                    label="Full name"
                    value={form.full_name}
                    onChange={(value) => setForm({ ...form, full_name: value })}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                  />
                  <Field
                    label="Student number or ID"
                    value={form.student_number}
                    onChange={(value) => setForm({ ...form, student_number: value })}
                  />
                  <Field
                    label="Course/Department"
                    value={form.course_department}
                    onChange={(value) => setForm({ ...form, course_department: value })}
                  />
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-primary w-full" disabled={submitting}>
                      <Send className="h-4 w-4" />
                      {submitting ? 'Registering...' : 'Register'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function StatusLine({ icon: Icon, label }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <Icon className="h-4 w-4 text-ocean-600" />
      {label}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="input mt-1"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
