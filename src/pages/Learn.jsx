import { Link } from 'react-router-dom'
import { MODULES, moduleProgress } from '../data/lessons.js'
import { useStore } from '../lib/store.jsx'

export default function Learn() {
  const { state } = useStore()
  return (
    <div>
      <h1>🎓 Investing Academy</h1>
      <p className="subtitle">
        Six modules, from "what is a stock?" to writing professional investment theses.
        Work in order — each module builds on the last. Finish a module's lessons to unlock
        its quiz, and practice every concept in the simulator as you go.
      </p>

      {MODULES.map((mod, i) => {
        const p = moduleProgress(mod, state.completedLessons)
        const quiz = state.quizScores[mod.id]
        return (
          <div className="card" key={mod.id}>
            <div className="row spread">
              <h3 style={{ margin: 0 }}>{mod.emoji} Module {i + 1}: {mod.title}</h3>
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
                  <span className="small muted">· {l.minutes} min</span>{' '}
                  {state.completedLessons[l.id] && <span className="up">✓</span>}
                </li>
              ))}
            </ol>
          </div>
        )
      })}
    </div>
  )
}
