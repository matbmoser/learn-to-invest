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

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CandlestickSeries, CrosshairMode, LineStyle, createChart, createSeriesMarkers,
} from 'lightweight-charts'
import {
  HORIZONS, SIGNALS, SIGNAL_GROUPS, backtest, chartPatterns, getSignal, verdict,
} from '../lib/patterns.js'
import { getCompanies, getSeries, isLiveMode } from '../lib/market.js'
import { useStore } from '../lib/store.jsx'
import {
  IconBulb, IconCompass, IconSearch, IconTrend, IconWarning,
} from '../components/icons.jsx'

const toDay = (d) => d.toISOString().slice(0, 10)
const pp = (v, digits = 2) => (v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(digits)}`)

const VERDICT_PILL = {
  positive: 'good-bg', negative: 'crit-bg',
  none: 'neutral', trivial: 'warn-bg', insufficient: 'warn-bg',
}
const VERDICT_LABEL = {
  positive: 'edge found (be sceptical)', negative: 'negative edge',
  none: 'no measurable edge', trivial: 'trivial edge', insufficient: 'too few samples',
}

// Candles with a marker on every bar where the selected signal fired.
function SignalChart({ candles, hits, patterns }) {
  const { state } = useStore()
  const theme = state.settings.theme || 'dark'
  const box = useRef(null)

  useEffect(() => {
    if (!box.current || !candles.length) return
    const cs = getComputedStyle(document.documentElement)
    const v = (n) => cs.getPropertyValue(n).trim()

    const chart = createChart(box.current, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' }, textColor: v('--text-muted'),
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 10, attributionLogo: false,
      },
      grid: { vertLines: { color: v('--grid') }, horzLines: { color: v('--grid') } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: v('--grid'), scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: { borderColor: v('--grid'), rightOffset: 2, fixLeftEdge: true, fixRightEdge: true },
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: v('--series-3'), downColor: v('--series-8'), borderVisible: false,
      wickUpColor: v('--series-3'), wickDownColor: v('--series-8'),
    })
    series.setData(candles.map((c) => ({
      time: toDay(c.date), open: c.open, high: c.high, low: c.low, close: c.close,
    })))

    if (hits.length) {
      createSeriesMarkers(series, hits.map((i) => ({
        time: toDay(candles[i].date),
        position: 'belowBar',
        color: v('--accent'),
        shape: 'arrowUp',
      })))
    }

    // Structural patterns are drawn as the level they hinge on.
    for (const p of patterns.slice(-4)) {
      series.createPriceLine({
        price: p.level,
        color: p.bias === 'bullish' ? v('--series-3') : v('--series-8'),
        lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: false, title: p.type,
      })
    }

    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [candles, hits, patterns, theme])

  return <div className="sc-pane sc-pane-price" ref={box} style={{ height: 320 }} />
}

export default function Patterns() {
  const { dataVersion } = useStore()
  const companies = getCompanies()
  const [ticker, setTicker] = useState(companies[0]?.ticker || '')
  const [signalId, setSignalId] = useState('rsi-oversold')
  const [scope, setScope] = useState('all')

  const signal = getSignal(signalId)

  const candles = useMemo(() => getSeries(ticker), [ticker, dataVersion])

  const seriesList = useMemo(() => (
    scope === 'all' ? companies.map((c) => getSeries(c.ticker)) : [candles]
  ), [scope, companies, candles, dataVersion])

  const result = useMemo(() => backtest(signal, seriesList), [signal, seriesList])
  const v = useMemo(() => verdict(result), [result])

  const hits = useMemo(() => {
    try { return signal.fires(candles) } catch { return [] }
  }, [signal, candles])

  const patterns = useMemo(() => {
    try { return chartPatterns(candles) } catch { return [] }
  }, [candles])

  const recent = patterns.slice(-5).reverse()

  return (
    <div>
      <h1><IconSearch size={24} /> Pattern lab</h1>
      <p className="subtitle">
        The honest way to answer "does this pattern predict anything?" — measure it. Pick a signal
        and this page finds every time it fired historically, then reports what actually happened
        over the next 1 to 60 days, compared against the baseline of every other day. The theory is
        in <Link to="/learn/prediction/base-rates">the Prediction module of the Academy</Link>.
      </p>

      <div className="notice" style={{ marginBottom: 18 }}>
        <IconWarning size={15} />
        <span>
          {isLiveMode()
            ? 'You are in live mode, so this runs on real market data — but a few years of one stock is still a small sample. Treat every result as a hypothesis, not a finding.'
            : 'The simulated market is a random walk with volatility regimes: by construction it contains no genuine predictive patterns. That makes it the perfect place to learn what "no edge" looks like — and to notice how easily a convincing-looking edge appears in pure noise.'}
        </span>
      </div>

      <div className="card ind-controls">
        <div className="row spread" style={{ marginBottom: 12 }}>
          <div className="row">
            <label htmlFor="pl-signal" style={{ margin: 0 }}>Signal</label>
            <select id="pl-signal" value={signalId} onChange={(e) => setSignalId(e.target.value)}
              style={{ minWidth: 300 }}>
              {SIGNAL_GROUPS.map((g) => (
                <optgroup key={g.id} label={g.name}>
                  {SIGNALS.filter((s) => s.group === g.id).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="row">
            <label htmlFor="pl-ticker" style={{ margin: 0 }}>Chart</label>
            <select id="pl-ticker" value={ticker} onChange={(e) => setTicker(e.target.value)}>
              {companies.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker}</option>)}
            </select>
          </div>
        </div>
        <div className="row spread">
          <div className="range-tabs">
            <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>
              All {companies.length} stocks
            </button>
            <button className={scope === 'one' ? 'active' : ''} onClick={() => setScope('one')}>
              {ticker} only
            </button>
          </div>
          <span className="small muted">
            {result.occurrences.toLocaleString()} occurrences tested
          </span>
        </div>
      </div>

      <div className="card">
        <div className="row spread" style={{ alignItems: 'flex-start' }}>
          <h3 style={{ margin: 0 }}>{signal.name}</h3>
          <span className={'pill ' + VERDICT_PILL[v.level]}>{VERDICT_LABEL[v.level]}</span>
        </div>

        <div className="ind-grid" style={{ margin: '14px 0' }}>
          <div>
            <div className="ind-h"><IconBulb size={13} /> The claim</div>
            <p className="small secondary" style={{ margin: 0 }}>{signal.idea}</p>
          </div>
          <div>
            <div className="ind-h"><IconWarning size={13} /> The catch</div>
            <p className="small secondary" style={{ margin: 0 }}>{signal.caution}</p>
          </div>
        </div>

        <div className={'callout' + (v.level === 'positive' ? '' : ' warn')}>
          <div className="callout-title">
            <IconCompass size={15} /> What the data actually says
          </div>
          <div className="small">{v.text}</div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Horizon</th>
                <th className="num">Occurrences</th>
                <th className="num">Win rate</th>
                <th className="num">Baseline win</th>
                <th className="num">Avg return</th>
                <th className="num">Baseline avg</th>
                <th className="num">Edge</th>
                <th className="num">t</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.horizon}>
                  <td><strong>{r.horizon} day{r.horizon > 1 ? 's' : ''}</strong></td>
                  <td className="num">{r.signal ? r.signal.n.toLocaleString() : '—'}</td>
                  <td className="num">{r.signal ? `${r.signal.winRate.toFixed(1)}%` : '—'}</td>
                  <td className="num muted">{r.baseline ? `${r.baseline.winRate.toFixed(1)}%` : '—'}</td>
                  <td className="num">{r.signal ? `${pp(r.signal.mean)}%` : '—'}</td>
                  <td className="num muted">{r.baseline ? `${pp(r.baseline.mean)}%` : '—'}</td>
                  <td className={'num ' + (r.edge > 0 ? 'up' : r.edge < 0 ? 'down' : '')}>
                    {r.edge != null ? `${pp(r.edge)} pp` : '—'}
                  </td>
                  <td className={'num ' + (r.t != null && Math.abs(r.t) > 2 ? '' : 'muted')}>
                    {r.t != null ? r.t.toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="small muted" style={{ marginTop: 10 }}>
          <strong>Edge</strong> is the signal's average forward return minus the baseline's, in
          percentage points. <strong>t</strong> above 2 means the difference is larger than chance
          would usually produce — necessary, but nowhere near sufficient.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>
          <IconTrend size={17} /> Where it fired on {ticker}
        </h3>
        <p className="small secondary">
          {hits.length
            ? `${hits.length} occurrences marked below. Look at how many were followed by a rise and how many by a fall — that visual scan is the same thing the table measures, just less reliably.${patterns.length ? ' The dashed levels are the structural patterns listed further down, not the signal.' : ''}`
            : 'This signal never fired on this stock. That itself is information: a signal that almost never triggers cannot be the basis of a strategy.'}
        </p>
        <SignalChart candles={candles} hits={hits} patterns={patterns} />
      </div>

      {recent.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}><IconSearch size={17} /> Structural patterns detected on {ticker}</h3>
          <p className="small secondary">
            Double tops, double bottoms and head-and-shoulders found mechanically from pivot highs
            and lows. They are drawn as dashed levels on the chart above. Detecting them is easy;
            the hard part — and the part most books skip — is that finding them in hindsight tells
            you nothing about whether they worked.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pattern</th><th>Bias</th><th>Formed</th><th className="num">Key level</th></tr>
              </thead>
              <tbody>
                {recent.map((p, i) => (
                  <tr key={i}>
                    <td>{p.type}</td>
                    <td>
                      <span className={'pill ' + (p.bias === 'bullish' ? 'good-bg' : 'crit-bg')}>
                        {p.bias}
                      </span>
                    </td>
                    <td className="small muted">
                      {candles[p.from].date.toISOString().slice(0, 10)} → {candles[p.to].date.toISOString().slice(0, 10)}
                    </td>
                    <td className="num">{p.level.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
