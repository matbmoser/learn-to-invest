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

// Minimal markdown renderer for mentor replies: headings, paragraphs, lists,
// fenced code, tables, and inline **bold** / *italic* / `code`.

function inline(text, keyBase = 0) {
  const parts = []
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g
  let last = 0
  let m
  let key = keyBase
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**')) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('`')) parts.push(<code key={key++}>{tok.slice(1, -1)}</code>)
    else parts.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function splitRow(line) {
  return line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
}

export default function Markdown({ text }) {
  const lines = text.split('\n')
  const out = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code
    if (line.trimStart().startsWith('```')) {
      const body = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) body.push(lines[i++])
      i++
      out.push(
        <pre key={key++} style={{
          background: 'color-mix(in srgb, var(--text-muted) 12%, transparent)',
          borderRadius: 8, padding: '10px 12px', overflowX: 'auto',
          fontSize: 13, margin: '10px 0',
        }}>{body.join('\n')}</pre>
      )
      continue
    }

    // table
    if (line.includes('|') && lines[i + 1] && /^[\s|:-]+$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const headers = splitRow(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|')) rows.push(splitRow(lines[i++]))
      out.push(
        <div className="table-wrap" key={key++} style={{ margin: '10px 0' }}>
          <table>
            <thead><tr>{headers.map((h, j) => <th key={j}>{inline(h)}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      out.push(<h3 key={key++} style={{ fontSize: 15, margin: '14px 0 6px' }}>{inline(h[2])}</h3>)
      i++
      continue
    }

    // lists
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      out.push(
        <ul key={key++} style={{ margin: '8px 0', paddingLeft: 22 }}>
          {items.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{inline(it)}</li>)}
        </ul>
      )
      continue
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
        i++
      }
      out.push(
        <ol key={key++} style={{ margin: '8px 0', paddingLeft: 22 }}>
          {items.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{inline(it)}</li>)}
        </ol>
      )
      continue
    }

    // blank
    if (line.trim() === '') { i++; continue }

    // paragraph
    const para = []
    while (i < lines.length && lines[i].trim() !== '' &&
      !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) && !lines[i].trimStart().startsWith('```')) {
      para.push(lines[i++])
    }
    out.push(<p key={key++} style={{ margin: '0 0 10px' }}>{inline(para.join(' '))}</p>)
  }

  return <>{out}</>
}
