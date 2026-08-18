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

// The research dashboard: one company under the microscope at a time, with
// every analysis panel following the selection — while the comparison chart
// is SHARED and persistent: companies you pin stay drawn on it as you switch
// research targets, so side-by-side context survives the whole session.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CrosshairMode, LineSeries, LineStyle, createChart } from 'lightweight-charts'
import { getIndicator } from '../data/indicatorGuide.js'
import { annualizedVol, maxDrawdown } from '../lib/indicators.js'
import { getCompanies, getFundamentals, getQuote, getSeries, healthScore, isLiveMode } from '../lib/market.js'
import AnalystDock from '../components/AnalystDock.jsx'
import { realSummary } from '../lib/realportfolio.js'
import { useStore } from '../lib/store.jsx'
import {
  IconBulb, IconClipboard, IconMentor, IconPulse, IconSearch, IconTag, IconX,
} from '../components/icons.jsx'

const RANGES = { '3M': 63, '6M': 126, '1Y': 252, All: Infinity }
const READ_IDS = ['sma', 'rsi', 'macd', 'adx', 'atr', 'obv']
const STATE_PILL = {
  bullish: 'good-bg', bearish: 'crit-bg',
  stretched: 'warn-bg', 'washed-out': 'warn-bg',
  divergence: 'warn-bg', mixed: 'neutral', neutral: 'neutral',
}
const toDay = (d) => d.toISOString().slice(0, 10)
const pctFmt = (v, d = 1) => (v == null || !isFinite(v) ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(d)}%`)

function seriesColor(i) {
  const cs = getComputedStyle(document.documentElement)
  return cs.getPropertyValue(`--series-${(i % 8) + 1}`).trim()
}

// Percent performance of the last `n` sessions, from each series' own start.
function perfOver(closes, n) {
  if (!closes || closes.length < 2) return null
  const base = closes[Math.max(0, closes.length - 1 - n)]
  return ((closes[closes.length - 1] - base) / base) * 100
}

// The shared chart: every listed ticker drawn as a normalized % line from
// the start of the selected range. It does not reset when the research
// target changes — pins persist.
function CompareChart({ tickers, focus, range }) {
  const { state, dataVersion } = useStore()
  const theme = state.settings.theme || 'dark'
  const box = useRef(null)

  useEffect(() => {
    if (!box.current || !tickers.length) return
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
      rightPriceScale: { borderColor: v('--grid') },
      timeScale: { borderColor: v('--grid'), rightOffset: 2, fixLeftEdge: true, fixRightEdge: true },
      localization: { priceFormatter: (p) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%` },
    })

    tickers.forEach((t, i) => {
      const rows = getSeries(t).slice(-RANGES[range])
      if (rows.length < 2) return
      const base = rows[0].close
      const line = chart.addSeries(LineSeries, {
        color: seriesColor(i),
        lineWidth: t === focus ? 3 : 2,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        title: t,
      })
      line.setData(rows.map((r) => ({ time: toDay(r.date), value: ((r.close - base) / base) * 100 })))
      if (i === 0) {
        line.createPriceLine({
          price: 0, color: v('--grid'), lineWidth: 1,
          lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: '',
        })
      }
    })

    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [tickers.join(','), focus, range, theme, dataVersion])

  return <div className="sc-pane sc-pane-price" ref={box} style={{ height: 320 }} />
}

export default function Research() {
  const { state, dataVersion, setResearch, setResearchNote, setResearchChat } = useStore()
  const companies = getCompanies()
  const research = state.research || { ticker: '', pins: [], notes: {} }

  // fall back gracefully if the stored ticker vanished (e.g. mode switch)
  const ticker = companies.some((c) => c.ticker === research.ticker)
    ? research.ticker : companies[0]?.ticker || ''
  const pins = (research.pins || []).filter((p) => p !== ticker && companies.some((c) => c.ticker === p))
  const chartTickers = [ticker, ...pins]

  const [range, setRange] = useState('1Y')

  const company = companies.find((c) => c.ticker === ticker)
  const series = useMemo(() => getSeries(ticker), [ticker, dataVersion])
  const closes = useMemo(() => series.map((d) => d.close), [series])
  const quote = getQuote(ticker)
  const fundamentals = getFundamentals(ticker)
  const health = fundamentals ? healthScore(fundamentals) : null

  const readings = useMemo(() => READ_IDS.map((id) => {
    const ind = getIndicator(id)
    if (!ind) return null
    try { return { id, name: ind.name, ...ind.reading(series) } } catch { return null }
  }).filter(Boolean), [series])

  const hi52 = Math.max(...closes.slice(-252))
  const lo52 = Math.min(...closes.slice(-252))
  const note = research.notes?.[ticker] || ''
  const [dockOpen, setDockOpen] = useState(true)
  const dockRef = useRef(null)

  // Everything the analyst can see from this dashboard: the researched
  // company's numbers, the pinned comparisons, the user's own notes, and a
  // light summary of their real portfolio for "my situation" questions.
  const context = useMemo(() => {
    const lines = []
    lines.push('# RESEARCH DASHBOARD STATE')
    lines.push(`Market mode: ${isLiveMode() ? 'LIVE' : 'SIMULATED (fictional companies)'}`)
    lines.push(`The user is researching ${ticker} — ${company?.name || ''} (${company?.sector || 'n/a'}).`)
    if (quote) lines.push(`Price ${quote.price.toFixed(2)} (${pctFmt(quote.changePct, 2)} today), 1M ${pctFmt(perfOver(closes, 21))}, 1Y ${pctFmt(perfOver(closes, 252))}, ann. vol ${(annualizedVol(closes.slice(-252)) * 100).toFixed(0)}%, worst 1Y drawdown -${(maxDrawdown(closes.slice(-252)) * 100).toFixed(0)}%, 52w range ${lo52.toFixed(2)}-${hi52.toFixed(2)}.`)
    for (const r of readings) lines.push(`- ${r.name}: [${r.state}] ${r.text}`)
    if (fundamentals) {
      lines.push(`Fundamentals: revenue $${fundamentals.revenue}B (${pctFmt(fundamentals.revenueGrowth)}), net margin ${fundamentals.netMargin}%, P/E ${fundamentals.peRatio ? fundamentals.peRatio.toFixed(1) : 'n/a'}, P/S ${fundamentals.psRatio.toFixed(1)}, D/E ${fundamentals.debtToEquity}, ROE ${fundamentals.roe}%, FCF margin ${fundamentals.fcfMargin}%, dividend ${fundamentals.dividendYield}%${health ? `, health score ${health.total}/100` : ''}.`)
    }
    if (pins.length) {
      lines.push('Pinned comparisons on the shared chart:')
      for (const t of pins) {
        const c = getSeries(t).map((d) => d.close)
        lines.push(`- ${t}: 1M ${pctFmt(perfOver(c, 21))}, 3M ${pctFmt(perfOver(c, 63))}, 1Y ${pctFmt(perfOver(c, 252))}`)
      }
    }
    if (note.trim()) lines.push(`The user's own research notes on ${ticker}: "${note.trim()}"`)
    const notedTickers = Object.entries(research.notes || {}).filter(([t, v]) => t !== ticker && v?.trim())
    if (notedTickers.length) lines.push(`They also keep notes on: ${notedTickers.map(([t]) => t).join(', ')}.`)
    const rp = state.realPortfolio?.instruments
    if (rp?.length) {
      const sum = realSummary(rp, null)
      const owned = sum.rows.filter((r) => r.shares > 0)
      if (owned.length) {
        lines.push('Their REAL portfolio (from the My investments page — real money, teach, never instruct):')
        for (const r of owned) lines.push(`- ${r.name}${r.symbol ? ` (${r.symbol})` : ''}: ${r.shares} shares${r.avgCost ? `, avg cost ${r.avgCost} ${r.currency}` : ''}`)
      }
    }
    const doneLessons = Object.keys(state.completedLessons || {}).length
    lines.push(`Curriculum progress: ${doneLessons} lessons completed.`)
    return lines.join('\n')
  }, [ticker, company, quote, closes, readings, fundamentals, health, pins.join(','), note, state.realPortfolio, state.completedLessons, lo52, hi52])

  function analyseSituation() {
    dockRef.current?.send(
      'Analyse my situation using everything you can see: the company I am researching, its ' +
      'indicators and fundamentals, my pinned comparisons, my research notes, and my real ' +
      'portfolio. Give me: 1) the two or three things that stand out most, 2) what a ' +
      'professional analyst would check next before forming a view, 3) concrete next steps for ' +
      'ME — what to research, which app tool to use, and which Academy lesson fills my biggest ' +
      'current gap. Teach me the reasoning; do not tell me to buy or sell anything.'
    )
  }

  function pin(t) {
    if (!research.pins?.includes(t)) setResearch({ pins: [...(research.pins || []), t] })
  }
  function unpin(t) {
    setResearch({ pins: (research.pins || []).filter((x) => x !== t) })
  }

  return (
    <div className="invest-layout">
      <div className="invest-main">
      <div className="row spread" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}><IconClipboard size={24} /> Research</h1>
          <p className="small secondary" style={{ margin: 0 }}>
            Switch the company under research — every panel follows. The comparison chart is
            shared: pinned companies stay on it while you move between targets.
          </p>
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <label htmlFor="research-ticker" style={{ margin: 0 }} className="small muted">Researching</label>
          <select
            id="research-ticker"
            value={ticker}
            onChange={(e) => setResearch({ ticker: e.target.value })}
          >
            {companies.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>)}
          </select>
          <button onClick={() => pin(ticker)} disabled={research.pins?.includes(ticker)}>
            <IconTag size={13} /> Pin to chart
          </button>
          <button className="primary" onClick={analyseSituation}>
            <IconBulb size={14} /> Analyse my situation
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row spread" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="toggle-row" style={{ margin: 0 }}>
            {chartTickers.map((t, i) => (
              <span key={t} className="toggle-chip on" style={{ borderColor: seriesColor(i), color: seriesColor(i) }}>
                {t}{t === ticker ? ' · researching' : ''}
                {t !== ticker && (
                  <button
                    onClick={() => unpin(t)}
                    aria-label={`Unpin ${t}`}
                    style={{ all: 'unset', cursor: 'pointer', marginLeft: 6, display: 'inline-flex' }}
                  ><IconX size={11} /></button>
                )}
              </span>
            ))}
          </div>
          <div className="range-tabs">
            {Object.keys(RANGES).map((r) => (
              <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <CompareChart tickers={chartTickers} focus={ticker} range={range} />
        </div>
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          Normalized performance — every line starts at 0% at the beginning of the range, so
          different price levels compare fairly.
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}><IconPulse size={16} /> {ticker} snapshot</h3>
          <table>
            <tbody>
              <tr><td className="muted">Company</td><td className="num"><strong>{company?.name}</strong></td></tr>
              <tr><td className="muted">Sector</td><td className="num">{company?.sector || '—'}</td></tr>
              <tr><td className="muted">Price</td><td className="num">{quote ? quote.price.toFixed(2) : '—'} ({quote ? pctFmt(quote.changePct, 2) : '—'} today)</td></tr>
              <tr><td className="muted">1 month</td><td className={'num ' + (perfOver(closes, 21) >= 0 ? 'up' : 'down')}>{pctFmt(perfOver(closes, 21))}</td></tr>
              <tr><td className="muted">1 year</td><td className={'num ' + (perfOver(closes, 252) >= 0 ? 'up' : 'down')}>{pctFmt(perfOver(closes, 252))}</td></tr>
              <tr><td className="muted">Annualized volatility</td><td className="num">{(annualizedVol(closes.slice(-252)) * 100).toFixed(0)}%</td></tr>
              <tr><td className="muted">Worst 1-year drawdown</td><td className="num down">-{(maxDrawdown(closes.slice(-252)) * 100).toFixed(0)}%</td></tr>
              <tr><td className="muted">Position in 52-week range</td><td className="num">{(((quote?.price ?? 0) - lo52) / (hi52 - lo52) * 100).toFixed(0)}% ({lo52.toFixed(0)}–{hi52.toFixed(0)})</td></tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}><IconSearch size={16} /> What the indicators say right now</h3>
          {readings.map((r) => (
            <div key={r.id} className="row" style={{ alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <span className={'pill ' + (STATE_PILL[r.state] || 'neutral')} style={{ flex: '0 0 auto' }}>{r.state}</span>
              <span className="small secondary"><strong>{r.name}:</strong> {r.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}>Fundamentals</h3>
          {fundamentals ? (
            <>
              {health && (
                <div className="row" style={{ marginBottom: 10 }}>
                  <span className={'pill ' + (health.total >= 70 ? 'good-bg' : health.total >= 45 ? 'warn-bg' : 'crit-bg')}>
                    Health {health.total}/100
                  </span>
                </div>
              )}
              <table>
                <tbody>
                  <tr><td className="muted">Revenue</td><td className="num">${fundamentals.revenue}B ({pctFmt(fundamentals.revenueGrowth)})</td></tr>
                  <tr><td className="muted">Net margin</td><td className="num">{fundamentals.netMargin}%</td></tr>
                  <tr><td className="muted">P/E</td><td className="num">{fundamentals.peRatio ? fundamentals.peRatio.toFixed(1) : 'n/a'}</td></tr>
                  <tr><td className="muted">P/S</td><td className="num">{fundamentals.psRatio.toFixed(1)}</td></tr>
                  <tr><td className="muted">Debt / equity</td><td className="num">{fundamentals.debtToEquity}</td></tr>
                  <tr><td className="muted">ROE</td><td className="num">{fundamentals.roe}%</td></tr>
                  <tr><td className="muted">FCF margin</td><td className="num">{fundamentals.fcfMargin}%</td></tr>
                  <tr><td className="muted">Dividend yield</td><td className="num">{fundamentals.dividendYield}%</td></tr>
                </tbody>
              </table>
            </>
          ) : (
            <p className="small muted">No curated fundamentals in live mode — the panels above still
            work, and the analyst can reason from price action.</p>
          )}
          <p className="small" style={{ marginBottom: 0 }}>
            <Link to={`/market/${ticker}`}>Full chart &amp; trading page</Link> ·{' '}
            <Link to={`/mentor?stock=${ticker}`}><IconMentor size={13} /> Ask the analyst about {ticker}</Link>
          </p>
        </div>

        <div className="card" style={{ marginTop: 0 }}>
          <h3 style={{ marginTop: 0 }}>Relative performance</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Ticker</th><th className="num">1M</th><th className="num">3M</th><th className="num">1Y</th></tr>
              </thead>
              <tbody>
                {chartTickers.map((t) => {
                  const c = getSeries(t).map((d) => d.close)
                  return (
                    <tr key={t} className={t === ticker ? 'row-focus' : ''}>
                      <td><strong>{t}</strong>{t === ticker && <span className="small muted"> · researching</span>}</td>
                      {[21, 63, 252].map((n) => {
                        const p = perfOver(c, n)
                        return <td key={n} className={'num ' + (p >= 0 ? 'up' : 'down')}>{pctFmt(p)}</td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {pins.length === 0 && (
            <p className="small muted" style={{ marginBottom: 0 }}>
              Pin companies to compare them here and on the shared chart — try pinning a defensive
              (FRSH, MEDX) against a cyclical (HOMR, LUXE).
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Your research notes on {ticker}</h3>
        <p className="small secondary" style={{ marginTop: 0 }}>
          The watchlist discipline from the Academy: write the thesis while you are calm — what
          makes it good, what you would pay, what would change your mind. Notes are saved per
          company, in this browser only.
        </p>
        <textarea
          value={note}
          onChange={(e) => setResearchNote(ticker, e.target.value)}
          placeholder={`Why would ${ticker} be worth owning? At what price? What breaks the thesis?`}
          rows={5}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
      </div>

      <AnalystDock
        ref={dockRef}
        open={dockOpen} setOpen={setDockOpen} context={context}
        history={research.chat || []} setHistory={setResearchChat}
        title="Research analyst"
        placeholder={`Ask about ${ticker}…`}
        suggestions={[
          `Give me three tips for researching ${ticker} properly.`,
          `What is the biggest risk the numbers show for ${ticker}?`,
          'Which of my pinned companies looks strongest, and why?',
          'Critique my research notes like a senior analyst.',
        ]}
      />
    </div>
  )
}
