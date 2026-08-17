# Learn to Invest

An interactive web app that teaches stock investing **from absolute zero** — and lets you practice
everything immediately in a built-in paper-trading simulator with virtual money, alongside an AI
mentor that plays the role of a senior investment analyst.

No backend, no accounts, no real money at risk. Everything runs in your browser.

![Dashboard](docs/screenshots/dashboard.png)

---

## Contents

- [Investing Academy](#investing-academy) — 6 modules, 28 lessons, quizzes
- [AI Mentor](#ai-mentor) — chat with a senior analyst about your own portfolio
- [Market simulator](#market-simulator) — charts, indicators, fundamentals
- [Paper trading](#paper-trading) — a virtual $10,000 portfolio with risk feedback
- [Analyst tools](#analyst-tools) — position sizing, risk/reward, compounding, DCF
- [Live market data](#optional-live-market-data) (optional)
- [Running it](#running-it) · [Deploying](#deploying-to-github-pages) · [License](#license)

---

## Investing Academy

Six modules that take you from "what is a stock?" to writing professional investment theses. Each
module ends with a quiz, and your progress is saved locally.

| # | Module | What you learn |
|---|--------|----------------|
| 1 | **Investing Foundations** | What a stock is, how markets and orders work, and how to set yourself up safely before risking a dollar |
| 2 | **Fundamental Analysis** | The three financial statements, valuation ratios (P/E, P/S), health ratios, moats, and a repeatable analysis checklist |
| 3 | **Technical Analysis & Timing** | Trends, support/resistance, moving averages, RSI, MACD, Bollinger Bands, volume — and the honest limits of every signal |
| 4 | **Risk Management** | Position sizing (the 1–2% rule), stop losses, diversification, risk/reward math, and the traps that destroy beginners |
| 5 | **Psychology & Strategy** | Behavioral biases, choosing a strategy, when to sell, and writing your own investment policy statement |
| 6 | **Think Like a Business Analyst** | Business models, unit economics, Porter's Five Forces, SWOT, moat durability, DCF valuation, and investment theses |

![Academy](docs/screenshots/academy.png)

Lessons are written for a beginner — plain language, worked examples, and callouts for the things
that actually cost people money.

![Lesson](docs/screenshots/lesson.png)

---

## AI Mentor

Chat with an AI that plays a senior investment analyst. It explains concepts from scratch, walks
you through analyzing a company the way a professional would, reviews your practice portfolio for
risk, and quizzes you.

What makes it useful is context: the mentor sees **your** positions and P&L, the current market and
prices, and which lessons you have finished — so answers are about your situation, not generic
theory. From any stock page, **Ask the analyst about `<TICKER>`** opens the chat with that
company's price, indicators, and fundamentals already loaded.

![AI Mentor](docs/screenshots/mentor.png)

It is deliberately a *teacher*, not a tipster: it explains how analysts reason and what the
evidence supports, and declines to tell you what to buy with real money.

Requires your own [Claude API key](https://console.anthropic.com) — see
[Settings](#settings--api-keys).

---

## Market simulator

Twelve fictional companies across sectors, with deterministic price histories that advance every
real day. Each stock page has an interactive chart with SMA/EMA/Bollinger overlays and RSI/MACD
panels, a plain-English read of what the indicators currently say, full fundamentals with
beginner explanations, and a component-by-component financial health score.

![Market](docs/screenshots/market.png)

![Stock detail](docs/screenshots/stock-detail.png)

![Indicator read and fundamentals](docs/screenshots/stock-analysis.png)

---

## Paper trading

Everyone starts with **$10,000 of virtual cash**. The portfolio page tracks positions, P&L,
allocation by stock and by sector, and full transaction history — plus automatic diversification
feedback that flags concentration the way a good advisor would.

![Portfolio](docs/screenshots/portfolio.png)

---

## Analyst tools

The four calculations the lessons keep coming back to: position sizing (the 1–2% rule),
risk/reward with the break-even win rate, compound growth, and a simplified DCF with margin of
safety.

![Tools](docs/screenshots/tools.png)

There's also a searchable 50-term glossary in plain English.

![Glossary](docs/screenshots/glossary.png)

---

## Settings & API keys

![Settings](docs/screenshots/settings.png)

Two optional integrations, each using your own key, stored **only in your browser** and sent only
to its own provider:

### AI Mentor — Claude API
Create a key at [console.anthropic.com](https://console.anthropic.com) and paste it into Settings.
Pick **Claude Opus 5** (deepest analysis), **Sonnet 5** (balanced), or **Haiku 4.5** (fastest and
cheapest). Replies stream in as they are written.

### Optional live market data — Twelve Data
Paste a free [Twelve Data](https://twelvedata.com) key to switch the Market from the simulated
companies to **8 real US stocks** (AAPL, MSFT, NVDA, AMZN, TSLA, JPM, JNJ, KO) with real daily
price history. Charts, indicators, and paper trading all work on real data. One batch request per
day (~8 of the free tier's 800 daily credits), cached until midnight; if the fetch fails the app
says why and falls back to the simulated market.

> **Security note:** the app has no server, so both keys live in the browser's localStorage. That
> is fine for personal use — but use keys with spending limits, and don't save them on a shared
> computer. A multi-user deployment should proxy these calls server-side.

---

## Themes

Dark by default, with a light theme one click away in the sidebar.

![Light theme](docs/screenshots/dashboard-light.png)

---

## Running it

```bash
npm install
npm run dev      # development server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Built with React + Vite. All state — course progress, portfolio, settings, and chat history —
lives in your browser's localStorage.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the app on every push to `master`. One-time
setup: in the GitHub repo go to **Settings → Pages** and set **Source: GitHub Actions**. The app
uses hash routing and relative asset paths, so it works on Pages with no extra configuration.

---

## Disclaimer

This is an educational simulator. In simulated mode all companies, prices, and financial data are
fictional and generated for practice; in live mode the prices are real but the portfolio is still
virtual. Nothing in this app is financial advice.

---

## Support the project

If this project helps you learn to invest, you can
[buy me a coffee with PayPal](https://paypal.me/mathiasbrunkowmoser).

<a href="https://paypal.me/mathiasbrunkowmoser">
  <img src="docs/screenshots/buymeacoffeepaypal.png" width="180" alt="PayPal QR code for Mathias Brunkow Moser">
</a>

Made with ♥ by [Mathias Brunkow Moser](https://github.com/matbmoser).

---

## License

GPL-3.0-or-later — see [LICENSE](LICENSE).

This program is free software: you can redistribute it and/or modify it under the terms of the GNU
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version. It is distributed in the hope that it will be
useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.

## AI-generated content

The code and content in this repository were generated with AI assistance
(Claude Code, Anthropic), directed and edited by the author.

AI makes mistakes. Verify anything that matters — especially anything you would act on with real
money — against primary sources before relying on it.
