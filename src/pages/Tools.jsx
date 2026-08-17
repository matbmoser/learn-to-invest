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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fmtMoney } from '../lib/format.js'

function Num({ label, value, onChange, step = 'any', suffix }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="row" style={{ gap: 6 }}>
        <input type="number" value={value} step={step}
          onChange={(e) => onChange(e.target.value)} style={{ width: 140 }} />
        {suffix && <span className="small muted">{suffix}</span>}
      </div>
    </div>
  )
}

function PositionSize() {
  const [portfolio, setPortfolio] = useState('10000')
  const [riskPct, setRiskPct] = useState('1')
  const [entry, setEntry] = useState('50')
  const [stop, setStop] = useState('45')
  const p = +portfolio; const r = +riskPct; const e = +entry; const s = +stop
  const riskPerShare = e - s
  const maxLoss = p * (r / 100)
  const shares = riskPerShare > 0 ? Math.floor(maxLoss / riskPerShare) : 0
  const positionValue = shares * e
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>📐 Position size calculator</h3>
      <p className="small secondary">
        The 1–2% rule from the <Link to="/learn/risk/position-sizing">Risk module</Link>: risk a
        fixed small % of your portfolio per idea; let the stop distance set the share count.
      </p>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <Num label="Portfolio value ($)" value={portfolio} onChange={setPortfolio} />
        <Num label="Risk per trade (%)" value={riskPct} onChange={setRiskPct} step="0.5" />
        <Num label="Entry price ($)" value={entry} onChange={setEntry} />
        <Num label="Stop-loss price ($)" value={stop} onChange={setStop} />
      </div>
      {riskPerShare > 0 && p > 0 ? (
        <div className="notice">
          Max loss if the stop hits: <strong>{fmtMoney(maxLoss)}</strong> · Risk per share:{' '}
          <strong>{fmtMoney(riskPerShare)}</strong> → Buy at most{' '}
          <strong>{shares} shares</strong> ({fmtMoney(positionValue)} position,{' '}
          {p > 0 ? ((positionValue / p) * 100).toFixed(1) : 0}% of portfolio).
        </div>
      ) : (
        <div className="notice">Enter a stop below the entry price to size the position.</div>
      )}
    </div>
  )
}

function RiskReward() {
  const [entry, setEntry] = useState('100')
  const [stop, setStop] = useState('95')
  const [target, setTarget] = useState('115')
  const e = +entry; const s = +stop; const t = +target
  const risk = e - s
  const reward = t - e
  const ratio = risk > 0 ? reward / risk : 0
  const breakeven = risk > 0 && reward > 0 ? (risk / (risk + reward)) * 100 : null
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>⚖️ Risk / reward calculator</h3>
      <p className="small secondary">
        Skip trades under 2:1 — good ratios let you be wrong often and still profit
        (<Link to="/learn/risk/risk-reward">expectancy lesson</Link>).
      </p>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <Num label="Entry price ($)" value={entry} onChange={setEntry} />
        <Num label="Stop-loss ($)" value={stop} onChange={setStop} />
        <Num label="Target price ($)" value={target} onChange={setTarget} />
      </div>
      {risk > 0 && reward > 0 ? (
        <div className="notice">
          Risking <strong>{fmtMoney(risk)}</strong> to make <strong>{fmtMoney(reward)}</strong> ={' '}
          <strong>{ratio.toFixed(1)} : 1</strong>{' '}
          {ratio >= 3 ? '✅ excellent' : ratio >= 2 ? '✔️ acceptable' : '⚠️ below the 2:1 guideline'} ·
          Break-even win rate: <strong>{breakeven.toFixed(0)}%</strong> — win more often than that
          and this trade profile makes money over time.
        </div>
      ) : (
        <div className="notice">Stop must be below entry and target above entry.</div>
      )}
    </div>
  )
}

function Compound() {
  const [initial, setInitial] = useState('1000')
  const [monthly, setMonthly] = useState('200')
  const [rate, setRate] = useState('8')
  const [years, setYears] = useState('20')
  const P = +initial; const m = +monthly; const r = +rate / 100 / 12; const n = +years * 12
  let fv = P
  for (let i = 0; i < n; i++) fv = fv * (1 + r) + m
  const contributed = P + m * n
  const growth = fv - contributed
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🌱 Compound growth calculator</h3>
      <p className="small secondary">
        The engine from <Link to="/learn/foundations/what-is-a-stock">lesson one</Link>: time in
        the market, plus regular contributions, does the heavy lifting.
      </p>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <Num label="Starting amount ($)" value={initial} onChange={setInitial} />
        <Num label="Monthly contribution ($)" value={monthly} onChange={setMonthly} />
        <Num label="Annual return (%)" value={rate} onChange={setRate} step="0.5" />
        <Num label="Years" value={years} onChange={setYears} step="1" />
      </div>
      {n > 0 && (
        <div className="notice">
          After <strong>{years} years</strong>: <strong>{fmtMoney(fv, 0)}</strong> — you contributed{' '}
          {fmtMoney(contributed, 0)}, and compounding added <strong>{fmtMoney(growth, 0)}</strong>{' '}
          ({contributed > 0 ? ((growth / contributed) * 100).toFixed(0) : 0}% on top).
        </div>
      )}
    </div>
  )
}

function IntrinsicValue() {
  const [fcf, setFcf] = useState('5')
  const [growth, setGrowth] = useState('10')
  const [terminal, setTerminal] = useState('4')
  const [discount, setDiscount] = useState('10')
  const [price, setPrice] = useState('80')
  const f0 = +fcf; const g = +growth / 100; const gt = +terminal / 100; const d = +discount / 100
  let value = null
  if (f0 > 0 && d > gt && d > 0) {
    value = 0
    let f = f0
    for (let y = 1; y <= 5; y++) {
      f = f * (1 + g)
      value += f / Math.pow(1 + d, y)
    }
    const terminalValue = (f * (1 + gt)) / (d - gt)
    value += terminalValue / Math.pow(1 + d, 5)
  }
  const p = +price
  const mos = value && p > 0 ? ((value - p) / value) * 100 : null
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🏷️ Intrinsic value (simplified DCF)</h3>
      <p className="small secondary">
        Five years of projected free cash flow plus a terminal value, discounted to today —
        the model from the <Link to="/learn/analyst/intrinsic-value">valuation lesson</Link>.
        Play with the assumptions and watch how sensitive "fair value" is.
      </p>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <Num label="FCF per share ($)" value={fcf} onChange={setFcf} />
        <Num label="Growth, years 1–5 (%)" value={growth} onChange={setGrowth} />
        <Num label="Terminal growth (%)" value={terminal} onChange={setTerminal} />
        <Num label="Discount rate (%)" value={discount} onChange={setDiscount} />
        <Num label="Current price ($)" value={price} onChange={setPrice} />
      </div>
      {value ? (
        <div className="notice">
          Estimated intrinsic value: <strong>{fmtMoney(value)}</strong> per share.{' '}
          {mos != null && (mos > 0
            ? <>At {fmtMoney(p)}, the margin of safety is <strong>{mos.toFixed(0)}%</strong>{' '}
                {mos >= 25 ? '✅ — inside the 25–40% professional guideline.' : '⚠️ — thinner than the 25% guideline; your assumptions must be right.'}</>
            : <>At {fmtMoney(p)}, the market price is <strong>above</strong> this estimate — the market
                is assuming rosier numbers than yours.</>)}
          <div className="small muted" style={{ marginTop: 6 }}>
            Remember: a valuation is a range, not a truth. Discount rate must exceed terminal growth.
          </div>
        </div>
      ) : (
        <div className="notice">Enter a positive FCF and a discount rate above the terminal growth rate.</div>
      )}
    </div>
  )
}

export default function Tools() {
  return (
    <div>
      <h1>🧮 Analyst tools</h1>
      <p className="subtitle">
        The four calculations every lesson keeps coming back to. Use them on simulator trades
        first, then on any real decision.
      </p>
      <PositionSize />
      <div style={{ height: 16 }} />
      <RiskReward />
      <div style={{ height: 16 }} />
      <Compound />
      <div style={{ height: 16 }} />
      <IntrinsicValue />
    </div>
  )
}
