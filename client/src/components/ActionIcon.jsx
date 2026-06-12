import { Link } from 'react-router-dom'

function Tooltip({ label }) {
  return (
    <span className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-soft transition group-hover:opacity-100 group-focus-within:opacity-100">
      {label}
    </span>
  )
}

export function ActionIconLink({ to, label, children, className = '', onClick }) {
  return (
    <span className="group relative inline-flex" title={label}>
      <Link className={`icon-btn ${className}`} to={to} aria-label={label} onClick={onClick}>
        {children}
      </Link>
      <Tooltip label={label} />
    </span>
  )
}

export function ActionIconButton({ label, children, className = '', ...props }) {
  return (
    <span className="group relative inline-flex" title={label}>
      <button type="button" className={`icon-btn ${className}`} aria-label={label} {...props}>
        {children}
      </button>
      <Tooltip label={label} />
    </span>
  )
}
