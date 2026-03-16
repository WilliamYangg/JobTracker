import { useState, useEffect } from 'react'
import './App.css'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { TrackerTable } from './components/TrackerTable'
import { CompanyEditor } from './components/CompanyEditor'
import { AddCompanyModal } from './components/AddCompanyModal'
import { StatsDashboard } from './components/StatsDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [selectedApp, setSelectedApp] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dbError, setDbError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setApplications([])
      return
    }

    const fetchApps = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        setDbError(error.message)
        setApplications([])
      } else {
        setDbError(null)
        setApplications(data || [])
      }
    }

    fetchApps()

    const channel = supabase
      .channel('applications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, fetchApps)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSelectedApp(null)
    setShowAddModal(false)
  }

  const handleAddCompany = async ({ company_name, job_title, type, status, logoFile }) => {
    if (!user) return

    let logoUrl = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, logoFile, { upsert: true })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
        logoUrl = publicUrl
      }
    }

    await supabase.from('applications').insert({
      user_id: user.id,
      company_name,
      job_title,
      type,
      status,
      logo_url: logoUrl,
    })
  }

  const handleUpdateApplication = async (id, updates) => {
    const { logoFile, logoUrl: logoUrlOverride, ...rest } = updates
    let logoUrl = undefined
    if (logoUrlOverride === null) {
      logoUrl = null
    } else if (logoFile && user) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true })
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
        logoUrl = publicUrl
      }
    }
    const finalUpdates = { ...rest, ...(logoUrl !== undefined && { logo_url: logoUrl }) }
    await supabase.from('applications').update(finalUpdates).eq('id', id)
    setSelectedApp((prev) => (prev?.id === id ? { ...prev, ...finalUpdates } : prev))
  }

  const handleStatusChange = async (id, status) => {
    await handleUpdateApplication(id, { status })
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="app-logo-icon" style={{ margin: '0 auto 20px' }}>J</div>
          <h1>Job Tracker</h1>
          <p className="auth-subtitle">Set up Supabase to get started.</p>
          <p className="setup-instructions">
            Copy <code>.env.example</code> to <code>.env</code> and add your Supabase URL and anon key. See <code>README.md</code> for full setup instructions.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="app-logo-icon" style={{ margin: '0 auto 20px' }}>J</div>
          <h1>Job Tracker</h1>
          <p className="auth-subtitle">Track your job applications in one place. Stay organized and never miss a follow-up.</p>
          <button className="btn-google" onClick={handleSignIn}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {dbError && (
        <div className="db-setup-banner">
          <div className="db-setup-content">
            <strong>Database setup required</strong>
            <span>Open Supabase → SQL Editor → New query → paste & run the contents of <code>supabase-schema.sql</code></span>
          </div>
        </div>
      )}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <div className="app-logo-icon">J</div>
            <h1>Job Tracker</h1>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowAddModal(true)} disabled={!!dbError}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Company
          </button>
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <button className="btn-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="app-main">
        {selectedApp ? (
          <CompanyEditor
            application={selectedApp}
            onBack={() => setSelectedApp(null)}
            onUpdate={handleUpdateApplication}
          />
        ) : (
          <>
            <StatsDashboard applications={applications} />
            <div className="section-header">
              <h2 className="section-title">Applications</h2>
            </div>
            <TrackerTable
              applications={applications}
              onRowClick={setSelectedApp}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </main>
      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCompany}
        />
      )}
    </div>
  )
}

export default App
