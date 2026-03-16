import { useMemo } from 'react'

const STATUS_OPTIONS = [
  'not yet applied',
  'applied',
  'done OA',
  'behavioural int',
  'technical int',
  'final round',
  'waiting on offer',
]

function statusToClass(status) {
  if (!status) return ''
  return status.replace(/\s+/g, '-').toLowerCase()
}

function formatStatusLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

export function TrackerTable({ applications, onRowClick, onStatusChange }) {
  const sortedApps = useMemo(() => {
    return [...applications].sort((a, b) =>
      new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
    )
  }, [applications])

  const handleStatusChange = (e, id) => {
    e.stopPropagation()
    onStatusChange(id, e.target.value)
  }

  return (
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
          {sortedApps.map((app) => (
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
      {sortedApps.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No applications yet</h3>
          <p>Add your first company to start tracking your job search. You can add logos, notes, and update status as you progress.</p>
        </div>
      )}
    </div>
  )
}
