import { useState, useMemo } from 'react'

const STATUS_OPTIONS = [
  'not yet applied',
  'applied',
  'done OA',
  'behavioural int',
  'technical int',
  'final round',
  'waiting on offer',
]

const STATUS_ORDER = Object.fromEntries(STATUS_OPTIONS.map((s, i) => [s, i]))

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recent' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'progress-asc', label: 'Progress (earliest)' },
  { value: 'progress-desc', label: 'Progress (furthest)' },
  { value: 'intern-first', label: 'Interns first' },
  { value: 'grad-first', label: 'Grads first' },
]

function statusToClass(status) {
  if (!status) return ''
  return status.replace(/\s+/g, '-').toLowerCase()
}

function formatStatusLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

export function TrackerTable({ applications, onRowClick, onStatusChange }) {
  const [sortBy, setSortBy] = useState('recent')
  const [filterType, setFilterType] = useState('all')

  const filteredAndSortedApps = useMemo(() => {
    let list = applications

    if (filterType === 'intern') {
      list = list.filter((a) => a.type === 'intern')
    } else if (filterType === 'grad') {
      list = list.filter((a) => a.type === 'grad')
    }

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.company_name || '').localeCompare(b.company_name || '')
        case 'name-desc':
          return (b.company_name || '').localeCompare(a.company_name || '')
        case 'progress-asc':
          return (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        case 'progress-desc':
          return (STATUS_ORDER[b.status] ?? 0) - (STATUS_ORDER[a.status] ?? 0)
        case 'intern-first':
          if (a.type === b.type) return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          return a.type === 'intern' ? -1 : 1
        case 'grad-first':
          if (a.type === b.type) return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          return a.type === 'grad' ? -1 : 1
        default:
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      }
    })
  }, [applications, sortBy, filterType])

  const handleStatusChange = (e, id) => {
    e.stopPropagation()
    onStatusChange(id, e.target.value)
  }

  return (
    <div className="tracker-section">
      <div className="tracker-toolbar">
        <div className="tracker-filters">
          <label htmlFor="filter-type">Filter</label>
          <select id="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="all">All</option>
            <option value="intern">Intern only</option>
            <option value="grad">Grad only</option>
          </select>
        </div>
        <div className="tracker-sort">
          <label htmlFor="sort-by">Sort</label>
          <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrapper">
      <table className="tracker-table">
        <thead>
          <tr>
            <th className="col-company">Company</th>
            <th className="col-title">Job Title</th>
            <th className="col-type">Type</th>
            <th className="col-status">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedApps.map((app) => (
            <tr
              key={app.id}
              className="tracker-row"
              onClick={() => onRowClick(app)}
            >
              <td className="col-company">
                <div className="company-cell">
                  {app.logo_url ? (
                    <img src={app.logo_url} alt="" className="row-logo" />
                  ) : (
                    <div className="row-logo-placeholder">
                      {app.company_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span>{app.company_name}</span>
                </div>
              </td>
              <td className="col-title">{app.job_title || '—'}</td>
              <td className="col-type">
                <span className={`type-badge ${app.type}`}>
                  {app.type === 'intern' ? 'Intern' : 'Grad'}
                </span>
              </td>
              <td className="col-status" onClick={(e) => e.stopPropagation()}>
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(e, app.id)}
                  className={`status-select status-badge status-${statusToClass(app.status)}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{formatStatusLabel(s)}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAndSortedApps.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No applications yet</h3>
          <p>Add your first company to start tracking your job search. You can add logos, notes, and update status as you progress.</p>
        </div>
      )}
      </div>
    </div>
  )
}
