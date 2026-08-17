import { useNavigate } from 'react-router-dom'
import { COMPANIES, getQuote, getSeries } from '../lib/market.js'
import { fmtMoney, fmtPct } from '../lib/format.js'
import { Sparkline } from '../components/charts.jsx'

export default function Market() {
  const navigate = useNavigate()
  const rows = COMPANIES.map((c) => ({
    c,
    q: getQuote(c.ticker),
    spark: getSeries(c.ticker).slice(-30).map((d) => d.close),
  }))

  return (
    <div>
      <h1>📊 Market</h1>
      <p className="subtitle">
        A simulated market of 12 fictional companies across sectors. Prices advance every real
        day, just like a real market — click any stock to analyze it and practice trading with
        virtual money.
      </p>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company</th>
              <th>Sector</th>
              <th className="num">Price</th>
              <th className="num">Today</th>
              <th>30 days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ c, q, spark }) => (
              <tr key={c.ticker} className="clickable" onClick={() => navigate(`/market/${c.ticker}`)}>
                <td><strong>{c.ticker}</strong></td>
                <td>
                  {c.name}
                  <div className="small muted">{c.profile}</div>
                </td>
                <td><span className="pill neutral">{c.sector}</span></td>
                <td className="num">{fmtMoney(q.price)}</td>
                <td className={'num ' + (q.changePct >= 0 ? 'up' : 'down')}>{fmtPct(q.changePct)}</td>
                <td>
                  <Sparkline values={spark} width={110} height={32}
                    color={spark[spark.length - 1] >= spark[0] ? 'var(--series-3)' : 'var(--series-8)'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
