import { ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { getApiError } from '../services/api'

const initialForm = {
  name: '',
  email: '',
  password: '',
  organization: '',
  phone: '',
}

export default function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Unable to create account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-hearth-50 px-4 py-8">
      <section className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6 space-y-5">
          <BrandLogo variant="compact" />
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Organizer registration</h1>
            <p className="text-sm text-slate-500">Create your CheckInn workspace</p>
          </div>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="sm:col-span-2">
            <Alert type="error">{error}</Alert>
          </div>
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input mt-1"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="organization">
              Organization
            </label>
            <input
              id="organization"
              className="input mt-1"
              required
              value={form.organization}
              onChange={(event) => setForm({ ...form, organization: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input mt-1"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className="input mt-1"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input mt-1"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <ClipboardCheck className="h-4 w-4" />
              {loading ? 'Creating account...' : 'Create organizer account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
