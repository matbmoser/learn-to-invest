// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Mathias Brunkow Moser
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// This file was generated with AI assistance (Claude Code, Anthropic).

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCompany, getFundamentals, getQuote, getSeries, healthScore } from '../lib/market.js'
import { adx, annualizedVol, atr, macd, maxDrawdown, obv, rsi, sma } from '../lib/indicators.js'
import { portfolioSummary, useStore } from '../lib/store.jsx'
import { fmtBillions, fmtMoney, fmtNum, fmtPct } from '../lib/format.js'
import { Meter } from '../components/charts.jsx'
import StockChart from '../components/StockChart.jsx'
import {
  IconClipboard, IconCompass, IconMentor, IconPulse, IconTrade, IconWarning,
} from '../components/icons.jsx'

function TradePanel({ ticker }) {
  const { state, buy, sell } = useStore()
  const [shares, setShares] = useState('')
  const [msg, setMsg] = useState(null)
  const q = getQuote(ticker)
  const held = state.holdings[ticker]
  const n = Math.floor(Number(shares))
  const cost = n > 0 ? n * q.price : 0
  const summary = portfolioSummary(state)
  const positionPctAfter = summary.total > 0
    ? (((held ? held.shares * q.price : 0) + cost) / summary.total) * 100
    : 0

  function act(kind) {
    const res = kind === 'buy' ? buy(ticker, n) : sell(ticker, n)
    setMsg(res.ok
      ? { ok: true, text: `${kind === 'buy' ? 'Bought' : 'Sold'} ${n} share${n > 1 ? 's' : ''} of ${ticker} at ${fmtMoney(q.price)}.` }
      : { ok: false, text: res.error })
    if (res.ok) setShares('')
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}><IconTrade size={17} /> Practice trade</h3>
      <div className="small secondary" style={{ marginBottom: 10 }}>
        Cash: <strong>{fmtMoney(state.cash)}</strong>
        {held && <> · You own <strong>{held.shares}</strong> shares (avg {fmtMoney(held.costBasis / held.shares)})</>}
      </div>
      <div className="field">
        <label>Number of shares</label>
        <input type="number" min="1" step="1" value={shares}
          onChange={(e) => setShares(e.target.value)} placeholder="e.g. 10"
          style={{ width: '100%' }} />
      </div>
      {n > 0 && (
        <div className="small secondary" style={{ marginBottom: 10 }}>
          Order value: <strong>{fmtMoney(cost)}</strong>
          {n > 0 && positionPctAfter > 10 && (
            <div className="down" style={{ marginTop: 4 }}>
              <IconWarning size={13} /> After buying, this position would be {positionPctAfter.toFixed(0)}% of your
              portfolio — above the ~10% beginner guideline from the Risk module.
            </div>
          )}
        </div>
      )}
      <div className="row">
        <button className="primary" disabled={!(n > 0) || cost > state.cash} onClick={() => act('buy')}>
          Buy
        </button>
        <button className="danger-outline" disabled={!(n > 0) || !held || n > (held?.shares ?? 0)}
          onClick={() => act('sell')}>
          Sell
        </button>
      </div>
      {msg && (
        <p className={'small ' + (msg.ok ? 'up' : 'down')} style={{ marginBottom: 0 }}>{msg.text}</p>
      )}
    </div>
  )
}

function SignalCard({ candles }) {
  const closes = candles.map((d) => d.close)
  // Educational read of current indicators — with honest framing
  const s20 = sma(closes, 20)
  const s50 = sma(closes, 50)
  const s200 = sma(closes, 200)
  const r = rsi(closes, 14)
  const m = macd(closes)
  const i = closes.length - 1
  const price = closes[i]

  const signals = []
  if (s200[i] != null) {
    const above = price > s200[i]
    signals.push({
      label: 'Long-term trend (price vs 200-day SMA)',
      state: above ? 'bullish' : 'bearish',
      text: above
        ? 'Price is above the 200-day average — broadly considered a healthy long-term uptrend.'
        : 'Price is below the 200-day average — the long-term trend is down; extra caution warranted.',
    })
  }
  if (s20[i] != null && s50[i] != null) {
    const above = s20[i] > s50[i]
    signals.push({
      label: 'Medium-term trend (SMA 20 vs SMA 50)',
      state: above ? 'bullish' : 'bearish',
      text: above
        ? 'The fast average is above the slow one — recent momentum is positive.'
        : 'The fast average is below the slow one — recent momentum is negative.',
    })
  }
  if (r[i] != null) {
    const v = r[i]
    signals.push({
      label: `RSI (14) = ${v.toFixed(0)}`,
      state: v > 70 ? 'stretched' : v < 30 ? 'washed-out' : 'neutral',
      text: v > 70
        ? 'Overbought — the rally is stretched; chasing here carries extra risk.'
        : v < 30
          ? 'Oversold — selling has been extreme. Worth investigating, not auto-buying.'
          : 'In the neutral zone — momentum is neither stretched nor washed out.',
    })
  }
  if (m.macdLine[i] != null && m.signal[i] != null) {
    const bull = m.macdLine[i] > m.signal[i]
    signals.push({
      label: 'MACD vs signal line',
      state: bull ? 'bullish' : 'bearish',
      text: bull ? 'MACD is above its signal line — momentum currently turning up.'
                 : 'MACD is below its signal line — momentum currently turning down.',
    })
  }

  // Regime: which toolkit even applies here?
  const a = adx(candles)
  if (a.adx[i] != null) {
    const v = a.adx[i]
    const trending = v >= 25
    signals.push({
      label: `Trend strength (ADX ${v.toFixed(0)})`,
      state: !trending ? 'range' : a.plusDI[i] > a.minusDI[i] ? 'bullish' : 'bearish',
      text: trending
        ? `A genuine trend is in place, favouring ${a.plusDI[i] > a.minusDI[i] ? 'buyers' : 'sellers'} — trend-following tools apply here.`
        : 'Below 25, so there is no real trend. Moving-average crossovers will whipsaw; range tactics fit better.',
    })
  }

  // Volatility, expressed as the thing you actually use it for.
  const at = atr(candles)
  if (at[i] != null) {
    signals.push({
      label: `Normal daily range (ATR ${at[i].toFixed(2)})`,
      state: 'neutral',
      text: `A typical day moves about ${((at[i] / price) * 100).toFixed(1)}% . A 2× ATR stop would sit roughly ${(at[i] * 2).toFixed(2)} from your entry — closer than that and ordinary noise takes you out.`,
    })
  }

  // Is volume confirming the move?
  const o = obv(candles)
  const back = Math.min(20, o.length - 1)
  if (o[i] != null && o[i - back] != null) {
    const obvUp = o[i] > o[i - back]
    const priceUp = closes[i] > closes[i - back]
    signals.push({
      label: 'Volume confirmation (OBV, 20 days)',
      state: obvUp === priceUp ? (priceUp ? 'bullish' : 'bearish') : 'divergence',
      text: obvUp === priceUp
        ? `Price and on-balance volume are both ${priceUp ? 'rising' : 'falling'} — volume is confirming the move.`
        : `Price is ${priceUp ? 'rising' : 'falling'} while on-balance volume is ${obvUp ? 'rising' : 'falling'} — a divergence worth treating carefully.`,
    })
  }

  const pillFor = (state) =>
    state === 'bullish' ? 'good-bg' : state === 'bearish' ? 'crit-bg' :
    state === 'stretched' || state === 'washed-out' || state === 'divergence' || state === 'range'
      ? 'warn-bg' : 'neutral'

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}><IconCompass size={17} /> Indicator read (educational)</h3>
      {signals.map((s) => (
        <div key={s.label} style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 8 }}>
            <span className={'pill ' + pillFor(s.state)}>{s.state}</span>
            <strong className="small">{s.label}</strong>
          </div>
          <div className="small secondary" style={{ marginTop: 3 }}>{s.text}</div>
        </div>
      ))}
      <p className="small muted" style={{ marginBottom: 0 }}>
        Remember from the <Link to="/learn/technical/buy-sell-signals">Academy</Link>: indicators
        describe probabilities, not certainties. Look for several agreeing (confluence) and always
        pre-define your exit. See every indicator drawn and explained in the{' '}
        <Link to="/indicators">Indicator reference</Link>.
      </p>
    </div>
  )
}

function Fundamentals({ ticker }) {
  const f = getFundamentals(ticker)
  const h = healthScore(f)
  if (!f) {
    return (
      <div className="notice" style={{ marginTop: 16 }}>
        <IconClipboard size={15} /> Curated fundamentals and the financial health score are a feature of the{' '}
        <strong>simulated market</strong>, where the numbers are designed as teaching material.
        For this real stock, look up its financials on your broker or a site like the company's
        investor-relations page — and practice applying the{' '}
        <Link to="/learn/fundamental/stock-checklist">analysis checklist</Link> to them.
      </div>
    )
  }
  const rows = [
    ['Market cap', fmtBillions(f.marketCap), 'Price × all shares: the whole company\'s price tag.'],
    ['Revenue (yearly)', fmtBillions(f.revenue), 'Total sales — the top line.'],
    ['Revenue growth', fmtPct(f.revenueGrowth, 1), 'How fast sales grew vs last year.'],
    ['Net margin', fmtPct(f.netMargin, 1, false), 'Profit kept from each $1 of sales.'],
    ['EPS', fmtMoney(f.eps), 'Earnings per share — profit ÷ share count.'],
    ['P/E ratio', f.peRatio ? fmtNum(f.peRatio, 1) : '— (unprofitable)', 'Dollars paid per $1 of annual profit.'],
    ['P/S ratio', fmtNum(f.psRatio, 1), 'Market cap ÷ revenue — useful when there are no profits.'],
    ['Debt / Equity', fmtNum(f.debtToEquity, 2), 'Leverage: how much debt per $1 of shareholder money.'],
    ['Current ratio', fmtNum(f.currentRatio, 1), 'Can it pay this year\'s bills? >1.5 is comfortable.'],
    ['ROE', fmtPct(f.roe, 1, false), 'How hard shareholder money works.'],
    ['FCF margin', fmtPct(f.fcfMargin, 1, false), 'Real cash generated from each $1 of sales.'],
    ['Dividend yield', fmtPct(f.dividendYield, 1, false), 'Annual cash payout as % of the price.'],
  ]
  return (
    <div className="grid grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
      <div className="card table-wrap">
        <h3 style={{ marginTop: 0 }}><IconClipboard size={17} /> Fundamentals</h3>
        <table>
          <tbody>
            {rows.map(([k, v, help]) => (
              <tr key={k}>
                <td>
                  <strong>{k}</strong>
                  <div className="small muted">{help}</div>
                </td>
                <td className="num" style={{ verticalAlign: 'middle', fontWeight: 600 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}><IconPulse size={17} /> Financial health score</h3>
        <div className="row" style={{ marginBottom: 6 }}>
          <span className="stat-value">{h.total}/100</span>
        </div>
        <Meter value={h.total} />
        <hr className="divider" />
        {h.parts.map((p) => (
          <div key={p.label} style={{ marginBottom: 12 }}>
            <div className="row spread small">
              <strong>{p.label}</strong>
              <span className="muted">{Math.round(p.score)}/{p.max}</span>
            </div>
            <Meter value={p.score} max={p.max} />
            <div className="small secondary" style={{ marginTop: 3 }}>{p.note}</div>
          </div>
        ))}
        <p className="small muted" style={{ marginBottom: 0 }}>
          A teaching aid, not a verdict — the <Link to="/learn/fundamental/stock-checklist">full
          checklist</Link> covers what no score can (moat, management, price paid).
        </p>
      </div>
    </div>
  )
}

export default function StockDetail() {
  const { ticker } = useParams()
  const { dataVersion } = useStore()
  const c = getCompany(ticker)

  const full = useMemo(() => getSeries(ticker), [ticker, dataVersion])
  const q = getQuote(ticker)
  if (!c || full.length < 2 || !q) {
    return (
      <p>
        No price data for "{ticker}" in the current market mode.{' '}
        <Link to="/market">Back to Market</Link>
      </p>
    )
  }
  const fullCloses = full.map((d) => d.close)

  const vol = annualizedVol(fullCloses.slice(-252))
  const dd = maxDrawdown(fullCloses.slice(-252))
  const yearAgo = fullCloses[Math.max(0, fullCloses.length - 253)]
  const yearPerf = ((q.price - yearAgo) / yearAgo) * 100

  return (
    <div>
      <p className="small muted" style={{ marginBottom: 4 }}>
        <Link to="/market">Market</Link> · {c.sector}
      </p>
      <div className="row spread">
        <div>
          <h1 style={{ marginBottom: 0 }}>{c.ticker} <span style={{ fontWeight: 400 }}>· {c.name}</span></h1>
          <p className="secondary" style={{ margin: '4px 0 0' }}>{c.profile}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stat-value">{fmtMoney(q.price)}</div>
          <div className={'stat-delta ' + (q.changePct >= 0 ? 'up' : 'down')}>
            {fmtMoney(q.change)} ({fmtPct(q.changePct)}) today
          </div>
          <Link to={`/mentor?stock=${ticker}`}>
            <button style={{ marginTop: 10 }}><IconMentor size={15} /> Ask the analyst about {ticker}</button>
          </Link>
        </div>
      </div>

      <div className="grid grid-3" style={{ margin: '16px 0' }}>
        <div className="card">
          <div className="stat-label">1-year performance</div>
          <div className={'stat-value ' + (yearPerf >= 0 ? 'up' : 'down')} style={{ fontSize: 20 }}>
            {fmtPct(yearPerf, 1)}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Volatility (annualized)</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{(vol * 100).toFixed(0)}%</div>
          <div className="small muted">{vol > 0.35 ? 'High — size positions smaller' : vol > 0.22 ? 'Moderate' : 'Relatively calm'}</div>
        </div>
        <div className="card">
          <div className="stat-label">Max drawdown (1Y)</div>
          <div className="stat-value down" style={{ fontSize: 20 }}>-{(dd * 100).toFixed(0)}%</div>
          <div className="small muted">Worst peak-to-trough fall this year</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Price chart</h3>
        <StockChart series={full} ticker={ticker} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <SignalCard candles={full} />
        <TradePanel ticker={ticker} />
      </div>

      <Fundamentals ticker={ticker} />
    </div>
  )
}
