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

// Draws a single indicator the way it actually appears on a chart: either as
// an overlay on the candles, or as its own oscillator pane. Charts mount only
// once scrolled into view, so a page full of them stays responsive.

import { useEffect, useRef, useState } from 'react'
import {
  CandlestickSeries, CrosshairMode, HistogramSeries, LineSeries, LineStyle,
  createChart,
} from 'lightweight-charts'
import { useStore } from '../lib/store.jsx'

const toDay = (d) => d.toISOString().slice(0, 10)

function readTheme() {
  const cs = getComputedStyle(document.documentElement)
  const v = (n) => cs.getPropertyValue(n).trim()
  return {
    text: v('--text-muted'), grid: v('--grid'), border: v('--baseline'),
    up: v('--series-3'), down: v('--series-8'), accent: v('--accent'),
  }
}

// The catalogue stores colours as CSS custom properties; canvas needs literals.
function resolve(color) {
  if (!color?.startsWith('var(')) return color
  const name = color.slice(4, -1).trim()
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export default function IndicatorChart({ indicator, candles, height = 200 }) {
  const { state } = useStore()
  const theme = state.settings.theme || 'dark'
  const boxRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // Lazy-mount: only build the chart once the card scrolls into view.
  useEffect(() => {
    const el = boxRef.current
    if (!el || visible) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); io.disconnect() }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  useEffect(() => {
    if (!visible || !boxRef.current || !candles.length) return
    const t = readTheme()
    const overlay = indicator.render === 'overlay'

    const chart = createChart(boxRef.current, {
      autoSize: true,
      layout: {
        background: { color: 'transparent' }, textColor: t.text,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 10, attributionLogo: false,
      },
      grid: { vertLines: { color: t.grid }, horzLines: { color: t.grid } },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: t.border, labelBackgroundColor: t.accent },
        horzLine: { color: t.border, labelBackgroundColor: t.accent },
      },
      rightPriceScale: { borderColor: t.grid, scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: { borderColor: t.grid, rightOffset: 2, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    })

    // Overlay indicators are drawn on top of the price candles; oscillators
    // get a bare pane of their own.
    if (overlay) {
      const price = chart.addSeries(CandlestickSeries, {
        upColor: t.up, downColor: t.down, borderVisible: false,
        wickUpColor: t.up, wickDownColor: t.down,
        priceLineVisible: false, lastValueVisible: false,
      })
      price.setData(candles.map((c) => ({
        time: toDay(c.date), open: c.open, high: c.high, low: c.low, close: c.close,
      })))
    }

    let first = null
    for (const s of indicator.compute(candles)) {
      const points = s.values
        .map((v, i) => (v == null ? null : { time: toDay(candles[i].date), value: v }))
        .filter(Boolean)
      if (!points.length) continue

      if (s.type === 'histogram') {
        const h = chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false })
        h.setData(points.map((p) => ({
          ...p, color: p.value >= 0 ? 'rgba(25,158,112,0.6)' : 'rgba(230,103,103,0.6)',
        })))
        first = first || h
        continue
      }

      const opts = {
        color: resolve(s.color), lineWidth: 2,
        priceLineVisible: false, lastValueVisible: false,
        lineStyle: s.dashed ? LineStyle.Dashed : LineStyle.Solid,
      }
      if (s.type === 'dots') {
        opts.lineVisible = false
        opts.pointMarkersVisible = true
        opts.pointMarkersRadius = 1.6
      }
      const line = chart.addSeries(LineSeries, opts)
      line.setData(points)
      first = first || line
    }

    // Reference bands (RSI 70/30, ADX 25, CCI ±100) and the zero line.
    if (first) {
      for (const b of indicator.bands || []) {
        first.createPriceLine({
          price: b.value, color: t.border, lineWidth: 1,
          lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: b.label,
        })
      }
      if (indicator.zeroLine) {
        first.createPriceLine({
          price: 0, color: t.border, lineWidth: 1,
          lineStyle: LineStyle.Solid, axisLabelVisible: false, title: '',
        })
      }
      if (indicator.scale) {
        first.applyOptions({ autoscaleInfoProvider: () => ({
          priceRange: { minValue: indicator.scale[0], maxValue: indicator.scale[1] },
        }) })
      }
    }

    chart.timeScale().fitContent()
    return () => chart.remove()
  }, [visible, indicator, candles, theme])

  return (
    <>
      <div className="ind-chart" ref={boxRef} style={{ height }} />
      <div className="legend">
        {indicator.compute(candles).map((s) => (
          <span className="legend-item" key={s.name}>
            <span className="swatch" style={{
              background: s.color,
              borderRadius: s.type === 'dots' ? '50%' : 3,
            }} />
            {s.name}
          </span>
        ))}
      </div>
    </>
  )
}
