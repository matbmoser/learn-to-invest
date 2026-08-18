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

// The user's REAL portfolio tracker (distinct from the practice simulator):
// a list of instruments they actually own, with live prices via Twelve Data
// where the symbol is available on their plan, and manual prices everywhere
// else (private companies like SpaceX, or exchanges outside the free tier).
//
// Twelve Data plan reality: the free tier serves US-listed symbols plus
// forex; European listings (XETRA, LSE) need a paid plan. Every instrument
// therefore supports a manual fallback price, and the UI says which is which.

// Seed list — the instruments can be edited, removed, or added to freely.
// Shares and cost default to 0: the owner fills in their own numbers.
export const SEED_INSTRUMENTS = [
  { id: 'bmw', name: 'BMW', symbol: 'BMW', exchange: 'XETR', currency: 'EUR', type: 'stock', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'msci-world', name: 'iShares Core MSCI World (Acc)', symbol: 'EUNL', exchange: 'XETR', currency: 'EUR', type: 'etf', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'mercedes', name: 'Mercedes-Benz Group', symbol: 'MBG', exchange: 'XETR', currency: 'EUR', type: 'stock', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'ai-etf', name: 'L&G Artificial Intelligence (Acc)', symbol: 'AIAI', exchange: 'LSE', currency: 'USD', type: 'etf', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'spacex', name: 'SpaceX', symbol: '', exchange: '', currency: 'EUR', type: 'private', shares: 0, avgCost: 0, manualPrice: 0, monitored: false },
  { id: 'nio', name: 'Nio', symbol: 'NIO', exchange: '', currency: 'USD', type: 'stock', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'apple', name: 'Apple', symbol: 'AAPL', exchange: '', currency: 'USD', type: 'stock', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
  { id: 'vw', name: 'Volkswagen (Vz.)', symbol: 'VOW3', exchange: 'XETR', currency: 'EUR', type: 'stock', shares: 0, avgCost: 0, manualPrice: 0, monitored: true },
]

const CACHE_KEY = 'lti-real-cache-v1'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

// The request symbol Twelve Data expects: "BMW:XETR" for exchange-qualified
// listings, plain "AAPL" for US symbols.
export function requestSymbol(inst) {
  if (!inst.symbol) return null
  return inst.exchange ? `${inst.symbol}:${inst.exchange}` : inst.symbol
}

function parseSeries(body) {
  if (!body || body.status === 'error' || !Array.isArray(body.values)) return null
  return body.values
    .map((v) => ({
      date: new Date(v.datetime + 'T00:00:00Z'),
      open: +v.open, high: +v.high, low: +v.low, close: +v.close,
      volume: +v.volume || 0,
    }))
    .filter((r) => isFinite(r.close))
    .reverse()
}

export function getCachedRealData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { stamp, data, failed, fx } = JSON.parse(raw)
    if (stamp !== todayStamp()) return null
    const out = {}
    for (const [sym, rows] of Object.entries(data)) {
      out[sym] = rows.map((r) => ({ ...r, date: new Date(r.date) }))
    }
    return { data: out, failed: failed || {}, fx: fx || null }
  } catch {
    return null
  }
}

export function clearRealCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
}

// One batched request for every symbol-bearing instrument plus EUR/USD.
// Returns { data: {reqSym: candles[]}, failed: {reqSym: message}, fx: rate|null }.
// Per-symbol failures (plan limits, unknown symbols) are collected, not fatal.
export async function fetchRealData(apiKey, instruments) {
  const syms = [...new Set(instruments.map(requestSymbol).filter(Boolean))]
  const all = [...syms, 'EUR/USD']
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(all.join(','))}&interval=1day&outputsize=400&apikey=${encodeURIComponent(apiKey)}`

  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Could not reach Twelve Data. Check your connection (or an ad-blocker).')
  }
  if (!res.ok) throw new Error(`Twelve Data returned HTTP ${res.status}.`)
  const body = await res.json()
  if (body.status === 'error') {
    throw new Error(body.message || 'The API rejected the request — check your API key in Settings.')
  }

  // A single-symbol request returns a flat object; batches key by symbol.
  const bySym = all.length === 1 ? { [all[0]]: body } : body

  const data = {}
  const failed = {}
  for (const sym of syms) {
    const series = parseSeries(bySym[sym])
    if (series && series.length >= 20) data[sym] = series
    else failed[sym] = bySym[sym]?.message || 'No data returned for this symbol.'
  }
  const fxSeries = parseSeries(bySym['EUR/USD'])
  const fx = fxSeries?.length ? fxSeries[fxSeries.length - 1].close : null

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      stamp: todayStamp(),
      failed,
      fx,
      data: Object.fromEntries(Object.entries(data).map(([sym, rows]) => [
        sym, rows.map((r) => ({ ...r, date: r.date.toISOString() })),
      ])),
    }))
  } catch { /* cache is an optimization */ }

  return { data, failed, fx }
}

// Best-known price for an instrument: live close when we have a series,
// otherwise the manual price (0 = unknown). source tells the UI which it is.
export function instrumentPrice(inst, liveData) {
  const sym = requestSymbol(inst)
  const series = sym && liveData?.data?.[sym]
  if (series && series.length) {
    const last = series[series.length - 1]
    const prev = series[series.length - 2]
    return {
      price: last.close,
      changePct: prev ? ((last.close - prev.close) / prev.close) * 100 : 0,
      source: 'live',
    }
  }
  if (inst.manualPrice > 0) return { price: inst.manualPrice, changePct: null, source: 'manual' }
  return { price: null, changePct: null, source: 'none' }
}

// EUR value of one instrument position (USD converted via EUR/USD rate).
function positionValueEUR(inst, priceInfo, fx) {
  if (priceInfo.price == null || !inst.shares) return null
  const native = priceInfo.price * inst.shares
  if (inst.currency === 'EUR') return native
  if (inst.currency === 'USD' && fx) return native / fx
  return null
}

// Summarises the whole real portfolio at current prices.
export function realSummary(instruments, liveData) {
  const fx = liveData?.fx || null
  let valueEUR = 0
  let costEUR = 0
  let priced = 0
  let unpriced = 0
  const rows = instruments.map((inst) => {
    const p = instrumentPrice(inst, liveData)
    const value = p.price != null ? p.price * inst.shares : null
    const vEUR = positionValueEUR(inst, p, fx)
    const cost = inst.avgCost * inst.shares
    const cEUR = inst.currency === 'EUR' ? cost : (fx ? cost / fx : null)
    if (vEUR != null && inst.shares > 0) { valueEUR += vEUR; priced++ } else if (inst.shares > 0) { unpriced++ }
    if (cEUR != null && inst.shares > 0) costEUR += cEUR
    return {
      ...inst,
      priceInfo: p,
      value,
      valueEUR: vEUR,
      cost,
      gain: value != null && cost > 0 ? value - cost : null,
      gainPct: value != null && cost > 0 ? ((value - cost) / cost) * 100 : null,
    }
  })
  return { rows, valueEUR, costEUR, gainEUR: valueEUR - costEUR, priced, unpriced, fx }
}

// Compact context block so the analyst chat and the per-position reads see
// the user's REAL holdings (marked clearly as real, not the simulator).
export function buildRealContext(instruments, liveData, summary) {
  const lines = []
  lines.push('# THE USER\'S REAL PORTFOLIO (actual money, tracked in the "My investments" dashboard)')
  lines.push('This is separate from the practice simulator. Be a teacher: explain reasoning and risks; never give a direct instruction to buy or sell with real money.')
  if (summary.valueEUR > 0) {
    lines.push(`Approximate total of priced positions: €${summary.valueEUR.toFixed(0)}${summary.unpriced ? ` (+${summary.unpriced} position(s) without a price)` : ''}. EUR/USD ${summary.fx ? summary.fx.toFixed(4) : 'unknown'}.`)
  }
  for (const r of realSummary(instruments, liveData).rows) {
    const p = r.priceInfo
    const bits = [
      `${r.name}${r.symbol ? ` (${r.symbol}${r.exchange ? ':' + r.exchange : ''})` : ' (private company, no ticker)'}`,
      r.type.toUpperCase(),
      r.shares > 0 ? `${r.shares} shares` : 'shares not set',
      r.avgCost > 0 ? `avg cost ${r.avgCost} ${r.currency}` : null,
      p.price != null ? `price ${p.price.toFixed(2)} ${r.currency} (${p.source})` : 'no price available',
      p.changePct != null ? `today ${p.changePct >= 0 ? '+' : ''}${p.changePct.toFixed(2)}%` : null,
      r.gainPct != null ? `P&L ${r.gainPct >= 0 ? '+' : ''}${r.gainPct.toFixed(1)}%` : null,
      r.monitored ? 'monitored' : 'not monitored',
    ].filter(Boolean)
    lines.push('- ' + bits.join(' · '))
  }
  // Recent price behaviour for monitored instruments with live data
  for (const inst of instruments.filter((x) => x.monitored)) {
    const sym = requestSymbol(inst)
    const s = sym && liveData?.data?.[sym]
    if (!s || s.length < 30) continue
    const c = s.map((d) => d.close)
    const i = c.length - 1
    const perf = (n) => c.length > n ? (((c[i] - c[i - n]) / c[i - n]) * 100).toFixed(1) + '%' : 'n/a'
    lines.push(`- ${inst.symbol} recent: 1M ${perf(21)}, 3M ${perf(63)}, 1Y ${perf(252)}; 52-week range ${Math.min(...c.slice(-252)).toFixed(2)}–${Math.max(...c.slice(-252)).toFixed(2)} ${inst.currency}`)
  }
  return lines.join('\n')
}
