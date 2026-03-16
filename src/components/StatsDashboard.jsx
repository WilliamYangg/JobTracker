import { useMemo } from 'react'

export function StatsDashboard({ applications }) {
  const stats = useMemo(() => {
    const total = applications.length
    const applied = applications.filter((a) => a.status !== 'not yet applied').length
    const inProgress = applications.filter((a) =>
      ['applied', 'done OA', 'behavioural int', 'technical int', 'final round'].includes(a.status)
    ).length
    const offers = applications.filter((a) => a.status === 'waiting on offer').length

    return { total, applied, inProgress, offers }
  }, [applications])

  return (
    <div className="stats-grid">
      <div className="stat-card highlight">
        <div className="stat-value">{stats.total}</div>
        <div className="stat-label">Total Applications</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.applied}</div>
        <div className="stat-label">Applied</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.inProgress}</div>
        <div className="stat-label">In Progress</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.offers}</div>
        <div className="stat-label">Waiting on Offer</div>
      </div>
    </div>
  )
}
