import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Learn from './pages/Learn.jsx'
import Lesson from './pages/Lesson.jsx'
import Market from './pages/Market.jsx'
import StockDetail from './pages/StockDetail.jsx'
import Portfolio from './pages/Portfolio.jsx'
import Tools from './pages/Tools.jsx'
import Glossary from './pages/Glossary.jsx'
import Settings from './pages/Settings.jsx'

const links = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { section: 'Learn' },
  { to: '/learn', icon: '🎓', label: 'Academy' },
  { to: '/glossary', icon: '📖', label: 'Glossary' },
  { section: 'Practice' },
  { to: '/market', icon: '📊', label: 'Market' },
  { to: '/portfolio', icon: '💼', label: 'Portfolio' },
  { to: '/tools', icon: '🧮', label: 'Tools' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-badge">📈</span> Learn to Invest
        </div>
        {links.map((l, i) =>
          l.section ? (
            <div className="nav-section" key={i}>{l.section}</div>
          ) : (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              <span className="nav-icon">{l.icon}</span> {l.label}
            </NavLink>
          )
        )}
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:moduleId/:lessonId" element={<Lesson />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/:ticker" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
