import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { getApiError } from '../services/api'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Unable to sign in.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-hearth-50 px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <BrandLogo variant="full" className="mb-8 h-auto w-72" />
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Manage registrations, QR attendance, certificates, and reports in one place.
            </p>
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">Sign in</h2>
            <p className="text-sm text-slate-500">Welcome back to CheckInn</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <Alert type="error">{error}</Alert>
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
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input mt-1"
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 rounded-md bg-ocean-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Demo accounts</p>
            <p className="mt-1">Admin: admin@checkinn.test / Admin@123</p>
            <p>Organizer: organizer@checkinn.test / Organizer@123</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need an organizer account?{' '}
            <Link className="font-semibold" to="/register">
              Register
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
