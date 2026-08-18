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

// Professional portfolio graphics for the My investments dashboard, built
// to the dataviz method: bars for magnitude (allocation), diverging bars
// for polarity (P&L by position), an area chart for wealth over time, and
// stat tiles for the period P&L headline numbers. Every mark carries a
// visible text label, so identity and value never depend on color alone.

import { useEffect, useRef } from 'react'
import { AreaSeries, CrosshairMode, LineStyle, createChart } from 'lightweight-charts'
import { PNL_WINDOWS } from '../lib/realportfolio.js'
import { useStore } from '../lib/store.jsx'

const toDay = (d) => d.toISOString().slice(0, 10)
const eur = (n, digits = 0) =>
  n == null ? '—' : `${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`

function seriesColor(i) {
  const cs = getComputedStyle(document.documentElement)
  return cs.getPropertyValue(`--series-${(i % 8) + 1}`).trim()
}

// Wealth over time: one area series (no legend needed — the title names it)
// with a dashed price line at the cost basis, so gain/loss reads as the gap.
export function WealthChart({ history, costEUR }) {
  const { state } = useStore()
  const theme = state.settings.theme || 'dark'
  const box = useRef(null)

  useEffect(() => {
    if (!box.current || history.length < 2) return
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
      rightPriceScale: { borderColor: v('--grid'), scaleMargins: { top: 0.12, bottom: 0.08 } },
      timeScale: { borderColor: v('--grid'), rightOffset: 1, fixLeftEdge: true, fixRightEdge: true },
      localization: { priceFormatter: (p) => eur(p) },
    })
    const accent = v('--accent')
    const area = chart.addSeries(AreaSeries, {
      lineColor: accent, lineWidth: 2,
      topColor: accent + '44', bottomColor: accent + '00',
    })
    area.setData(history.map((h) => ({ time: toDay(h.date), value: h.value })))
    if (costEUR > 0) {
      area.createPriceLine({
        price: costEUR, color: v('--text-muted'), lineWidth: 1,
        lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'cost',
      })
    }
    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [history, costEUR, theme])

  return <div className="sc-pane sc-pane-price" ref={box} style={{ height: 240 }} />
}

// Headline P&L numbers per window — stat tiles, not a chart.
export function PnLTiles({ pnl }) {
  if (!pnl) return null
  return (
    <div className="pnl-tiles">
      {PNL_WINDOWS.map((w) => {
        const p = pnl[w.key]
        const dir = p == null ? '' : p.abs >= 0 ? 'up' : 'down'
        return (
          <div className="pnl-tile" key={w.key}>
            <div className="stat-label">{w.label}</div>
            <div className={'pnl-abs ' + dir}>{p ? `${p.abs >= 0 ? '+' : ''}${eur(p.abs)}` : '—'}</div>
            <div className={'small ' + (dir || 'muted')}>{p?.pct != null ? `${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(2)}%` : 'not enough history'}</div>
          </div>
        )
      })}
    </div>
  )
}

// Allocation: horizontal bars, one per position, sorted by weight. Color
// follows the instrument (fixed order from the instrument list), and every
// bar is directly labeled with name, weight and value.
export function AllocationBars({ rows, instruments }) {
  const priced = rows.filter((r) => r.valueEUR != null && r.shares > 0)
  const total = priced.reduce((a, r) => a + r.valueEUR, 0)
  if (!total) return <p className="small muted">Set share counts (and prices) to see your allocation.</p>
  const colorIndex = new Map(instruments.map((inst, i) => [inst.id, i]))
  const sorted = [...priced].sort((a, b) => b.valueEUR - a.valueEUR)
  const max = sorted[0].valueEUR
  return (
    <div className="viz-bars">
      {sorted.map((r) => {
        const w = (r.valueEUR / total) * 100
        return (
          <div className="viz-row" key={r.id} title={`${r.name}: ${eur(r.valueEUR)} (${w.toFixed(1)}% of portfolio)`}>
            <span className="viz-name">{r.name}</span>
            <span className="viz-track">
              <span className="viz-fill" style={{ width: `${(r.valueEUR / max) * 100}%`, background: seriesColor(colorIndex.get(r.id) ?? 0) }} />
            </span>
            <span className="viz-val">{w.toFixed(1)}% · {eur(r.valueEUR)}</span>
          </div>
        )
      })}
    </div>
  )
}

// P&L by position: diverging bars around a zero baseline — polarity, so
// exactly two poles (the app's up/down tokens) and direct labels.
export function PnLBars({ rows }) {
  const withPnl = rows.filter((r) => r.gainPct != null && r.shares > 0)
  if (!withPnl.length) return <p className="small muted">Add average costs to see per-position P&amp;L.</p>
  const sorted = [...withPnl].sort((a, b) => b.gainPct - a.gainPct)
  const max = Math.max(...sorted.map((r) => Math.abs(r.gainPct)), 1)
  return (
    <div className="viz-bars">
      {sorted.map((r) => {
        const pos = r.gainPct >= 0
        const w = (Math.abs(r.gainPct) / max) * 50
        return (
          <div className="viz-row" key={r.id} title={`${r.name}: ${r.gainPct >= 0 ? '+' : ''}${r.gainPct.toFixed(1)}% (${r.gain >= 0 ? '+' : ''}${r.gain.toFixed(0)} ${r.currency === 'EUR' ? '€' : '$'})`}>
            <span className="viz-name">{r.name}</span>
            <span className="viz-track diverging">
              <span
                className="viz-fill"
                style={{
                  width: `${w}%`,
                  [pos ? 'left' : 'right']: '50%',
                  background: pos ? 'var(--series-3)' : 'var(--series-8)',
                }}
              />
              <span className="viz-zero" />
            </span>
            <span className={'viz-val ' + (pos ? 'up' : 'down')}>{pos ? '+' : ''}{r.gainPct.toFixed(1)}%</span>
          </div>
        )
      })}
    </div>
  )
}
