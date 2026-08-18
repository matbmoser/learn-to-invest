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

import { Link } from 'react-router-dom'
import { MODULES, moduleProgress } from '../data/lessons.js'
import { useStore } from '../lib/store.jsx'
import { Icon, IconAcademy, IconCheck, IconClock } from '../components/icons.jsx'

export default function Learn() {
  const { state } = useStore()
  return (
    <div>
      <h1><IconAcademy size={24} /> Investing Academy</h1>
      <p className="subtitle">
        {MODULES.length} modules and {MODULES.reduce((n, m) => n + m.lessons.length, 0)} lessons,
        from "what is a stock?" to writing professional investment theses.
        Work in order — each module builds on the last. Finish a module's lessons to unlock
        its quiz, and practice every concept in the simulator as you go.
      </p>

      {MODULES.map((mod, i) => {
        const p = moduleProgress(mod, state.completedLessons)
        const quiz = state.quizScores[mod.id]
        return (
          <div className="card" key={mod.id}>
            <div className="row spread">
              <h3 style={{ margin: 0 }}>
                <span className="mod-icon"><Icon name={mod.icon} size={17} /></span>
                Module {i + 1}: {mod.title}
              </h3>
              <div className="row">
                <span className="pill neutral">{mod.level}</span>
                {quiz != null && (
                  <span className={'pill ' + (quiz >= 80 ? 'good-bg' : 'warn-bg')}>
                    Quiz best: {quiz}%
                  </span>
                )}
              </div>
            </div>
            <p className="small secondary" style={{ margin: '6px 0 12px' }}>{mod.description}</p>
            <div className="row" style={{ marginBottom: 12 }}>
              <div className="progress-track" style={{ width: 180 }}>
                <div className="progress-fill" style={{ width: `${p.pct}%` }} />
              </div>
              <span className="small muted">{p.done} of {p.total} lessons done</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {mod.lessons.map((l) => (
                <li key={l.id} style={{ marginBottom: 6 }}>
                  <Link to={`/learn/${mod.id}/${l.id}`}>{l.title}</Link>{' '}
                  <span className="small muted"><IconClock size={12} /> {l.minutes} min</span>{' '}
                  {state.completedLessons[l.id] && <span className="up"><IconCheck size={14} /></span>}
                </li>
              ))}
            </ol>
          </div>
        )
      })}
    </div>
  )
}
