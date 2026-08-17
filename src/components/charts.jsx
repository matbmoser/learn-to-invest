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

import { useMemo, useRef, useState } from 'react'
import { fmtDate, fmtDateShort } from '../lib/format.js'

// ---------- shared helpers ----------

function niceTicks(min, max, count = 4) {
  if (!isFinite(min) || !isFinite(max) || min === max) return [min]
  const span = max - min
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const ticks = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(v)
  return ticks
}

function extent(arrays) {
  let min = Infinity
  let max = -Infinity
  for (const arr of arrays) {
    for (const v of arr) {
      if (v == null) continue
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  if (min === Infinity) { min = 0; max = 1 }
  if (min === max) { min -= 1; max += 1 }
  return [min, max]
}

function buildPath(values, x, y) {
  let d = ''
  let pen = false
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v == null) { pen = false; continue }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
    pen = true
  }
  return d
}

// ---------- TimeSeriesChart ----------
// Generic multi-series line chart with crosshair + tooltip.
// props:
//   dates: Date[]
//   series: [{ name, color (css var), values: (number|null)[], width?, dash? }]
//   band: optional { upper, lower, color } — translucent fill (e.g. Bollinger)
//   bars: optional { values, posColor, negColor } — histogram behind lines (MACD)
//   refLines: optional [{ value, label, color? }]
//   height, formatValue, areaFill (wash under first series), yDomain
export function TimeSeriesChart({
  dates, series, band, bars, refLines = [],
  height = 300, formatValue = (v) => v.toFixed(2),
  areaFill = false, yDomain,
}) {
  const boxRef = useRef(null)
  const [hover, setHover] = useState(null) // index into dates
  const width = 900
  const pad = { top: 14, right: 8, bottom: 26, left: 56 }

  const { xAt, yAt, ticks, dateTicks } = useMemo(() => {
    const allVals = series.map((s) => s.values)
    if (band) allVals.push(band.upper, band.lower)
    if (bars) allVals.push(bars.values)
    let [min, max] = yDomain ?? extent(allVals)
    if (!yDomain) {
      const padV = (max - min) * 0.08
      min -= padV; max += padV
    }
    const innerW = width - pad.left - pad.right
    const innerH = height - pad.top - pad.bottom
    const n = Math.max(1, dates.length - 1)
    const xAt = (i) => pad.left + (i / n) * innerW
    const yAt = (v) => pad.top + innerH - ((v - min) / (max - min)) * innerH
    const ticks = niceTicks(min, max, 4)
    const tickCount = Math.min(6, dates.length)
    const dateTicks = []
    for (let t = 0; t < tickCount; t++) {
      dateTicks.push(Math.round((t / Math.max(1, tickCount - 1)) * n))
    }
    return { xAt, yAt, ticks, dateTicks }
  }, [dates, series, band, bars, yDomain, height])

  function onMove(e) {
    const box = boxRef.current
    if (!box || dates.length === 0) return
    const rect = box.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * width
    const n = Math.max(1, dates.length - 1)
    const innerW = width - pad.left - pad.right
    const i = Math.round(((px - pad.left) / innerW) * n)
    setHover(Math.max(0, Math.min(dates.length - 1, i)))
  }

  const hoverRows = hover != null
    ? series.filter((s) => s.values[hover] != null)
        .map((s) => ({ name: s.name, color: s.color, value: s.values[hover] }))
    : []
  if (hover != null && bars && bars.values[hover] != null) {
    hoverRows.push({
      name: bars.name || 'Histogram',
      color: bars.values[hover] >= 0 ? bars.posColor : bars.negColor,
      value: bars.values[hover],
    })
  }

  const tooltipLeft = hover != null && dates.length > 1 && hover / (dates.length - 1) > 0.62

  return (
    <div className="chart-box" ref={boxRef}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
      >
        {/* gridlines + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(t)} y2={yAt(t)}
              stroke="var(--grid)" strokeWidth="1" />
            <text x={pad.left - 8} y={yAt(t) + 4} textAnchor="end"
              fontSize="11.5" fill="var(--text-muted)"
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatValue(t)}
            </text>
          </g>
        ))}
        {/* x labels */}
        {dateTicks.map((i) => (
          <text key={i} x={xAt(i)} y={height - 8} textAnchor="middle"
            fontSize="11.5" fill="var(--text-muted)">
            {fmtDateShort(dates[i])}
          </text>
        ))}
        {/* reference lines (e.g. RSI 30/70) */}
        {refLines.map((r) => (
          <g key={r.label}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(r.value)} y2={yAt(r.value)}
              stroke={r.color || 'var(--baseline)'} strokeWidth="1" strokeDasharray="none" />
            <text x={width - pad.right - 4} y={yAt(r.value) - 4} textAnchor="end"
              fontSize="10.5" fill="var(--text-muted)">{r.label}</text>
          </g>
        ))}
        {/* band fill */}
        {band && (
          <path
            d={
              buildPath(band.upper, xAt, yAt) +
              buildPath([...band.lower].reverse(), (i) => xAt(band.lower.length - 1 - i), yAt).replace(/^M/, 'L') +
              'Z'
            }
            fill={band.color} opacity="0.1"
          />
        )}
        {/* histogram bars */}
        {bars && bars.values.map((v, i) => {
          if (v == null) return null
          const x = xAt(i)
          const y0 = yAt(0)
          const y1 = yAt(v)
          return (
            <rect key={i}
              x={x - 1.4} width={2.8}
              y={Math.min(y0, y1)} height={Math.max(1, Math.abs(y0 - y1))}
              fill={v >= 0 ? bars.posColor : bars.negColor} rx="1"
            />
          )
        })}
        {/* area wash under primary series */}
        {areaFill && series[0] && (
          <path
            d={
              buildPath(series[0].values, xAt, yAt) +
              `L${xAt(series[0].values.length - 1)},${yAt(ticks[0])}L${xAt(0)},${yAt(ticks[0])}Z`
            }
            fill={series[0].color} opacity="0.1"
          />
        )}
        {/* series lines */}
        {series.map((s) => (
          <path key={s.name} d={buildPath(s.values, xAt, yAt)}
            fill="none" stroke={s.color}
            strokeWidth={s.width ?? 2} strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={s.dash ? '5 4' : 'none'}
          />
        ))}
        {/* crosshair + markers */}
        {hover != null && (
          <g>
            <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.top} y2={height - pad.bottom}
              stroke="var(--baseline)" strokeWidth="1" />
            {series.map((s) =>
              s.values[hover] != null ? (
                <circle key={s.name} cx={xAt(hover)} cy={yAt(s.values[hover])} r="4.5"
                  fill={s.color} stroke="var(--surface)" strokeWidth="2" />
              ) : null
            )}
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="chart-tooltip"
          style={tooltipLeft
            ? { right: `${100 - (hover / (dates.length - 1)) * 100 + 2}%`, top: 10 }
            : { left: `${(hover / Math.max(1, dates.length - 1)) * 100 + 2}%`, top: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{fmtDate(dates[hover])}</div>
          {hoverRows.map((r) => (
            <div className="tooltip-row" key={r.name}>
              <span className="tooltip-key">
                <span className="swatch" style={{ background: r.color }} />{r.name}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatValue(r.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChartLegend({ items }) {
  if (items.length < 2) return null
  return (
    <div className="legend">
      {items.map((it) => (
        <span className="legend-item" key={it.name}>
          <span className="swatch" style={{ background: it.color }} />{it.name}
        </span>
      ))}
    </div>
  )
}

// ---------- Sparkline (stat tiles / market list) ----------
export function Sparkline({ values, width = 120, height = 36, color = 'var(--series-1)' }) {
  if (!values || values.length < 2) return null
  const [min, max] = extent([values])
  const x = (i) => (i / (values.length - 1)) * (width - 4) + 2
  const y = (v) => height - 3 - ((v - min) / (max - min)) * (height - 6)
  let d = ''
  values.forEach((v, i) => { d += `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}` })
  const last = values[values.length - 1]
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r="3.5" fill={color} stroke="var(--surface)" strokeWidth="2" />
    </svg>
  )
}

// ---------- Horizontal allocation bars ----------
export function AllocationBars({ items, formatValue }) {
  // items: [{ label, value, color }]
  const total = items.reduce((a, b) => a + b.value, 0)
  if (total <= 0) return null
  return (
    <div>
      {items.map((it) => {
        const pct = (it.value / total) * 100
        return (
          <div key={it.label} style={{ marginBottom: 10 }}>
            <div className="row spread" style={{ marginBottom: 3 }}>
              <span className="tooltip-key">
                <span className="swatch" style={{ background: it.color }} />
                <span style={{ color: 'var(--text-primary)' }}>{it.label}</span>
              </span>
              <span className="small secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatValue ? formatValue(it.value) : it.value} · {pct.toFixed(1)}%
              </span>
            </div>
            <div style={{ background: 'color-mix(in srgb, var(--text-muted) 12%, transparent)', borderRadius: 4, height: 14 }}>
              <div style={{
                width: `${Math.max(1, pct)}%`, height: '100%',
                background: it.color, borderRadius: '0 4px 4px 0',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------- Score meter (financial health) ----------
export function Meter({ value, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const color = pct >= 65 ? 'var(--good)' : pct >= 40 ? 'var(--warning)' : 'var(--critical)'
  return (
    <div style={{
      background: `color-mix(in srgb, ${color} 18%, transparent)`,
      borderRadius: 999, height: 10, overflow: 'hidden',
    }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  )
}
