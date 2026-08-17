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

/* ==========================================================================
   Extended indicator library.

   The functions above take a plain array of closes. The ones below need the
   full candle (high / low / close / volume), so they take the OHLC series
   directly. Every function returns arrays aligned to the input, with null
   wherever there is not yet enough history.
   ========================================================================== */

// Wilder's smoothing: the running average used by RSI, ATR and ADX. It is an
// EMA with alpha = 1/period, seeded with a simple average of the first window.
function wilder(values, period) {
  const out = new Array(values.length).fill(null)
  let sum = 0
  let prev = null
  for (let i = 0; i < values.length; i++) {
    if (values[i] == null) continue
    if (prev == null) {
      sum += values[i]
      if (i === period - 1) { prev = sum / period; out[i] = prev }
    } else {
      prev = (prev * (period - 1) + values[i]) / period
      out[i] = prev
    }
  }
  return out
}

const highest = (arr, i, n) => {
  let m = -Infinity
  for (let j = i - n + 1; j <= i; j++) if (arr[j] > m) m = arr[j]
  return m
}
const lowest = (arr, i, n) => {
  let m = Infinity
  for (let j = i - n + 1; j <= i; j++) if (arr[j] < m) m = arr[j]
  return m
}

// Weighted moving average — linear weights, heaviest on the most recent bar.
export function wma(values, period) {
  const out = new Array(values.length).fill(null)
  const denom = (period * (period + 1)) / 2
  for (let i = period - 1; i < values.length; i++) {
    let acc = 0
    for (let j = 0; j < period; j++) acc += values[i - j] * (period - j)
    out[i] = acc / denom
  }
  return out
}

// True range: the day's full span, including any gap from yesterday's close.
export function trueRange(candles) {
  return candles.map((c, i) => {
    if (i === 0) return c.high - c.low
    const pc = candles[i - 1].close
    return Math.max(c.high - c.low, Math.abs(c.high - pc), Math.abs(c.low - pc))
  })
}

// Average True Range — the standard volatility-in-price-units measure.
export function atr(candles, period = 14) {
  return wilder(trueRange(candles), period)
}

// Stochastic oscillator. %K is where the close sits inside the recent range;
// %D smooths it. `smoothK` of 3 gives the common "slow" stochastic.
export function stochastic(candles, period = 14, smoothK = 3, smoothD = 3) {
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const raw = new Array(candles.length).fill(null)
  for (let i = period - 1; i < candles.length; i++) {
    const hh = highest(highs, i, period)
    const ll = lowest(lows, i, period)
    raw[i] = hh === ll ? 50 : ((candles[i].close - ll) / (hh - ll)) * 100
  }
  const k = smoothK > 1 ? smaNullable(raw, smoothK) : raw
  const d = smaNullable(k, smoothD)
  return { k, d }
}

// SMA that tolerates leading nulls (used to chain smoothing steps).
function smaNullable(values, period) {
  const out = new Array(values.length).fill(null)
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) continue
    let acc = 0
    let ok = true
    for (let j = 0; j < period; j++) {
      const v = values[i - j]
      if (v == null) { ok = false; break }
      acc += v
    }
    if (ok) out[i] = acc / period
  }
  return out
}

// Williams %R — the stochastic mirrored onto a -100..0 scale.
export function williamsR(candles, period = 14) {
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const out = new Array(candles.length).fill(null)
  for (let i = period - 1; i < candles.length; i++) {
    const hh = highest(highs, i, period)
    const ll = lowest(lows, i, period)
    out[i] = hh === ll ? -50 : ((hh - candles[i].close) / (hh - ll)) * -100
  }
  return out
}

const typicalPrice = (c) => (c.high + c.low + c.close) / 3

// Commodity Channel Index — how far price sits from its average, in units of
// mean deviation. Unbounded, but ±100 are the conventional thresholds.
export function cci(candles, period = 20) {
  const tp = candles.map(typicalPrice)
  const avg = sma(tp, period)
  const out = new Array(candles.length).fill(null)
  for (let i = period - 1; i < candles.length; i++) {
    let dev = 0
    for (let j = 0; j < period; j++) dev += Math.abs(tp[i - j] - avg[i])
    const meanDev = dev / period
    out[i] = meanDev === 0 ? 0 : (tp[i] - avg[i]) / (0.015 * meanDev)
  }
  return out
}

// Rate of change — momentum as a percentage over N bars.
export function roc(values, period = 12) {
  const out = new Array(values.length).fill(null)
  for (let i = period; i < values.length; i++) {
    out[i] = ((values[i] - values[i - period]) / values[i - period]) * 100
  }
  return out
}

// Average Directional Index with the directional indicators (+DI / -DI).
// ADX measures trend STRENGTH only; +DI vs -DI gives the direction.
export function adx(candles, period = 14) {
  const plusDM = new Array(candles.length).fill(0)
  const minusDM = new Array(candles.length).fill(0)
  for (let i = 1; i < candles.length; i++) {
    const up = candles[i].high - candles[i - 1].high
    const down = candles[i - 1].low - candles[i].low
    plusDM[i] = up > down && up > 0 ? up : 0
    minusDM[i] = down > up && down > 0 ? down : 0
  }
  const trS = wilder(trueRange(candles), period)
  const plusS = wilder(plusDM, period)
  const minusS = wilder(minusDM, period)

  const plusDI = new Array(candles.length).fill(null)
  const minusDI = new Array(candles.length).fill(null)
  const dx = new Array(candles.length).fill(null)
  for (let i = 0; i < candles.length; i++) {
    if (trS[i] == null || plusS[i] == null || minusS[i] == null || trS[i] === 0) continue
    plusDI[i] = (plusS[i] / trS[i]) * 100
    minusDI[i] = (minusS[i] / trS[i]) * 100
    const sum = plusDI[i] + minusDI[i]
    dx[i] = sum === 0 ? 0 : (Math.abs(plusDI[i] - minusDI[i]) / sum) * 100
  }
  // ADX is Wilder smoothing applied again, to DX.
  const dxVals = dx.filter((v) => v != null)
  const firstDx = dx.findIndex((v) => v != null)
  const smoothed = wilder(dxVals, period)
  const adxOut = new Array(candles.length).fill(null)
  if (firstDx >= 0) for (let i = 0; i < smoothed.length; i++) adxOut[firstDx + i] = smoothed[i]

  return { adx: adxOut, plusDI, minusDI }
}

// On-Balance Volume — a running total that adds volume on up days and
// subtracts it on down days. The slope matters; the absolute level does not.
export function obv(candles) {
  const out = new Array(candles.length).fill(null)
  let acc = 0
  out[0] = 0
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].close > candles[i - 1].close) acc += candles[i].volume
    else if (candles[i].close < candles[i - 1].close) acc -= candles[i].volume
    out[i] = acc
  }
  return out
}

// Money Flow Index — RSI weighted by volume, so it measures conviction as
// well as direction. Bounded 0-100.
export function mfi(candles, period = 14) {
  const tp = candles.map(typicalPrice)
  const pos = new Array(candles.length).fill(0)
  const neg = new Array(candles.length).fill(0)
  for (let i = 1; i < candles.length; i++) {
    const flow = tp[i] * candles[i].volume
    if (tp[i] > tp[i - 1]) pos[i] = flow
    else if (tp[i] < tp[i - 1]) neg[i] = flow
  }
  const out = new Array(candles.length).fill(null)
  for (let i = period; i < candles.length; i++) {
    let p = 0
    let n = 0
    for (let j = 0; j < period; j++) { p += pos[i - j]; n += neg[i - j] }
    out[i] = n === 0 ? 100 : 100 - 100 / (1 + p / n)
  }
  return out
}

// Rolling VWAP — the volume-weighted average price over the last N bars.
// (True session VWAP resets daily; with daily candles a rolling window is the
// meaningful equivalent.)
export function vwap(candles, period = 20) {
  const out = new Array(candles.length).fill(null)
  for (let i = period - 1; i < candles.length; i++) {
    let pv = 0
    let v = 0
    for (let j = 0; j < period; j++) {
      const c = candles[i - j]
      pv += typicalPrice(c) * c.volume
      v += c.volume
    }
    out[i] = v === 0 ? null : pv / v
  }
  return out
}

// Donchian channel — the highest high and lowest low of the last N bars.
// The original breakout system, and the cleanest visual of support/resistance.
export function donchian(candles, period = 20) {
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const upper = new Array(candles.length).fill(null)
  const lower = new Array(candles.length).fill(null)
  const mid = new Array(candles.length).fill(null)
  for (let i = period - 1; i < candles.length; i++) {
    upper[i] = highest(highs, i, period)
    lower[i] = lowest(lows, i, period)
    mid[i] = (upper[i] + lower[i]) / 2
  }
  return { upper, lower, mid }
}

// Keltner channel — an EMA envelope built from ATR rather than standard
// deviation, so it reacts to true range instead of closing scatter.
export function keltner(candles, period = 20, atrPeriod = 10, mult = 2) {
  const mid = ema(candles.map((c) => c.close), period)
  const a = atr(candles, atrPeriod)
  const upper = new Array(candles.length).fill(null)
  const lower = new Array(candles.length).fill(null)
  for (let i = 0; i < candles.length; i++) {
    if (mid[i] == null || a[i] == null) continue
    upper[i] = mid[i] + mult * a[i]
    lower[i] = mid[i] - mult * a[i]
  }
  return { mid, upper, lower }
}

// Bollinger %B (where price sits in the band: 0 = lower, 1 = upper) and
// bandwidth (how wide the bands are — the squeeze detector).
export function bollingerExtras(values, period = 20, mult = 2) {
  const b = bollinger(values, period, mult)
  const percentB = new Array(values.length).fill(null)
  const bandwidth = new Array(values.length).fill(null)
  for (let i = 0; i < values.length; i++) {
    if (b.upper[i] == null) continue
    const span = b.upper[i] - b.lower[i]
    percentB[i] = span === 0 ? 0.5 : (values[i] - b.lower[i]) / span
    bandwidth[i] = b.mid[i] === 0 ? null : (span / b.mid[i]) * 100
  }
  return { ...b, percentB, bandwidth }
}

// Parabolic SAR — a trailing stop that flips side when price crosses it.
export function psar(candles, step = 0.02, max = 0.2) {
  const out = new Array(candles.length).fill(null)
  if (candles.length < 2) return out
  let bull = candles[1].close >= candles[0].close
  let af = step
  let ep = bull ? candles[0].high : candles[0].low
  let sar = bull ? candles[0].low : candles[0].high
  out[0] = sar

  for (let i = 1; i < candles.length; i++) {
    sar += af * (ep - sar)
    // SAR may never move inside the last two candles' range.
    const lo = Math.min(candles[i - 1].low, candles[Math.max(0, i - 2)].low)
    const hi = Math.max(candles[i - 1].high, candles[Math.max(0, i - 2)].high)
    if (bull) sar = Math.min(sar, lo)
    else sar = Math.max(sar, hi)

    const flip = bull ? candles[i].low < sar : candles[i].high > sar
    if (flip) {
      bull = !bull
      sar = ep
      af = step
      ep = bull ? candles[i].high : candles[i].low
    } else if (bull && candles[i].high > ep) {
      ep = candles[i].high
      af = Math.min(af + step, max)
    } else if (!bull && candles[i].low < ep) {
      ep = candles[i].low
      af = Math.min(af + step, max)
    }
    out[i] = sar
  }
  return out
}
