import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getQuote } from './market.js'

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
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage may be unavailable (private mode); the app still works in-memory
    }
  }, [state])

  const api = useMemo(() => ({
    state,

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
  }), [state])

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
