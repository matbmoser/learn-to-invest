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
import { GLOSSARY } from '../data/glossary.js'
import { IconGlossary, IconSearch } from '../components/icons.jsx'

export default function Glossary() {
  const [q, setQ] = useState('')
  const filtered = GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(q.toLowerCase()) || g.def.toLowerCase().includes(q.toLowerCase())
  )
  return (
    <div>
      <h1><IconGlossary size={24} /> Glossary</h1>
      <p className="subtitle">Every term in this app, in plain English. Search as you read.</p>
      <input placeholder="Search terms… (e.g. P/E, stop-loss, moat)" value={q}
        onChange={(e) => setQ(e.target.value)} style={{ width: '100%', maxWidth: 420, marginBottom: 20 }} />
      <div className="grid grid-2">
        {filtered.map((g) => (
          <div className="card" key={g.term} style={{ marginTop: 0 }}>
            <strong>{g.term}</strong>
            <p className="small secondary" style={{ margin: '4px 0 0' }}>{g.def}</p>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="muted">No terms match "{q}".</p>}
    </div>
  )
}
