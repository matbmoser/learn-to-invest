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
import Mentor from './pages/Mentor.jsx'
import Footer from './components/Footer.jsx'

const links = [
  { to: '/', icon: '🏠', label: 'Dashboard', end: true },
  { section: 'Learn' },
  { to: '/learn', icon: '🎓', label: 'Academy' },
  { to: '/mentor', icon: '💬', label: 'AI Mentor' },
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
          <Route path="/mentor" element={<Mentor />} />
        </Routes>
        <Footer />
      </main>
    </div>
  )
}
