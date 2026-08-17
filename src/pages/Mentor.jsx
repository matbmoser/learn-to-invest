import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Markdown from '../components/markdown.jsx'
import { askMentor, buildContext, MENTOR_MODELS, suggestedPrompts } from '../lib/mentor.js'
import { getCompany } from '../lib/market.js'
import { portfolioSummary, useStore } from '../lib/store.jsx'

export default function Mentor() {
  const { state, updateSettings, setMentorHistory } = useStore()
  const [params, setParams] = useSearchParams()
  const focusTicker = params.get('stock') || ''

  const [input, setInput] = useState(params.get('q') || '')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const endRef = useRef(null)

  const summary = portfolioSummary(state)
  const history = state.mentorHistory || []
  const apiKey = state.settings.anthropicKey
  const model = state.settings.mentorModel || MENTOR_MODELS[0].id

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history.length, streaming])

  async function send(question) {
    const text = (question ?? input).trim()
    if (!text || busy || !apiKey) return

    setError(null)
    setInput('')
    const nextHistory = [...history, { role: 'user', content: text }]
    setMentorHistory(nextHistory)
    setBusy(true)
    setStreaming('')

    const controller = new AbortController()
    abortRef.current = controller
    let acc = ''

    const res = await askMentor({
      apiKey,
      model,
      history: nextHistory,
      context: buildContext(state, summary, focusTicker),
      onText: (delta) => {
        acc += delta
        setStreaming(acc)
      },
      signal: controller.signal,
    })

    abortRef.current = null
    setBusy(false)
    setStreaming('')

    if (res.ok) {
      setMentorHistory([...nextHistory, { role: 'assistant', content: res.text }])
    } else if (res.aborted) {
      if (acc.trim()) setMentorHistory([...nextHistory, { role: 'assistant', content: acc + '\n\n_(stopped)_' }])
      else setMentorHistory(history)
    } else {
      setMentorHistory(history)
      setInput(text)
      setError(res.error)
    }
  }

  const company = focusTicker ? getCompany(focusTicker) : null
  const prompts = suggestedPrompts(state, summary, focusTicker)

  if (!apiKey) {
    return (
      <div>
        <h1>🎓 Ask a senior analyst</h1>
        <p className="subtitle">
          Chat with an AI mentor that plays the role of a senior investment analyst — it can
          explain any concept, walk you through analyzing a company, review your practice
          portfolio, and quiz you.
        </p>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add a Claude API key to enable the mentor</h3>
          <p className="small secondary">
            The mentor runs on Anthropic's Claude models. It needs your own API key, which is
            stored only in this browser. Setup takes a couple of minutes:
          </p>
          <ol className="small secondary" style={{ paddingLeft: 20 }}>
            <li>Create an account at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> and add a small amount of credit.</li>
            <li>Create an API key (it starts with <code>sk-ant-</code>).</li>
            <li>Paste it into <Link to="/settings">Settings</Link>.</li>
          </ol>
          <Link to="/settings"><button className="primary">Go to Settings →</button></Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row spread">
        <div>
          <h1 style={{ marginBottom: 4 }}>🎓 Ask a senior analyst</h1>
          <p className="small secondary" style={{ margin: 0 }}>
            {company
              ? <>Focused on <strong>{company.ticker} — {company.name}</strong>. The mentor can see its
                  price, chart indicators, and fundamentals.{' '}
                  <a href="#/mentor" onClick={() => setParams({})}>Clear focus</a></>
              : <>The mentor can see your portfolio, the market, and your course progress.</>}
          </p>
        </div>
        <div className="row">
          <select value={model}
            onChange={(e) => updateSettings({ mentorModel: e.target.value })}
            aria-label="Mentor model">
            {MENTOR_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {history.length > 0 && (
            <button onClick={() => { setMentorHistory([]); setError(null) }}>New chat</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, minHeight: 320 }}>
        {history.length === 0 && !streaming && (
          <div>
            <p className="secondary" style={{ marginTop: 0 }}>
              Ask anything — from "what is a stock?" to "walk me through valuing this company".
              Good places to start:
            </p>
            <div className="toggle-row">
              {prompts.map((p) => (
                <button key={p} className="toggle-chip" onClick={() => send(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <div className="small" style={{ fontWeight: 600, marginBottom: 4, color: m.role === 'user' ? 'var(--text-secondary)' : 'var(--accent)' }}>
              {m.role === 'user' ? 'You' : 'Analyst'}
            </div>
            <div style={m.role === 'user'
              ? { background: 'var(--accent-wash)', borderRadius: 10, padding: '10px 14px', whiteSpace: 'pre-wrap' }
              : undefined}>
              {m.role === 'user' ? m.content : <Markdown text={m.content} />}
            </div>
          </div>
        ))}

        {streaming && (
          <div style={{ marginBottom: 18 }}>
            <div className="small" style={{ fontWeight: 600, marginBottom: 4, color: 'var(--accent)' }}>Analyst</div>
            <Markdown text={streaming} />
          </div>
        )}

        {busy && !streaming && <p className="small muted">Thinking…</p>}
        {error && <p className="small down">⚠️ {error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="row"
        style={{ marginTop: 12, alignItems: 'flex-start' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={company ? `Ask about ${company.ticker}, or anything else…` : 'Ask your analyst a question…'}
          style={{ flex: 1, minWidth: 220 }}
          disabled={busy}
        />
        {busy ? (
          <button type="button" onClick={() => abortRef.current?.abort()}>Stop</button>
        ) : (
          <button type="submit" className="primary" disabled={!input.trim()}>Ask</button>
        )}
      </form>

      <div className="notice" style={{ marginTop: 14 }}>
        ⚠️ The mentor is a teaching tool, not a financial adviser. It explains how analysts think
        and what the evidence shows — it will not tell you what to buy with real money, and it can
        be wrong. Verify anything that matters before acting on it.
      </div>
    </div>
  )
}
