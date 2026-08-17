# 📈 Learn to Invest

An interactive web app that teaches stock investing **from absolute zero** — and lets you
practice everything immediately in a built-in paper-trading simulator with virtual money.
No API keys, no backend, no real money at risk.

## What's inside

### 🎓 Investing Academy — 6 modules, 28 lessons, quizzes
1. **Investing Foundations** — what a stock is, how markets work, order types, setting yourself up safely.
2. **Fundamental Analysis** — the three financial statements, valuation ratios (P/E, P/S), health ratios (margins, ROE, debt), moats, and a repeatable stock-analysis checklist.
3. **Technical Analysis & Timing** — trends, support/resistance, moving averages, RSI, MACD, Bollinger Bands, volume, and honest buy/sell signal frameworks.
4. **Risk Management** — position sizing (the 1–2% rule), stop losses, diversification, risk/reward and expectancy math, and the classic beginner traps.
5. **Psychology & Strategy** — behavioral biases, the main investing strategies, when to sell, and writing your own Investment Policy Statement.
6. **Think Like a Business Analyst** — business models and unit economics, Porter's Five Forces, SWOT, moat durability, DCF valuation with margin of safety, and writing professional investment theses.

Every module ends with a quiz; progress is saved locally.

### 📊 Simulated market + paper trading
- 12 fictional companies across sectors, with realistic price histories that **advance every real day** (deterministic simulation — same market on every device).
- Interactive charts with SMA/EMA/Bollinger overlays and RSI/MACD panels, with crosshair tooltips.
- An "indicator read" card that interprets the current technicals in plain English.
- Full fundamentals per stock with beginner explanations and a component-by-component financial health score.
- Buy/sell with $10,000 of virtual cash; portfolio tracking with P&L, allocation views, transaction history, and automatic **diversification feedback**.

### 🧮 Analyst tools
Position size calculator (1–2% rule) · Risk/reward + break-even win rate · Compound growth · Simplified DCF intrinsic value with margin of safety.

### 📖 Glossary
50 essential terms in plain English, searchable.

### 🔑 Optional: live real-market data (bring your own API key)
By default the app needs no key and no network. In **Settings** you can paste a free
[Twelve Data](https://twelvedata.com) API key to switch the Market to **8 real US stocks**
(AAPL, MSFT, NVDA, AMZN, TSLA, JPM, JNJ, KO) with real daily price history and quotes —
charts, indicators, and paper trading all work on real data.

- The key is stored **only in your browser** (localStorage) and sent only to Twelve Data.
- Daily candles are cached for the day: one session uses ~8 of the free tier's 800 daily credits.
- If the fetch fails (bad key, offline), the app reports why and falls back to the simulated market.
- Curated fundamentals + the health score remain a simulated-market feature (designed as teaching material).

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Built with React + Vite. All state (progress, portfolio, settings) lives in your browser's localStorage.

## Deploying to GitHub Pages

The repo ships with `.github/workflows/deploy.yml`, which builds and publishes the app on every
push to `master`. One-time setup: in the GitHub repo go to **Settings → Pages** and set
**Source: GitHub Actions**. The app uses hash-based routing and relative asset paths, so it works
on Pages with no extra configuration.

## Disclaimer

This is an educational simulator. All companies, prices, and financial data are fictional and
generated for practice. Nothing in this app is financial advice.
