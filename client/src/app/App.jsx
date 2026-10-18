import { Navigate, Outlet, Route, Routes, Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { analyzeResume, applicationsApi, interviewApi } from '../services/apiClient'
import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { ThemeOptions } from '../components/theme'
import { Logo } from '../components/Logo'
import { Badge, Button, Dialog, EmptyState as SharedEmptyState, StatCard, Dropzone } from '../components/ui'
import { Search, MoreHorizontal, BriefcaseBusiness, ClipboardCheck, FileSearch, MessagesSquare, Check } from 'lucide-react'

const statuses = ['Applied', 'In Review', 'Interview', 'Offer', 'Rejected']

const emptyApplication = {
  companyName: '',
  jobTitle: '',
  status: 'Applied',
  jobUrl: '',
  location: '',
  workMode: '',
  appliedAt: '',
  followUpAt: '',
  salaryMin: '',
  salaryMax: '',
  notes: '',
}

function Loading() {
  return <div className="state-card"><span className="spinner" /> Loading...</div>
}

function ErrorState({ message }) {
  return <div className="state-card error-state"><strong>Could not load this page.</strong><span>{message}</span></div>
}

function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getApplicationFormValues(application) {
  if (!application) return { ...emptyApplication }
  return {
    ...application,
    appliedAt: application.appliedAt?.slice(0, 10) ?? '',
    followUpAt: application.followUpAt?.slice(0, 10) ?? '',
  }
}

function buildApplicationPayload(form) {
  const fieldsToIgnore = new Set(['_id', 'userId', 'statusHistory', 'createdAt', 'updatedAt'])
  return Object.fromEntries(
    Object.entries(form).filter(([key, value]) => !fieldsToIgnore.has(key) && value !== ''),
  )
}

function sortApplications(items, sort) {
  return [...items].sort((first, second) => {
    if (sort === 'company') return first.companyName.localeCompare(second.companyName)
    if (sort === 'applied') return new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0)
    return new Date(second.updatedAt || 0) - new Date(first.updatedAt || 0)
  })
}

function countApplicationsByStatus(items) {
  return statuses.reduce((counts, status) => {
    counts[status] = items.filter((item) => item.status === status).length
    return counts
  }, {})
}

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function ProductPreview() {
  return <div className="product-preview" aria-label="ApplyPilot workspace preview">
    <div className="preview-bar"><span className="preview-dot" /><span className="preview-dot" /><span className="preview-dot" /></div>
    <div className="preview-body"><aside className="preview-sidebar"><Logo to="/"/><span className="preview-nav active">Overview</span><span className="preview-nav">Applications</span><span className="preview-nav">Resume Analyzer</span><span className="preview-nav">Interview Prep</span></aside><div className="preview-content"><div className="preview-heading"><span /><i /></div><div className="preview-stats"><span /><span /><span /></div><div className="preview-panels"><div><b /><em /><em /><em /></div><div><b /><em /><em /></div></div></div></div>
  </div>
}

function AuthVisual({ isLogin }) {
  return <aside className="auth-visual"><div className="auth-visual-glow" /><Logo to="/"/><div className="auth-visual-copy"><span className="auth-kicker">{isLogin ? 'Your workspace, ready' : 'A clearer job search'}</span><h2>{isLogin ? 'Pick up where you left off.' : 'Turn scattered applications into steady progress.'}</h2><p>Track applications, understand your resume match, and practice with purpose.</p></div><ProductPreview /></aside>
}

function LandingPage() {
  return <main className="landing">
    <nav className="nav container"><Logo to="/"/><div className="nav-links"><a href="#features">Features</a><Link className="button button-quiet" to="/login">Log in</Link><Link className="button button-primary" to="/signup">Get started</Link></div></nav>
    <section className="hero container"><div className="hero-copy-block"><p className="eyebrow">A calmer job search workspace</p><h1>Keep every application moving forward.</h1><p className="hero-copy">ApplyPilot helps you track applications, compare your resume with a job description, and prepare for interviews in one focused place.</p><div className="hero-actions"><Link className="button button-primary" to="/signup">Create your workspace</Link><a className="text-link" href="#features">See how it works <span aria-hidden="true">→</span></a></div><p className="hero-note">Private by default. Guidance, not guarantees.</p></div><ProductPreview /></section>
    <section id="features" className="features container"><div className="section-heading"><p className="eyebrow">Built for useful progress</p><h2>One clear view of your search.</h2></div><div className="feature-grid"><article className="feature-card"><span className="feature-number">01</span><h3>Track applications</h3><p>Keep statuses, notes, dates, and follow-ups together instead of scattered across tabs.</p></article><article className="feature-card"><span className="feature-number">02</span><h3>Understand the match</h3><p>Compare resume evidence with a job description and receive grounded suggestions.</p></article><article className="feature-card"><span className="feature-number">03</span><h3>Practice with purpose</h3><p>Generate bounded interview practice questions and save the notes that help you improve.</p></article></div></section>
    <footer className="footer container">
      <div className="footer-main">
        <div className="footer-brand">
          <Logo to="/" />
          <p>Your job search, organized.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ApplyPilot. All rights reserved.</span>
        <span id="privacy">Private by default. Guidance, not guarantees.</span>
      </div>
      <div className="sr-only">
        <span id="terms">ApplyPilot provides organization and preparation tools, not hiring or ATS guarantees.</span>
        <span id="contact">Contact information is provided by the project owner for the active deployment.</span>
      </div>
    </footer>
  </main>
}

function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError('')
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    try { await (isLogin ? login(form) : register(form)); navigate('/dashboard') }
    catch (requestError) { setError(requestError.message) }
    finally { setPending(false) }
  }
  return <main className="auth-page"><div className="auth-layout"><AuthVisual isLogin={isLogin}/><div className="auth-form-side"><div className="auth-mobile-brand"><Logo to="/"/></div><form className="auth-card" onSubmit={submit}><p className="eyebrow">{isLogin ? 'Welcome back' : 'Start organizing'}</p><h1>{isLogin ? 'Log in to your workspace' : 'Create your workspace'}</h1><p className="muted">{isLogin ? 'Continue where you left off.' : 'Keep your search focused and explainable.'}</p>{!isLogin && <label>Name<input className="input" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}<label>Email<input className="input" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input className="input" required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{!isLogin && <label>Confirm password<input className="input" required type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>}{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary full-width" disabled={pending}>{pending ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}</button><p className="form-footer">{isLogin ? <>New here? <Link to="/signup">Create an account</Link></> : <>Already have an account? <Link to="/login">Log in</Link></>}</p></form></div></div></main>
}

function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null); const [error, setError] = useState('')
  useEffect(() => { applicationsApi.dashboard().then((result) => setSummary(result.summary)).catch((e) => setError(e.message)) }, [])
  if (error) return <ErrorState message={error} />; if (!summary) return <Loading />
  const firstName = user?.name?.split(/\s+/)[0] || 'there'
  const greeting = getGreeting()
  const hasApplications = summary.total > 0
  return <><div className="page-heading"><div><h2>{greeting}, {firstName}</h2><p className="muted">{hasApplications ? `${summary.total} application${summary.total === 1 ? '' : 's'} in your workspace.` : 'Start with one small step to organize your search.'}</p></div><Link className="button button-primary" to="/applications/new">Add application</Link></div><div className="metrics-grid"><Metric icon={BriefcaseBusiness} label="Total applications" value={summary.total}/><Metric icon={ClipboardCheck} label="In review" value={summary.counts['In Review']}/><Metric icon={MessagesSquare} label="Interviews" value={summary.counts.Interview}/><Metric icon={Check} label="Offers" value={summary.counts.Offer}/></div>{!hasApplications ? <section className="panel dashboard-start"><div className="panel-heading"><div><h3>Get started</h3><p className="muted">A simple checklist for your first session.</p></div></div><div className="checklist"><Link className="check-item" to="/applications/new"><span className="check-dot"><BriefcaseBusiness size={14} aria-hidden="true"/></span><span><strong>Add your first application</strong><small>Track a role, status and follow-up.</small></span></Link><Link className="check-item" to="/tools/resume-analyzer"><span className="check-dot"><FileSearch size={14} aria-hidden="true"/></span><span><strong>Analyze a resume</strong><small>Compare evidence with a job description.</small></span></Link><Link className="check-item" to="/tools/interview-prep"><span className="check-dot"><MessagesSquare size={14} aria-hidden="true"/></span><span><strong>Practice an interview</strong><small>Generate bounded practice material.</small></span></Link></div></section> : null}<div className="dashboard-grid"><section className="panel"><div className="panel-heading"><h3>Recent applications</h3><Link to="/applications">View all</Link></div>{summary.recentApplications.length ? <div className="application-list">{summary.recentApplications.map((item) => <ApplicationRow key={item._id} item={item}/>)}</div> : <EmptyState text="No applications yet." />}</section><section className="panel"><div className="panel-heading"><h3>Upcoming follow-ups</h3></div>{summary.upcomingFollowUps.length ? summary.upcomingFollowUps.map((item) => <ApplicationRow key={item._id} item={item}/>) : <EmptyState text="No follow-ups scheduled." />}</section></div></>
}
function Metric({ icon, label, value }) { return <StatCard icon={icon} label={label} value={value} /> }
function EmptyState({ text }) { return <SharedEmptyState title={text} /> }
function ApplicationRow({ item }) { return <Link className="application-row" to={`/applications/${item._id}`}><div><strong>{item.companyName}</strong><span>{item.jobTitle}</span></div><Badge status={item.status}/></Link> }
function StatusBadge({ status }) { return <Badge status={status}/> }

function ApplicationsPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(''); const [search, setSearch] = useState(''); const [status, setStatus] = useState(''); const [sort, setSort] = useState('updated')
  const [pendingDelete, setPendingDelete] = useState(null); const [deleting, setDeleting] = useState(false)

  function load() {
    setError('')
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    applicationsApi.list(params.toString())
      .then((result) => setItems(result.applications))
      .catch((requestError) => setError(requestError.message))
  }

  useEffect(() => { load() }, [status])
  function submitSearch(event) { event.preventDefault(); load() }

  async function remove(item) {
    setDeleting(true)
    try {
      await applicationsApi.remove(item._id)
      setPendingDelete(null)
      load()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  const allItems = items ?? []
  const visibleItems = sortApplications(allItems, sort)
  const counts = countApplicationsByStatus(allItems)
  return <><div className="page-heading"><div><h2>Applications</h2><p className="muted">Keep your pipeline, notes and follow-ups in one place.</p></div><Link className="button button-primary" to="/applications/new">Add application</Link></div><form className="toolbar applications-toolbar" onSubmit={submitSearch}><div className="search"><Search size={17} aria-hidden="true"/><input className="input" aria-label="Search applications" placeholder="Search company or role" value={search} onChange={(e) => setSearch(e.target.value)}/></div><button className="button button-quiet" type="submit">Search</button></form><div className="applications-filter-row"><div className="tabs" role="tablist" aria-label="Filter applications by status"><button className="tab" type="button" role="tab" aria-selected={!status} onClick={() => setStatus('')}>All <span className="tab-count">{items?.length ?? 0}</span></button>{statuses.map((item) => <button className="tab" type="button" role="tab" key={item} aria-selected={status === item} onClick={() => setStatus(item)}>{item} <span className="tab-count">{counts[item] ?? 0}</span></button>)}</div><label className="sort-control">Sort<select className="select" aria-label="Sort applications" value={sort} onChange={(e) => setSort(e.target.value)}><option value="updated">Recently updated</option><option value="applied">Applied date</option><option value="company">Company</option></select></label></div>{error ? <ErrorState message={error}/> : items === null ? <Loading/> : visibleItems.length === 0 ? <EmptyState text={search || status ? 'No applications match those filters.' : 'No applications yet. Add your first application.'}/> : <div className="table-wrap"><table className="table applications-table"><thead><tr><th>Company</th><th>Role</th><th>Status</th><th className="col-applied">Applied</th><th className="col-followup">Follow-up</th><th aria-label="Actions"></th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item._id} onClick={() => window.location.assign(`/applications/${item._id}`)}><td><strong>{item.companyName}</strong></td><td>{item.jobTitle}</td><td><Badge status={item.status}/></td><td className="col-applied">{item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : '—'}</td><td className="col-followup">{item.followUpAt ? new Date(item.followUpAt).toLocaleDateString() : '—'}</td><td><details className="row-actions" onClick={(event) => event.stopPropagation()}><summary className="btn btn-ghost btn-icon" aria-label={`Open actions for ${item.companyName}`}><MoreHorizontal size={18} aria-hidden="true"/></summary><div className="row-menu" role="menu"><Link role="menuitem" to={`/applications/${item._id}`}>View</Link><Link role="menuitem" to={`/applications/${item._id}/edit`}>Edit</Link><button type="button" role="menuitem" onClick={() => setPendingDelete(item)}>Delete</button></div></details></td></tr>)}</tbody></table></div>}<Dialog open={Boolean(pendingDelete)} title="Delete application?" description={pendingDelete ? `This will permanently remove the application for ${pendingDelete.companyName}.` : ''} onClose={() => !deleting && setPendingDelete(null)}><div className="dialog-actions"><Button variant="secondary" disabled={deleting} onClick={() => setPendingDelete(null)}>Cancel</Button><Button variant="danger" loading={deleting} onClick={() => remove(pendingDelete)}>Delete application</Button></div></Dialog></>
}

function ApplicationForm({ existing = null }) {
  const navigate = useNavigate(); const [pending, setPending] = useState(false); const [error, setError] = useState('')
  const [form, setForm] = useState(() => getApplicationFormValues(existing))

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setPending(true)
    setError('')

    const body = buildApplicationPayload(form)
    try {
      const result = existing
        ? await applicationsApi.update(existing._id, body)
        : await applicationsApi.create(body)
      navigate(`/applications/${result.application._id}`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPending(false)
    }
  }
  return <form className="panel form-panel" onSubmit={submit}><div className="form-grid"><label>Company name<input required className="input" value={form.companyName} onChange={(e) => update('companyName', e.target.value)}/></label><label>Job title<input required className="input" value={form.jobTitle} onChange={(e) => update('jobTitle', e.target.value)}/></label><label>Status<select className="select" value={form.status} onChange={(e) => update('status', e.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label>Job URL<input className="input" type="url" value={form.jobUrl} onChange={(e) => update('jobUrl', e.target.value)}/></label><label>Location<input className="input" value={form.location} onChange={(e) => update('location', e.target.value)}/></label><label>Work mode<input className="input" placeholder="Remote, hybrid, onsite" value={form.workMode} onChange={(e) => update('workMode', e.target.value)}/></label><label>Applied date<input className="input" type="date" value={form.appliedAt} onChange={(e) => update('appliedAt', e.target.value)}/></label><label>Follow-up date<input className="input" type="date" value={form.followUpAt} onChange={(e) => update('followUpAt', e.target.value)}/></label><label>Salary minimum<input className="input" type="number" min="0" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)}/></label><label>Salary maximum<input className="input" type="number" min="0" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)}/></label><label className="full-span">Notes<textarea className="textarea" rows="5" value={form.notes} onChange={(e) => update('notes', e.target.value)}/></label></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-actions"><Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" loading={pending}>{pending ? 'Saving...' : 'Save application'}</Button></div></form>
}

function ApplicationDetailPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [error, setError] = useState('')
  useEffect(() => { applicationsApi.get(id).then((result) => setItem(result.application)).catch((e) => setError(e.message)) }, [id])
  async function remove() { if (!window.confirm('Delete this application?')) return; await applicationsApi.remove(id); navigate('/applications') }
  if (error) return <ErrorState message={error}/>; if (!item) return <Loading />
  return <><div className="page-heading"><div><Link className="back-link" to="/applications">← Applications</Link><h2>{item.companyName}</h2><p className="muted">{item.jobTitle}</p></div><div className="button-row"><Link className="button button-quiet" to={`/applications/${id}/edit`}>Edit</Link><button className="button button-danger" onClick={remove}>Delete</button></div></div><div className="detail-grid"><section className="panel"><div className="detail-status"><StatusBadge status={item.status}/><span className="muted">{item.location || 'Location not added'} · {item.workMode || 'Work mode not added'}</span></div><dl className="detail-list"><dt>Job URL</dt><dd>{item.jobUrl ? <a className="text-link" href={item.jobUrl} target="_blank" rel="noreferrer">{item.jobUrl}</a> : 'Not added'}</dd><dt>Applied</dt><dd>{item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : 'Not added'}</dd><dt>Follow-up</dt><dd>{item.followUpAt ? new Date(item.followUpAt).toLocaleDateString() : 'Not scheduled'}</dd><dt>Notes</dt><dd className="notes">{item.notes || 'No notes yet.'}</dd></dl></section><section className="panel"><h3>Status history</h3><div className="timeline">{item.statusHistory.map((entry, index) => <div className="timeline-item" key={`${entry.status}-${entry.changedAt}`}><span className="timeline-dot" aria-hidden="true"/><div className="timeline-content"><strong>{entry.status}</strong><span className="timeline-date muted">{new Date(entry.changedAt).toLocaleString()}</span></div>{index < item.statusHistory.length - 1 && <span className="timeline-line" aria-hidden="true"/>}</div>)}</div></section></div></>
}

function SettingsPage() { const { user, logout } = useAuth(); const navigate = useNavigate(); return <><div className="page-heading"><div><h2>Settings</h2><p className="muted">Manage your profile and workspace appearance.</p></div></div><section className="panel settings-panel"><h3>Profile</h3><dl className="detail-list"><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd></dl><h3>Appearance</h3><ThemeOptions/><h3>Session</h3><p className="muted">Log out from this device when you are finished.</p><Button variant="danger" onClick={async () => { await logout(); navigate('/') }}>Log out</Button></section></> }

function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null); const [jobDescription, setJobDescription] = useState(''); const [result, setResult] = useState(null); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!file) {
      setError('Choose a PDF resume first.')
      return
    }
    if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) {
      setError('Choose a PDF file no larger than 5 MB.')
      return
    }
    if (jobDescription.trim().length < 20) {
      setError('Add a job description of at least 20 characters.')
      return
    }

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobDescription', jobDescription)
    setPending(true)
    try {
      const response = await analyzeResume(formData)
      setResult(response.analysis.result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPending(false)
    }
  }

  return <><div className="page-heading"><div><h2>Resume analyzer</h2><p className="muted">Compare resume evidence with a job description. Not found does not mean you lack the skill.</p></div></div><div className="tool-grid"><form className="panel form-panel analyzer-form" onSubmit={submit}><div className="field"><span className="label">Resume PDF</span><Dropzone file={file} onFile={setFile} maxMB={5} disabled={pending}/></div><label>Job description<textarea className="textarea" rows="10" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." /><span className="help">{jobDescription.length.toLocaleString()} / 30,000 characters</span></label>{error && <div className="form-error" role="alert">{error}</div>}<div className="analyzer-actions"><span className="help">Minimum 20 characters</span><Button className="analyze-button" type="submit" loading={pending} disabled={!file || jobDescription.trim().length < 20}>{pending ? 'Analyzing...' : 'Analyze resume'}</Button></div></form><aside className="panel info-panel"><h3>How this works</h3><p className="muted">Your PDF text and job description are sent to the configured AI provider for this analysis.</p><p className="muted">Raw resume text is not stored. Results are saved to your account so you can review them later.</p><p className="muted">Not found in the resume does not mean you lack the skill.</p></aside></div>{pending ? <div className="panel stepper" role="status"><strong>Analyzing your resume</strong><span>Extracting text and comparing evidence. This can take a moment.</span></div> : null}{result && <section className="panel analysis-result"><h3>Summary</h3><p>{result.summary}</p><h3>Matched skills</h3>{result.matchedSkills.length ? result.matchedSkills.map((item) => <div className="analysis-item" key={item.skill}><strong>{item.skill}</strong><span>{item.evidence}</span></div>) : <EmptyState text="No supported matches were found." />}<h3>Not found or unclear</h3>{result.notFoundOrUnclear.map((item) => <div className="analysis-item" key={item.requirement}><strong>{item.requirement}</strong><span>{item.explanation}</span></div>)}<h3>Suggestions</h3>{result.suggestions.map((item) => <div className="analysis-item" key={item.suggestion}><strong>{item.suggestion}</strong><span>{item.rationale}</span></div>)}<p className="muted small">{result.disclaimer}</p></section>}</>
}

function InterviewPrepPage() {
  const [role, setRole] = useState(''); const [category, setCategory] = useState('Technical'); const [sessions, setSessions] = useState(null); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  useEffect(() => { interviewApi.sessions().then((response) => setSessions(response.sessions)).catch((e) => setError(e.message)) }, [])
  async function generate(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const response = await interviewApi.generate({ role, category })
      setSessions((current) => [response.session, ...(current ?? [])])
      setRole('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPending(false)
    }
  }

  async function save(session) {
    try {
      const response = await interviewApi.update(session._id, { questions: session.questions })
      setSessions((current) => current.map((item) => (
        item._id === response.session._id ? response.session : item
      )))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function changeQuestion(sessionId, questionId, field, value) {
    setSessions((current) => current.map((session) => {
      if (session._id !== sessionId) return session
      return {
        ...session,
        questions: session.questions.map((question) => (
          question._id === questionId
            ? { ...question, [field]: value }
            : question
        )),
      }
    }))
  }
  return <><div className="page-heading"><div><h2>Interview prep</h2><p className="muted">Practice material, not guaranteed interview questions.</p></div></div><form className="panel prep-form" onSubmit={generate}><label className="field"><span className="label">Target role</span><input className="input" required minLength="2" maxLength="160" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer"/></label><label className="field"><span className="label">Category</span><select className="select" value={category} onChange={(e) => setCategory(e.target.value)}><option>Technical</option><option>HR</option><option>Behavioral</option></select></label>{error && <div className="form-error" role="alert">{error}</div>}<Button type="submit" loading={pending}>{pending ? 'Generating...' : 'Generate questions'}</Button></form>{sessions?.length === 0 && <EmptyState text="Generate your first practice set above."/>}{sessions?.map((session) => { const practiced = session.questions.filter((item) => item.practiced).length; return <section className="panel session-card" key={session._id}><div className="panel-heading"><div><h3>{session.role}</h3><span className="muted">{session.category} · {practiced} of {session.questions.length} practiced</span></div><Button onClick={() => save(session)}>Save progress</Button></div>{session.questions.map((item, index) => <div className="question-card" key={item._id}><div className="question-prompt"><span className="question-number">Question {index + 1}</span><strong>{item.question}</strong></div><label className="field notes-field"><span className="label">Your notes</span><textarea className="textarea" rows="3" value={item.notes} placeholder="Add personal notes..." onChange={(e) => changeQuestion(session._id, item._id, 'notes', e.target.value)}/></label><label className="check-label"><input type="checkbox" checked={item.practiced} onChange={(e) => changeQuestion(session._id, item._id, 'practiced', e.target.checked)}/><span>Practiced</span></label></div>)}</section>})}</>
}

export default function App() {
  const { user, logout } = useAuth()
  async function handleLogout() {
    await logout()
    window.location.assign('/')
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><AuthPage mode="signup" /></PublicOnly>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route
            path="/applications/new"
            element={<><div className="page-heading"><h2>New application</h2></div><ApplicationForm /></>}
          />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route
            path="/applications/:id/edit"
            element={<><div className="page-heading"><h2>Edit application</h2></div><EditApplication /></>}
          />
          <Route path="/tools/resume-analyzer" element={<ResumeAnalyzerPage />} />
          <Route path="/tools/interview-prep" element={<InterviewPrepPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function EditApplication() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    applicationsApi.get(id)
      .then((result) => setItem(result.application))
      .catch((requestError) => setError(requestError.message))
  }, [id])

  if (error) return <ErrorState message={error} />
  return item ? <ApplicationForm existing={item} /> : <Loading />
}
