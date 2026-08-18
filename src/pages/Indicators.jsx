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

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import IndicatorChart from '../components/IndicatorChart.jsx'
import { FAMILIES, INDICATORS } from '../data/indicatorGuide.js'
import { getCompanies, getSeries } from '../lib/market.js'
import { useStore } from '../lib/store.jsx'
import {
  IconBulb, IconCompass, IconPulse, IconTrend, IconWarning,
} from '../components/icons.jsx'

const RANGES = { '6M': 126, '1Y': 252, '2Y': 504 }

const STATE_PILL = {
  bullish: 'good-bg', bearish: 'crit-bg',
  stretched: 'warn-bg', 'washed-out': 'warn-bg',
  divergence: 'warn-bg', mixed: 'neutral', neutral: 'neutral',
}

function IndicatorCard({ indicator, candles }) {
  const reading = useMemo(() => {
    try { return indicator.reading(candles) } catch { return null }
  }, [indicator, candles])

  return (
    <div className="card ind-card">
      <div className="row spread" style={{ alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0 }}>{indicator.name}</h3>
        <div className="row" style={{ gap: 6 }}>
          <span className="pill neutral">{indicator.lag}</span>
          <span className="pill neutral">{indicator.params}</span>
        </div>
      </div>

      <p className="secondary" style={{ margin: '8px 0 14px' }}>{indicator.what}</p>

      <IndicatorChart
        indicator={indicator}
        candles={candles}
        height={indicator.render === 'overlay' ? 230 : 170}
      />

      {reading && (
        <div className="ind-reading">
          <span className={'pill ' + (STATE_PILL[reading.state] || 'neutral')}>{reading.state}</span>
          <span>{reading.text}</span>
        </div>
      )}

      <div className="ind-grid">
        <div>
          <div className="ind-h"><IconCompass size={13} /> What it looks like</div>
          <p className="small secondary" style={{ margin: 0 }}>{indicator.look}</p>
        </div>
        <div>
          <div className="ind-h"><IconBulb size={13} /> How to read it</div>
          <ul className="small secondary ind-list">
            {indicator.read.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      </div>

      <div className="callout warn" style={{ marginBottom: 0 }}>
        <div className="callout-title"><IconWarning size={15} /> Where it fails</div>
        <div className="small">{indicator.limits}</div>
      </div>
    </div>
  )
}

export default function Indicators() {
  const { dataVersion } = useStore()
  const companies = getCompanies()
  const [ticker, setTicker] = useState(companies[0]?.ticker || '')
  const [range, setRange] = useState('1Y')
  const [family, setFamily] = useState('all')

  const candles = useMemo(() => {
    const full = getSeries(ticker)
    const n = Math.min(RANGES[range], full.length)
    return full.slice(full.length - n)
  }, [ticker, range, dataVersion])

  const shown = family === 'all' ? INDICATORS : INDICATORS.filter((i) => i.family === family)
  const activeFamily = FAMILIES.find((f) => f.id === family)

  return (
    <div>
      <h1><IconPulse size={24} /> Indicator reference</h1>
      <p className="subtitle">
        Every indicator, drawn on real price data so you can see exactly what it looks like — plus
        what it measures, how to read it, what it is saying about this chart right now, and where it
        misleads you. Change the stock and the range to watch each one behave in different
        conditions. The theory behind them is in{' '}
        <Link to="/learn/technical/indicator-families">the Technical Analysis module</Link>.
      </p>

      <div className="card ind-controls">
        <div className="row spread">
          <div className="row">
            <label htmlFor="ind-ticker" style={{ margin: 0 }}>Stock</label>
            <select id="ind-ticker" value={ticker} onChange={(e) => setTicker(e.target.value)}>
              {companies.map((c) => (
                <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>
              ))}
            </select>
          </div>
          <div className="range-tabs">
            {Object.keys(RANGES).map((r) => (
              <button key={r} className={r === range ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="toggle-row" style={{ marginBottom: 0 }}>
          <button className={'toggle-chip' + (family === 'all' ? ' on' : '')}
            onClick={() => setFamily('all')}>
            All {INDICATORS.length}
          </button>
          {FAMILIES.map((f) => (
            <button key={f.id}
              className={'toggle-chip' + (family === f.id ? ' on' : '')}
              onClick={() => setFamily(f.id)}>
              {f.name} {INDICATORS.filter((i) => i.family === f.id).length}
            </button>
          ))}
        </div>
      </div>

      {activeFamily ? (
        <div className="callout" style={{ marginTop: 18 }}>
          <div className="callout-title"><IconTrend size={15} /> {activeFamily.name} indicators</div>
          <div>{activeFamily.blurb}</div>
        </div>
      ) : (
        <div className="grid grid-2" style={{ marginTop: 18 }}>
          {FAMILIES.map((f) => (
            <div className="card" key={f.id} style={{ marginTop: 0 }}>
              <div className="row spread">
                <h3 style={{ margin: 0 }}>{f.name}</h3>
                <span className="pill neutral">
                  {INDICATORS.filter((i) => i.family === f.id).length} indicators
                </span>
              </div>
              <p className="small secondary" style={{ margin: '6px 0 0' }}>{f.blurb}</p>
            </div>
          ))}
        </div>
      )}

      <div className="notice" style={{ margin: '18px 0' }}>
        <IconWarning size={15} />
        <span>
          No indicator predicts the future — every one is a transformation of past price and volume.
          They are useful for describing conditions and defining risk, not for forecasting. Reading
          five indicators from the same family is not confirmation; it is the same number counted
          five times.
        </span>
      </div>

      {shown.map((ind) => (
        <IndicatorCard key={ind.id} indicator={ind} candles={candles} />
      ))}
    </div>
  )
}
