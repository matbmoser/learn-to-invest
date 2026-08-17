import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LIVE_COMPANIES } from '../lib/livedata.js'
import { isLiveMode } from '../lib/market.js'
import { useStore } from '../lib/store.jsx'

export default function Settings() {
  const { state, liveStatus, updateSettings, refreshLiveData } = useStore()
  const [keyInput, setKeyInput] = useState(state.settings.apiKey)
  const [showKey, setShowKey] = useState(false)

  const saved = state.settings.apiKey && state.settings.apiKey === keyInput.trim()

  function saveKey() {
    updateSettings({ apiKey: keyInput.trim() })
  }

  const statusPill =
    liveStatus.phase === 'on' ? <span className="pill good-bg">● live data active</span> :
    liveStatus.phase === 'loading' ? <span className="pill warn-bg">⏳ loading…</span> :
    liveStatus.phase === 'error' ? <span className="pill crit-bg">⚠ error</span> :
    <span className="pill neutral">simulated mode</span>

  return (
    <div>
      <h1>⚙️ Settings — market data</h1>
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
            {saved ? 'Saved ✓' : 'Save key'}
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          🔒 Your key is stored only in this browser (localStorage) and sent only to Twelve Data.
          It never touches any other server. Don't use a paid key on a shared computer.
        </p>

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
            <button onClick={refreshLiveData}>↻ Refresh today's data</button>
          )}
        </div>

        {liveStatus.message && (
          <p className={'small ' + (liveStatus.phase === 'error' ? 'down' : 'secondary')}
            style={{ marginTop: 10 }}>
            {liveStatus.phase === 'error' ? '⚠️ ' : ''}{liveStatus.message}
            {liveStatus.phase === 'error' && ' The app has fallen back to the simulated market.'}
          </p>
        )}
      </div>

      <div className="notice" style={{ marginTop: 16 }}>
        💡 Your practice portfolio applies to whichever market is active. If you switch between
        simulated and live modes, positions from the other mode keep their ticker but can't be
        priced — the cleanest workflow is to <Link to="/portfolio">reset your portfolio</Link> when
        you switch, and treat it as a fresh start on the new market.
      </div>
    </div>
  )
}
