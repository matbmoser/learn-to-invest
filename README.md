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

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Built with React + Vite. All state (progress, portfolio) lives in your browser's localStorage.

## Disclaimer

This is an educational simulator. All companies, prices, and financial data are fictional and
generated for practice. Nothing in this app is financial advice.
