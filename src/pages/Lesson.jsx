import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findLesson } from '../data/lessons.js'
import { useStore } from '../lib/store.jsx'

// tiny inline-markup renderer: **bold**, *italic*, `code`
function rich(text) {
  const parts = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let m
  let key = 0
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

function Block({ b }) {
  switch (b.t) {
    case 'p': return <p>{rich(b.text)}</p>
    case 'h': return <h3>{rich(b.text)}</h3>
    case 'ul': return <ul>{b.items.map((it, i) => <li key={i}>{rich(it)}</li>)}</ul>
    case 'ol': return <ol>{b.items.map((it, i) => <li key={i}>{rich(it)}</li>)}</ol>
    case 'callout':
      return (
        <div className={'callout' + (b.warn ? ' warn' : '')}>
          <div className="callout-title">{b.warn ? '⚠️' : '💡'} {b.title}</div>
          <div>{rich(b.text)}</div>
        </div>
      )
    case 'example':
      return (
        <div className="example-box">
          <div className="ex-title">📝 {b.title}</div>
          <div>{rich(b.text)}</div>
        </div>
      )
    case 'table':
      return (
        <div className="table-wrap" style={{ margin: '14px 0' }}>
          <table>
            <thead><tr>{b.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{rich(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default: return null
  }
}

function Quiz({ mod }) {
  const { state, recordQuiz } = useStore()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = mod.quiz.every((_, i) => answers[i] != null)
  const correct = mod.quiz.filter((q, i) => answers[i] === q.answer).length
  const pct = Math.round((correct / mod.quiz.length) * 100)

  function submit() {
    setSubmitted(true)
    recordQuiz(mod.id, pct)
  }

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <h2 style={{ marginTop: 0 }}>🧪 Module quiz: {mod.title}</h2>
      {state.quizScores[mod.id] != null && (
        <p className="small secondary">Your best score so far: {state.quizScores[mod.id]}%</p>
      )}
      {mod.quiz.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600 }}>{qi + 1}. {q.q}</p>
          {q.options.map((opt, oi) => {
            let cls = 'quiz-option'
            if (submitted) {
              if (oi === q.answer) cls += ' correct'
              else if (answers[qi] === oi) cls += ' incorrect'
            }
            return (
              <button key={oi} className={cls}
                disabled={submitted}
                style={answers[qi] === oi && !submitted ? { borderColor: 'var(--accent)', background: 'var(--accent-wash)' } : undefined}
                onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}>
                {opt}
              </button>
            )
          })}
          {submitted && (
            <p className="small secondary" style={{ marginTop: 6 }}>
              {answers[qi] === q.answer ? '✅ Correct. ' : '❌ '} {q.explain}
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button className="primary" disabled={!allAnswered} onClick={submit}>
          {allAnswered ? 'Check answers' : 'Answer every question to check'}
        </button>
      ) : (
        <div>
          <p style={{ fontWeight: 600 }} className={pct >= 80 ? 'up' : undefined}>
            Score: {correct}/{mod.quiz.length} ({pct}%)
            {pct >= 80 ? ' — module mastered! 🎉' : ' — review the lessons above and retry.'}
          </p>
          <button onClick={() => { setSubmitted(false); setAnswers({}) }}>Try again</button>
        </div>
      )}
    </div>
  )
}

export default function Lesson() {
  const { moduleId, lessonId } = useParams()
  const { state, completeLesson } = useStore()
  const { mod, lesson, idx } = findLesson(moduleId, lessonId)

  useEffect(() => { window.scrollTo(0, 0) }, [lessonId])

  if (!mod || !lesson) {
    return <p>Lesson not found. <Link to="/learn">Back to the Academy</Link></p>
  }

  const prev = mod.lessons[idx - 1]
  const next = mod.lessons[idx + 1]
  const isLast = idx === mod.lessons.length - 1
  const done = !!state.completedLessons[lesson.id]
  const allDone = mod.lessons.every((l) => state.completedLessons[l.id])

  return (
    <div>
      <p className="small muted" style={{ marginBottom: 4 }}>
        <Link to="/learn">Academy</Link> · {mod.emoji} {mod.title} · Lesson {idx + 1} of {mod.lessons.length}
      </p>
      <h1>{lesson.title}</h1>
      <p className="small muted">⏱ about {lesson.minutes} min {done && <span className="up">· ✓ completed</span>}</p>

      <div className="lesson-body">
        {lesson.content.map((b, i) => <Block b={b} key={i} />)}
      </div>

      <div className="row" style={{ marginTop: 28 }}>
        {prev && <Link to={`/learn/${mod.id}/${prev.id}`}><button>← {prev.title}</button></Link>}
        {!done && (
          <button className="primary" onClick={() => completeLesson(lesson.id)}>
            Mark as completed ✓
          </button>
        )}
        {next && (
          <Link to={`/learn/${mod.id}/${next.id}`}>
            <button className={done ? 'primary' : ''}
              onClick={() => completeLesson(lesson.id)}>
              Next: {next.title} →
            </button>
          </Link>
        )}
      </div>

      {isLast && (allDone || done) && <Quiz mod={mod} />}
    </div>
  )
}
