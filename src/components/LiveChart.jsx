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

// A compact TradingView Lightweight Charts wrapper for the real-portfolio
// dashboard: one instrument, switchable chart styles (candles, line, area,
// baseline), ranges, an optional SMA-50 overlay and a volume pane.

import { useEffect, useRef, useState } from 'react'
import {
  AreaSeries, BaselineSeries, CandlestickSeries, CrosshairMode,
  HistogramSeries, LineSeries, createChart,
} from 'lightweight-charts'
import { sma } from '../lib/indicators.js'
import { useStore } from '../lib/store.jsx'

const RANGES = { '1M': 21, '3M': 63, '6M': 126, '1Y': 252, All: Infinity }
const STYLES = ['Candles', 'Line', 'Area', 'Baseline']

const toDay = (d) => d.toISOString().slice(0, 10)

function themeVals() {
  const cs = getComputedStyle(document.documentElement)
  const v = (n) => cs.getPropertyValue(n).trim()
  return {
    muted: v('--text-muted'), grid: v('--grid'),
    up: v('--series-3'), down: v('--series-8'),
    accent: v('--accent'), s2: v('--series-2'),
  }
}

export default function LiveChart({ series, currency }) {
  const { state } = useStore()
  const theme = state.settings.theme || 'dark'
  const [style, setStyle] = useState('Candles')
  const [range, setRange] = useState('6M')
  const [showSma, setShowSma] = useState(false)
  const box = useRef(null)

  useEffect(() => {
    if (!box.current || !series?.length) return
    const t = themeVals()
    const rows = series.slice(-RANGES[range])
    const chart = createChart(box.current, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' }, textColor: t.muted,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 10, attributionLogo: false,
      },
      grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: t.grid, scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: { borderColor: t.grid, rightOffset: 2, fixLeftEdge: true, fixRightEdge: true },
      localization: { priceFormatter: (p) => `${p.toFixed(2)}` },
    })

    const closes = rows.map((r) => ({ time: toDay(r.date), value: r.close }))
    let main
    if (style === 'Candles') {
      main = chart.addSeries(CandlestickSeries, {
        upColor: t.up, downColor: t.down, borderVisible: false,
        wickUpColor: t.up, wickDownColor: t.down,
      })
      main.setData(rows.map((r) => ({
        time: toDay(r.date), open: r.open, high: r.high, low: r.low, close: r.close,
      })))
    } else if (style === 'Line') {
      main = chart.addSeries(LineSeries, { color: t.accent, lineWidth: 2 })
      main.setData(closes)
    } else if (style === 'Area') {
      main = chart.addSeries(AreaSeries, {
        lineColor: t.accent, lineWidth: 2,
        topColor: t.accent + '55', bottomColor: t.accent + '00',
      })
      main.setData(closes)
    } else {
      main = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: rows[0].close },
        topLineColor: t.up, bottomLineColor: t.down,
        topFillColor1: t.up + '44', topFillColor2: t.up + '00',
        bottomFillColor1: t.down + '00', bottomFillColor2: t.down + '44',
      })
      main.setData(closes)
    }

    if (showSma) {
      const s50 = sma(rows.map((r) => r.close), 50)
      const line = chart.addSeries(LineSeries, {
        color: t.s2, lineWidth: 1,
        priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
      })
      line.setData(rows.map((r, i) => ({ time: toDay(r.date), value: s50[i] }))
        .filter((d) => d.value != null))
    }

    if (rows.some((r) => r.volume > 0)) {
      const vol = chart.addSeries(HistogramSeries, {
        priceScaleId: 'vol', priceFormat: { type: 'volume' },
        priceLineVisible: false, lastValueVisible: false,
      })
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } })
      vol.setData(rows.map((r, i) => ({
        time: toDay(r.date), value: r.volume,
        color: (i > 0 && r.close < rows[i - 1].close ? t.down : t.up) + '66',
      })))
    }

    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [series, style, range, showSma, theme])

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <div className="range-tabs">
          {STYLES.map((s) => (
            <button key={s} className={style === s ? 'active' : ''} onClick={() => setStyle(s)}>{s}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className={'toggle-chip' + (showSma ? ' on' : '')} onClick={() => setShowSma(!showSma)}>
            SMA 50
          </button>
          <div className="range-tabs">
            {Object.keys(RANGES).map((r) => (
              <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="sc-pane sc-pane-price" ref={box} style={{ height: 280 }} />
      <p className="small muted" style={{ margin: '6px 0 0' }}>Prices in {currency}. Daily candles via Twelve Data.</p>
    </div>
  )
}
