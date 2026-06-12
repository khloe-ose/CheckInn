export const formatDate = (value) => {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatDateTime = (value) => {
  if (!value) return 'Not checked in'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatTime = (value) => {
  if (!value) return 'Not set'
  const [hour, minute] = String(value).split(':')
  const date = new Date()
  date.setHours(Number(hour || 0), Number(minute || 0), 0)
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const toInputTime = (value) => (value ? String(value).slice(0, 5) : '')

export const asPercent = (value) => `${Number(value || 0)}%`
