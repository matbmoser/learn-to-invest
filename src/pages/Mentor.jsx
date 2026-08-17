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

import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Markdown from '../components/markdown.jsx'
import { askMentor, buildContext, MENTOR_MODELS, suggestedPrompts } from '../lib/mentor.js'
import { getCompany } from '../lib/market.js'
import { portfolioSummary, useStore } from '../lib/store.jsx'
import { IconArrowRight, IconMentor, IconSend, IconStop, IconWarning } from '../components/icons.jsx'

export default function Mentor() {
  const { state, updateSettings, setMentorHistory } = useStore()
  const [params, setParams] = useSearchParams()
  const focusTicker = params.get('stock') || ''

  const [input, setInput] = useState(params.get('q') || '')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const endRef = useRef(null)

  const summary = portfolioSummary(state)
  const history = state.mentorHistory || []
  const apiKey = state.settings.anthropicKey
  const model = state.settings.mentorModel || MENTOR_MODELS[0].id

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history.length, streaming])

  async function send(question) {
    const text = (question ?? input).trim()
    if (!text || busy || !apiKey) return

    setError(null)
    setInput('')
    const nextHistory = [...history, { role: 'user', content: text }]
    setMentorHistory(nextHistory)
    setBusy(true)
    setStreaming('')

    const controller = new AbortController()
    abortRef.current = controller
    let acc = ''

    const res = await askMentor({
      apiKey,
      model,
      history: nextHistory,
      context: buildContext(state, summary, focusTicker),
      onText: (delta) => {
        acc += delta
        setStreaming(acc)
      },
      signal: controller.signal,
    })

    abortRef.current = null
    setBusy(false)
    setStreaming('')

    if (res.ok) {
      setMentorHistory([...nextHistory, { role: 'assistant', content: res.text }])
    } else if (res.aborted) {
      if (acc.trim()) setMentorHistory([...nextHistory, { role: 'assistant', content: acc + '\n\n_(stopped)_' }])
      else setMentorHistory(history)
    } else {
      setMentorHistory(history)
      setInput(text)
      setError(res.error)
    }
  }

  const company = focusTicker ? getCompany(focusTicker) : null
  const prompts = suggestedPrompts(state, summary, focusTicker)

  if (!apiKey) {
    return (
      <div>
        <h1><IconMentor size={24} /> Ask a senior analyst</h1>
        <p className="subtitle">
          Chat with an AI mentor that plays the role of a senior investment analyst — it can
          explain any concept, walk you through analyzing a company, review your practice
          portfolio, and quiz you.
        </p>
        <div className="card">
          <h3 style={{ marginTop: 0 }}><IconMentor size={17} /> Add a Claude API key to enable the mentor</h3>
          <p className="small secondary">
            The mentor runs on Anthropic's Claude models. It needs your own API key, which is
            stored only in this browser. Setup takes a couple of minutes:
          </p>
          <ol className="small secondary" style={{ paddingLeft: 20 }}>
            <li>Create an account at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> and add a small amount of credit.</li>
            <li>Create an API key (it starts with <code>sk-ant-</code>).</li>
            <li>Paste it into <Link to="/settings">Settings</Link>.</li>
          </ol>
          <Link to="/settings"><button className="primary">Go to Settings <IconArrowRight size={15} /></button></Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row spread">
        <div>
          <h1 style={{ marginBottom: 4 }}><IconMentor size={24} /> Ask a senior analyst</h1>
          <p className="small secondary" style={{ margin: 0 }}>
            {company
              ? <>Focused on <strong>{company.ticker} — {company.name}</strong>. The mentor can see its
                  price, chart indicators, and fundamentals.{' '}
                  <a href="#/mentor" onClick={() => setParams({})}>Clear focus</a></>
              : <>The mentor can see your portfolio, the market, and your course progress.</>}
          </p>
        </div>
        <div className="row">
          <select value={model}
            onChange={(e) => updateSettings({ mentorModel: e.target.value })}
            aria-label="Mentor model">
            {MENTOR_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {history.length > 0 && (
            <button onClick={() => { setMentorHistory([]); setError(null) }}>New chat</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, minHeight: 320 }}>
        {history.length === 0 && !streaming && (
          <div>
            <p className="secondary" style={{ marginTop: 0 }}>
              Ask anything — from "what is a stock?" to "walk me through valuing this company".
              Good places to start:
            </p>
            <div className="toggle-row">
              {prompts.map((p) => (
                <button key={p} className="toggle-chip" onClick={() => send(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i} className="chat-turn">
            <div className={'chat-who ' + (m.role === 'user' ? 'you' : 'analyst')}>
              {m.role === 'user' ? 'You' : <><IconMentor size={13} /> Analyst</>}
            </div>
            {m.role === 'user'
              ? <div className="chat-bubble">{m.content}</div>
              : <div className="chat-body"><Markdown text={m.content} /></div>}
          </div>
        ))}

        {streaming && (
          <div className="chat-turn">
            <div className="chat-who analyst"><IconMentor size={13} /> Analyst</div>
            <div className="chat-body"><Markdown text={streaming} /></div>
          </div>
        )}

        {busy && !streaming && (
          <p className="small muted typing-row">
            <span className="typing"><i /><i /><i /></span> Thinking…
          </p>
        )}
        {error && <p className="small down"><IconWarning size={14} /> {error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="row"
        style={{ marginTop: 12, alignItems: 'flex-start' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={company ? `Ask about ${company.ticker}, or anything else…` : 'Ask your analyst a question…'}
          style={{ flex: 1, minWidth: 220 }}
          disabled={busy}
        />
        {busy ? (
          <button type="button" onClick={() => abortRef.current?.abort()}><IconStop size={14} /> Stop</button>
        ) : (
          <button type="submit" className="primary" disabled={!input.trim()}><IconSend size={15} /> Ask</button>
        )}
      </form>

      <div className="notice" style={{ marginTop: 14 }}>
        <IconWarning size={15} />
        <span>The mentor is a teaching tool, not a financial adviser. It explains how analysts think
        and what the evidence shows — it will not tell you what to buy with real money, and it can
        be wrong. Verify anything that matters before acting on it.</span>
      </div>
    </div>
  )
}
