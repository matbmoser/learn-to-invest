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

// Pattern detection and signal back-testing.
//
// The point of this module is NOT to predict prices. It is to let a learner
// measure what actually happened after a signal fired historically, and to
// compare that against the baseline of every other day — so the honest答案
// "this pattern gives you no edge" is as easy to discover as any other.

import {
  adx, atr, bollinger, donchian, ema, macd, rsi, sma,
} from './indicators.js'

const body = (c) => Math.abs(c.close - c.open)
const range = (c) => c.high - c.low
const upperWick = (c) => c.high - Math.max(c.open, c.close)
const lowerWick = (c) => Math.min(c.open, c.close) - c.low
const isUp = (c) => c.close >= c.open

/* ============================ candlestick patterns ============================
   Each detector returns a boolean for index i. They are deliberately strict:
   loose definitions match half the chart and mean nothing. */

export const CANDLES = {
  bullishEngulfing: (c, i) => {
    if (i < 1) return false
    const p = c[i - 1]
    const n = c[i]
    return !isUp(p) && isUp(n) &&
      n.close > p.open && n.open < p.close &&
      body(n) > body(p) * 1.1
  },
  bearishEngulfing: (c, i) => {
    if (i < 1) return false
    const p = c[i - 1]
    const n = c[i]
    return isUp(p) && !isUp(n) &&
      n.open > p.close && n.close < p.open &&
      body(n) > body(p) * 1.1
  },
  hammer: (c, i) => {
    const n = c[i]
    if (range(n) === 0) return false
    // Long lower wick, small body near the top, after a decline.
    const declined = i >= 5 && c[i].close < c[i - 5].close
    return declined &&
      lowerWick(n) > body(n) * 2 &&
      upperWick(n) < body(n) * 0.6 &&
      body(n) / range(n) < 0.4
  },
  shootingStar: (c, i) => {
    const n = c[i]
    if (range(n) === 0) return false
    const advanced = i >= 5 && c[i].close > c[i - 5].close
    return advanced &&
      upperWick(n) > body(n) * 2 &&
      lowerWick(n) < body(n) * 0.6 &&
      body(n) / range(n) < 0.4
  },
  doji: (c, i) => {
    const n = c[i]
    return range(n) > 0 && body(n) / range(n) < 0.08
  },
  morningStar: (c, i) => {
    if (i < 2) return false
    const [a, b, d] = [c[i - 2], c[i - 1], c[i]]
    return !isUp(a) && body(b) < body(a) * 0.5 && isUp(d) &&
      d.close > (a.open + a.close) / 2
  },
  eveningStar: (c, i) => {
    if (i < 2) return false
    const [a, b, d] = [c[i - 2], c[i - 1], c[i]]
    return isUp(a) && body(b) < body(a) * 0.5 && !isUp(d) &&
      d.close < (a.open + a.close) / 2
  },
  threeWhiteSoldiers: (c, i) => {
    if (i < 2) return false
    return [0, 1, 2].every((k) => isUp(c[i - k])) &&
      c[i].close > c[i - 1].close && c[i - 1].close > c[i - 2].close &&
      [0, 1, 2].every((k) => body(c[i - k]) > range(c[i - k]) * 0.6)
  },
  threeBlackCrows: (c, i) => {
    if (i < 2) return false
    return [0, 1, 2].every((k) => !isUp(c[i - k])) &&
      c[i].close < c[i - 1].close && c[i - 1].close < c[i - 2].close &&
      [0, 1, 2].every((k) => body(c[i - k]) > range(c[i - k]) * 0.6)
  },
  bullishHarami: (c, i) => {
    if (i < 1) return false
    const p = c[i - 1]
    const n = c[i]
    return !isUp(p) && isUp(n) &&
      n.open > p.close && n.close < p.open && body(n) < body(p) * 0.6
  },
}

/* ================================ swing points ===============================
   A pivot high is a bar whose high exceeds the `w` bars either side of it.
   Everything structural (double tops, head and shoulders) is built on these. */

export function pivots(candles, w = 5) {
  const highs = []
  const lows = []
  for (let i = w; i < candles.length - w; i++) {
    let isHigh = true
    let isLow = true
    for (let k = 1; k <= w; k++) {
      if (candles[i].high <= candles[i - k].high || candles[i].high <= candles[i + k].high) isHigh = false
      if (candles[i].low >= candles[i - k].low || candles[i].low >= candles[i + k].low) isLow = false
    }
    if (isHigh) highs.push(i)
    if (isLow) lows.push(i)
  }
  return { highs, lows }
}

// Structural chart patterns, returned as ranges so they can be drawn.
export function chartPatterns(candles, w = 5) {
  const { highs, lows } = pivots(candles, w)
  const out = []
  const near = (a, b, tol = 0.03) => Math.abs(a - b) / ((a + b) / 2) < tol

  // Double top / bottom: two similar pivots separated by a meaningful gap.
  for (let i = 1; i < highs.length; i++) {
    const a = highs[i - 1]
    const b = highs[i]
    if (b - a < w * 2) continue
    if (near(candles[a].high, candles[b].high)) {
      out.push({ type: 'Double top', bias: 'bearish', from: a, to: b, level: candles[b].high })
    }
  }
  for (let i = 1; i < lows.length; i++) {
    const a = lows[i - 1]
    const b = lows[i]
    if (b - a < w * 2) continue
    if (near(candles[a].low, candles[b].low)) {
      out.push({ type: 'Double bottom', bias: 'bullish', from: a, to: b, level: candles[b].low })
    }
  }

  // Head and shoulders: three pivot highs, middle highest, shoulders similar.
  for (let i = 2; i < highs.length; i++) {
    const [l, h, r] = [highs[i - 2], highs[i - 1], highs[i]]
    const [lh, hh, rh] = [candles[l].high, candles[h].high, candles[r].high]
    if (hh > lh * 1.02 && hh > rh * 1.02 && near(lh, rh, 0.04)) {
      out.push({ type: 'Head and shoulders', bias: 'bearish', from: l, to: r, level: Math.min(lh, rh) })
    }
  }
  for (let i = 2; i < lows.length; i++) {
    const [l, h, r] = [lows[i - 2], lows[i - 1], lows[i]]
    const [ll, hl, rl] = [candles[l].low, candles[h].low, candles[r].low]
    if (hl < ll * 0.98 && hl < rl * 0.98 && near(ll, rl, 0.04)) {
      out.push({ type: 'Inverse head and shoulders', bias: 'bullish', from: l, to: r, level: Math.max(ll, rl) })
    }
  }

  return out.sort((a, b) => a.to - b.to)
}

/* ================================== signals ==================================
   A signal is a named condition that is either true or false on a given bar.
   `fires` returns the indices where it fired. */

function crossedAbove(a, b, i) {
  return a[i] != null && b[i] != null && a[i - 1] != null && b[i - 1] != null &&
    a[i - 1] <= b[i - 1] && a[i] > b[i]
}

export const SIGNAL_GROUPS = [
  { id: 'momentum', name: 'Momentum & mean reversion' },
  { id: 'trend', name: 'Trend & crossovers' },
  { id: 'candle', name: 'Candlestick patterns' },
  { id: 'breakout', name: 'Breakouts & volatility' },
  { id: 'seasonal', name: 'Calendar effects' },
]

export const SIGNALS = [
  {
    id: 'rsi-oversold', group: 'momentum', name: 'RSI drops below 30',
    idea: 'The classic "oversold bounce" trade: selling has been so one-sided that a rebound is due.',
    caution: 'In a genuine downtrend, oversold stays oversold. This is the signal that most often lures beginners into catching falling knives.',
    fires: (c) => {
      const r = rsi(c.map((d) => d.close), 14)
      return idx(c, (i) => r[i] != null && r[i - 1] != null && r[i - 1] >= 30 && r[i] < 30)
    },
  },
  {
    id: 'rsi-overbought', group: 'momentum', name: 'RSI rises above 70',
    idea: 'Often read as a signal to take profits or fade the move.',
    caution: 'Strong trends stay overbought for weeks. Shorting every 70 print is a reliable way to lose money in a bull market.',
    fires: (c) => {
      const r = rsi(c.map((d) => d.close), 14)
      return idx(c, (i) => r[i] != null && r[i - 1] != null && r[i - 1] <= 70 && r[i] > 70)
    },
  },
  {
    id: 'three-down', group: 'momentum', name: 'Three consecutive down days',
    idea: 'A short-term mean-reversion setup: short runs of selling often exhaust themselves.',
    caution: 'Also the first three days of every major decline. Nothing distinguishes the two at the time.',
    fires: (c) => idx(c, (i) => i >= 3 &&
      c[i].close < c[i - 1].close && c[i - 1].close < c[i - 2].close && c[i - 2].close < c[i - 3].close),
  },
  {
    id: 'golden-cross', group: 'trend', name: 'Golden cross (50-day crosses above 200-day)',
    idea: 'The most famous long-term bullish signal in technical analysis.',
    caution: 'It is extremely lagging — by the time it triggers, a large part of the move has already happened. It also fires late in ranges, producing whipsaws.',
    fires: (c) => {
      const cl = c.map((d) => d.close)
      const f = sma(cl, 50)
      const s = sma(cl, 200)
      return idx(c, (i) => crossedAbove(f, s, i))
    },
  },
  {
    id: 'death-cross', group: 'trend', name: 'Death cross (50-day crosses below 200-day)',
    idea: 'The bearish mirror of the golden cross, widely reported in the financial press.',
    caution: 'Frequently marks the bottom rather than the start of a decline, precisely because it is so lagging.',
    fires: (c) => {
      const cl = c.map((d) => d.close)
      const f = sma(cl, 50)
      const s = sma(cl, 200)
      return idx(c, (i) => crossedAbove(s, f, i))
    },
  },
  {
    id: 'macd-cross', group: 'trend', name: 'MACD crosses above its signal line',
    idea: 'A momentum-turning-up trigger, far more responsive than a moving-average cross.',
    caution: 'Fires constantly in sideways markets. Its value depends almost entirely on filtering by trend first.',
    fires: (c) => {
      const m = macd(c.map((d) => d.close))
      return idx(c, (i) => crossedAbove(m.macdLine, m.signal, i))
    },
  },
  {
    id: 'price-above-200', group: 'trend', name: 'Price crosses above the 200-day average',
    idea: 'The standard regime filter: above the 200-day is treated as a bull market, below as a bear market.',
    caution: 'Whipsaws badly when price oscillates around the line, which is exactly when you most want clarity.',
    fires: (c) => {
      const cl = c.map((d) => d.close)
      const s = sma(cl, 200)
      return idx(c, (i) => crossedAbove(cl, s, i))
    },
  },
  {
    id: 'adx-trend-start', group: 'trend', name: 'ADX rises through 25 with +DI on top',
    idea: 'A trend is establishing itself and buyers are in control — the moment trend-following tools start working.',
    caution: 'ADX is slow. Confirmation of strength often arrives when the move is already mature.',
    fires: (c) => {
      const a = adx(c)
      return idx(c, (i) => a.adx[i] != null && a.adx[i - 1] != null &&
        a.adx[i - 1] < 25 && a.adx[i] >= 25 && a.plusDI[i] > a.minusDI[i])
    },
  },
  {
    id: 'bullish-engulfing', group: 'candle', name: 'Bullish engulfing candle',
    idea: 'A large up day that completely swallows the previous down day — buyers overwhelming sellers in a single session.',
    caution: 'One of the most cited candle patterns, and one of the weakest in isolation. Context (where it appears) matters far more than the shape.',
    fires: (c) => idx(c, (i) => CANDLES.bullishEngulfing(c, i)),
  },
  {
    id: 'bearish-engulfing', group: 'candle', name: 'Bearish engulfing candle',
    idea: 'The mirror image: sellers overwhelming buyers, often read as a reversal warning.',
    caution: 'Same weakness — a shape without context is close to noise.',
    fires: (c) => idx(c, (i) => CANDLES.bearishEngulfing(c, i)),
  },
  {
    id: 'hammer', group: 'candle', name: 'Hammer after a decline',
    idea: 'A long lower wick shows sellers pushed price down and were rejected — a classic capitulation shape.',
    caution: 'Requires a preceding decline to mean anything, and even then it is a single bar of evidence.',
    fires: (c) => idx(c, (i) => CANDLES.hammer(c, i)),
  },
  {
    id: 'morning-star', group: 'candle', name: 'Morning star (three-bar reversal)',
    idea: 'A down day, an indecisive small bar, then a strong up day — the textbook bottoming sequence.',
    caution: 'Rare, which is good for specificity and bad for sample size. Small samples produce impressive-looking statistics that do not repeat.',
    fires: (c) => idx(c, (i) => CANDLES.morningStar(c, i)),
  },
  {
    id: 'three-soldiers', group: 'candle', name: 'Three white soldiers',
    idea: 'Three strong up days in a row, read as decisive buying pressure.',
    caution: 'Also just "the market went up three days", which is common and not obviously informative.',
    fires: (c) => idx(c, (i) => CANDLES.threeWhiteSoldiers(c, i)),
  },
  {
    id: 'donchian-breakout', group: 'breakout', name: '20-day high breakout',
    idea: 'Price closing above its highest level in 20 days — the original Turtle Traders entry.',
    caution: 'Breakout systems win rarely and rely on a few very large trends to pay for many small losses.',
    fires: (c) => {
      const d = donchian(c, 20)
      return idx(c, (i) => d.upper[i - 1] != null && c[i].close > d.upper[i - 1])
    },
  },
  {
    id: 'donchian-breakdown', group: 'breakout', name: '20-day low breakdown',
    idea: 'The bearish mirror — a close below the 20-day low.',
    caution: 'Often marks short-term capitulation lows rather than the start of further decline.',
    fires: (c) => {
      const d = donchian(c, 20)
      return idx(c, (i) => d.lower[i - 1] != null && c[i].close < d.lower[i - 1])
    },
  },
  {
    id: 'bollinger-lower', group: 'breakout', name: 'Close below the lower Bollinger band',
    idea: 'A statistically unusual down move — two standard deviations below the 20-day average.',
    caution: 'Unusual is not the same as wrong. In a downtrend, price walks the lower band for weeks.',
    fires: (c) => {
      const b = bollinger(c.map((d) => d.close), 20, 2)
      return idx(c, (i) => b.lower[i] != null && c[i].close < b.lower[i])
    },
  },
  {
    id: 'squeeze-break', group: 'breakout', name: 'Volatility squeeze then an up day',
    idea: 'Bollinger bandwidth at a 60-day low — energy coiling — followed by an up close.',
    caution: 'A squeeze reliably predicts a large move; it says nothing about direction. Assuming up is the whole error.',
    fires: (c) => {
      const cl = c.map((d) => d.close)
      const b = bollinger(cl, 20, 2)
      const bw = cl.map((v, i) => (b.upper[i] == null ? null : (b.upper[i] - b.lower[i]) / b.mid[i]))
      return idx(c, (i) => {
        if (i < 60 || bw[i] == null) return false
        let min = Infinity
        for (let k = 0; k < 60; k++) if (bw[i - k] != null && bw[i - k] < min) min = bw[i - k]
        return bw[i] <= min * 1.02 && c[i].close > c[i].open
      })
    },
  },
  {
    id: 'gap-up', group: 'breakout', name: 'Gap up of more than 2%',
    idea: 'Price opens far above the previous close — usually news. Traders debate whether gaps get "filled".',
    caution: 'Gap statistics are heavily distorted by the handful of events that caused them.',
    fires: (c) => idx(c, (i) => i >= 1 && (c[i].open - c[i - 1].close) / c[i - 1].close > 0.02),
  },
  {
    id: 'volume-spike-up', group: 'breakout', name: 'Up day on double average volume',
    idea: 'Conviction: a rising price backed by unusually heavy participation.',
    caution: 'Heavy volume also appears at exhaustion tops, where the last buyers are being filled.',
    fires: (c) => {
      const v = c.map((d) => d.volume)
      const av = sma(v, 20)
      return idx(c, (i) => av[i] != null && v[i] > av[i] * 2 && c[i].close > c[i].open)
    },
  },
  {
    id: 'monday', group: 'seasonal', name: 'It is a Monday',
    idea: 'The "weekend effect" — one of the oldest claimed calendar anomalies.',
    caution: 'A pure calendar rule with no economic mechanism. Included specifically so you can watch a famous anomaly fail to beat the baseline.',
    fires: (c) => idx(c, (i) => c[i].date.getUTCDay() === 1),
  },
  {
    id: 'turn-of-month', group: 'seasonal', name: 'Turn of the month (last or first 3 trading days)',
    idea: 'Pension and salary flows are said to lift prices around month end.',
    caution: 'Widely published, therefore widely arbitraged. Anomalies that survive publication are rare.',
    fires: (c) => idx(c, (i) => {
      const d = c[i].date.getUTCDate()
      const lastOfMonth = i + 1 < c.length && c[i + 1].date.getUTCMonth() !== c[i].date.getUTCMonth()
      return d <= 3 || lastOfMonth || (i + 2 < c.length && c[i + 2].date.getUTCMonth() !== c[i].date.getUTCMonth())
    }),
  },
  {
    id: 'sell-in-may', group: 'seasonal', name: 'The May–October half of the year',
    idea: '"Sell in May and go away" — the claim that summer months underperform.',
    caution: 'The effect is small, unstable across decades, and vanishes after costs in most markets.',
    fires: (c) => idx(c, (i) => {
      const m = c[i].date.getUTCMonth()
      return m >= 4 && m <= 9
    }),
  },
]

function idx(candles, test) {
  const out = []
  for (let i = 1; i < candles.length; i++) if (test(i)) out.push(i)
  return out
}

export const getSignal = (id) => SIGNALS.find((s) => s.id === id)

/* =============================== back-testing ================================ */

export const HORIZONS = [1, 5, 10, 20, 60]

function stats(returns) {
  const n = returns.length
  if (!n) return null
  const mean = returns.reduce((a, b) => a + b, 0) / n
  const variance = n > 1
    ? returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)
    : 0
  const sorted = [...returns].sort((a, b) => a - b)
  return {
    n,
    mean,
    variance,
    median: sorted[Math.floor(n / 2)],
    winRate: (returns.filter((r) => r > 0).length / n) * 100,
    best: sorted[n - 1],
    worst: sorted[0],
  }
}

// Welch's t-test: is the signal's mean forward return distinguishable from the
// baseline's? Reported so learners can see how rarely the answer is "yes".
function welchT(a, b) {
  if (!a || !b || a.n < 2 || b.n < 2) return null
  const se = Math.sqrt(a.variance / a.n + b.variance / b.n)
  if (se === 0) return null
  return (a.mean - b.mean) / se
}

const forwardReturn = (candles, i, h) =>
  i + h < candles.length ? ((candles[i + h].close - candles[i].close) / candles[i].close) * 100 : null

// Runs one signal over one or more price series and returns per-horizon stats
// for the signal alongside the unconditional baseline of every bar.
export function backtest(signal, seriesList) {
  const perHorizon = {}
  for (const h of HORIZONS) perHorizon[h] = { signal: [], baseline: [] }
  let occurrences = 0

  for (const candles of seriesList) {
    if (candles.length < 220) continue
    const hits = new Set(signal.fires(candles))
    occurrences += hits.size
    for (let i = 0; i < candles.length; i++) {
      for (const h of HORIZONS) {
        const r = forwardReturn(candles, i, h)
        if (r == null) continue
        perHorizon[h].baseline.push(r)
        if (hits.has(i)) perHorizon[h].signal.push(r)
      }
    }
  }

  const rows = HORIZONS.map((h) => {
    const s = stats(perHorizon[h].signal)
    const b = stats(perHorizon[h].baseline)
    return {
      horizon: h,
      signal: s,
      baseline: b,
      edge: s && b ? s.mean - b.mean : null,
      winEdge: s && b ? s.winRate - b.winRate : null,
      t: welchT(s, b),
    }
  })

  return { occurrences, rows }
}

// A blunt, deliberately conservative verdict. Most signals should land on
// "no measurable edge" — that is the lesson, not a bug.
//
// Two gates, both required. Statistical significance alone is not enough: with
// thousands of observations a difference of 0.01 percentage points clears t > 2
// while being economically meaningless and far smaller than trading costs.
const MIN_SAMPLE = 30
const MIN_EDGE_PP = 0.3 // percentage points of average forward return

export function verdict(result) {
  const usable = result.rows.filter((r) => r.signal && r.signal.n >= MIN_SAMPLE)
  if (!usable.length) {
    return {
      level: 'insufficient',
      text: `Only ${result.occurrences} occurrences — too few to conclude anything. Any pattern you see in a sample this small is almost certainly noise.`,
    }
  }

  const significant = usable.filter((r) => r.t != null && Math.abs(r.t) > 2)
  const material = significant.filter((r) => Math.abs(r.edge) >= MIN_EDGE_PP)

  if (!significant.length) {
    return {
      level: 'none',
      text: 'No horizon differs from the baseline by more than chance would produce. After this signal, the stock behaved about the same as on any other day.',
    }
  }
  if (!material.length) {
    const best = significant.reduce((a, b) => (Math.abs(b.t) > Math.abs(a.t) ? b : a))
    return {
      level: 'trivial',
      text: `Statistically detectable but economically meaningless: the ${best.horizon}-day edge is only ${best.edge.toFixed(2)} percentage points. With ${best.signal.n.toLocaleString()} observations even a trivial difference clears the significance bar — and this one is smaller than your trading costs.`,
    }
  }

  const best = material.reduce((a, b) => (Math.abs(b.edge) > Math.abs(a.edge) ? b : a))
  const expectedFalsePositives = Math.round(SIGNALS.length * HORIZONS.length * 0.05)
  return {
    level: best.edge > 0 ? 'positive' : 'negative',
    text: `At the ${best.horizon}-day horizon the average return is ${best.edge > 0 ? 'above' : 'below'} baseline by ${Math.abs(best.edge).toFixed(2)} percentage points (t ≈ ${best.t.toFixed(1)}, ${best.signal.n.toLocaleString()} occurrences). Treat it with suspicion: testing ${SIGNALS.length} signals across ${HORIZONS.length} horizons means about ${expectedFalsePositives} results this strong should appear by chance alone.`,
  }
}
