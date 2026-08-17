import { Link, useNavigate } from 'react-router-dom'
import { getCompany } from '../lib/market.js'
import { portfolioSummary, STARTING_CASH, useStore } from '../lib/store.jsx'
import { fmtMoney, fmtPct } from '../lib/format.js'
import { AllocationBars } from '../components/charts.jsx'

const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)',
  'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)']

function diversificationFeedback(positions, total) {
  const notes = []
  if (positions.length === 0) return notes
  const sectors = new Map()
  for (const p of positions) {
    const sector = getCompany(p.ticker)?.sector ?? 'Other'
    sectors.set(sector, (sectors.get(sector) ?? 0) + p.value)
  }
  const biggest = positions[0]
  if (biggest.value / total > 0.25) {
    notes.push({ warn: true, text: `${biggest.ticker} is ${((biggest.value / total) * 100).toFixed(0)}% of your portfolio — well above the ~10% beginner guideline. One bad earnings report would hit you hard.` })
  } else if (biggest.value / total > 0.12) {
    notes.push({ warn: true, text: `${biggest.ticker} is ${((biggest.value / total) * 100).toFixed(0)}% of your portfolio — slightly concentrated. Consider trimming or diversifying further.` })
  }
  for (const [sector, value] of sectors) {
    if (value / total > 0.4) {
      notes.push({ warn: true, text: `${((value / total) * 100).toFixed(0)}% of your holdings are in ${sector} — sector concentration means those stocks will likely fall together.` })
    }
  }
  if (positions.length < 5 && positions.length > 0) {
    notes.push({ warn: false, text: `You hold ${positions.length} stock${positions.length > 1 ? 's' : ''}. The Risk module suggests 10–20 across different sectors for real diversification.` })
  }
  if (notes.length === 0) {
    notes.push({ warn: false, text: 'No concentration flags — position and sector sizes look reasonably balanced. 👍' })
  }
  return notes
}

export default function Portfolio() {
  const { state, resetPortfolio } = useStore()
  const navigate = useNavigate()
  const s = portfolioSummary(state)
  const notes = diversificationFeedback(s.positions, s.total)

  const allocItems = [
    ...s.positions.map((p, i) => ({ label: p.ticker, value: p.value, color: SERIES[i % SERIES.length] })),
    { label: 'Cash', value: s.cash, color: 'var(--baseline)' },
  ]

  const sectorMap = new Map()
  for (const p of s.positions) {
    const sec = getCompany(p.ticker)?.sector ?? 'Other'
    sectorMap.set(sec, (sectorMap.get(sec) ?? 0) + p.value)
  }
  const sectorItems = [...sectorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: SERIES[i % SERIES.length] }))

  return (
    <div>
      <h1>💼 Your practice portfolio</h1>
      <p className="subtitle">
        Track your virtual positions exactly like a real brokerage would — and get the
        diversification feedback a good advisor should give you.
      </p>

      <div className="grid grid-4">
        <div className="card">
          <div className="stat-label">Total value</div>
          <div className="stat-value">{fmtMoney(s.total)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Total gain / loss</div>
          <div className={'stat-value ' + (s.totalGain >= 0 ? 'up' : 'down')}>{fmtPct(s.totalGainPct)}</div>
          <div className={'stat-delta ' + (s.totalGain >= 0 ? 'up' : 'down')}>{fmtMoney(s.totalGain)} vs. {fmtMoney(STARTING_CASH, 0)} start</div>
        </div>
        <div className="card">
          <div className="stat-label">Invested</div>
          <div className="stat-value">{fmtMoney(s.marketValue)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Cash</div>
          <div className="stat-value">{fmtMoney(s.cash)}</div>
        </div>
      </div>

      {s.positions.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ margin: 0 }}>
            No positions yet. Head to the <Link to="/market">Market</Link>, analyze a stock with
            what you learned in the <Link to="/learn">Academy</Link>, and make your first practice trade.
          </p>
        </div>
      ) : (
        <>
          <div className="card table-wrap" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Positions</h3>
            <table>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th className="num">Shares</th>
                  <th className="num">Avg cost</th>
                  <th className="num">Price</th>
                  <th className="num">Value</th>
                  <th className="num">Gain/Loss</th>
                  <th className="num">Today</th>
                </tr>
              </thead>
              <tbody>
                {s.positions.map((p) => (
                  <tr key={p.ticker} className="clickable" onClick={() => navigate(`/market/${p.ticker}`)}>
                    <td><strong>{p.ticker}</strong> <span className="small muted">{getCompany(p.ticker)?.name}</span></td>
                    <td className="num">{p.shares}</td>
                    <td className="num">{fmtMoney(p.avgCost)}</td>
                    <td className="num">{fmtMoney(p.price)}</td>
                    <td className="num">{fmtMoney(p.value)}</td>
                    <td className={'num ' + (p.gain >= 0 ? 'up' : 'down')}>
                      {fmtMoney(p.gain)} ({fmtPct(p.gainPct)})
                    </td>
                    <td className={'num ' + (p.dayChangePct >= 0 ? 'up' : 'down')}>{fmtPct(p.dayChangePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Allocation by position</h3>
              <AllocationBars items={allocItems} formatValue={(v) => fmtMoney(v, 0)} />
            </div>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Allocation by sector</h3>
              <AllocationBars items={sectorItems} formatValue={(v) => fmtMoney(v, 0)} />
              <hr className="divider" />
              <h3 style={{ marginTop: 0 }}>🛡️ Diversification check</h3>
              {notes.map((note, i) => (
                <p key={i} className={'small ' + (note.warn ? 'down' : 'secondary')} style={{ marginBottom: 8 }}>
                  {note.warn ? '⚠️ ' : '✔️ '}{note.text}
                </p>
              ))}
            </div>
          </div>
        </>
      )}

      {state.transactions.length > 0 && (
        <div className="card table-wrap" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Transaction history</h3>
          <table>
            <thead>
              <tr><th>When</th><th>Type</th><th>Ticker</th><th className="num">Shares</th><th className="num">Price</th><th className="num">Total</th></tr>
            </thead>
            <tbody>
              {state.transactions.map((t, i) => (
                <tr key={i}>
                  <td className="small">{new Date(t.at).toLocaleString()}</td>
                  <td><span className={'pill ' + (t.type === 'BUY' ? 'good-bg' : 'crit-bg')}>{t.type}</span></td>
                  <td><strong>{t.ticker}</strong></td>
                  <td className="num">{t.shares}</td>
                  <td className="num">{fmtMoney(t.price)}</td>
                  <td className="num">{fmtMoney(t.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row" style={{ marginTop: 20 }}>
        <button className="danger-outline"
          onClick={() => {
            if (window.confirm('Reset your practice portfolio to $10,000 cash? Learning progress is kept.')) {
              resetPortfolio()
            }
          }}>
          Reset portfolio to $10,000
        </button>
      </div>
    </div>
  )
}
