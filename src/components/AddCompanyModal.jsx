import { useState, useEffect } from 'react'
import { LogoDropzone } from './LogoDropzone'

export function AddCompanyModal({ onClose, onSave }) {
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [type, setType] = useState('intern')
  const [status, setStatus] = useState('not yet applied')
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!companyName.trim()) return
    setSaving(true)
    try {
      await onSave({
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        type,
        status,
        logoFile,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-company-modal-title"
    >
      <div className="modal add-company-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="add-company-modal-title">Add Company</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="company-name">Company Name</label>
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google, Meta..."
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Software Engineer Intern"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="intern">Intern</option>
                <option value="grad">Grad</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="not yet applied">Not yet applied</option>
                <option value="applied">Applied</option>
                <option value="done OA">Done OA</option>
                <option value="behavioural int">Behavioural int</option>
                <option value="technical int">Technical int</option>
                <option value="final round">Final round</option>
                <option value="waiting on offer">Waiting on offer</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Company Logo</label>
            <LogoDropzone id="add-company-logo" value={logoFile} onChange={setLogoFile} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !companyName.trim()}>
              {saving ? 'Adding...' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
