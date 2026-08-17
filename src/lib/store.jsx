import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { disableLiveMode, enableLiveMode, getQuote } from './market.js'
import { clearLiveCache, fetchLiveData, getCachedLiveData, LIVE_COMPANIES } from './livedata.js'

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
  settings: { apiKey: '', liveMode: false, anthropicKey: '', mentorModel: 'claude-opus-5' },
  // AI mentor conversation (most recent chat only)
  mentorHistory: [],
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
