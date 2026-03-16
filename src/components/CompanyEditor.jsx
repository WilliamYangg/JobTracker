import { useState, useEffect, useCallback } from 'react'
import { RichTextEditor } from './RichTextEditor'
import { LogoDropzone } from './LogoDropzone'

const STATUS_OPTIONS = [
  'not yet applied',
  'applied',
  'done OA',
  'behavioural int',
  'technical int',
  'final round',
  'waiting on offer',
]

function formatStatusLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

export function CompanyEditor({ application, onBack, onUpdate }) {
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [type, setType] = useState('grad')
  const [status, setStatus] = useState('not yet applied')
  const [notes, setNotes] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (application) {
      setCompanyName(application.company_name || '')
      setJobTitle(application.job_title || '')
      setType(application.type || 'grad')
      setStatus(application.status || 'not yet applied')
      setNotes(application.notes || '')
      setLogoFile(null)
      setRemoveLogo(false)
    }
  }, [application])

  if (!application) return null

  const handleSave = async () => {
    if (!hasChanges && !logoFile && !removeLogo) return
    setSaving(true)
    try {
      await onUpdate(application.id, {
        company_name: companyName,
        job_title: jobTitle,
        type,
        status,
        notes,
        ...(removeLogo && { logoUrl: null }),
        ...(logoFile && { logoFile }),
      })
      setHasChanges(false)
      setLogoFile(null)
      setRemoveLogo(false)
    } finally {
      setSaving(false)
    }
  }

  const markChanged = () => setHasChanges(true)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onBack()
  }, [onBack])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="company-editor">
      <div className="company-editor-header">
        <button type="button" className="btn-back" onClick={onBack} aria-label="Back to applications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Applications
        </button>
        <div className="company-editor-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || (!hasChanges && !logoFile && !removeLogo)}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="company-editor-body">
        <div className="company-editor-meta">
          <div className="company-editor-logo-section">
            <LogoDropzone
              id="company-editor-logo"
              value={logoFile}
              currentUrl={removeLogo ? null : application.logo_url}
              onChange={(file) => { setLogoFile(file); setRemoveLogo(false) }}
              onRemove={() => { setRemoveLogo(true); setLogoFile(null) }}
            />
          </div>
          <div className="company-editor-fields">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); markChanged() }}
                placeholder="Company name"
                className="company-editor-title-input"
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); markChanged() }}
                placeholder="Job title"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={(e) => { setType(e.target.value); markChanged() }}>
                  <option value="intern">Intern</option>
                  <option value="grad">Grad</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => { setStatus(e.target.value); markChanged() }}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{formatStatusLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="company-editor-notes">
          <label>Notes</label>
          <RichTextEditor
            key={application.id}
            content={notes}
            onChange={(html) => { setNotes(html); markChanged() }}
            placeholder="Add notes, interview prep, key dates..."
          />
        </div>
      </div>
    </div>
  )
}
