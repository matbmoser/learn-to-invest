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

// Live market data via Twelve Data (free API key from https://twelvedata.com).
// The key is supplied by the user in Settings, stored only in their browser,
// and sent only to Twelve Data. Daily candles are cached in localStorage for
// the rest of the day so a session costs ~8 API credits — well inside the free
// tier (800/day, 8/min). All 8 symbols are fetched in a single batch request
// to respect the 8-credits-per-minute limit.

export const LIVE_COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', profile: 'iPhone, Mac, services — the classic quality large-cap.' },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology', profile: 'Windows, Office, Azure cloud — subscription economics at scale.' },
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology', profile: 'AI and graphics chips — high growth, high expectations.' },
  { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer Discretionary', profile: 'E-commerce and AWS cloud computing.' },
  { ticker: 'TSLA', name: 'Tesla', sector: 'Consumer Discretionary', profile: 'Electric vehicles and energy — famously volatile.' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', profile: 'The largest US bank — rate-sensitive financial.' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', profile: 'Pharma and medtech — a classic defensive stock.' },
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples', profile: 'Global beverages — slow, steady, dividend-paying.' },
]

const CACHE_KEY = 'lti-live-cache-v1'

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

export function getCachedLiveData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { stamp, data } = JSON.parse(raw)
    if (stamp !== todayStamp()) return null
    return reviveDates(data)
  } catch {
    return null
  }
}

function reviveDates(data) {
  const out = {}
  for (const [sym, rows] of Object.entries(data)) {
    out[sym] = rows.map((r) => ({ ...r, date: new Date(r.date) }))
  }
  return out
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
    .reverse() // API returns newest first; the app expects oldest first
}

// Fetches ~400 daily candles for all live tickers in one batch request.
// Returns { seriesBySymbol } or throws an Error with a user-readable message.
export async function fetchLiveData(apiKey) {
  const symbols = LIVE_COMPANIES.map((c) => c.ticker).join(',')
  const url = `https://api.twelvedata.com/time_series?symbol=${symbols}&interval=1day&outputsize=400&apikey=${encodeURIComponent(apiKey)}`

  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Could not reach Twelve Data. Check your internet connection (or an ad-blocker may be blocking the request).')
  }
  if (!res.ok) throw new Error(`Twelve Data returned HTTP ${res.status}.`)
  const body = await res.json()

  // Batch responses are keyed by symbol; single-symbol responses are flat.
  // A top-level error (bad/missing key) looks like { status: 'error', message }.
  if (body.status === 'error') {
    throw new Error(body.message || 'The API rejected the request — double-check your API key.')
  }

  const data = {}
  const failed = []
  for (const c of LIVE_COMPANIES) {
    const series = parseSeries(body[c.ticker])
    if (series && series.length >= 30) data[c.ticker] = series
    else failed.push(c.ticker + (body[c.ticker]?.message ? ` (${body[c.ticker].message})` : ''))
  }

  if (Object.keys(data).length === 0) {
    throw new Error('No data came back for any symbol. ' + (failed[0] || 'Check that your API key is valid.'))
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      stamp: todayStamp(),
      data: Object.fromEntries(
        Object.entries(data).map(([sym, rows]) => [
          sym, rows.map((r) => ({ ...r, date: r.date.toISOString() })),
        ])
      ),
    }))
  } catch {
    // cache is an optimization; ignore quota errors
  }

  return { data, failed }
}

export function clearLiveCache() {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
}
