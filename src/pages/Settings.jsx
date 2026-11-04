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
import { LIVE_COMPANIES } from '../lib/livedata.js'
import { isLiveMode } from '../lib/market.js'
import { MENTOR_MODELS } from '../lib/mentor.js'
import { useStore } from '../lib/store.jsx'
import {
  IconBulb, IconCheck, IconInfo, IconLock, IconMentor, IconRefresh,
  IconSettings, IconWarning,
} from '../components/icons.jsx'

function MentorSettings() {
  const { state, updateSettings } = useStore()
  const [keyInput, setKeyInput] = useState(state.settings.anthropicKey)
  const [showKey, setShowKey] = useState(false)
  const saved = state.settings.anthropicKey && state.settings.anthropicKey === keyInput.trim()
  const model = state.settings.mentorModel || MENTOR_MODELS[0].id

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="row spread">
        <h3 style={{ margin: 0 }}><IconMentor size={17} /> AI mentor (Claude API)</h3>
        {state.settings.anthropicKey
          ? <span className="pill good-bg"><IconCheck size={12} /> mentor enabled</span>
          : <span className="pill neutral">not configured</span>}
      </div>
      <p className="small secondary">
        The <Link to="/mentor">AI Mentor</Link> is a senior-analyst chat partner: it explains any
        concept, walks you through analyzing a company, reviews your practice portfolio, and quizzes
        you. It runs on Anthropic's Claude models and needs your own API key.
      </p>

      <h3>1. Get a Claude API key</h3>
      <ol className="small secondary" style={{ paddingLeft: 20 }}>
        <li>Sign up at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> and add a small amount of credit (a few dollars goes a long way for chat).</li>
        <li>Create an API key — it starts with <code>sk-ant-</code>.</li>
        <li>Paste it below.</li>
      </ol>

      <h3>2. Save your key</h3>
      <div className="row" style={{ alignItems: 'center' }}>
        <input
          type={showKey ? 'text' : 'password'}
          placeholder="sk-ant-..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          style={{ width: 320, maxWidth: '100%' }}
          autoComplete="off"
        />
        <button onClick={() => setShowKey((s) => !s)}>{showKey ? 'Hide' : 'Show'}</button>
        <button className="primary" disabled={!keyInput.trim() || saved}
          onClick={() => updateSettings({ anthropicKey: keyInput.trim() })}>
          {saved ? <><IconCheck size={14} /> Saved</> : 'Save Claude key'}
        </button>
        {state.settings.anthropicKey && (
          <button className="danger-outline"
            onClick={() => { updateSettings({ anthropicKey: '' }); setKeyInput('') }}>
            Remove
          </button>
        )}
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        <IconLock size={13} /> Stored only in this browser (localStorage) and sent only to Anthropic — the app has no
        server. Because the key lives in the browser, use a key with a spending limit, and don't
        save one on a shared or public computer.
      </p>

      <h3>3. Choose a model</h3>
      <div className="row">
        <select value={model} onChange={(e) => updateSettings({ mentorModel: e.target.value })}>
          {MENTOR_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <span className="small secondary">
          {MENTOR_MODELS.find((m) => m.id === model)?.note}
        </span>
      </div>
      <p className="small muted" style={{ marginBottom: 0 }}>
        You pay Anthropic directly for what you use. A typical mentor answer costs a fraction of a
        cent to a few cents depending on the model.
      </p>
    </div>
  )
}

// Probes the user's own key with one US symbol, one Xetra symbol and one FX
// pair, and reports exactly what their plan returns. This is the honest way
// to answer "why is my European stock empty?" — the app cannot know a plan's
// entitlements without asking.
function CoverageCheck({ apiKey }) {
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  async function run() {
    if (!apiKey || busy) return
    setBusy(true)
    setResult(null)
    const probes = [
      { label: 'US stocks', symbol: 'AAPL' },
      { label: 'Xetra (Germany)', symbol: 'BMW:XETR' },
      { label: 'London', symbol: 'SHEL:LSE' },
      { label: 'Forex (EUR/USD)', symbol: 'EUR/USD' },
    ]
    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(probes.map((p) => p.symbol).join(','))}&interval=1day&outputsize=2&apikey=${encodeURIComponent(apiKey)}`
      const res = await fetch(url)
      const body = await res.json()
      if (body.status === 'error') {
        setResult({ error: body.message || 'The API rejected the request.' })
      } else {
        setResult({
          rows: probes.map((p) => {
            const entry = body[p.symbol] ?? body
            const ok = Array.isArray(entry?.values) && entry.values.length > 0
            return { ...p, ok, message: ok ? 'available' : (entry?.message || 'no data returned') }
          }),
        })
      }
    } catch {
      setResult({ error: 'Could not reach Twelve Data (connection blocked or offline).' })
    }
    setBusy(false)
  }

  return (
    <>
      <h3>What does my key actually cover?</h3>
      <p className="small secondary" style={{ marginTop: 0 }}>
        Plans differ, so the app asks your key directly: it requests one US symbol, one Xetra
        symbol, one London symbol and one currency pair, and reports what comes back. Costs 4 API
        credits.
      </p>
      <button onClick={run} disabled={!apiKey || busy}>
        {busy ? 'Checking…' : 'Check my data coverage'}
      </button>
      {result?.error && <p className="small down" style={{ marginTop: 8 }}><IconWarning size={13} /> {result.error}</p>}
      {result?.rows && (
        <>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead><tr><th>Market</th><th>Probe</th><th>Result</th></tr></thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.symbol}>
                    <td>{r.label}</td>
                    <td className="small muted">{r.symbol}</td>
                    <td>
                      <span className={'pill ' + (r.ok ? 'good-bg' : 'crit-bg')}>{r.ok ? 'available' : 'not available'}</span>
                      {!r.ok && <div className="small muted">{r.message}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.some((r) => !r.ok && r.symbol.includes(':')) && (
            <p className="small secondary" style={{ marginTop: 8 }}>
              European exchanges are not included in your current plan. You have three options:
              keep <strong>manual prices</strong> for those holdings (totals and P&amp;L stay exact,
              charts come from the US proxy), switch those positions to their{' '}
              <strong>US listings/ADRs</strong> where one exists, or upgrade to a Twelve Data plan
              that includes international exchanges (from about $29/month). Nothing in the app
              breaks either way — every row tells you which prices are live and which are manual.
            </p>
          )}
        </>
      )}
    </>
  )
}

export default function Settings() {
  const { state, liveStatus, updateSettings, refreshLiveData } = useStore()
  const [keyInput, setKeyInput] = useState(state.settings.apiKey)
  const [showKey, setShowKey] = useState(false)

  const saved = state.settings.apiKey && state.settings.apiKey === keyInput.trim()

  function saveKey() {
    updateSettings({ apiKey: keyInput.trim() })
  }

  const statusPill =
    liveStatus.phase === 'on' ? <span className="pill good-bg"><IconCheck size={12} /> live data active</span> :
    liveStatus.phase === 'loading' ? <span className="pill warn-bg">loading…</span> :
    liveStatus.phase === 'error' ? <span className="pill crit-bg"><IconWarning size={12} /> error</span> :
    <span className="pill neutral">simulated mode</span>

  return (
    <div>
      <h1><IconSettings size={24} /> Settings</h1>
      <p className="subtitle">
        The app works fully without any setup, using its simulated market. If you want to practice
        on <strong>real stocks with real prices</strong> (Apple, Microsoft, NVIDIA…), plug in a free
        API key below.
      </p>

      <div className="card">
        <div className="row spread">
          <h3 style={{ margin: 0 }}>Data source</h3>
          {statusPill}
        </div>
        <p className="small secondary">
          <strong>Simulated</strong> — 12 fictional companies with realistic prices and full
          fundamentals. Best for learning: consistent, always available, and free of real-world noise.
          <br />
          <strong>Live</strong> — {LIVE_COMPANIES.length} real US stocks
          ({LIVE_COMPANIES.map((c) => c.ticker).join(', ')}) with real daily price history and
          quotes from Twelve Data. Charts, indicators, and paper trading all work; curated
          fundamentals and health scores remain a simulated-market feature.
        </p>

        <h3>1. Get a free API key</h3>
        <ol className="small secondary" style={{ paddingLeft: 20 }}>
          <li>Go to <a href="https://twelvedata.com/pricing" target="_blank" rel="noreferrer">twelvedata.com</a> and create a free account (no credit card needed).</li>
          <li>Copy the API key from your Twelve Data dashboard.</li>
          <li>Paste it here. The free tier is plenty: this app uses ~8 of your 800 daily credits, and caches the data for the rest of the day.</li>
        </ol>

        <h3>2. Save your key</h3>
        <div className="row" style={{ alignItems: 'center' }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="Paste your Twelve Data API key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={{ width: 320, maxWidth: '100%' }}
            autoComplete="off"
          />
          <button onClick={() => setShowKey((s) => !s)}>{showKey ? 'Hide' : 'Show'}</button>
          <button className="primary" onClick={saveKey} disabled={!keyInput.trim() || saved}>
            {saved ? <><IconCheck size={14} /> Saved</> : 'Save key'}
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          <IconLock size={13} /> Your key is stored only in this browser (localStorage) and sent only to Twelve Data.
          It never touches any other server. Don't use a paid key on a shared computer.
        </p>

        <CoverageCheck apiKey={state.settings.apiKey} />

        <h3>3. Turn on live data</h3>
        <div className="row">
          <button
            className={state.settings.liveMode ? '' : 'primary'}
            disabled={!state.settings.liveMode}
            onClick={() => updateSettings({ liveMode: false })}
          >
            Simulated market
          </button>
          <button
            className={state.settings.liveMode ? 'primary' : ''}
            disabled={state.settings.liveMode || !state.settings.apiKey}
            onClick={() => updateSettings({ liveMode: true })}
          >
            Live market {!state.settings.apiKey && '(save a key first)'}
          </button>
          {state.settings.liveMode && isLiveMode() && (
            <button onClick={refreshLiveData}><IconRefresh size={14} /> Refresh today's data</button>
          )}
        </div>

        {liveStatus.message && (
          <p className={'small ' + (liveStatus.phase === 'error' ? 'down' : 'secondary')}
            style={{ marginTop: 10 }}>
            {liveStatus.phase === 'error' && <IconWarning size={13} />} {liveStatus.message}
            {liveStatus.phase === 'error' && ' The app has fallen back to the simulated market.'}
          </p>
        )}
      </div>

      <MentorSettings />

      <div className="notice" style={{ marginTop: 16 }}>
        <IconBulb size={15} />
        <span>Your practice portfolio applies to whichever market is active. If you switch between
        simulated and live modes, positions from the other mode keep their ticker but can't be
        priced — the cleanest workflow is to <Link to="/portfolio">reset your portfolio</Link> when
        you switch, and treat it as a fresh start on the new market.</span>
      </div>
    </div>
  )
}
