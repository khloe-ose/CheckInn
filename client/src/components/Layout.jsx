import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import BrandLogo from './BrandLogo'

const baseNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/participants', label: 'Participants', icon: Users },
  { to: '/check-in', label: 'QR Check-In', icon: QrCode },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const navItems = isAdmin
    ? [...baseNav, { to: '/users', label: 'Users', icon: ClipboardList }]
    : baseNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 via-white to-hearth-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/dashboard" className="text-slate-950">
            <BrandLogo variant="compact" className="h-14 w-auto sm:h-16" />
          </NavLink>

          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-ocean-50 text-ocean-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
            <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? 'bg-ocean-50 text-ocean-700' : 'text-slate-600'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              <button type="button" className="btn-secondary justify-start" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="page-shell">{children}</main>
    </div>
  )
}
