import { Link } from 'react-router-dom'
import { MODULES, moduleProgress } from '../data/lessons.js'
import { COMPANIES, getQuote, getSeries } from '../lib/market.js'
import { portfolioSummary, useStore } from '../lib/store.jsx'
import { fmtMoney, fmtPct } from '../lib/format.js'
import { Sparkline } from '../components/charts.jsx'

export default function Dashboard() {
  const { state } = useStore()
  const summary = portfolioSummary(state)
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0)
  const doneLessons = Object.keys(state.completedLessons).length
  const pct = Math.round((doneLessons / totalLessons) * 100)

  // next lesson to continue with
  let nextLesson = null
  outer:
  for (const mod of MODULES) {
    for (const l of mod.lessons) {
      if (!state.completedLessons[l.id]) { nextLesson = { mod, l }; break outer }
    }
  }

  const movers = COMPANIES
    .map((c) => ({ c, q: getQuote(c.ticker) }))
    .sort((a, b) => Math.abs(b.q.changePct) - Math.abs(a.q.changePct))
    .slice(0, 4)

  return (
    <div>
      <h1>Welcome back 👋</h1>
      <p className="subtitle">
        Your path: learn a concept in the <Link to="/learn">Academy</Link>, then practice it
        immediately in the <Link to="/market">simulated market</Link> with virtual money.
        Nothing here is real-money financial advice — it is a safe training ground.
      </p>

      <div className="grid grid-3">
        <div className="card">
          <div className="stat-label">Learning progress</div>
          <div className="stat-value">{doneLessons} / {totalLessons} lessons</div>
          <div style={{ margin: '10px 0' }} className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {nextLesson ? (
            <Link to={`/learn/${nextLesson.mod.id}/${nextLesson.l.id}`}>
              Continue: {nextLesson.l.title} →
            </Link>
          ) : (
            <span className="up">🎉 Curriculum complete!</span>
          )}
        </div>

        <div className="card">
          <div className="stat-label">Virtual portfolio value</div>
          <div className="stat-value">{fmtMoney(summary.total)}</div>
          <div className={'stat-delta ' + (summary.totalGain >= 0 ? 'up' : 'down')}>
            {fmtMoney(summary.totalGain)} ({fmtPct(summary.totalGainPct)}) all time
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            {summary.positions.length === 0
              ? <>You hold only cash. <Link to="/market">Make your first practice trade →</Link></>
              : <Link to="/portfolio">View portfolio →</Link>}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Cash available</div>
          <div className="stat-value">{fmtMoney(summary.cash)}</div>
          <div className="small muted" style={{ marginTop: 6 }}>
            Everyone starts with $10,000 in practice money.
          </div>
        </div>
      </div>

      <h2>Your learning path</h2>
      <div className="grid grid-2">
        {MODULES.map((mod, i) => {
          const p = moduleProgress(mod, state.completedLessons)
          const quiz = state.quizScores[mod.id]
          return (
            <Link key={mod.id} to={`/learn/${mod.id}/${mod.lessons[0].id}`}
              className="card" style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="row spread">
                <div style={{ fontWeight: 600 }}>{mod.emoji} {i + 1}. {mod.title}</div>
                <span className="pill neutral">{mod.level}</span>
              </div>
              <p className="small secondary" style={{ margin: '8px 0' }}>{mod.description}</p>
              <div className="row spread">
                <div className="progress-track" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="small muted">{p.done}/{p.total}</span>
                {quiz != null && (
                  <span className={'pill ' + (quiz >= 80 ? 'good-bg' : 'neutral')}>quiz {quiz}%</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <h2>Today's biggest movers (simulated market)</h2>
      <div className="grid grid-4">
        {movers.map(({ c, q }) => {
          const closes = getSeries(c.ticker).slice(-30).map((d) => d.close)
          return (
            <Link key={c.ticker} to={`/market/${c.ticker}`}
              className="card" style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="row spread">
                <strong>{c.ticker}</strong>
                <span className={'small ' + (q.changePct >= 0 ? 'up' : 'down')}>
                  {fmtPct(q.changePct)}
                </span>
              </div>
              <div className="small muted" style={{ marginBottom: 6 }}>{c.name}</div>
              <Sparkline values={closes} color={q.changePct >= 0 ? 'var(--series-3)' : 'var(--series-8)'} />
              <div style={{ marginTop: 6, fontWeight: 600 }}>{fmtMoney(q.price)}</div>
            </Link>
          )
        })}
      </div>

      <div className="notice" style={{ marginTop: 24 }}>
        ⚠️ Educational simulator. All companies and prices here are fictional and generated for
        practice. Nothing in this app is financial advice — when you move to real money, start
        small, use a regulated broker, and re-read the Risk Management module first.
      </div>
    </div>
  )
}
