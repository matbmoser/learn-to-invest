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

// Technical indicators. Each returns an array aligned with the input closes;
// positions without enough history are null.

export function sma(values, period) {
  const out = new Array(values.length).fill(null)
  let sum = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]
    if (i >= period) sum -= values[i - period]
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null)
  const k = 2 / (period + 1)
  let prev = null
  for (let i = 0; i < values.length; i++) {
    if (i === period - 1) {
      let s = 0
      for (let j = 0; j < period; j++) s += values[i - j]
      prev = s / period
      out[i] = prev
    } else if (i >= period) {
      prev = values[i] * k + prev * (1 - k)
      out[i] = prev
    }
  }
  return out
}

export function rsi(values, period = 14) {
  const out = new Array(values.length).fill(null)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    const gain = Math.max(0, change)
    const loss = Math.max(0, -change)
    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
      if (i === period) out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
    }
  }
  return out
}

export function macd(values, fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = ema(values, fast)
  const emaSlow = ema(values, slow)
  const macdLine = values.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null
  )
  // Signal = EMA of the MACD line, computed over its non-null tail
  const firstIdx = macdLine.findIndex((v) => v != null)
  const signal = new Array(values.length).fill(null)
  if (firstIdx >= 0) {
    const tail = macdLine.slice(firstIdx)
    const sig = ema(tail, signalPeriod)
    for (let i = 0; i < sig.length; i++) signal[firstIdx + i] = sig[i]
  }
  const histogram = macdLine.map((v, i) =>
    v != null && signal[i] != null ? v - signal[i] : null
  )
  return { macdLine, signal, histogram }
}

export function bollinger(values, period = 20, mult = 2) {
  const mid = sma(values, period)
  const upper = new Array(values.length).fill(null)
  const lower = new Array(values.length).fill(null)
  for (let i = period - 1; i < values.length; i++) {
    let sumSq = 0
    for (let j = 0; j < period; j++) sumSq += (values[i - j] - mid[i]) ** 2
    const sd = Math.sqrt(sumSq / period)
    upper[i] = mid[i] + mult * sd
    lower[i] = mid[i] - mult * sd
  }
  return { mid, upper, lower }
}

export function maxDrawdown(values) {
  let peak = -Infinity
  let maxDd = 0
  for (const v of values) {
    if (v > peak) peak = v
    const dd = (peak - v) / peak
    if (dd > maxDd) maxDd = dd
  }
  return maxDd
}

// Annualized volatility from daily closes (≈252 trading days/year)
export function annualizedVol(values) {
  if (values.length < 2) return 0
  const rets = []
  for (let i = 1; i < values.length; i++) rets.push(Math.log(values[i] / values[i - 1]))
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)
  return Math.sqrt(variance) * Math.sqrt(252)
}
