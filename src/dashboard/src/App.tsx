// SPDX-License-Identifier: AGPL-3.0
// Copyright (C) 2026 Juan Pablo Chancay
//
// App shell — view state machine (no external router).
// Views: login | register | participant_dashboard | session | results | admin
// Security: admin view requires role check on every render.

import { useCallback, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { login as apiLogin, register as apiRegister, recordConsent,
         getMe, getSessionResults, startSession, adminListParticipants,
         adminListLiveSessions } from './api/experimentClient'
import { TaskSequencer } from './experiment/TaskSequencer'
import type { AdminParticipant, LiveSessionRow, MeResponse, ResultsResponse, RegisterRequest } from './api/types'

// ── Views ─────────────────────────────────────────────────────────────────────

type View = 'login' | 'register' | 'dashboard' | 'session' | 'results' | 'admin'

// ── Login page ────────────────────────────────────────────────────────────────

function LoginPage({ onRegister }: { onRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const tok = await apiLogin({ email, password })
      login(tok.access_token, tok.role, tok.participant_id)
    } catch (err: unknown) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-white mb-1">CAL Research Platform</h1>
        <p className="text-xs text-gray-500 mb-6">Layer 2 — TCO-L2 Experiment</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-gray-400 mb-1">Email</label>
            <input id="email" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-gray-400 mb-1">Password</label>
            <input id="password" type="password" required autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
          </div>
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-4 text-center">
          Not registered?{' '}
          <button onClick={onRegister} className="text-blue-400 underline">Register here</button>
        </p>
      </div>
    </div>
  )
}

// ── Register page ─────────────────────────────────────────────────────────────

function RegisterPage({ onBack }: { onBack: () => void }) {
  const { login } = useAuth()
  const [form, setForm] = useState<Partial<RegisterRequest>>({
    prior_tco_exposure: false, ai_familiarity: 2,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof RegisterRequest, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name || form.years_experience === undefined) {
      setError('Please fill all required fields.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const tok = await apiRegister(form as RegisterRequest)
      login(tok.access_token, tok.role, tok.participant_id)
    } catch (err: unknown) {
      setError('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="text-xs text-gray-500 underline mb-4">← Back to login</button>
        <h1 className="text-xl font-bold text-white mb-1">Register</h1>
        <p className="text-xs text-gray-500 mb-6">CAL Research Platform — Participant Registration</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {([
            ['Name', 'name', 'text'],
            ['Email', 'email', 'email'],
            ['Password (min. 8 chars)', 'password', 'password'],
            ['Country (optional)', 'country', 'text'],
          ] as [string, keyof RegisterRequest, string][]).map(([lbl, key, type]) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1">{lbl}</label>
              <input type={type} value={(form[key] as string) ?? ''} onChange={(e) => set(key, e.target.value)}
                required={key !== 'country'}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Years of code review experience *</label>
            <input type="number" min={0} required value={form.years_experience ?? ''}
              onChange={(e) => set('years_experience', parseInt(e.target.value, 10))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              AI tool familiarity (0=never · 4=daily)
            </label>
            <input type="range" min={0} max={4} step={1}
              value={form.ai_familiarity ?? 2}
              onChange={(e) => set('ai_familiarity', parseInt(e.target.value, 10))}
              className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-0.5">
              <span>Never</span><span>Rarely</span><span>Monthly</span><span>Weekly</span><span>Daily</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="tco" checked={form.prior_tco_exposure ?? false}
              onChange={(e) => set('prior_tco_exposure', e.target.checked)}
              className="accent-blue-500" />
            <label htmlFor="tco" className="text-xs text-gray-400">
              I have heard of or used Tensor-Based Cognitive Oversight (TCO) before
            </label>
          </div>
          {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Informed consent ──────────────────────────────────────────────────────────
// Single-blind note: the dashboard must NEVER display the assigned group or
// mention a comparison group — the full purpose is revealed at debriefing only.

const CONSENT_TEXT = `INFORMED CONSENT — CAL Research Study (TCO-L2)

Purpose. You are invited to participate in a research study on how software
engineers supervise and correct outputs generated by AI code pipelines. The
study is conducted by Aural Syncro Research Lab (PI: Juan Pablo Chancay,
jpcpol@gmail.com).

What you will do. One session of approximately 3 hours: a short technical
questionnaire, a practice task, four supervision tasks on AI-generated code
and configuration, and two brief workload questionnaires (NASA-TLX). The
session may be recorded (screen and audio) for internal review only.

Risks and benefits. There are no risks beyond those of ordinary computer
work. There is no monetary compensation. You will receive early access to
the published results and, if you wish, an acknowledgment in the paper.

Data handling. Your data is stored under a pseudonymous identifier (e.g.
P012). Your name and email are used only to coordinate the session and are
never published. Recordings are stored locally and are not uploaded.
Anonymized data may be deposited in an open-science repository after the
study concludes.

Voluntary participation. Your participation is voluntary. You may stop at
any time without giving a reason, and you may request the deletion of your
data at any point, with no consequence.

Contact. For questions about the study or your data, write to
jpcpol@gmail.com.

By accepting below you confirm that you have read this form, that your
questions (if any) were answered, and that you agree to participate.`

function ConsentPanel() {
  const [read, setRead] = useState(false)
  const [accepting, setAccepting] = useState(false)
  return (
    <div className="bg-gray-900 border border-yellow-700 rounded p-4 mb-4">
      <h2 className="text-sm font-semibold text-yellow-300 mb-2">Informed consent</h2>
      <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-950 border border-gray-700 rounded p-3 max-h-64 overflow-y-auto mb-3 font-mono">
        {CONSENT_TEXT}
      </pre>
      <label className="flex items-start gap-2 mb-3 text-xs text-gray-300">
        <input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)}
          className="accent-yellow-500 mt-0.5" />
        I have read and understood the informed consent above.
      </label>
      <button
        disabled={!read || accepting}
        onClick={async () => {
          setAccepting(true)
          await recordConsent({ consent: true })
          window.location.reload()
        }}
        className="text-xs font-semibold text-yellow-100 bg-yellow-700 px-3 py-1.5 rounded hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed">
        {accepting ? 'Recording…' : 'I consent to participate →'}
      </button>
    </div>
  )
}

// ── Participant dashboard ─────────────────────────────────────────────────────

function ParticipantDashboard({
  me, onStartSession, onViewResults,
}: {
  me: MeResponse
  onStartSession: () => void
  onViewResults: () => void
}) {
  const { logout } = useAuth()
  const session = me.current_session

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono text-sm p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-lg font-bold text-white">Welcome, {me.name.split(' ')[0]}</h1>
            <p className="text-xs text-gray-500 mt-0.5">CAL Research Platform · L2</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-600 underline hover:text-gray-400">Sign out</button>
        </div>

        <div className="bg-gray-900 rounded border border-gray-700 p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-gray-500">Consent:</span> <span className={me.consent_given ? 'text-green-400' : 'text-yellow-400'}>{me.consent_given ? '✓ Signed' : 'Pending'}</span></div>
            <div><span className="text-gray-500">Session:</span> <span className="text-white">{session?.status ?? 'Not yet invited'}</span></div>
          </div>
        </div>

        {!me.consent_given && <ConsentPanel />}

        {session?.status === 'invited' && me.consent_given && (
          <button onClick={onStartSession}
            className="w-full py-3 text-sm font-bold bg-blue-700 hover:bg-blue-600 rounded transition-colors">
            Start session →
          </button>
        )}

        {session?.status === 'completed' && (
          <button onClick={onViewResults}
            className="w-full py-3 text-sm font-bold bg-green-800 hover:bg-green-700 rounded transition-colors">
            View results →
          </button>
        )}

        {!session && (
          <div className="bg-gray-800 rounded border border-gray-700 p-4 text-xs text-gray-500">
            Your session has not been scheduled yet. You will receive an email with your session date and time.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Results / debriefing ──────────────────────────────────────────────────────

function ResultsView({ results, group }: { results: ResultsResponse; group: string }) {
  const { logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono text-sm p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold text-white">Session Complete — Debriefing</h1>
          <button onClick={logout} className="text-xs text-gray-600 underline">Sign out</button>
        </div>

        <div className="bg-gray-900 rounded border border-gray-700 p-4 mb-4">
          <p className="text-xs text-gray-400 mb-3">
            Thank you for participating. You were assigned to the{' '}
            <span className="text-white font-semibold uppercase">{group}</span> group.
          </p>
          <h2 className="text-sm font-semibold text-gray-300 mb-2">Task Accuracy</h2>
          <div className="space-y-2">
            {results.task_results.map((r) => (
              <div key={`${r.task}-${r.scenario}`} className="flex justify-between text-xs">
                <span className="text-gray-400">{r.task} — Scenario {r.scenario}</span>
                <span className={r.detected ? 'text-green-400' : 'text-red-400'}>
                  {r.detected ? '✓ Detected' : '✗ Not detected'}
                  {r.accuracy !== null && ` (${(r.accuracy * 100).toFixed(0)}%)`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {results.ncf && (
          <div className="bg-gray-900 rounded border border-gray-700 p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">NCF Proxies</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-500">Working Memory Saturation</div>
              <div className="text-white">{results.ncf.working_memory_saturation?.toFixed(1) ?? '—'}</div>
              <div className="text-gray-500">Sigma Accuracy</div>
              <div className="text-white">{results.ncf.sigma_accuracy?.toFixed(3) ?? '—'}</div>
              <div className="text-gray-500">NCF at Frontier</div>
              <div className={results.ncf.ncf_at_frontier ? 'text-green-400' : 'text-yellow-400'}>
                {results.ncf.ncf_at_frontier === null ? '—' : results.ncf.ncf_at_frontier ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600">
          Full results will be shared when the experiment concludes. Thank you for your contribution to CAL research.
        </p>
      </div>
    </div>
  )
}

// ── LLM provenance seal (read-only — instrument constraint DT-035) ────────────

function LLMProvenanceSeal() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Instrument Seal</span>
        <span className="text-xs bg-green-900 text-green-300 px-1.5 py-0.5 rounded">φ GO</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">LLM Model</div>
          <div className="text-white font-mono">claude-sonnet-4-6</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Provider</div>
          <div className="text-white font-mono">Anthropic / OpenRouter</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">φ Gate (DT-021 v2)</div>
          <div className="text-white font-mono">2026-06-06 · ρ≥0.75 ✓</div>
        </div>
      </div>
      <p className="text-xs text-yellow-600 mt-2">
        Model is not configurable. Any change invalidates calibration and requires a full φ re-run.
      </p>
    </div>
  )
}

// ── Live sessions panel (auto-refresh every 30s) ──────────────────────────────

function LiveSessionsPanel() {
  const [rows, setRows] = useState<LiveSessionRow[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const refresh = useCallback(() => {
    adminListLiveSessions()
      .then((data) => { setRows(data); setLastRefresh(new Date()) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  const elapsed = (isoStr: string | null): string => {
    if (!isoStr) return '—'
    const ms = Date.now() - new Date(isoStr).getTime()
    const m = Math.floor(ms / 60_000)
    const s = Math.floor((ms % 60_000) / 1000)
    return `${m}m ${s}s`
  }

  const phaseLabel = (row: LiveSessionRow): string => {
    if (!row.current_phase) return '—'
    if (row.phase_updated_at) {
      const ago = Math.floor((Date.now() - new Date(row.phase_updated_at).getTime()) / 1000)
      return `${row.current_phase} (${ago}s ago)`
    }
    return row.current_phase
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-300">Sessions in progress</h2>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-600">
              refreshed {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button onClick={refresh} className="text-xs text-blue-400 underline">refresh</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded p-4 text-xs text-gray-600">
          No sessions currently in progress.
        </div>
      ) : (
        <div className="bg-gray-900 rounded border border-gray-700 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                {['Participant', 'Group', 'Phase', 'Elapsed', 'Pre-test', 'Tasks', 'TLX', 'NCF'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-gray-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.session_id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="px-3 py-2 text-gray-200">{r.participant_name}</td>
                  <td className={`px-3 py-2 font-semibold uppercase ${r.group === 'experimental' ? 'text-blue-400' : 'text-gray-300'}`}>
                    {r.group ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-300 font-mono">{phaseLabel(r)}</td>
                  <td className="px-3 py-2 text-gray-400 tabular-nums">{elapsed(r.started_at)}</td>
                  <td className={`px-3 py-2 ${r.pretest_done ? 'text-green-400' : 'text-gray-600'}`}>
                    {r.pretest_done ? '✓' : '○'}
                  </td>
                  <td className="px-3 py-2 text-gray-300 tabular-nums">{r.tasks_submitted}/4</td>
                  <td className="px-3 py-2 text-gray-300 tabular-nums">{r.tlx_submitted}/2</td>
                  <td className={`px-3 py-2 ${r.ncf_done ? 'text-green-400' : 'text-gray-600'}`}>
                    {r.ncf_done ? '✓' : '○'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Admin dashboard ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const { logout } = useAuth()
  const [participants, setParticipants] = useState<AdminParticipant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminListParticipants()
      .then(setParticipants)
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: participants.length,
    control: participants.filter((p) => p.group === 'control').length,
    experimental: participants.filter((p) => p.group === 'experimental').length,
    completed: participants.filter((p) => p.session_status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono text-sm p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold text-white">Admin Dashboard — CAL Experiment</h1>
          <button onClick={logout} className="text-xs text-gray-600 underline">Sign out</button>
        </div>

        <LLMProvenanceSeal />

        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-gray-900 rounded border border-gray-700 p-4">
              <div className="text-2xl font-bold text-white tabular-nums">{v}</div>
              <div className="text-xs text-gray-500 capitalize mt-0.5">{k}</div>
            </div>
          ))}
        </div>

        <LiveSessionsPanel />

        <h2 className="text-sm font-semibold text-gray-300 mb-2">All participants</h2>
        {loading ? (
          <p className="text-xs text-gray-500">Loading…</p>
        ) : (
          <div className="bg-gray-900 rounded border border-gray-700 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Name', 'Email', 'Exp.', 'Stratum', 'Group', 'AI Fam.', 'Consent', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-gray-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.participant_id} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-3 py-2 text-gray-200">{p.name}</td>
                    <td className="px-3 py-2 text-gray-400">{p.email}</td>
                    <td className="px-3 py-2 text-gray-300">{p.years_experience}y</td>
                    <td className="px-3 py-2 text-gray-400">{p.experience_stratum ?? '—'}</td>
                    <td className={`px-3 py-2 font-semibold uppercase ${p.group === 'experimental' ? 'text-blue-400' : 'text-gray-300'}`}>
                      {p.group ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-400">{p.ai_familiarity ?? '—'}/4</td>
                    <td className={`px-3 py-2 ${p.consent_given ? 'text-green-400' : 'text-yellow-400'}`}>
                      {p.consent_given ? '✓' : '✗'}
                    </td>
                    <td className={`px-3 py-2 ${p.session_status === 'completed' ? 'text-green-400' : 'text-gray-400'}`}>
                      {p.session_status ?? 'not invited'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root app ──────────────────────────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [view, setView] = useState<View>('login')
  const [me, setMe] = useState<MeResponse | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [results, setResults] = useState<ResultsResponse | null>(null)

  // Resolve view based on auth state after login
  useEffect(() => {
    if (!isAuthenticated) { setView('login'); return }
    getMe().then((data) => {
      setMe(data)
      setView(data.role === 'admin' ? 'admin' : 'dashboard')
    }).catch(() => setView('login'))
  }, [isAuthenticated])

  const handleStartSession = useCallback(async () => {
    if (!me?.current_session) return
    const { session_id } = await startSession({ session_id: me.current_session.id })
    setSessionId(session_id)
    setView('session')
  }, [me])

  const handleSessionComplete = useCallback(async () => {
    if (!sessionId) return
    const res = await getSessionResults(sessionId).catch(() => null)
    setResults(res)
    setView('results')
  }, [sessionId])

  // Re-login after completion: fetch results for the completed session
  // (the backend returns it as current_session with status 'completed').
  const handleViewResults = useCallback(async () => {
    if (!me?.current_session) return
    const res = await getSessionResults(me.current_session.id).catch(() => null)
    if (res) {
      setResults(res)
      setView('results')
    }
  }, [me])

  if (!isAuthenticated) {
    if (view === 'register') return <RegisterPage onBack={() => setView('login')} />
    return <LoginPage onRegister={() => setView('register')} />
  }

  if (view === 'admin') return <AdminDashboard />

  if (view === 'session' && sessionId && me?.group) {
    return (
      <TaskSequencer
        sessionId={sessionId}
        group={me.group}
        onComplete={handleSessionComplete}
      />
    )
  }

  if (view === 'results' && results && me?.group) {
    return <ResultsView results={results} group={me.group} />
  }

  if (me) {
    return (
      <ParticipantDashboard
        me={me}
        onStartSession={handleStartSession}
        onViewResults={handleViewResults}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
