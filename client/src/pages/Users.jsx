import { Plus, Save, Trash2, UserCog } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/Alert'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import api, { getApiError } from '../services/api'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  organization: '',
  phone: '',
  role: 'organizer',
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selected, setSelected] = useState(null)

  const loadUsers = useCallback(() => {
    setLoading(true)
    api
      .get('/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch((err) => setError(getApiError(err, 'Unable to load users.')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const createUser = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setWorking(true)
    try {
      await api.post('/users', form)
      setSuccess('User created.')
      setForm(emptyForm)
      loadUsers()
    } catch (err) {
      setError(getApiError(err, 'Unable to create user.'))
    } finally {
      setWorking(false)
    }
  }

  const updateUser = async (user, updates) => {
    setWorking(true)
    setError('')
    try {
      await api.patch(`/users/${user.id}`, updates)
      setSuccess('User updated.')
      loadUsers()
    } catch (err) {
      setError(getApiError(err, 'Unable to update user.'))
    } finally {
      setWorking(false)
    }
  }

  const deleteUser = async () => {
    if (!selected) return
    setWorking(true)
    try {
      await api.delete(`/users/${selected.id}`)
      setSuccess('User deleted.')
      setSelected(null)
      loadUsers()
    } catch (err) {
      setError(getApiError(err, 'Unable to delete user.'))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-ocean-700">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">User management</h1>
      </div>

      <Alert type="error">{error}</Alert>
      <Alert>{success}</Alert>

      <form className="panel grid gap-4 p-5 lg:grid-cols-6" onSubmit={createUser}>
        <div className="lg:col-span-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
            <Plus className="h-4 w-4" />
            Add user
          </h2>
        </div>
        <Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
        />
        <Input
          label="Organization"
          value={form.organization}
          onChange={(value) => setForm({ ...form, organization: value })}
        />
        <div>
          <label className="label" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            className="input mt-1"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full" disabled={working}>
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingState label="Loading users..." />
      ) : users.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ocean-50 text-ocean-700">
                        <UserCog className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.organization || 'Unassigned'}</td>
                  <td>
                    <select
                      className="input min-w-32"
                      value={user.role}
                      onChange={(event) => updateUser(user, { role: event.target.value })}
                    >
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="input min-w-32"
                      value={user.is_active ? 'active' : 'inactive'}
                      onChange={(event) =>
                        updateUser(user, { is_active: event.target.value === 'active' })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="icon-btn text-rose-600 hover:text-rose-700"
                        onClick={() => setSelected(user)}
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No users found" message="Create the first organizer or admin account." />
      )}

      <ConfirmModal
        open={Boolean(selected)}
        title="Delete user"
        message={`Delete ${selected?.name || 'this user'}? Related organizer events will also be deleted by the database relationship.`}
        onClose={() => setSelected(null)}
        onConfirm={deleteUser}
        loading={working}
      />
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  const id = label.toLowerCase()
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input mt-1"
        type={type}
        required={label !== 'Organization'}
        minLength={type === 'password' ? 8 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
