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

// The indicator reference. Each entry knows how to compute itself from an OHLC
// series, how to draw itself, and — crucially — how to say in plain English
// what it is currently showing on the chart in front of you.

import {
  adx, atr, bollingerExtras, cci, donchian, ema, keltner, macd, mfi, obv,
  psar, roc, rsi, sma, stochastic, vwap, williamsR, wma,
} from '../lib/indicators.js'

export const FAMILIES = [
  {
    id: 'trend',
    name: 'Trend',
    blurb: 'Which way is price going, and how strongly? Trend indicators smooth out noise to reveal direction. They are lagging by construction — they confirm a move rather than predict it.',
  },
  {
    id: 'momentum',
    name: 'Momentum',
    blurb: 'How fast is price moving, and is that speed fading? Momentum indicators (oscillators) are leading — they can warn of exhaustion before price turns, at the cost of more false alarms.',
  },
  {
    id: 'volatility',
    name: 'Volatility',
    blurb: 'How much is price moving, regardless of direction? These size the normal range, which is what you need to place stops and position sizes that are not hit by ordinary noise.',
  },
  {
    id: 'volume',
    name: 'Volume',
    blurb: 'How much conviction is behind the move? Price tells you what happened; volume tells you how much money agreed. Moves on thin volume are the ones that reverse.',
  },
]

const closes = (c) => c.map((d) => d.close)
const last = (arr) => {
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return arr[i]
  return null
}

// Series colours reference the app's palette so the guide matches the charts.
const C = {
  price: 'var(--series-1)', a: 'var(--series-2)', b: 'var(--series-7)',
  c: 'var(--series-4)', d: 'var(--series-5)', up: 'var(--series-3)',
  down: 'var(--series-8)',
}

export const INDICATORS = [
  // ------------------------------------------------------------ TREND ----
  {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    family: 'trend',
    lag: 'Lagging',
    params: 'Periods 20, 50, 200',
    what: 'The average closing price over the last N days, redrawn each day. The most basic way to strip noise out of a price series.',
    look: 'A smooth line running through the middle of the candles. Short periods hug price closely; the 200-day is a slow, sweeping curve that barely reacts to single days.',
    read: [
      'Price above a rising average = uptrend; below a falling one = downtrend.',
      'The slope matters as much as the level — a flat average means no trend, whatever price does around it.',
      'Crossovers of a fast and slow average (50 over 200 = "golden cross") are classic trend-change signals.',
      'In strong trends the average often acts as support or resistance that price bounces off.',
    ],
    limits: 'Lagging by design: by the time an average confirms a trend, part of the move has happened. In sideways markets price crosses back and forth constantly, producing whipsaws.',
    render: 'overlay',
    compute: (cd) => ([
      { name: 'SMA 20', color: C.a, values: sma(closes(cd), 20) },
      { name: 'SMA 50', color: C.b, values: sma(closes(cd), 50) },
      { name: 'SMA 200', color: C.c, values: sma(closes(cd), 200) },
    ]),
    reading: (cd) => {
      const p = last(closes(cd))
      const s50 = last(sma(closes(cd), 50))
      const s200 = last(sma(closes(cd), 200))
      if (s200 == null) return null
      const above200 = p > s200
      const golden = s50 > s200
      return {
        state: above200 && golden ? 'bullish' : !above200 && !golden ? 'bearish' : 'mixed',
        text: `Price is ${above200 ? 'above' : 'below'} the 200-day average and the 50-day is ${golden ? 'above' : 'below'} the 200-day — ${above200 && golden ? 'a textbook uptrend structure' : !above200 && !golden ? 'a textbook downtrend structure' : 'a mixed picture, typical of a transition or a range'}.`,
      }
    },
  },
  {
    id: 'ema',
    name: 'Exponential & Weighted Moving Averages',
    family: 'trend',
    lag: 'Lagging',
    params: 'EMA 12 · WMA 12',
    what: 'Moving averages that weight recent days more heavily, so they turn faster than a simple average of the same length.',
    look: 'Almost the same shape as the SMA, but consistently a step ahead of it at turning points — closer to price when price is moving.',
    read: [
      'Use when you want earlier signals and can tolerate more false ones.',
      'EMA weights decay smoothly; WMA weights fall in a straight line. In practice they behave very similarly.',
      'The EMA is the building block of MACD and Keltner channels.',
    ],
    limits: 'Faster reaction means more whipsaws. Reacting sooner to a real move and reacting sooner to noise are the same property — you cannot buy one without the other.',
    render: 'overlay',
    compute: (cd) => ([
      { name: 'EMA 12', color: C.d, values: ema(closes(cd), 12) },
      { name: 'WMA 12', color: C.c, values: wma(closes(cd), 12) },
      { name: 'SMA 12', color: C.b, values: sma(closes(cd), 12), dashed: true },
    ]),
    reading: (cd) => {
      const e = last(ema(closes(cd), 12))
      const s = last(sma(closes(cd), 12))
      if (e == null || s == null) return null
      return {
        state: e > s ? 'bullish' : 'bearish',
        text: `The 12-day EMA sits ${e > s ? 'above' : 'below'} the 12-day SMA, which means recent days have been ${e > s ? 'stronger' : 'weaker'} than the earlier part of the window.`,
      }
    },
  },
  {
    id: 'macd',
    name: 'MACD',
    family: 'trend',
    lag: 'Lagging (with leading histogram)',
    params: '12, 26, 9',
    what: 'Moving Average Convergence Divergence: the gap between a 12-day and 26-day EMA, plotted with a 9-day signal line and a histogram of the difference between the two.',
    look: 'Its own pane below price. Two lines weaving around each other and a zero line, with bars showing the gap between them — green above zero, red below.',
    read: [
      'MACD crossing above its signal line = momentum turning up; below = turning down.',
      'Above/below the zero line tells you whether the medium-term trend itself is up or down.',
      'The histogram shrinking is an early warning — it fades before the lines actually cross.',
      'Divergence (price makes a new high, MACD does not) signals a rally running out of engines.',
    ],
    limits: 'Built from moving averages, so it inherits their lag. It generates constant false crossovers in sideways markets, and it is unbounded — you cannot read "overbought" from its level.',
    render: 'pane',
    compute: (cd) => {
      const m = macd(closes(cd))
      return [
        { name: 'MACD', color: C.price, values: m.macdLine },
        { name: 'Signal', color: C.a, values: m.signal, dashed: true },
        { name: 'Histogram', color: C.up, values: m.histogram, type: 'histogram' },
      ]
    },
    zeroLine: true,
    reading: (cd) => {
      const m = macd(closes(cd))
      const line = last(m.macdLine)
      const sig = last(m.signal)
      if (line == null || sig == null) return null
      const bull = line > sig
      return {
        state: bull ? 'bullish' : 'bearish',
        text: `MACD is ${bull ? 'above' : 'below'} its signal line and ${line > 0 ? 'above' : 'below'} zero — short-term momentum is turning ${bull ? 'up' : 'down'} within a ${line > 0 ? 'positive' : 'negative'} medium-term trend.`,
      }
    },
  },
  {
    id: 'adx',
    name: 'ADX & Directional Indicators',
    family: 'trend',
    lag: 'Lagging',
    params: '14 periods',
    what: 'The Average Directional Index measures how strong a trend is — not which way it points. The +DI and −DI lines supply the direction.',
    look: 'A pane with three lines. ADX climbs when a trend is establishing and falls when the market goes quiet, regardless of direction. +DI above −DI means buyers dominate.',
    read: [
      'ADX below 20: no real trend — range-trading conditions, and trend-following signals will fail.',
      'ADX 25–50: a genuine trend is in place. Trend-following tools work best here.',
      'ADX above 50: very strong trend, but often late in the move.',
      '+DI crossing above −DI is a bullish directional signal; the reverse is bearish. Only trust these when ADX confirms a trend exists.',
    ],
    limits: 'ADX rises in strong downtrends too — a high reading is not bullish on its own. It is also slow: by the time ADX confirms strength, the easy part of the move is usually gone.',
    render: 'pane',
    compute: (cd) => {
      const a = adx(cd)
      return [
        { name: 'ADX', color: C.price, values: a.adx },
        { name: '+DI', color: C.up, values: a.plusDI },
        { name: '−DI', color: C.down, values: a.minusDI },
      ]
    },
    bands: [{ value: 25, label: '25' }],
    reading: (cd) => {
      const a = adx(cd)
      const v = last(a.adx)
      const p = last(a.plusDI)
      const m = last(a.minusDI)
      if (v == null) return null
      const trending = v >= 25
      return {
        state: !trending ? 'neutral' : p > m ? 'bullish' : 'bearish',
        text: `ADX is ${v.toFixed(0)} — ${trending ? 'a real trend is in place' : 'below 25, so there is no meaningful trend and range conditions apply'}. ${p > m ? '+DI' : '−DI'} is on top, so what direction there is favours ${p > m ? 'buyers' : 'sellers'}.`,
      }
    },
  },
  {
    id: 'psar',
    name: 'Parabolic SAR',
    family: 'trend',
    lag: 'Lagging',
    params: 'Step 0.02, max 0.2',
    what: 'A trailing stop that "stops and reverses". It places a dot on the chart that follows price, accelerating as the trend extends, and flips to the other side when price crosses it.',
    look: 'A trail of dots below the candles in an uptrend and above them in a downtrend, tightening toward price as the move matures.',
    read: [
      'Dots below price = uptrend intact. Dots above = downtrend intact.',
      'A flip is the exit signal — the trend on that timeframe has broken.',
      'Its real strength is as a mechanical trailing stop, not as an entry trigger.',
    ],
    limits: 'It assumes a trend always exists, so in a sideways market it flips constantly and loses money on every whipsaw. Use it only when a trend filter such as ADX says a trend is present.',
    render: 'overlay',
    compute: (cd) => ([{ name: 'Parabolic SAR', color: C.d, values: psar(cd), type: 'dots' }]),
    reading: (cd) => {
      const s = last(psar(cd))
      const p = last(closes(cd))
      if (s == null) return null
      const bull = s < p
      return {
        state: bull ? 'bullish' : 'bearish',
        text: `The SAR dots are ${bull ? 'below' : 'above'} price, marking an ${bull ? 'uptrend' : 'downtrend'}. A close ${bull ? 'below' : 'above'} roughly ${s.toFixed(2)} would flip it.`,
      }
    },
  },

  // --------------------------------------------------------- MOMENTUM ----
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    family: 'momentum',
    lag: 'Leading',
    params: '14 periods',
    what: 'Compares the size of recent gains to recent losses and squeezes the result onto a 0–100 scale. The most widely used oscillator in existence.',
    look: 'A single line in its own pane, oscillating between 0 and 100, with reference lines at 70 and 30.',
    read: [
      'Above 70 = "overbought": the rally has been unusually one-sided. Not an automatic sell.',
      'Below 30 = "oversold": selling has been extreme. In quality companies this often marks panic lows.',
      'The 40–60 zone is neutral. In strong uptrends RSI often bottoms near 40 rather than 30.',
      'Divergence is the highest-value signal: price makes a higher high while RSI makes a lower high.',
    ],
    limits: 'Strong trends can hold RSI above 70 for weeks, and shorting every overbought reading is a reliable way to lose money. Oversold can stay oversold in a genuinely broken company.',
    render: 'pane',
    compute: (cd) => ([{ name: 'RSI (14)', color: C.b, values: rsi(closes(cd), 14) }]),
    bands: [{ value: 70, label: '70' }, { value: 30, label: '30' }],
    scale: [0, 100],
    reading: (cd) => {
      const v = last(rsi(closes(cd), 14))
      if (v == null) return null
      return {
        state: v > 70 ? 'stretched' : v < 30 ? 'washed-out' : 'neutral',
        text: `RSI is ${v.toFixed(0)} — ${v > 70 ? 'overbought territory, so the move is stretched and chasing it carries extra risk' : v < 30 ? 'oversold territory, which is worth investigating rather than auto-buying' : 'the neutral zone, with momentum neither stretched nor washed out'}.`,
      }
    },
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    family: 'momentum',
    lag: 'Leading',
    params: '14, 3, 3',
    what: 'Measures where the close sits inside the recent high-low range. Near the top of the range = strength; near the bottom = weakness. %K is the raw line, %D its smoothed signal.',
    look: 'Two lines in a 0–100 pane, faster and jumpier than RSI, with bands at 80 and 20.',
    read: [
      'Above 80 = closing near the top of its recent range; below 20 = near the bottom.',
      'The %K crossing %D is the trade trigger — more useful than the level alone.',
      'Best suited to range-bound markets, where it catches the swings between support and resistance.',
    ],
    limits: 'Much noisier than RSI. In a strong trend it pins near an extreme for long stretches and produces a stream of losing counter-trend signals.',
    render: 'pane',
    compute: (cd) => {
      const s = stochastic(cd)
      return [
        { name: '%K', color: C.price, values: s.k },
        { name: '%D', color: C.a, values: s.d, dashed: true },
      ]
    },
    bands: [{ value: 80, label: '80' }, { value: 20, label: '20' }],
    scale: [0, 100],
    reading: (cd) => {
      const s = stochastic(cd)
      const k = last(s.k)
      const d = last(s.d)
      if (k == null) return null
      return {
        state: k > 80 ? 'stretched' : k < 20 ? 'washed-out' : 'neutral',
        text: `%K is ${k.toFixed(0)}${d != null ? ` and %D is ${d.toFixed(0)}` : ''} — price is closing ${k > 80 ? 'near the top of' : k < 20 ? 'near the bottom of' : 'in the middle of'} its 14-day range.`,
      }
    },
  },
  {
    id: 'williams',
    name: 'Williams %R',
    family: 'momentum',
    lag: 'Leading',
    params: '14 periods',
    what: 'The same measurement as the stochastic %K, mirrored onto a −100 to 0 scale. Where the close sits in the recent range, read from the top down.',
    look: 'A single line hugging a pane from −100 (bottom) to 0 (top), with bands at −20 and −80.',
    read: [
      'Above −20 = overbought. Below −80 = oversold.',
      'It tends to turn a fraction earlier than most oscillators, which makes it popular for timing.',
      'Mathematically %R = %K − 100, so it adds nothing on top of a stochastic — pick one.',
    ],
    limits: 'Extremely twitchy, and identical in information content to the stochastic. Running both is a classic beginner mistake: it feels like confirmation but it is the same signal counted twice.',
    render: 'pane',
    compute: (cd) => ([{ name: 'Williams %R', color: C.d, values: williamsR(cd) }]),
    bands: [{ value: -20, label: '−20' }, { value: -80, label: '−80' }],
    scale: [-100, 0],
    reading: (cd) => {
      const v = last(williamsR(cd))
      if (v == null) return null
      return {
        state: v > -20 ? 'stretched' : v < -80 ? 'washed-out' : 'neutral',
        text: `Williams %R is ${v.toFixed(0)} — ${v > -20 ? 'overbought' : v < -80 ? 'oversold' : 'mid-range'}. Note this is the stochastic on a different scale, so treat it as one opinion, not two.`,
      }
    },
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index (CCI)',
    family: 'momentum',
    lag: 'Leading',
    params: '20 periods',
    what: 'How far price has strayed from its own average, measured in units of its typical deviation. Despite the name it is used on every asset class.',
    look: 'An unbounded line oscillating around zero, with conventional markers at +100 and −100. Spikes far past those in strong moves.',
    read: [
      'Above +100 = unusually strong; below −100 = unusually weak.',
      'Two schools of use: fade the extremes in ranges, or treat a push past +100 as a breakout confirmation in trends.',
      'Crossing back through zero is a simple momentum-shift signal.',
    ],
    limits: 'Unbounded, so there is no fixed level that means "too far". The ±100 thresholds are conventions, not laws, and in volatile names readings of ±300 are routine.',
    render: 'pane',
    compute: (cd) => ([{ name: 'CCI (20)', color: C.b, values: cci(cd) }]),
    bands: [{ value: 100, label: '+100' }, { value: -100, label: '−100' }],
    zeroLine: true,
    reading: (cd) => {
      const v = last(cci(cd))
      if (v == null) return null
      return {
        state: v > 100 ? 'stretched' : v < -100 ? 'washed-out' : 'neutral',
        text: `CCI is ${v.toFixed(0)} — price sits ${Math.abs(v) > 100 ? 'unusually far' : 'within a normal distance'} ${v >= 0 ? 'above' : 'below'} its 20-day average.`,
      }
    },
  },
  {
    id: 'roc',
    name: 'Rate of Change / Momentum',
    family: 'momentum',
    lag: 'Leading',
    params: '12 periods',
    what: 'The simplest momentum measure there is: the percentage change over the last N days. Everything else in this family is a refinement of this idea.',
    look: 'A line oscillating around zero. Above zero means price is higher than N days ago; the distance from zero is the speed of the move.',
    read: [
      'Crossing zero means the N-day trend has changed sign.',
      'The slope tells you whether the move is accelerating or decelerating.',
      'Widely used to rank stocks for relative-strength strategies — buying what is already rising fastest.',
    ],
    limits: 'No upper or lower bound and no smoothing, so it is jumpy and hard to compare across stocks with different volatility.',
    render: 'pane',
    compute: (cd) => ([{ name: 'ROC (12)', color: C.a, values: roc(closes(cd), 12) }]),
    zeroLine: true,
    reading: (cd) => {
      const v = last(roc(closes(cd), 12))
      if (v == null) return null
      return {
        state: v > 0 ? 'bullish' : 'bearish',
        text: `Price is ${v >= 0 ? 'up' : 'down'} ${Math.abs(v).toFixed(1)}% versus 12 days ago, so short-term momentum is ${v >= 0 ? 'positive' : 'negative'}.`,
      }
    },
  },

  // -------------------------------------------------------- VOLATILITY ----
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    family: 'volatility',
    lag: 'Lagging',
    params: '20 periods, 2 standard deviations',
    what: 'A 20-day average wrapped in bands two standard deviations above and below. Because the bands are built from volatility, they widen in turmoil and pinch in calm.',
    look: 'An envelope around price that breathes — flaring open during sharp moves and squeezing to a narrow ribbon when the market goes quiet.',
    read: [
      'Touching the upper band means the move is statistically stretched — but in a strong trend price can "walk the band" for weeks.',
      'The squeeze (bands pinching tight) means energy is coiling; big moves are often born from squeezes.',
      'Which way price breaks out of a squeeze is the tradeable information, not the squeeze itself.',
      '%B tells you where price sits in the band: above 1 = outside the top, below 0 = outside the bottom.',
    ],
    limits: 'A band touch is not a signal. Beginners lose money selling every upper-band touch in a healthy uptrend. Standard deviation also assumes a normal distribution, which markets do not obey.',
    render: 'overlay',
    compute: (cd) => {
      const b = bollingerExtras(closes(cd))
      return [
        { name: 'Upper', color: C.price, values: b.upper, dashed: true },
        { name: 'Mid (SMA 20)', color: C.a, values: b.mid },
        { name: 'Lower', color: C.price, values: b.lower, dashed: true },
      ]
    },
    reading: (cd) => {
      const b = bollingerExtras(closes(cd))
      const pb = last(b.percentB)
      const bw = last(b.bandwidth)
      if (pb == null) return null
      return {
        state: pb > 1 ? 'stretched' : pb < 0 ? 'washed-out' : 'neutral',
        text: `%B is ${pb.toFixed(2)} — price is ${pb > 1 ? 'above the upper band' : pb < 0 ? 'below the lower band' : `${(pb * 100).toFixed(0)}% of the way up the band`}. Bandwidth is ${bw?.toFixed(1)}% of the average, so the bands are currently ${bw < 8 ? 'tight — a squeeze' : bw > 20 ? 'wide — volatility is elevated' : 'about normal'}.`,
      }
    },
  },
  {
    id: 'atr',
    name: 'Average True Range (ATR)',
    family: 'volatility',
    lag: 'Lagging',
    params: '14 periods',
    what: 'The average daily range in price units, counting overnight gaps. It says nothing about direction — only about how much this stock typically moves in a day.',
    look: 'A single line in its own pane, in dollars rather than percent. It spikes during panic and drifts down in quiet markets.',
    read: [
      'This is the single most practical indicator for risk management: it tells you what a normal day looks like.',
      'Place stops a multiple of ATR away (1.5–3× is common) so ordinary noise does not take you out.',
      'Feed it into position sizing: a wider ATR means a smaller position for the same dollar risk.',
      'Rising ATR means conditions are getting more dangerous, whichever way price is going.',
    ],
    limits: 'Purely descriptive — it never tells you direction, and it is expressed in dollars, so you cannot compare a $500 stock to a $20 one without dividing by price.',
    render: 'pane',
    compute: (cd) => ([{ name: 'ATR (14)', color: C.c, values: atr(cd) }]),
    reading: (cd) => {
      const v = last(atr(cd))
      const p = last(closes(cd))
      if (v == null) return null
      const pctOfPrice = (v / p) * 100
      return {
        state: 'neutral',
        text: `ATR is ${v.toFixed(2)}, about ${pctOfPrice.toFixed(1)}% of the price — that is a normal day's range. A 2× ATR stop would sit roughly ${(v * 2).toFixed(2)} away from your entry.`,
      }
    },
  },
  {
    id: 'keltner',
    name: 'Keltner Channels',
    family: 'volatility',
    lag: 'Lagging',
    params: 'EMA 20, ATR 10 × 2',
    what: 'An envelope like Bollinger, but built from ATR around an EMA instead of standard deviation around an SMA. It reacts to true range, including gaps.',
    look: 'A smoother, steadier envelope than Bollinger — it does not flare as dramatically, because ATR is less jumpy than standard deviation.',
    read: [
      'A close outside the channel signals a genuine breakout more reliably than a Bollinger touch.',
      'The classic squeeze setup: Bollinger Bands narrowing inside the Keltner channel marks unusually compressed volatility.',
      'In trends, the middle EMA often acts as the pullback level to buy.',
    ],
    limits: 'Same core weakness as any envelope — it describes the range, not the direction. In a strong trend price rides the outer line without ever mean-reverting.',
    render: 'overlay',
    compute: (cd) => {
      const k = keltner(cd)
      return [
        { name: 'Upper', color: C.b, values: k.upper, dashed: true },
        { name: 'EMA 20', color: C.a, values: k.mid },
        { name: 'Lower', color: C.b, values: k.lower, dashed: true },
      ]
    },
    reading: (cd) => {
      const k = keltner(cd)
      const p = last(closes(cd))
      const u = last(k.upper)
      const l = last(k.lower)
      if (u == null) return null
      return {
        state: p > u ? 'stretched' : p < l ? 'washed-out' : 'neutral',
        text: `Price is ${p > u ? 'above the upper channel — a breakout reading' : p < l ? 'below the lower channel — a breakdown reading' : 'inside the channel, which is the normal state'}.`,
      }
    },
  },
  {
    id: 'donchian',
    name: 'Donchian Channels',
    family: 'volatility',
    lag: 'Lagging',
    params: '20 periods',
    what: 'The highest high and lowest low of the last N days, drawn as two lines. The original trend-following breakout system, made famous by the Turtle Traders.',
    look: 'A staircase-shaped box around price. The lines are flat until a new extreme is set, then step up or down.',
    read: [
      'This is support and resistance made explicit and mechanical.',
      'A close above the upper line is a breakout; below the lower line, a breakdown.',
      'The channel width itself is a volatility read — a narrow box means a tight range.',
      'Commonly used with an exit on the opposite N-day extreme.',
    ],
    limits: 'Breakout systems lose small amounts frequently and make it back on a few large trends. That means a low win rate, which is psychologically hard to sit through even when the maths works.',
    render: 'overlay',
    compute: (cd) => {
      const d = donchian(cd)
      return [
        { name: '20-day high', color: C.up, values: d.upper },
        { name: 'Midline', color: C.a, values: d.mid, dashed: true },
        { name: '20-day low', color: C.down, values: d.lower },
      ]
    },
    reading: (cd) => {
      const d = donchian(cd)
      const p = last(closes(cd))
      const u = last(d.upper)
      const l = last(d.lower)
      if (u == null) return null
      const pos = ((p - l) / (u - l)) * 100
      return {
        state: pos > 80 ? 'bullish' : pos < 20 ? 'bearish' : 'neutral',
        text: `Price sits ${pos.toFixed(0)}% of the way up its 20-day range (${l.toFixed(2)} to ${u.toFixed(2)}) — ${pos > 80 ? 'near the top, testing breakout territory' : pos < 20 ? 'near the bottom, testing support' : 'mid-range'}.`,
      }
    },
  },

  // ------------------------------------------------------------ VOLUME ----
  {
    id: 'obv',
    name: 'On-Balance Volume (OBV)',
    family: 'volume',
    lag: 'Leading',
    params: 'Cumulative',
    what: 'A running total that adds the day\'s volume when price closes up and subtracts it when price closes down. It turns volume into a trend line.',
    look: 'A cumulative line in its own pane. Only its direction matters — the absolute number is meaningless.',
    read: [
      'OBV rising with price confirms the trend: buying is doing the work.',
      'The high-value signal is divergence — price making new highs while OBV does not means the rally is running on shrinking participation.',
      'OBV sometimes turns before price, because accumulation shows in volume first.',
    ],
    limits: 'It counts a whole day\'s volume as either fully positive or fully negative based on the close, which is crude. A single huge day can dominate the line for months.',
    render: 'pane',
    compute: (cd) => ([{ name: 'OBV', color: C.b, values: obv(cd) }]),
    reading: (cd) => {
      const o = obv(cd)
      const n = Math.min(20, o.length - 1)
      const now = last(o)
      const then = o[o.length - 1 - n]
      const p = closes(cd)
      const pNow = last(p)
      const pThen = p[p.length - 1 - n]
      if (now == null || then == null) return null
      const obvUp = now > then
      const priceUp = pNow > pThen
      const agree = obvUp === priceUp
      return {
        state: agree ? (priceUp ? 'bullish' : 'bearish') : 'divergence',
        text: agree
          ? `Over the last ${n} days both price and OBV are ${priceUp ? 'rising' : 'falling'} — volume is confirming the move.`
          : `Over the last ${n} days price is ${priceUp ? 'rising' : 'falling'} while OBV is ${obvUp ? 'rising' : 'falling'} — a divergence, which means volume is not confirming the price move.`,
      }
    },
  },
  {
    id: 'mfi',
    name: 'Money Flow Index (MFI)',
    family: 'volume',
    lag: 'Leading',
    params: '14 periods',
    what: 'Essentially RSI weighted by volume — often called the "volume-weighted RSI". It measures buying and selling pressure with the size of the money behind it.',
    look: 'A 0–100 oscillator that looks much like RSI, with bands at 80 and 20, but reacts differently when big-volume days appear.',
    read: [
      'Above 80 = overbought with real money behind the move; below 20 = oversold.',
      'When MFI and RSI disagree, the difference is entirely volume — that gap is the information.',
      'Divergence carries more weight than RSI divergence because conviction is baked in.',
    ],
    limits: 'Inherits every RSI weakness plus a dependence on clean volume data. In thinly traded names a single block trade can distort it badly.',
    render: 'pane',
    compute: (cd) => ([{ name: 'MFI (14)', color: C.d, values: mfi(cd) }]),
    bands: [{ value: 80, label: '80' }, { value: 20, label: '20' }],
    scale: [0, 100],
    reading: (cd) => {
      const v = last(mfi(cd))
      const r = last(rsi(closes(cd), 14))
      if (v == null) return null
      const gap = r != null ? v - r : null
      return {
        state: v > 80 ? 'stretched' : v < 20 ? 'washed-out' : 'neutral',
        text: `MFI is ${v.toFixed(0)}${gap != null ? `, versus RSI at ${r.toFixed(0)}` : ''} — ${v > 80 ? 'buying pressure is stretched' : v < 20 ? 'selling pressure is extreme' : 'flows are balanced'}.${gap != null && Math.abs(gap) > 10 ? ` The ${Math.abs(gap).toFixed(0)}-point gap to RSI means volume is telling a ${gap > 0 ? 'stronger' : 'weaker'} story than price alone.` : ''}`,
      }
    },
  },
  {
    id: 'vwap',
    name: 'VWAP',
    family: 'volume',
    lag: 'Lagging',
    params: 'Rolling 20 periods',
    what: 'The volume-weighted average price — the average price actually paid, weighted by how much traded at each level. Institutions use it as the benchmark for execution quality.',
    look: 'A line through price that tracks it closely but is pulled toward the levels where the most volume changed hands.',
    read: [
      'Price above VWAP means the average buyer is in profit; below, underwater. That is a real sentiment read.',
      'Large funds try to buy below VWAP and sell above it, which makes it a genuine magnet level.',
      'Often acts as intraday support or resistance because so many desks reference it.',
    ],
    limits: 'True VWAP resets each session and is an intraday tool; on daily candles a rolling window is only an approximation. It is also heavily lagging in fast markets.',
    render: 'overlay',
    compute: (cd) => ([{ name: 'VWAP (20)', color: C.c, values: vwap(cd, 20) }]),
    reading: (cd) => {
      const v = last(vwap(cd, 20))
      const p = last(closes(cd))
      if (v == null) return null
      const above = p > v
      return {
        state: above ? 'bullish' : 'bearish',
        text: `Price is ${above ? 'above' : 'below'} the 20-day VWAP of ${v.toFixed(2)} — the average buyer over that window is ${above ? 'in profit' : 'underwater'}.`,
      }
    },
  },
]

export const byFamily = (id) => INDICATORS.filter((i) => i.family === id)
export const getIndicator = (id) => INDICATORS.find((i) => i.id === id)
