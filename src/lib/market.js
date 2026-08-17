// Simulated market engine.
// Prices are generated deterministically from a per-ticker seed, one candle per
// weekday from EPOCH to today — so the "market" advances every real day and is
// identical on every device with no backend or API key.

const EPOCH = new Date('2023-01-02T00:00:00Z')
const MS_PER_DAY = 86400000

// Mulberry32 — small deterministic PRNG
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Box-Muller: normal(0,1) from two uniforms
function gaussian(rng) {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Fictional but realistic companies across sectors. Fundamentals are the
// teaching material for the fundamental-analysis lessons.
export const COMPANIES = [
  {
    ticker: 'NOVA', name: 'NovaTech Systems', sector: 'Technology',
    start: 142, drift: 0.00055, vol: 0.021,
    profile: 'Designs chips for AI data centers. Fast-growing, expensive, volatile.',
    fundamentals: {
      revenue: 38.2, revenueGrowth: 34.0, netMargin: 24.5, eps: 5.86,
      peRatio: null, debtToEquity: 0.31, currentRatio: 3.1, roe: 28.4,
      dividendYield: 0.0, fcfMargin: 22.0, sharesOutB: 1.6,
    },
  },
  {
    ticker: 'SOLR', name: 'Solaris Energy', sector: 'Energy',
    start: 48, drift: 0.00035, vol: 0.024,
    profile: 'Solar panel maker and utility-scale projects. Cyclical and policy-sensitive.',
    fundamentals: {
      revenue: 9.4, revenueGrowth: 18.5, netMargin: 8.2, eps: 1.92,
      peRatio: null, debtToEquity: 0.85, currentRatio: 1.8, roe: 11.2,
      dividendYield: 0.6, fcfMargin: 4.5, sharesOutB: 0.4,
    },
  },
  {
    ticker: 'MEDX', name: 'MediCore Health', sector: 'Healthcare',
    start: 88, drift: 0.00032, vol: 0.013,
    profile: 'Medical devices and diagnostics. Steady demand in good and bad economies.',
    fundamentals: {
      revenue: 21.7, revenueGrowth: 9.0, netMargin: 18.1, eps: 4.32,
      peRatio: null, debtToEquity: 0.52, currentRatio: 2.2, roe: 17.9,
      dividendYield: 1.8, fcfMargin: 16.5, sharesOutB: 0.9,
    },
  },
  {
    ticker: 'BANQ', name: 'First Meridian Bank', sector: 'Financials',
    start: 54, drift: 0.00028, vol: 0.015,
    profile: 'Regional bank. Earns the spread between loans and deposits; rate-sensitive.',
    fundamentals: {
      revenue: 14.8, revenueGrowth: 4.5, netMargin: 27.0, eps: 5.10,
      peRatio: null, debtToEquity: 1.1, currentRatio: 1.1, roe: 12.6,
      dividendYield: 3.4, fcfMargin: 25.0, sharesOutB: 0.8,
    },
  },
  {
    ticker: 'FRSH', name: 'FreshCart Foods', sector: 'Consumer Staples',
    start: 63, drift: 0.00022, vol: 0.010,
    profile: 'Grocery brands people buy every week. Slow growth, very stable, pays dividends.',
    fundamentals: {
      revenue: 45.3, revenueGrowth: 3.2, netMargin: 9.8, eps: 3.41,
      peRatio: null, debtToEquity: 0.68, currentRatio: 1.4, roe: 15.3,
      dividendYield: 2.9, fcfMargin: 8.9, sharesOutB: 1.3,
    },
  },
  {
    ticker: 'LUXE', name: 'Maison Luxe Group', sector: 'Consumer Discretionary',
    start: 210, drift: 0.00040, vol: 0.017,
    profile: 'Luxury fashion houses. High margins, but sales fall when consumers cut back.',
    fundamentals: {
      revenue: 28.9, revenueGrowth: 12.4, netMargin: 21.3, eps: 11.05,
      peRatio: null, debtToEquity: 0.45, currentRatio: 1.9, roe: 24.1,
      dividendYield: 1.2, fcfMargin: 19.8, sharesOutB: 0.5,
    },
  },
  {
    ticker: 'RAIL', name: 'Continental Rail', sector: 'Industrials',
    start: 118, drift: 0.00025, vol: 0.012,
    profile: 'Freight railroad with a near-monopoly network — a classic "moat" business.',
    fundamentals: {
      revenue: 23.5, revenueGrowth: 5.1, netMargin: 26.8, eps: 9.87,
      peRatio: null, debtToEquity: 0.95, currentRatio: 0.9, roe: 19.4,
      dividendYield: 2.1, fcfMargin: 21.5, sharesOutB: 0.6,
    },
  },
  {
    ticker: 'CLDW', name: 'CloudWorks Inc.', sector: 'Technology',
    start: 96, drift: 0.00048, vol: 0.019,
    profile: 'Subscription software for businesses. Recurring revenue, high growth.',
    fundamentals: {
      revenue: 12.1, revenueGrowth: 26.7, netMargin: 12.9, eps: 2.14,
      peRatio: null, debtToEquity: 0.22, currentRatio: 2.7, roe: 14.8,
      dividendYield: 0.0, fcfMargin: 25.3, sharesOutB: 0.7,
    },
  },
  {
    ticker: 'HOMR', name: 'HomeRight Builders', sector: 'Real Estate',
    start: 41, drift: 0.00030, vol: 0.020,
    profile: 'Homebuilder. Very cyclical: booms with low interest rates, busts with high.',
    fundamentals: {
      revenue: 16.6, revenueGrowth: -4.2, netMargin: 10.4, eps: 4.55,
      peRatio: null, debtToEquity: 0.74, currentRatio: 2.4, roe: 16.7,
      dividendYield: 1.5, fcfMargin: 7.8, sharesOutB: 0.3,
    },
  },
  {
    ticker: 'VOLT', name: 'Voltaic Motors', sector: 'Consumer Discretionary',
    start: 27, drift: 0.00045, vol: 0.030,
    profile: 'Electric vehicle startup. Not yet profitable — a lesson in speculative risk.',
    fundamentals: {
      revenue: 4.8, revenueGrowth: 51.0, netMargin: -12.5, eps: -1.35,
      peRatio: null, debtToEquity: 1.35, currentRatio: 1.6, roe: -8.9,
      dividendYield: 0.0, fcfMargin: -18.0, sharesOutB: 1.1,
    },
  },
  {
    ticker: 'AGRO', name: 'TerraAgro Sciences', sector: 'Materials',
    start: 72, drift: 0.00020, vol: 0.014,
    profile: 'Fertilizers and crop science. Commodity-linked; profits swing with crop prices.',
    fundamentals: {
      revenue: 18.9, revenueGrowth: 2.8, netMargin: 13.6, eps: 6.02,
      peRatio: null, debtToEquity: 0.58, currentRatio: 2.0, roe: 13.1,
      dividendYield: 2.6, fcfMargin: 11.2, sharesOutB: 0.4,
    },
  },
  {
    ticker: 'STRM', name: 'StreamVerse Media', sector: 'Communication',
    start: 155, drift: 0.00038, vol: 0.022,
    profile: 'Video streaming platform. Subscriber growth drives the story quarter to quarter.',
    fundamentals: {
      revenue: 31.4, revenueGrowth: 15.9, netMargin: 16.2, eps: 12.30,
      peRatio: null, debtToEquity: 0.88, currentRatio: 1.2, roe: 21.6,
      dividendYield: 0.0, fcfMargin: 14.4, sharesOutB: 0.4,
    },
  },
]

function isWeekday(d) {
  const day = d.getUTCDay()
  return day !== 0 && day !== 6
}

// Trading days from EPOCH through `until` (inclusive), UTC-based.
function tradingDays(until) {
  const days = []
  const d = new Date(EPOCH.getTime())
  while (d.getTime() <= until.getTime()) {
    if (isWeekday(d)) days.push(new Date(d.getTime()))
    d.setTime(d.getTime() + MS_PER_DAY)
  }
  return days
}

const seriesCache = new Map()

// Full OHLC history for a ticker up to today. Cached per (ticker, day).
export function getSeries(ticker) {
  const now = new Date()
  const todayKey = Math.floor(now.getTime() / MS_PER_DAY)
  const cacheKey = `${ticker}:${todayKey}`
  if (seriesCache.has(cacheKey)) return seriesCache.get(cacheKey)

  const c = COMPANIES.find((x) => x.ticker === ticker)
  if (!c) return []
  const rng = mulberry32(hashString('lti-' + ticker))
  const days = tradingDays(now)
  const out = []
  let price = c.start
  // Regime state: occasionally flip between calm/trending/stressed markets so
  // charts show realistic runs, pullbacks, and volatility clusters.
  let regimeDrift = 0
  let regimeVol = 1
  for (let i = 0; i < days.length; i++) {
    if (rng() < 0.012) {
      const r = rng()
      if (r < 0.35) { regimeDrift = 0.0025; regimeVol = 0.9 }        // bull run
      else if (r < 0.6) { regimeDrift = -0.003; regimeVol = 1.6 }    // sell-off
      else { regimeDrift = 0; regimeVol = 1 }                        // calm
    }
    const shock = gaussian(rng) * c.vol * regimeVol
    const open = price
    price = Math.max(1, price * Math.exp(c.drift + regimeDrift + shock))
    const close = price
    const wick = Math.abs(gaussian(rng)) * c.vol * regimeVol * 0.7
    const high = Math.max(open, close) * (1 + wick)
    const low = Math.min(open, close) * (1 - wick)
    const volume = Math.round(1e6 * (0.6 + rng() * 0.8) * (1 + Math.abs(shock) * 30))
    out.push({ date: days[i], open, high, low, close, volume })
  }
  seriesCache.set(cacheKey, out)
  return out
}

export function getQuote(ticker) {
  const s = getSeries(ticker)
  if (s.length < 2) return null
  const last = s[s.length - 1]
  const prev = s[s.length - 2]
  const change = last.close - prev.close
  return {
    ticker,
    price: last.close,
    change,
    changePct: (change / prev.close) * 100,
    volume: last.volume,
    date: last.date,
  }
}

export function getCompany(ticker) {
  return COMPANIES.find((c) => c.ticker === ticker) || null
}

// Fundamentals with price-dependent ratios filled in.
export function getFundamentals(ticker) {
  const c = getCompany(ticker)
  const q = getQuote(ticker)
  if (!c || !q) return null
  const f = { ...c.fundamentals }
  f.peRatio = f.eps > 0 ? q.price / f.eps : null
  f.marketCap = q.price * f.sharesOutB // in billions
  f.psRatio = f.marketCap / f.revenue
  return f
}

// Simple 0–100 "financial health" score used as a teaching aid — the detail
// page explains every component so learners see *why*, not just the number.
export function healthScore(f) {
  if (!f) return null
  const parts = []
  parts.push({
    label: 'Profitability', max: 25,
    score: f.netMargin <= 0 ? 0 : Math.min(25, (f.netMargin / 20) * 25),
    note: f.netMargin <= 0 ? 'The company loses money on every sale.' :
      f.netMargin >= 15 ? 'Strong net margin — keeps a healthy share of each sale.' :
      'Modest margins — profitable, but with little cushion.',
  })
  parts.push({
    label: 'Growth', max: 25,
    score: Math.max(0, Math.min(25, ((f.revenueGrowth + 5) / 30) * 25)),
    note: f.revenueGrowth >= 15 ? 'Revenue is growing fast.' :
      f.revenueGrowth >= 5 ? 'Steady, moderate growth.' :
      f.revenueGrowth >= 0 ? 'Growth has nearly stalled.' : 'Revenue is shrinking.',
  })
  parts.push({
    label: 'Debt safety', max: 25,
    score: Math.max(0, Math.min(25, (1.5 - f.debtToEquity) / 1.5 * 25)),
    note: f.debtToEquity <= 0.5 ? 'Low debt — resilient in downturns.' :
      f.debtToEquity <= 1.0 ? 'Moderate debt load.' : 'High leverage — risky if profits fall.',
  })
  parts.push({
    label: 'Cash generation', max: 25,
    score: f.fcfMargin <= 0 ? 0 : Math.min(25, (f.fcfMargin / 18) * 25),
    note: f.fcfMargin <= 0 ? 'Burns cash — depends on outside funding.' :
      f.fcfMargin >= 12 ? 'Converts sales into real cash well.' : 'Positive but thin cash flow.',
  })
  const total = Math.round(parts.reduce((a, p) => a + p.score, 0))
  return { total, parts }
}
