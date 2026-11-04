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

const CACHE_KEY = 'lti-real-cache-v2'

// Currencies the tracker can convert into EUR. Forex is on Twelve Data's
// free plan, so these pairs cost credits but never plan errors.
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK', 'PLN']
export const CURRENCY_SYMBOL = {
  EUR: '€', USD: '$', GBP: '£', CHF: 'CHF', SEK: 'kr', DKK: 'kr', NOK: 'kr', PLN: 'zł',
}
const fxPair = (c) => `EUR/${c}`

// EUR value of an amount in `currency`. rates maps currency -> units per EUR.
export function toEUR(amount, currency, rates) {
  if (amount == null) return null
  if (currency === 'EUR') return amount
  const r = rates?.[currency]
  return r ? amount / r : null
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

// The request symbol Twelve Data expects: "BMW:XETR" for exchange-qualified
// listings, plain "AAPL" for US symbols.
export function requestSymbol(inst) {
  if (!inst.symbol) return null
  return inst.exchange ? `${inst.symbol}:${inst.exchange}` : inst.symbol
}

// A US-listed stand-in used ONLY to draw a chart when the real listing is
// not on the user's data plan. It never touches valuation: an ADR trades in
// another currency at another ratio, so using it for position value would be
// simply wrong. Charts drawn from it are labelled as proxies.
export function chartSymbol(inst) {
  return inst.chartSymbol ? inst.chartSymbol.trim().toUpperCase() : null
}

// Well-known US-listed stand-ins for European listings, offered as hints in
// the edit form. Similar exposure — never the same instrument.
export const PROXY_HINTS = {
  BMW: { symbol: 'BMWYY', what: 'BMW ADR (US OTC)' },
  MBG: { symbol: 'MBGYY', what: 'Mercedes-Benz ADR (US OTC)' },
  VOW3: { symbol: 'VWAGY', what: 'Volkswagen ADR (US OTC)' },
  EUNL: { symbol: 'URTH', what: 'iShares MSCI World (US listing)' },
  IWDA: { symbol: 'URTH', what: 'iShares MSCI World (US listing)' },
  AIAI: { symbol: 'AIQ', what: 'Global X AI & Technology ETF — similar theme' },
  SAP: { symbol: 'SAP', what: 'SAP NYSE listing' },
  SIE: { symbol: 'SIEGY', what: 'Siemens ADR (US OTC)' },
  ALV: { symbol: 'ALIZY', what: 'Allianz ADR (US OTC)' },
  AIR: { symbol: 'EADSY', what: 'Airbus ADR (US OTC)' },
  ASML: { symbol: 'ASML', what: 'ASML Nasdaq listing' },
}

export function proxyHint(inst) {
  return inst.symbol ? PROXY_HINTS[inst.symbol.toUpperCase()] || null : null
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

let cacheMemo = { key: '', value: null }

export function getCachedRealData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const key = raw.length + raw.slice(0, 40)
    if (cacheMemo.key === key) return cacheMemo.value
    const { stamp, data, failed, fx, rates } = JSON.parse(raw)
    if (stamp !== todayStamp()) return null
    const out = {}
    for (const [sym, rows] of Object.entries(data)) {
      out[sym] = rows.map((r) => ({ ...r, date: new Date(r.date) }))
    }
    const value = { data: out, failed: failed || {}, fx: fx || null, rates: rates || (fx ? { USD: fx } : {}) }
    cacheMemo = { key, value }
    return value
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
  const syms = [...new Set([
    ...instruments.map(requestSymbol),
    ...instruments.map(chartSymbol),
  ].filter(Boolean))]
  // one FX pair per non-EUR currency actually in use
  const needed = [...new Set(instruments.map((i) => i.currency).filter((c) => c && c !== 'EUR'))]
  const fxSyms = needed.map(fxPair)
  const all = [...syms, ...fxSyms]
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
    const msg = body.message || ''
    if (/credit|limit|429/i.test(msg)) {
      throw new Error(
        `Twelve Data rate limit reached: ${msg} Each symbol costs one API credit and the free plan allows 8 per minute — wait a minute, then press Update data again.`
      )
    }
    throw new Error(msg || 'The API rejected the request — check your API key in Settings.')
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
  const rates = {}
  for (const c of needed) {
    const rows = parseSeries(bySym[fxPair(c)])
    if (rows?.length) {
      data[fxPair(c)] = rows
      rates[c] = rows[rows.length - 1].close
    }
  }
  const fx = rates.USD ?? null

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      stamp: todayStamp(),
      failed,
      fx,
      rates,
      data: Object.fromEntries(Object.entries(data).map(([sym, rows]) => [
        sym, rows.map((r) => ({ ...r, date: r.date.toISOString() })),
      ])),
    }))
  } catch { /* cache is an optimization */ }
  cacheMemo = { key: '', value: null }
  try { window.dispatchEvent(new Event('lti-real-updated')) } catch { /* SSR/tests */ }

  return { data, failed, fx, rates }
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

// Why a row has no live price, in the user's words, using the API's own
// message when there is one. Returns null when the price is fine.
export function priceProblem(inst, liveData) {
  if (inst.type === 'private') {
    return inst.manualPrice > 0 ? null : {
      short: 'Private company',
      detail: 'Not listed on any exchange, so no price feed exists. Enter a manual price (for example your last known valuation per share) to include it in your totals.',
    }
  }
  if (!inst.symbol) {
    return { short: 'No symbol set', detail: 'Add the ticker in Edit, or set a manual price.' }
  }
  const sym = requestSymbol(inst)
  if (liveData?.data?.[sym]?.length) return null
  const apiMessage = liveData?.failed?.[sym]
  if (!liveData) {
    return { short: 'No market-data key', detail: 'Add a Twelve Data key in Settings, or set a manual price.' }
  }
  const international = Boolean(inst.exchange)
  return {
    short: international ? `${inst.exchange} not on your plan` : 'Symbol not returned',
    detail: (apiMessage ? `The API said: “${apiMessage}” ` : '') + (international
      ? 'Twelve Data\'s free plan covers US stocks, forex and crypto; European listings such as XETRA and LSE need a paid plan (a handful of trial symbols are the exception, which is why one or two may work). Set a manual price to keep your totals right, and optionally add a US-listed chart proxy so you still get a chart.'
      : 'Check the ticker spelling, or set a manual price.'),
    canProxy: true,
  }
}

// EUR value of one instrument position, via the FX rates table.
function positionValueEUR(inst, priceInfo, rates) {
  if (priceInfo.price == null || !inst.shares) return null
  return toEUR(priceInfo.price * inst.shares, inst.currency, rates)
}

// Summarises the whole real portfolio at current prices.
export function realSummary(instruments, liveData) {
  const rates = liveData?.rates || (liveData?.fx ? { USD: liveData.fx } : {})
  let valueEUR = 0
  let costEUR = 0
  let priced = 0
  let unpriced = 0
  const rows = instruments.map((inst) => {
    const p = instrumentPrice(inst, liveData)
    const value = p.price != null ? p.price * inst.shares : null
    const vEUR = positionValueEUR(inst, p, rates)
    const cost = inst.avgCost * inst.shares
    const cEUR = toEUR(cost, inst.currency, rates)
    if (vEUR != null && inst.shares > 0) { valueEUR += vEUR; priced++ } else if (inst.shares > 0) { unpriced++ }
    if (cEUR != null && inst.shares > 0) costEUR += cEUR
    return {
      ...inst,
      priceInfo: p,
      priceEUR: toEUR(p.price, inst.currency, rates),
      avgCostEUR: toEUR(inst.avgCost, inst.currency, rates),
      value,
      valueEUR: vEUR,
      cost,
      costEUR: cEUR,
      gain: value != null && cost > 0 ? value - cost : null,
      gainEUR: vEUR != null && cEUR > 0 ? vEUR - cEUR : null,
      gainPct: value != null && cost > 0 ? ((value - cost) / cost) * 100 : null,
    }
  })
  return { rows, valueEUR, costEUR, gainEUR: valueEUR - costEUR, priced, unpriced, rates, fx: rates.USD ?? null }
}

// Compact context block so the analyst chat and the per-position reads see
// the user's REAL holdings (marked clearly as real, not the simulator).
export function buildRealContext(instruments, liveData, summary, pnl) {
  const lines = []
  lines.push('# THE USER\'S REAL PORTFOLIO (actual money, tracked in the "My investments" dashboard)')
  lines.push('This is separate from the practice simulator. Be a teacher: explain reasoning and risks; never give a direct instruction to buy or sell with real money.')
  if (summary.valueEUR > 0) {
    lines.push(`Approximate total of priced positions: €${summary.valueEUR.toFixed(0)}${summary.unpriced ? ` (+${summary.unpriced} position(s) without a price)` : ''}. EUR/USD ${summary.fx ? summary.fx.toFixed(4) : 'unknown'}.`)
  }
  if (pnl) {
    const bits = PNL_WINDOWS
      .map((w) => (pnl[w.key] ? `${w.label} ${pnl[w.key].abs >= 0 ? '+' : ''}${pnl[w.key].abs.toFixed(0)} EUR (${pnl[w.key].pct != null ? (pnl[w.key].pct >= 0 ? '+' : '') + pnl[w.key].pct.toFixed(2) + '%' : 'n/a'})` : null))
      .filter(Boolean)
    if (bits.length) lines.push('Portfolio P&L by period: ' + bits.join(' · '))
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

// ------------------------------------------------------------------
// Wealth analytics: the EUR value of the CURRENT holdings evaluated over
// history. Assumes today's share counts across the window (purchase dates
// are unknown), converts USD positions through the EUR/USD series day by
// day, and adds manual-priced positions (e.g. private companies) as a
// constant contribution.

export function portfolioHistory(instruments, liveData) {
  const owned = instruments.filter((i) => i.shares > 0)
  if (!owned.length || !liveData?.data) return []
  const rates = liveData.rates || (liveData.fx ? { USD: liveData.fx } : {})
  // daily rate lookup per currency, so history is currency-correct
  const fxMaps = {}
  for (const c of CURRENCIES) {
    const rows = liveData.data[fxPair(c)]
    if (rows?.length) fxMaps[c] = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r.close]))
  }

  const live = []
  let manualEUR = 0
  const dates = new Set()
  for (const inst of owned) {
    const sym = requestSymbol(inst)
    const rows = sym && liveData.data[sym]
    if (rows?.length) {
      const map = new Map(rows.map((r) => [r.date.toISOString().slice(0, 10), r.close]))
      live.push({ inst, map, first: rows[0].close })
      for (const k of map.keys()) dates.add(k)
    } else if (inst.manualPrice > 0) {
      manualEUR += toEUR(inst.manualPrice * inst.shares, inst.currency, rates) || 0
    }
  }
  if (!live.length) return []

  const sorted = [...dates].sort().slice(-400)
  const lastClose = new Map()
  const lastRate = { ...rates }
  const out = []
  for (const day of sorted) {
    for (const [c, map] of Object.entries(fxMaps)) {
      if (map.has(day)) lastRate[c] = map.get(day)
    }
    let total = manualEUR
    let complete = true
    for (const { inst, map, first } of live) {
      if (map.has(day)) lastClose.set(inst.id, map.get(day))
      const close = lastClose.get(inst.id) ?? first
      const eur = toEUR(close * inst.shares, inst.currency, lastRate)
      if (eur == null) complete = false
      else total += eur
    }
    if (complete) out.push({ date: new Date(day + 'T00:00:00Z'), value: total })
  }
  return out
}

// P&L over standard windows of TRADING days, from the history above.
export const PNL_WINDOWS = [
  { key: 'day', label: 'Today', n: 1 },
  { key: 'week', label: '1 week', n: 5 },
  { key: 'month', label: '1 month', n: 21 },
  { key: 'quarter', label: '3 months', n: 63 },
  { key: 'year', label: '1 year', n: 252 },
]

export function periodPnL(history) {
  if (!history || history.length < 2) return null
  const last = history[history.length - 1].value
  const out = {}
  for (const w of PNL_WINDOWS) {
    const i = history.length - 1 - w.n
    if (i < 0) { out[w.key] = null; continue }
    const base = history[i].value
    out[w.key] = { abs: last - base, pct: base > 0 ? ((last - base) / base) * 100 : null }
  }
  return out
}
