import { useState } from 'react'
import { GLOSSARY } from '../data/glossary.js'

export default function Glossary() {
  const [q, setQ] = useState('')
  const filtered = GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(q.toLowerCase()) || g.def.toLowerCase().includes(q.toLowerCase())
  )
  return (
    <div>
      <h1>📖 Glossary</h1>
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
