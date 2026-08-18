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

// A docked analyst chat panel, shared by the dashboards: My investments
// docks it on the LEFT, Research on the RIGHT. The parent supplies the
// context string, the persisted history and its setter; a ref exposes
// send() so a page-level button (e.g. "Analyse my situation") can stream
// a prompt straight into the chat.

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Markdown from './markdown.jsx'
import { askMentor, MENTOR_MODELS } from '../lib/mentor.js'
import { useStore } from '../lib/store.jsx'
import { IconMentor, IconSend, IconStop, IconWarning, IconX } from './icons.jsx'

const AnalystDock = forwardRef(function AnalystDock(
  { open, setOpen, context, history, setHistory, suggestions = [], placeholder = 'Ask the analyst…', title = 'Ask the analyst' },
  ref
) {
  const { state } = useStore()
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const endRef = useRef(null)

  const apiKey = state.settings.anthropicKey
  const model = state.settings.mentorModel || MENTOR_MODELS[0].id

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [history.length, streaming])

  async function send(question) {
    const text = (question ?? input).trim()
    if (!text || busy || !apiKey) return
    setError(null)
    setInput('')
    const next = [...history, { role: 'user', content: text }]
    setHistory(next)
    setBusy(true)
    setStreaming('')
    const controller = new AbortController()
    abortRef.current = controller
    let acc = ''
    const res = await askMentor({
      apiKey, model, history: next, context,
      onText: (d) => { acc += d; setStreaming(acc) },
      signal: controller.signal,
    })
    abortRef.current = null
    setBusy(false)
    setStreaming('')
    if (res.ok) setHistory([...next, { role: 'assistant', content: res.text }])
    else if (res.aborted) {
      if (acc.trim()) setHistory([...next, { role: 'assistant', content: acc + '\n\n_(stopped)_' }])
      else setHistory(history)
    } else {
      setHistory(history)
      setInput(text)
      setError(res.error)
    }
  }

  useImperativeHandle(ref, () => ({
    send: (prompt) => { setOpen(true); send(prompt) },
    busy,
  }))

  if (!open) {
    return (
      <button className="dock-opener" onClick={() => setOpen(true)} aria-label="Open analyst chat">
        <IconMentor size={16} /> Analyst
      </button>
    )
  }

  return (
    <aside className="chat-dock card">
      <div className="row spread" style={{ marginBottom: 8 }}>
        <strong className="row" style={{ gap: 6 }}><IconMentor size={16} /> {title}</strong>
        <div className="row" style={{ gap: 6 }}>
          {history.length > 0 && (
            <button className="toggle-chip" onClick={() => setHistory([])}>New</button>
          )}
          <button className="toggle-chip" onClick={() => setOpen(false)} aria-label="Collapse chat">
            <IconX size={13} />
          </button>
        </div>
      </div>

      {!apiKey ? (
        <p className="small secondary">
          The analyst chat needs your Claude API key.{' '}
          <Link to="/settings">Add it in Settings</Link> — it stays in this browser.
        </p>
      ) : (
        <>
          <div className="dock-scroll">
            {history.length === 0 && !streaming && suggestions.length > 0 && (
              <div className="toggle-row" style={{ marginBottom: 8 }}>
                {suggestions.map((p) => (
                  <button key={p} className="toggle-chip" onClick={() => send(p)}>{p}</button>
                ))}
              </div>
            )}
            {history.map((m, i) => (
              <div key={i} className="chat-turn">
                <div className={'chat-who ' + (m.role === 'user' ? 'you' : 'analyst')}>
                  {m.role === 'user' ? 'You' : 'Analyst'}
                </div>
                {m.role === 'user'
                  ? <div className="chat-bubble">{m.content}</div>
                  : <div className="chat-body small"><Markdown text={m.content} /></div>}
              </div>
            ))}
            {streaming && (
              <div className="chat-turn">
                <div className="chat-who analyst">Analyst</div>
                <div className="chat-body small"><Markdown text={streaming} /></div>
              </div>
            )}
            {busy && !streaming && (
              <p className="small muted typing-row"><span className="typing"><i /><i /><i /></span> Thinking…</p>
            )}
            {error && <p className="small down"><IconWarning size={13} /> {error}</p>}
            <div ref={endRef} />
          </div>
          <form className="row" style={{ marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); send() }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1, minWidth: 0 }}
              disabled={busy}
            />
            {busy ? (
              <button type="button" onClick={() => abortRef.current?.abort()} aria-label="Stop"><IconStop size={13} /></button>
            ) : (
              <button type="submit" className="primary" disabled={!input.trim()} aria-label="Send"><IconSend size={14} /></button>
            )}
          </form>
        </>
      )}
    </aside>
  )
})

export default AnalystDock
