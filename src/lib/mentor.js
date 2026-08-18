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

// The AI mentor: a senior investment analyst you can ask questions.
//
// Calls the Claude API directly from the browser with the user's own API key
// (stored only in their browser, same pattern as the market-data key). This is
// acceptable for a personal, local learning app; a multi-user deployment should
// proxy these calls through a server so the key never reaches the client.

import Anthropic from '@anthropic-ai/sdk'
import { getCompanies, getFundamentals, getQuote, getSeries, healthScore, isLiveMode } from './market.js'
import { adx, annualizedVol, atr, macd, maxDrawdown, obv, rsi, sma } from './indicators.js'
import { MODULES } from '../data/lessons.js'
import { fmtMoney, fmtPct } from './format.js'

export const MENTOR_MODELS = [
  {
    id: 'claude-opus-5',
    name: 'Claude Opus 5',
    note: 'Deepest reasoning — best for analysis and "why" questions. Recommended.',
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    note: 'Faster and cheaper, still excellent for teaching and Q&A.',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    note: 'Fastest and lowest cost — good for quick definitions and drills.',
  },
]

const SYSTEM_PROMPT = `You are a senior investment analyst and patient mentor inside "Learn to Invest", an educational web app. The person you are talking to is a complete beginner who wants to learn to analyze companies, judge when buying or selling is sensible, manage risk, and eventually think like a professional business analyst.

# Who you are
You have two decades of experience covering companies: reading financial statements, building valuation models, and sitting through several market cycles. You have seen what actually loses beginners money — position sizing they never thought about, a thesis they never wrote down, and selling in a panic. You teach the way a good senior colleague does: plainly, with the reasoning shown, and without jargon unless you define it in the same sentence.

# How to teach
Answer the question that was asked, then teach the transferable principle behind it. When the user asks about a specific company or trade, walk through your reasoning in the order an analyst would: what the business does, what the numbers say, what the price assumes, what the chart says about timing, and what could go wrong. Show the arithmetic when a number matters — a beginner learns more from "20 ÷ 4 = a P/E of 5" than from the conclusion alone.

Use the app's own curriculum as your shared vocabulary. The eleven modules are: Investing Foundations; Financial Concepts (time value of money, inflation, rates and the economy, bonds and yields, risk mathematics, cost of capital, instruments and leverage); Fundamental Analysis; Reading Charts from Zero (chart and candlestick anatomy, timeframes, volume, scales and gaps, a five-step chart-reading workflow); Technical Analysis & Timing; Prediction & Pattern Recognition (base rates, chart and candlestick patterns, seasonality, back-testing traps, probabilistic thinking); Company Events & the Big Picture (earnings reports, dividends and buybacks, corporate actions, economic indicators, cycles and sector rotation, bear markets); Risk Management; When to Buy, When to Sell (watchlists, the five-gate buy checklist, entry methods, overvaluation, broken theses, the exit playbook, holding); Psychology & Strategy; and Think Like a Business Analyst. When a question maps onto a lesson the user has not done yet, answer it fully first and then point them to the module by name.

When you use data from the CURRENT APP STATE below, say where the number came from so the user learns to find it themselves next time.

# Boundaries that matter
This is a simulator. The companies in simulated mode are fictional and their prices are generated; in live mode the prices are real but the practice portfolio is virtual. Never present a trade suggestion as a recommendation to act on with real money. You can and should say what an analyst would look at, what the evidence supports, and what the risks are — that is teaching. What you must not do is tell the user what to buy or sell with their real savings, predict prices, or imply any outcome is certain.

If the user asks you to just tell them what to buy, teach them how to decide instead, and say plainly why: the goal is that they can do this without you.

# How to write
Keep responses focused, brief, and concise to avoid overwhelming a beginner. Lead with the direct answer, then the reasoning that supports it. Most answers should be a few short paragraphs; use a short list only when the content is genuinely a list, and a small table only for comparing a few concrete numbers. Prose beats bullet-point fragments for explaining ideas. Do not add disclaimers to every paragraph — the app already carries them; one brief caveat where it genuinely matters is enough.

Deliver what the user asked for, at the scope they intended. Make routine judgment calls yourself and check in only when different readings would lead to materially different answers. Do not append a summary of what you just said, and do not offer a menu of follow-up topics at the end of every reply.`

function pct(n, digits = 1) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}%`
}

// A compact snapshot of everything the mentor should know about this user's
// situation. Rebuilt per request; kept small and readable on purpose.
export function buildContext(state, summary, focusTicker) {
  const lines = []

  lines.push('# CURRENT APP STATE')
  lines.push(`Market mode: ${isLiveMode() ? 'LIVE — real US stocks, real daily prices' : 'SIMULATED — fictional companies, generated prices'}`)

  // Portfolio
  lines.push('')
  lines.push('## The user\'s practice portfolio (virtual money, started at $10,000)')
  lines.push(`Total value ${fmtMoney(summary.total)} · cash ${fmtMoney(summary.cash)} · invested ${fmtMoney(summary.marketValue)} · all-time ${fmtPct(summary.totalGainPct)}`)
  if (summary.positions.length === 0) {
    lines.push('No positions yet — they hold only cash and have not made a practice trade.')
  } else {
    for (const p of summary.positions) {
      const weight = summary.total > 0 ? (p.value / summary.total) * 100 : 0
      lines.push(
        `- ${p.ticker}: ${p.shares} shares, avg cost ${fmtMoney(p.avgCost)}, now ${fmtMoney(p.price)}, ` +
        `value ${fmtMoney(p.value)} (${weight.toFixed(0)}% of portfolio), P&L ${fmtPct(p.gainPct)}`
      )
    }
  }

  // Market
  lines.push('')
  lines.push('## Available companies (ticker · sector · price · today)')
  for (const c of getCompanies()) {
    const q = getQuote(c.ticker)
    if (!q) continue
    lines.push(`- ${c.ticker} · ${c.sector} · ${fmtMoney(q.price)} · ${pct(q.changePct, 2)} — ${c.name}`)
  }

  // Focused stock: full analyst workup
  if (focusTicker) {
    const q = getQuote(focusTicker)
    const series = getSeries(focusTicker)
    if (q && series.length > 30) {
      const closes = series.map((d) => d.close)
      const i = closes.length - 1
      const s50 = sma(closes, 50)
      const s200 = sma(closes, 200)
      const r = rsi(closes, 14)
      const m = macd(closes)
      const yearAgo = closes[Math.max(0, closes.length - 253)]
      const f = getFundamentals(focusTicker)
      const h = healthScore(f)

      lines.push('')
      lines.push(`## The user is currently looking at ${focusTicker}`)
      lines.push(`Price ${fmtMoney(q.price)} (${pct(q.changePct, 2)} today), 1-year ${pct(((q.price - yearAgo) / yearAgo) * 100)}`)
      lines.push(`Annualized volatility ${(annualizedVol(closes.slice(-252)) * 100).toFixed(0)}%, worst 1-year drawdown -${(maxDrawdown(closes.slice(-252)) * 100).toFixed(0)}%`)
      if (s50[i] != null) lines.push(`50-day SMA ${fmtMoney(s50[i])} — price is ${q.price > s50[i] ? 'above' : 'below'} it`)
      if (s200[i] != null) lines.push(`200-day SMA ${fmtMoney(s200[i])} — price is ${q.price > s200[i] ? 'above' : 'below'} it`)
      if (r[i] != null) lines.push(`RSI(14) ${r[i].toFixed(0)}`)
      if (m.macdLine[i] != null && m.signal[i] != null) {
        lines.push(`MACD ${m.macdLine[i] > m.signal[i] ? 'above' : 'below'} its signal line`)
      }
      const a = adx(series)
      if (a.adx[i] != null) {
        lines.push(`ADX ${a.adx[i].toFixed(0)} (${a.adx[i] >= 25 ? 'a real trend is present' : 'no real trend — range conditions'}), ${a.plusDI[i] > a.minusDI[i] ? '+DI' : '-DI'} on top`)
      }
      const at = atr(series)
      if (at[i] != null) lines.push(`ATR ${at[i].toFixed(2)} (about ${((at[i] / q.price) * 100).toFixed(1)}% of price — a normal day's range)`)
      const o = obv(series)
      const back = Math.min(20, o.length - 1)
      if (o[i] != null && o[i - back] != null) {
        const obvUp = o[i] > o[i - back]
        const priceUp = closes[i] > closes[i - back]
        lines.push(`OBV over 20 days is ${obvUp ? 'rising' : 'falling'} while price is ${priceUp ? 'rising' : 'falling'}${obvUp === priceUp ? ' — volume confirms the move' : ' — a volume divergence'}`)
      }
      if (f) {
        lines.push(
          `Fundamentals: revenue $${f.revenue}B growing ${pct(f.revenueGrowth)}, net margin ${f.netMargin}%, ` +
          `EPS ${fmtMoney(f.eps)}, P/E ${f.peRatio ? f.peRatio.toFixed(1) : 'n/a (unprofitable)'}, ` +
          `P/S ${f.psRatio.toFixed(1)}, debt/equity ${f.debtToEquity}, current ratio ${f.currentRatio}, ` +
          `ROE ${f.roe}%, FCF margin ${f.fcfMargin}%, dividend yield ${f.dividendYield}%`
        )
        if (h) lines.push(`App's financial health score: ${h.total}/100`)
      } else {
        lines.push('No curated fundamentals for this company (live-mode stock) — reason from price action and general knowledge, and say which figures the user would need to look up.')
      }
    }
  }

  // Learning progress
  const done = MODULES.map((mod) => {
    const n = mod.lessons.filter((l) => state.completedLessons[l.id]).length
    return `${mod.title} ${n}/${mod.lessons.length}${state.quizScores[mod.id] != null ? ` (quiz ${state.quizScores[mod.id]}%)` : ''}`
  })
  lines.push('')
  lines.push('## Their progress through the curriculum')
  lines.push(done.join(' · '))

  return lines.join('\n')
}

let cachedClient = null
let cachedKey = null

function getClient(apiKey) {
  if (cachedClient && cachedKey === apiKey) return cachedClient
  cachedClient = new Anthropic({
    apiKey,
    // The key is the user's own and never leaves their browser except to
    // Anthropic. See the Settings page for the warning shown to the user.
    dangerouslyAllowBrowser: true,
  })
  cachedKey = apiKey
  return cachedClient
}

function friendlyError(err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'That API key was rejected. Check it in Settings — it should start with "sk-ant-".'
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'Your API key does not have access to this model. Try a different model in Settings.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the API — wait a moment and send the message again.'
  }
  if (err instanceof Anthropic.NotFoundError) {
    return 'That model was not found for your account. Pick a different one in Settings.'
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Claude API. Check your internet connection (an ad-blocker or corporate proxy can also block it).'
  }
  if (err instanceof Anthropic.APIError) {
    return `The API returned an error: ${err.message}`
  }
  return err?.message || 'Something went wrong talking to the API.'
}

// Streams a mentor reply.
//   history: [{ role: 'user'|'assistant', content: string }]
//   onText:  called with each text delta as it arrives
// Resolves to { ok, text } or { ok: false, error }.
export async function askMentor({ apiKey, model, history, context, onText, signal }) {
  const client = getClient(apiKey)

  const params = {
    model,
    max_tokens: 8000,
    // The persona is stable across every request, so it gets the cache
    // breakpoint; the volatile portfolio/market snapshot follows it uncached.
    system: [
      { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: context },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    // Chat pacing: medium keeps replies quick without dulling the analysis.
    output_config: { effort: 'medium' },
  }

  async function run(useFallbacks) {
    const stream = useFallbacks
      ? client.beta.messages.stream({
          ...params,
          // If safety classifiers decline a request, Anthropic re-runs it on a
          // recommended fallback model server-side instead of failing.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        }, { signal })
      : client.messages.stream(params, { signal })

    stream.on('text', (delta) => onText(delta))
    return stream.finalMessage()
  }

  try {
    let final
    try {
      final = await run(true)
    } catch (err) {
      // Older accounts may not have the fallback beta enabled; retry plainly.
      if (err instanceof Anthropic.BadRequestError) final = await run(false)
      else throw err
    }

    if (final.stop_reason === 'refusal') {
      return {
        ok: false,
        error: 'The model declined to answer that one. Try rephrasing — this mentor is for learning about investing and analysis.',
      }
    }
    const text = final.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
    return { ok: true, text }
  } catch (err) {
    if (err?.name === 'AbortError') return { ok: false, aborted: true }
    return { ok: false, error: friendlyError(err) }
  }
}

// Starter questions, tailored to where the user actually is.
export function suggestedPrompts(state, summary, focusTicker) {
  if (focusTicker) {
    return [
      `Walk me through how you'd analyze ${focusTicker} as an analyst.`,
      `Is ${focusTicker} expensive or cheap right now, and how would I tell?`,
      `What are the three biggest risks in owning ${focusTicker}?`,
      `If I bought ${focusTicker} today, where would you put a stop-loss and why?`,
    ]
  }
  const done = Object.keys(state.completedLessons).length
  if (summary.positions.length > 0) {
    return [
      'Review my portfolio like an analyst would. What stands out?',
      'Am I taking too much risk in any single position?',
      'How do I decide when to sell something I own?',
      'Which of my holdings would suffer most in a recession, and why?',
    ]
  }
  if (done === 0) {
    return [
      "I'm a total beginner. Explain what a stock actually is, like I'm new to this.",
      'How much money do I need to start investing, and what should I do first?',
      'What is the single most common mistake beginners make?',
      'What is the difference between investing and gambling?',
    ]
  }
  return [
    'How do I read a P/E ratio, and when is a low one a trap?',
    'Explain position sizing with a worked example using $10,000.',
    'What is an economic moat, and how do I check if a company really has one?',
    'Give me a drill: quiz me on judging whether a business is healthy.',
  ]
}
