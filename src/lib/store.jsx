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

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { disableLiveMode, enableLiveMode, getQuote } from './market.js'
import { clearLiveCache, fetchLiveData, getCachedLiveData, LIVE_COMPANIES } from './livedata.js'
import { SEED_INSTRUMENTS } from './realportfolio.js'

const STORAGE_KEY = 'learn-to-invest-v1'
export const STARTING_CASH = 10000

const defaultState = {
  cash: STARTING_CASH,
  // holdings: { [ticker]: { shares, costBasis } } — costBasis is total $ paid
  holdings: {},
  // transactions: newest first
  transactions: [],
  // completedLessons: { [lessonId]: true }, quizScores: { [moduleId]: pct }
  completedLessons: {},
  quizScores: {},
  // API keys never leave this browser except in requests to their own provider
  settings: {
    apiKey: '', liveMode: false,
    anthropicKey: '', mentorModel: 'claude-opus-5',
    theme: 'dark',
  },
  // AI mentor conversation (most recent chat only)
  mentorHistory: [],
  // The user's REAL portfolio tracker (separate from the simulator):
  // instruments they actually own, its own analyst chat, and cached
  // analyst reads keyed by instrument id.
  realPortfolio: { instruments: null, chat: [], reads: {} },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const st = raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState }
    if (!st.realPortfolio?.instruments) {
      st.realPortfolio = { chat: [], reads: {}, ...st.realPortfolio, instruments: SEED_INSTRUMENTS }
    }
    return st
  } catch {
    return defaultState
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  // live data lifecycle: off | loading | on | error
  const [liveStatus, setLiveStatus] = useState({ phase: 'off', message: '' })
  // bumped whenever the market data source changes, so charts recompute
  const [dataVersion, setDataVersion] = useState(0)
  const [reloadCounter, setReloadCounter] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage may be unavailable (private mode); the app still works in-memory
    }
  }, [state])

  // Theme is stamped on <html> so CSS tokens (and charts) follow it.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark')
  }, [state.settings.theme])

  const { liveMode, apiKey } = state.settings
  useEffect(() => {
    let cancelled = false
    async function activate() {
      const cached = getCachedLiveData()
      if (cached && Object.keys(cached).length > 0) {
        enableLiveMode(LIVE_COMPANIES.filter((c) => cached[c.ticker]), cached)
        setLiveStatus({ phase: 'on', message: 'Using today\'s cached data.' })
        setDataVersion((v) => v + 1)
        return
      }
      setLiveStatus({ phase: 'loading', message: 'Fetching real market data…' })
      try {
        const { data, failed } = await fetchLiveData(apiKey)
        if (cancelled) return
        enableLiveMode(LIVE_COMPANIES.filter((c) => data[c.ticker]), data)
        setLiveStatus({
          phase: 'on',
          message: failed.length ? `Loaded, but some symbols failed: ${failed.join(', ')}` : 'Live data loaded.',
        })
      } catch (e) {
        if (cancelled) return
        disableLiveMode()
        setLiveStatus({ phase: 'error', message: e.message })
      }
      setDataVersion((v) => v + 1)
    }
    if (liveMode && apiKey) {
      activate()
    } else {
      disableLiveMode()
      setLiveStatus({ phase: 'off', message: '' })
      setDataVersion((v) => v + 1)
    }
    return () => { cancelled = true }
  }, [liveMode, apiKey, reloadCounter])

  const api = useMemo(() => ({
    state,
    liveStatus,
    dataVersion,

    updateSettings(patch) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
    },

    refreshLiveData() {
      clearLiveCache()
      setReloadCounter((c) => c + 1)
    },

    addInstrument(inst) {
      setState((s) => ({
        ...s,
        realPortfolio: {
          ...s.realPortfolio,
          instruments: [...s.realPortfolio.instruments, inst],
        },
      }))
    },

    updateInstrument(id, patch) {
      setState((s) => ({
        ...s,
        realPortfolio: {
          ...s.realPortfolio,
          instruments: s.realPortfolio.instruments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        },
      }))
    },

    removeInstrument(id) {
      setState((s) => {
        const reads = { ...s.realPortfolio.reads }
        delete reads[id]
        return {
          ...s,
          realPortfolio: {
            ...s.realPortfolio,
            reads,
            instruments: s.realPortfolio.instruments.filter((i) => i.id !== id),
          },
        }
      })
    },

    setRealChat(history) {
      setState((s) => ({
        ...s,
        realPortfolio: { ...s.realPortfolio, chat: history.slice(-30) },
      }))
    },

    setRead(id, read) {
      setState((s) => ({
        ...s,
        realPortfolio: {
          ...s.realPortfolio,
          reads: { ...s.realPortfolio.reads, [id]: read },
        },
      }))
    },

    setMentorHistory(history) {
      // keep the stored transcript bounded so localStorage can't fill up
      setState((s) => ({ ...s, mentorHistory: history.slice(-40) }))
    },

    buy(ticker, shares) {
      const q = getQuote(ticker)
      if (!q || shares <= 0) return { ok: false, error: 'Invalid order.' }
      const cost = q.price * shares
      if (cost > state.cash + 1e-9) return { ok: false, error: 'Not enough cash for this order.' }
      setState((s) => {
        const h = s.holdings[ticker] || { shares: 0, costBasis: 0 }
        return {
          ...s,
          cash: s.cash - cost,
          holdings: {
            ...s.holdings,
            [ticker]: { shares: h.shares + shares, costBasis: h.costBasis + cost },
          },
          transactions: [
            { type: 'BUY', ticker, shares, price: q.price, total: cost, at: Date.now() },
            ...s.transactions,
          ].slice(0, 200),
        }
      })
      return { ok: true }
    },

    sell(ticker, shares) {
      const q = getQuote(ticker)
      const h = state.holdings[ticker]
      if (!q || !h || shares <= 0) return { ok: false, error: 'Invalid order.' }
      if (shares > h.shares) return { ok: false, error: 'You do not own that many shares.' }
      const proceeds = q.price * shares
      setState((s) => {
        const cur = s.holdings[ticker]
        const remaining = cur.shares - shares
        const holdings = { ...s.holdings }
        if (remaining <= 1e-9) delete holdings[ticker]
        else holdings[ticker] = {
          shares: remaining,
          costBasis: cur.costBasis * (remaining / cur.shares),
        }
        return {
          ...s,
          cash: s.cash + proceeds,
          holdings,
          transactions: [
            { type: 'SELL', ticker, shares, price: q.price, total: proceeds, at: Date.now() },
            ...s.transactions,
          ].slice(0, 200),
        }
      })
      return { ok: true }
    },

    resetPortfolio() {
      setState((s) => ({ ...s, cash: STARTING_CASH, holdings: {}, transactions: [] }))
    },

    completeLesson(lessonId) {
      setState((s) => ({
        ...s,
        completedLessons: { ...s.completedLessons, [lessonId]: true },
      }))
    },

    recordQuiz(moduleId, pct) {
      setState((s) => ({
        ...s,
        quizScores: {
          ...s.quizScores,
          [moduleId]: Math.max(pct, s.quizScores[moduleId] ?? 0),
        },
      }))
    },
  }), [state, liveStatus, dataVersion])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

// Derived portfolio metrics at current market prices
export function portfolioSummary(state) {
  let marketValue = 0
  let costBasis = 0
  const positions = Object.entries(state.holdings).map(([ticker, h]) => {
    const q = getQuote(ticker)
    const value = q ? q.price * h.shares : 0
    marketValue += value
    costBasis += h.costBasis
    return {
      ticker,
      shares: h.shares,
      costBasis: h.costBasis,
      avgCost: h.costBasis / h.shares,
      price: q?.price ?? 0,
      value,
      gain: value - h.costBasis,
      gainPct: h.costBasis > 0 ? ((value - h.costBasis) / h.costBasis) * 100 : 0,
      dayChangePct: q?.changePct ?? 0,
    }
  }).sort((a, b) => b.value - a.value)
  const total = state.cash + marketValue
  return {
    positions,
    marketValue,
    costBasis,
    cash: state.cash,
    total,
    totalGain: total - STARTING_CASH,
    totalGainPct: ((total - STARTING_CASH) / STARTING_CASH) * 100,
  }
}
