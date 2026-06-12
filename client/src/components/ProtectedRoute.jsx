import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LoadingState from './LoadingState'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingState label="Checking session..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
