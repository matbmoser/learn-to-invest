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

// The user's REAL portfolio dashboard: track the instruments you actually
// own (editable, addable), monitor the ones you choose, chart them live via
// Twelve Data where available, and get educational analyst reads from
// Claude — with a docked analyst chat on the left for questions.

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Markdown from '../components/markdown.jsx'
import LiveChart from '../components/LiveChart.jsx'
import AnalystDock from '../components/AnalystDock.jsx'
import { AllocationBars, PnLBars, PnLTiles, WealthChart } from '../components/PortfolioViz.jsx'
import { askMentor, MENTOR_MODELS } from '../lib/mentor.js'
import {
  buildRealContext, chartSymbol, clearRealCache, fetchRealData, getCachedRealData,
  periodPnL, portfolioHistory, priceProblem, proxyHint, realSummary, requestSymbol,
} from '../lib/realportfolio.js'
import { useStore } from '../lib/store.jsx'
import {
  IconCheck, IconMentor, IconPulse, IconRefresh, IconTrade, IconWarning, IconX,
} from '../components/icons.jsx'

const cur = (n, c = 'EUR', digits = 2) =>
  n == null ? '—' : `${n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${c === 'EUR' ? '€' : '$'}`
const pctFmt = (v) => (v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`)

const EMPTY_FORM = {
  name: '', symbol: '', exchange: '', currency: 'EUR', type: 'stock',
  shares: '', avgCost: '', manualPrice: '', chartSymbol: '', monitored: true,
}

function InstrumentForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const isPrivate = f.type === 'private'
  const hint = proxyHint(f)
  return (
    <form
      className="invest-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!f.name.trim()) return
        onSave({
          ...f,
          name: f.name.trim(),
          symbol: isPrivate ? '' : f.symbol.trim().toUpperCase(),
          exchange: isPrivate ? '' : f.exchange.trim().toUpperCase(),
          chartSymbol: f.chartSymbol.trim().toUpperCase(),
          shares: Math.max(0, parseFloat(f.shares) || 0),
          avgCost: Math.max(0, parseFloat(f.avgCost) || 0),
          manualPrice: Math.max(0, parseFloat(f.manualPrice) || 0),
        })
      }}
    >
      <div className="invest-form-grid">
        <label>Name
          <input value={f.name} onChange={set('name')} placeholder="e.g. Siemens" required />
        </label>
        <label>Type
          <select value={f.type} onChange={set('type')}>
            <option value="stock">Stock</option>
            <option value="etf">ETF / fund</option>
            <option value="private">Private (no ticker)</option>
          </select>
        </label>
        {!isPrivate && (
          <label>Symbol
            <input value={f.symbol} onChange={set('symbol')} placeholder="e.g. SIE" />
          </label>
        )}
        {!isPrivate && (
          <label>Exchange <span className="muted">(blank = US)</span>
            <input value={f.exchange} onChange={set('exchange')} placeholder="e.g. XETR" />
          </label>
        )}
        <label>Currency
          <select value={f.currency} onChange={set('currency')}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label>Shares you own
          <input type="number" step="any" min="0" value={f.shares} onChange={set('shares')} placeholder="0" />
        </label>
        <label>Avg cost / share
          <input type="number" step="any" min="0" value={f.avgCost} onChange={set('avgCost')} placeholder="0.00" />
        </label>
        <label>Manual price <span className="muted">(fallback)</span>
          <input type="number" step="any" min="0" value={f.manualPrice} onChange={set('manualPrice')} placeholder="0.00" />
        </label>
        {!isPrivate && (
          <label>Chart proxy <span className="muted">(US symbol, chart only)</span>
            <input value={f.chartSymbol} onChange={set('chartSymbol')} placeholder={hint ? hint.symbol : 'e.g. BMWYY'} />
          </label>
        )}
      </div>
      {hint && !f.chartSymbol && (
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          Suggested chart proxy for {f.symbol}: <button type="button" className="toggle-chip"
            onClick={() => setF({ ...f, chartSymbol: hint.symbol })}>{hint.symbol}</button>{' '}
          — {hint.what}. It only draws the chart; your value and P&amp;L always use the price above.
        </p>
      )}
      <div className="row" style={{ marginTop: 10 }}>
        <button type="submit" className="primary"><IconCheck size={14} /> Save</button>
        <button type="button" onClick={onCancel}><IconX size={14} /> Cancel</button>
      </div>
    </form>
  )
}

export default function MyInvestments() {
  const { state, addInstrument, updateInstrument, removeInstrument, setRead, setRealChat } = useStore()
  const instruments = state.realPortfolio.instruments || []
  const reads = state.realPortfolio.reads || {}
  const twelveKey = state.settings.apiKey
  const anthropicKey = state.settings.anthropicKey
  const model = state.settings.mentorModel || MENTOR_MODELS[0].id

  const [liveData, setLiveData] = useState(null)
  const [liveStatus, setLiveStatus] = useState({ phase: twelveKey ? 'loading' : 'off', message: '' })
  const [reloadTick, setReloadTick] = useState(0)
  const [editingId, setEditingId] = useState(null) // instrument id | 'new' | null
  const [dockOpen, setDockOpen] = useState(true)
  const [readBusy, setReadBusy] = useState(null) // instrument id being analysed

  const symbolsKey = instruments.map(requestSymbol).filter(Boolean).join(',')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!twelveKey) { setLiveStatus({ phase: 'off', message: '' }); setLiveData(null); return }
      const cached = getCachedRealData()
      if (cached && Object.keys(cached.data).length > 0 && reloadTick === 0) {
        setLiveData(cached)
        setLiveStatus({ phase: 'on', message: 'Using today\'s cached prices.' })
        return
      }
      setLiveStatus({ phase: 'loading', message: 'Fetching prices…' })
      try {
        const result = await fetchRealData(twelveKey, instruments)
        if (cancelled) return
        setLiveData(result)
        setLiveStatus({ phase: 'on', message: 'Live prices updated.' })
      } catch (e) {
        if (cancelled) return
        setLiveData(null)
        setLiveStatus({ phase: 'error', message: e.message })
      }
    }
    run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twelveKey, symbolsKey, reloadTick])

  const summary = useMemo(() => realSummary(instruments, liveData), [instruments, liveData])
  const problems = useMemo(() => {
    const out = {}
    for (const inst of instruments) {
      const p = priceProblem(inst, liveData)
      if (p) out[inst.id] = p
    }
    return out
  }, [instruments, liveData])
  const problemIds = Object.keys(problems)
  const history = useMemo(() => portfolioHistory(instruments, liveData), [instruments, liveData])
  const pnl = useMemo(() => periodPnL(history), [history])
  const context = useMemo(() => buildRealContext(instruments, liveData, summary, pnl), [instruments, liveData, summary, pnl])
  const monitored = summary.rows.filter((r) => r.monitored)

  async function getRead(inst) {
    if (!anthropicKey || readBusy) return
    setReadBusy(inst.id)
    const prompt =
      `Give me an educational analyst read on my real holding "${inst.name}"` +
      `${inst.symbol ? ` (${inst.symbol})` : ''}. Structure it as: what this asset actually is; ` +
      'how it has behaved recently (use the data you can see); what an analyst would watch next ' +
      '(events, levels, fundamentals); the main risks of my position; and which Academy module ' +
      'would teach me the most about it right now. Keep it under 250 words. ' +
      'Teach me how to think about it — do not tell me to buy or sell.'
    const res = await askMentor({
      apiKey: anthropicKey, model,
      history: [{ role: 'user', content: prompt }],
      context,
      onText: () => {},
    })
    setReadBusy(null)
    if (res.ok) setRead(inst.id, { text: res.text, at: Date.now() })
    else setRead(inst.id, { text: `_${res.error || 'The analyst could not answer just now.'}_`, at: Date.now() })
  }

  function saveInstrument(values) {
    if (editingId === 'new') {
      const id = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
      addInstrument({ id, monitored: true, ...values })
    } else {
      updateInstrument(editingId, values)
    }
    setEditingId(null)
  }

  const editing = editingId && editingId !== 'new' ? instruments.find((i) => i.id === editingId) : null

  return (
    <div className="invest-layout">
      <AnalystDock
        open={dockOpen} setOpen={setDockOpen} context={context}
        history={state.realPortfolio.chat || []} setHistory={setRealChat}
        placeholder="Ask about your holdings…"
        suggestions={[
          'Review my real portfolio. What stands out?',
          'Am I too concentrated in German carmakers?',
          'How should I think about my ETF vs my single stocks?',
          'What would you check before adding to any position?',
        ]}
      />

      <div className="invest-main">
        <div className="row spread" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ marginBottom: 4 }}><IconTrade size={24} /> My investments</h1>
            <p className="small secondary" style={{ margin: 0 }}>
              Your real holdings — tracked, charted, and explained. Everything stays in this browser.
            </p>
          </div>
          <div className="row">
            {twelveKey && (
              <button onClick={() => { clearRealCache(); setReloadTick((t) => t + 1) }}>
                <IconRefresh size={14} /> Update data
              </button>
            )}
            <button className="primary" onClick={() => setEditingId('new')}>+ Add instrument</button>
          </div>
        </div>

        {!twelveKey && (
          <div className="notice" style={{ marginTop: 14 }}>
            <IconPulse size={15} />
            <span>
              No market-data key set, so prices come from your manual entries.
              Add a free <strong>Twelve Data</strong> key in <Link to="/settings">Settings</Link> for
              live prices and charts (US symbols like AAPL and NIO work on the free plan; XETRA
              listings such as BMW need a paid plan — or just set a manual price).
            </span>
          </div>
        )}
        {liveStatus.phase === 'error' && (
          <div className="notice" style={{ marginTop: 14 }}>
            <IconWarning size={15} /><span>{liveStatus.message}</span>
          </div>
        )}
        {twelveKey && problemIds.length > 0 && (
          <div className="notice" style={{ marginTop: 14 }}>
            <IconWarning size={15} />
            <span>
              <strong>{problemIds.length} of {instruments.length} instruments have no live price.</strong>{' '}
              Twelve Data's free plan covers US stocks, forex and crypto — European listings
              (XETRA, LSE) need a paid plan, which is why {' '}
              {instruments.filter((i) => problems[i.id] && i.exchange).map((i) => i.symbol).join(', ') || 'some symbols'}{' '}
              come back empty while US tickers work. Each row below says exactly why, and offers a
              manual price plus an optional US chart proxy.
            </span>
          </div>
        )}

        <div className="grid grid-4" style={{ marginTop: 16 }}>
          <div className="card" style={{ marginTop: 0 }}>
            <div className="stat-label">Priced positions value</div>
            <div className="stat-value">{summary.valueEUR > 0 ? cur(summary.valueEUR, 'EUR', 0) : '—'}</div>
            {summary.unpriced > 0 && <div className="small muted">+{summary.unpriced} without a price</div>}
          </div>
          <div className="card" style={{ marginTop: 0 }}>
            <div className="stat-label">Cost of those positions</div>
            <div className="stat-value">{summary.costEUR > 0 ? cur(summary.costEUR, 'EUR', 0) : '—'}</div>
          </div>
          <div className="card" style={{ marginTop: 0 }}>
            <div className="stat-label">Unrealised P&amp;L</div>
            <div className={'stat-value ' + (summary.gainEUR >= 0 ? 'up' : 'down')}>
              {summary.costEUR > 0 ? cur(summary.gainEUR, 'EUR', 0) : '—'}
            </div>
          </div>
          <div className="card" style={{ marginTop: 0 }}>
            <div className="stat-label">Instruments · monitored</div>
            <div className="stat-value">{instruments.length} · {monitored.length}</div>
          </div>
        </div>

        {history.length > 1 && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Performance — your money over time</h3>
            <PnLTiles pnl={pnl} />
            <WealthChart history={history} costEUR={summary.costEUR} />
            <p className="small muted" style={{ margin: '8px 0 0' }}>
              EUR value of your current holdings evaluated over the past year (today's share
              counts throughout; USD converted through the daily EUR/USD rate; manual-priced
              positions included as a constant). The dashed line is what those positions cost you.
            </p>
          </div>
        )}

        {summary.valueEUR > 0 && (
          <div className="grid grid-2">
            <div className="card" style={{ marginTop: 0 }}>
              <h3 style={{ marginTop: 0 }}>Allocation</h3>
              <AllocationBars rows={summary.rows} instruments={instruments} />
            </div>
            <div className="card" style={{ marginTop: 0 }}>
              <h3 style={{ marginTop: 0 }}>P&amp;L by position</h3>
              <PnLBars rows={summary.rows} />
            </div>
          </div>
        )}

        {editingId && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{editingId === 'new' ? 'Add an instrument' : `Edit ${editing?.name}`}</h3>
            <InstrumentForm
              initial={editingId === 'new' ? EMPTY_FORM : {
                ...EMPTY_FORM, ...editing,
                shares: editing.shares || '', avgCost: editing.avgCost || '',
                manualPrice: editing.manualPrice || '', chartSymbol: editing.chartSymbol || '',
              }}
              onSave={saveInstrument}
              onCancel={() => setEditingId(null)}
            />
          </div>
        )}

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Holdings</h3>
          <p className="small secondary" style={{ marginTop: 0 }}>
            Set your share counts with <strong>Edit</strong> (they start at zero). <strong>Monitor</strong> chooses
            which instruments get charts and analyst reads below.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th><th>Symbol</th>
                  <th className="num">Shares</th><th className="num">Avg cost</th>
                  <th className="num">Price</th><th className="num">Today</th>
                  <th className="num">Value</th><th className="num">P&amp;L</th>
                  <th>Monitor</th><th></th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                      {r.type !== 'stock' && (
                        <span className="pill neutral" style={{ marginLeft: 6 }}>{r.type === 'etf' ? 'ETF' : 'private'}</span>
                      )}
                    </td>
                    <td className="small muted">{r.symbol ? `${r.symbol}${r.exchange ? ':' + r.exchange : ''}` : '—'}</td>
                    <td className="num">{r.shares || '—'}</td>
                    <td className="num">{r.avgCost ? cur(r.avgCost, r.currency) : '—'}</td>
                    <td className="num">
                      {r.priceInfo.price != null ? cur(r.priceInfo.price, r.currency) : '—'}
                      {r.priceInfo.source === 'manual' && <span className="small muted"> (manual)</span>}
                      {problems[r.id] && (
                        <div className="small warn-text" title={problems[r.id].detail}>
                          {problems[r.id].short}
                        </div>
                      )}
                    </td>
                    <td className={'num ' + (r.priceInfo.changePct > 0 ? 'up' : r.priceInfo.changePct < 0 ? 'down' : '')}>
                      {pctFmt(r.priceInfo.changePct)}
                    </td>
                    <td className="num">{r.value != null && r.shares ? cur(r.value, r.currency) : '—'}</td>
                    <td className={'num ' + (r.gain > 0 ? 'up' : r.gain < 0 ? 'down' : '')}>
                      {r.gainPct != null ? pctFmt(r.gainPct) : '—'}
                    </td>
                    <td>
                      <button
                        className={'toggle-chip' + (r.monitored ? ' on' : '')}
                        onClick={() => updateInstrument(r.id, { monitored: !r.monitored })}
                        aria-label={`${r.monitored ? 'Stop monitoring' : 'Monitor'} ${r.name}`}
                      >
                        {r.monitored ? 'On' : 'Off'}
                      </button>
                    </td>
                    <td className="num">
                      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                        <button className="toggle-chip" onClick={() => setEditingId(r.id)}>Edit</button>
                        <button
                          className="toggle-chip"
                          onClick={() => { if (confirm(`Remove ${r.name} from the tracker?`)) removeInstrument(r.id) }}
                          aria-label={`Remove ${r.name}`}
                        ><IconX size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {monitored.map((r) => {
          const sym = requestSymbol(r)
          const own = sym && liveData?.data?.[sym]
          const proxySym = chartSymbol(r)
          const proxy = !own && proxySym ? liveData?.data?.[proxySym] : null
          const series = own || proxy
          const problem = problems[r.id]
          const read = reads[r.id]
          return (
            <div className="card" key={r.id}>
              <div className="row spread" style={{ flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0 }}>
                  {r.name}
                  {r.priceInfo.price != null && (
                    <span className="small secondary" style={{ marginLeft: 10, fontWeight: 400 }}>
                      {cur(r.priceInfo.price, r.currency)}
                      {r.priceInfo.changePct != null && (
                        <span className={r.priceInfo.changePct >= 0 ? 'up' : 'down'}> {pctFmt(r.priceInfo.changePct)}</span>
                      )}
                    </span>
                  )}
                </h3>
                {anthropicKey && (
                  <button onClick={() => getRead(r)} disabled={readBusy != null}>
                    <IconMentor size={14} /> {readBusy === r.id ? 'Analysing…' : read ? 'Refresh analyst read' : 'Get analyst read'}
                  </button>
                )}
              </div>

              {series ? (
                <div style={{ marginTop: 12 }}>
                  {proxy && (
                    <p className="small warn-text" style={{ margin: '0 0 8px' }}>
                      <IconWarning size={13} /> Chart shows <strong>{proxySym}</strong> as a proxy —
                      your own listing is not on your data plan. Shape and trend are indicative;
                      the price level and currency are not your holding's, and your value and P&amp;L
                      above use the manual price instead.
                    </p>
                  )}
                  <LiveChart series={series} currency={proxy ? 'proxy units' : r.currency} />
                </div>
              ) : (
                <div className="empty-chart">
                  <p className="small" style={{ margin: 0 }}>
                    <strong>{problem?.short || 'No chart data'}</strong>
                  </p>
                  <p className="small secondary" style={{ margin: '6px 0 10px' }}>
                    {problem?.detail || 'Add a Twelve Data key in Settings to chart this instrument.'}
                  </p>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="toggle-chip" onClick={() => setEditingId(r.id)}>
                      Set manual price
                    </button>
                    {problem?.canProxy && proxyHint(r) && !r.chartSymbol && (
                      <button
                        className="toggle-chip"
                        onClick={() => updateInstrument(r.id, { chartSymbol: proxyHint(r).symbol })}
                      >
                        Use {proxyHint(r).symbol} as chart proxy
                      </button>
                    )}
                  </div>
                </div>
              )}

              {read && (
                <div className="analyst-read">
                  <div className="ind-h" style={{ marginBottom: 6 }}>
                    <IconMentor size={13} /> Analyst read · {new Date(read.at).toLocaleDateString()}
                  </div>
                  <div className="chat-body small"><Markdown text={read.text} /></div>
                </div>
              )}
            </div>
          )
        })}

        <div className="notice" style={{ marginTop: 14 }}>
          <IconWarning size={15} />
          <span>This dashboard is a learning and tracking tool. The analyst explains and teaches from
          your data — it does not give personal financial advice, and nothing here is a recommendation
          to buy or sell. Prices can be delayed; verify with your broker before acting.</span>
        </div>
      </div>
    </div>
  )
}
