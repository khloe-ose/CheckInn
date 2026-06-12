import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import EventDetails from './pages/EventDetails'
import EventForm from './pages/EventForm'
import Events from './pages/Events'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Participants from './pages/Participants'
import PublicRegistration from './pages/PublicRegistration'
import QRCheckIn from './pages/QRCheckIn'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Users from './pages/Users'

const protectedPage = (page, roles) => (
  <ProtectedRoute roles={roles}>
    <Layout>{page}</Layout>
  </ProtectedRoute>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/:slug" element={<PublicRegistration />} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/events" element={protectedPage(<Events />)} />
      <Route path="/events/new" element={protectedPage(<EventForm />)} />
      <Route path="/events/:id" element={protectedPage(<EventDetails />)} />
      <Route path="/events/:id/edit" element={protectedPage(<EventForm />)} />
      <Route path="/events/:eventId/participants" element={protectedPage(<Participants />)} />
      <Route path="/participants" element={protectedPage(<Participants />)} />
      <Route path="/check-in" element={protectedPage(<QRCheckIn />)} />
      <Route path="/reports" element={protectedPage(<Reports />)} />
      <Route path="/users" element={protectedPage(<Users />, ['admin'])} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
