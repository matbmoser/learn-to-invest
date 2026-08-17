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

// Professional stock charting built on TradingView's Lightweight Charts:
// candlesticks, a volume pane, moving-average / Bollinger overlays, and
// separate RSI and MACD panes whose crosshair and time axis stay in sync
// with the price pane.

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CandlestickSeries, CrosshairMode, HistogramSeries, LineSeries, LineStyle,
  createChart,
} from 'lightweight-charts'
import { bollinger, ema, macd, rsi, sma } from '../lib/indicators.js'
import { fmtCompact, fmtMoney } from '../lib/format.js'
import { useStore } from '../lib/store.jsx'

const RANGES = { '3M': 63, '6M': 126, '1Y': 252, '2Y': 504, All: Infinity }

const OVERLAYS = [
  { key: 'sma20', label: 'SMA 20', color: 'var(--series-2)' },
  { key: 'sma50', label: 'SMA 50', color: 'var(--series-7)' },
  { key: 'sma200', label: 'SMA 200', color: 'var(--series-4)' },
  { key: 'ema12', label: 'EMA 12', color: 'var(--series-5)' },
  { key: 'boll', label: 'Bollinger', color: 'var(--series-1)' },
]

// Lightweight Charts wants literal colours, not CSS custom properties.
function readTheme(el) {
  const cs = getComputedStyle(el)
  const v = (name) => cs.getPropertyValue(name).trim()
  return {
    surface: v('--surface'),
    text: v('--text-secondary'),
    muted: v('--text-muted'),
    grid: v('--grid'),
    border: v('--baseline'),
    up: v('--series-3'),
    down: v('--series-8'),
    s1: v('--series-1'), s2: v('--series-2'), s4: v('--series-4'),
    s5: v('--series-5'), s7: v('--series-7'),
    accent: v('--accent'),
  }
}

const toDay = (d) => d.toISOString().slice(0, 10)

function baseOptions(t, { rightPad = 6 } = {}) {
  return {
    autoSize: true,
    layout: {
      background: { color: 'transparent' },
      textColor: t.muted,
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      fontSize: 11,
      attributionLogo: false,
    },
    grid: {
      vertLines: { color: t.grid, style: LineStyle.Solid },
      horzLines: { color: t.grid, style: LineStyle.Solid },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: t.border, width: 1, style: LineStyle.Solid, labelBackgroundColor: t.accent },
      horzLine: { color: t.border, width: 1, style: LineStyle.Solid, labelBackgroundColor: t.accent },
    },
    rightPriceScale: { borderColor: t.grid, scaleMargins: { top: 0.12, bottom: 0.12 } },
    timeScale: { borderColor: t.grid, rightOffset: rightPad, fixLeftEdge: true, fixRightEdge: true },
    handleScale: { axisPressedMouseMove: { price: false } },
  }
}

export default function StockChart({ series, ticker }) {
  const { state } = useStore()
  const theme = state.settings.theme || 'dark'

  const [range, setRange] = useState('6M')
  const [type, setType] = useState('candles')
  const [overlays, setOverlays] = useState({ sma20: true, sma50: true })
  const [panes, setPanes] = useState({ volume: true, rsi: false, macd: false })
  const [hover, setHover] = useState(null)

  const priceRef = useRef(null)
  const rsiRef = useRef(null)
  const macdRef = useRef(null)
  const apiRef = useRef({})

  // Indicators are computed on the full history, then sliced to the window so
  // the first visible SMA-200 point is correct rather than empty.
  const data = useMemo(() => {
    const closes = series.map((d) => d.close)
    const ind = {
      sma20: sma(closes, 20), sma50: sma(closes, 50), sma200: sma(closes, 200),
      ema12: ema(closes, 12), boll: bollinger(closes, 20, 2),
      rsi: rsi(closes, 14), macd: macd(closes),
    }
    const n = RANGES[range] === Infinity ? series.length : Math.min(RANGES[range], series.length)
    const from = series.length - n
    const cut = (arr) => arr.slice(from)
    const win = series.slice(from)
    const line = (arr) => cut(arr)
      .map((v, i) => (v == null ? null : { time: toDay(win[i].date), value: v }))
      .filter(Boolean)

    return {
      window: win,
      candles: win.map((d) => ({
        time: toDay(d.date), open: d.open, high: d.high, low: d.low, close: d.close,
      })),
      closeLine: win.map((d) => ({ time: toDay(d.date), value: d.close })),
      volume: win.map((d) => ({
        time: toDay(d.date), value: d.volume,
        color: d.close >= d.open ? 'rgba(25,158,112,0.45)' : 'rgba(230,103,103,0.45)',
      })),
      sma20: line(ind.sma20), sma50: line(ind.sma50), sma200: line(ind.sma200),
      ema12: line(ind.ema12),
      bollUpper: line(ind.boll.upper), bollLower: line(ind.boll.lower), bollMid: line(ind.boll.mid),
      rsi: line(ind.rsi),
      macdLine: line(ind.macd.macdLine),
      macdSignal: line(ind.macd.signal),
      macdHist: cut(ind.macd.histogram)
        .map((v, i) => (v == null ? null : {
          time: toDay(win[i].date), value: v,
          color: v >= 0 ? 'rgba(25,158,112,0.6)' : 'rgba(230,103,103,0.6)',
        }))
        .filter(Boolean),
    }
  }, [series, range])

  // Build (and rebuild on theme / pane changes) every chart.
  useEffect(() => {
    if (!priceRef.current) return
    const t = readTheme(document.documentElement)
    const api = {}

    const price = createChart(priceRef.current, baseOptions(t))
    api.price = price
    api.candles = price.addSeries(CandlestickSeries, {
      upColor: t.up, downColor: t.down, borderVisible: false,
      wickUpColor: t.up, wickDownColor: t.down,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    api.line = price.addSeries(LineSeries, {
      color: t.s1, lineWidth: 2, priceLineVisible: false, lastValueVisible: false,
    })
    api.volume = price.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' }, priceScaleId: 'vol',
    })
    price.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, visible: false })

    const overlaySeries = (color, dashed = false) => price.addSeries(LineSeries, {
      color, lineWidth: 2, priceLineVisible: false, lastValueVisible: false,
      lineStyle: dashed ? LineStyle.Dashed : LineStyle.Solid,
      crosshairMarkerVisible: false,
    })
    api.sma20 = overlaySeries(t.s2)
    api.sma50 = overlaySeries(t.s7)
    api.sma200 = overlaySeries(t.s4)
    api.ema12 = overlaySeries(t.s5, true)
    api.bollUpper = overlaySeries(t.s1, true)
    api.bollLower = overlaySeries(t.s1, true)

    if (rsiRef.current) {
      const c = createChart(rsiRef.current, {
        ...baseOptions(t),
        rightPriceScale: { borderColor: t.grid, scaleMargins: { top: 0.1, bottom: 0.1 } },
      })
      api.rsiChart = c
      api.rsiSeries = c.addSeries(LineSeries, { color: t.s7, lineWidth: 2, priceLineVisible: false })
      for (const [v, col] of [[70, t.down], [30, t.up]]) {
        api.rsiSeries.createPriceLine({
          price: v, color: col, lineWidth: 1, lineStyle: LineStyle.Dashed,
          axisLabelVisible: true, title: String(v),
        })
      }
    }
    if (macdRef.current) {
      const c = createChart(macdRef.current, baseOptions(t))
      api.macdChart = c
      api.macdHist = c.addSeries(HistogramSeries, { priceLineVisible: false })
      api.macdLine = c.addSeries(LineSeries, { color: t.s1, lineWidth: 2, priceLineVisible: false })
      api.macdSignal = c.addSeries(LineSeries, { color: t.s2, lineWidth: 2, priceLineVisible: false, lineStyle: LineStyle.Dashed })
    }

    // Keep every pane on the same visible range and the same crosshair.
    const charts = [price, api.rsiChart, api.macdChart].filter(Boolean)
    let syncing = false
    const unsubs = []
    for (const c of charts) {
      const handler = (r) => {
        if (syncing || !r) return
        syncing = true
        for (const other of charts) if (other !== c) other.timeScale().setVisibleLogicalRange(r)
        syncing = false
      }
      c.timeScale().subscribeVisibleLogicalRangeChange(handler)
      unsubs.push(() => c.timeScale().unsubscribeVisibleLogicalRangeChange(handler))
    }
    const targets = [
      [api.rsiChart, api.rsiSeries],
      [api.macdChart, api.macdLine],
    ].filter(([c]) => c)
    const onMove = (param) => {
      if (!param.time) {
        setHover(null)
        for (const [c] of targets) c.clearCrosshairPosition()
        return
      }
      const bar = param.seriesData.get(api.candles)
      const vol = param.seriesData.get(api.volume)
      if (bar) setHover({ ...bar, volume: vol?.value })
      for (const [c, s] of targets) c.setCrosshairPosition(0, param.time, s)
    }
    price.subscribeCrosshairMove(onMove)
    unsubs.push(() => price.unsubscribeCrosshairMove(onMove))

    apiRef.current = api
    return () => {
      unsubs.forEach((u) => u())
      charts.forEach((c) => c.remove())
      apiRef.current = {}
    }
  }, [theme, panes.rsi, panes.macd])

  // Feed data / toggle overlays without tearing the charts down.
  useEffect(() => {
    const a = apiRef.current
    if (!a.price) return
    const set = (s, d) => s && s.setData(d)

    a.candles.applyOptions({ visible: type === 'candles' })
    a.line.applyOptions({ visible: type === 'line' })
    set(a.candles, data.candles)
    set(a.line, data.closeLine)
    set(a.volume, panes.volume ? data.volume : [])

    for (const key of ['sma20', 'sma50', 'sma200', 'ema12']) {
      set(a[key], overlays[key] ? data[key] : [])
    }
    set(a.bollUpper, overlays.boll ? data.bollUpper : [])
    set(a.bollLower, overlays.boll ? data.bollLower : [])

    set(a.rsiSeries, data.rsi)
    set(a.macdHist, data.macdHist)
    set(a.macdLine, data.macdLine)
    set(a.macdSignal, data.macdSignal)

    a.price.timeScale().fitContent()
    a.rsiChart?.timeScale().fitContent()
    a.macdChart?.timeScale().fitContent()
  }, [data, overlays, panes.volume, type, panes.rsi, panes.macd])

  const last = data.window[data.window.length - 1]
  const shown = hover || last
  const prevClose = (() => {
    if (!hover) return data.window[data.window.length - 2]?.close
    const i = data.candles.findIndex((c) => c.time === hover.time)
    return i > 0 ? data.candles[i - 1].close : undefined
  })()
  const chg = shown && prevClose ? ((shown.close - prevClose) / prevClose) * 100 : 0

  return (
    <div className="sc">
      <div className="sc-toolbar">
        <div className="range-tabs">
          {Object.keys(RANGES).map((r) => (
            <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <div className="range-tabs">
          <button className={type === 'candles' ? 'active' : ''} onClick={() => setType('candles')}>Candles</button>
          <button className={type === 'line' ? 'active' : ''} onClick={() => setType('line')}>Line</button>
        </div>
      </div>

      <div className="toggle-row">
        {OVERLAYS.map((o) => (
          <button key={o.key}
            className={'toggle-chip' + (overlays[o.key] ? ' on' : '')}
            onClick={() => setOverlays((s) => ({ ...s, [o.key]: !s[o.key] }))}>
            <span className="swatch" style={{ background: o.color }} /> {o.label}
          </button>
        ))}
        {[['volume', 'Volume'], ['rsi', 'RSI'], ['macd', 'MACD']].map(([k, label]) => (
          <button key={k}
            className={'toggle-chip' + (panes[k] ? ' on' : '')}
            onClick={() => setPanes((s) => ({ ...s, [k]: !s[k] }))}>
            {label}
          </button>
        ))}
      </div>

      {shown && (
        <div className="sc-readout">
          <strong>{ticker}</strong>
          <span>O <b>{fmtMoney(shown.open)}</b></span>
          <span>H <b>{fmtMoney(shown.high)}</b></span>
          <span>L <b>{fmtMoney(shown.low)}</b></span>
          <span>C <b>{fmtMoney(shown.close)}</b></span>
          <span className={chg >= 0 ? 'up' : 'down'}>
            {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
          </span>
          {shown.volume != null && <span className="muted">Vol {fmtCompact(shown.volume)}</span>}
        </div>
      )}

      <div className="sc-pane sc-pane-price" ref={priceRef} />
      {panes.rsi && (
        <>
          <div className="sc-pane-label">RSI (14) <span className="muted">— above 70 overbought, below 30 oversold</span></div>
          <div className="sc-pane sc-pane-sub" ref={rsiRef} />
        </>
      )}
      {panes.macd && (
        <>
          <div className="sc-pane-label">MACD (12, 26, 9) <span className="muted">— crossovers signal momentum shifts</span></div>
          <div className="sc-pane sc-pane-sub" ref={macdRef} />
        </>
      )}

      <p className="small muted sc-hint">
        Scroll to zoom, drag to pan, hover for the OHLC readout. Charting by TradingView Lightweight Charts.
      </p>
    </div>
  )
}
