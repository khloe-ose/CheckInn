import { Home, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ocean-50 via-white to-hearth-50 px-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <div className="mb-6 flex justify-center">
          <BrandLogo variant="full" className="h-auto w-56" />
        </div>
        <SearchX className="mx-auto h-12 w-12 text-ocean-600" />
        <h1 className="mt-4 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-2 text-slate-600">The requested page does not exist in CheckInn.</p>
        <Link className="btn-primary mt-6" to="/dashboard">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </section>
    </main>
  )
}
