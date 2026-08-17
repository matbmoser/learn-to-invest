// The Academy curriculum. Block types rendered by Lesson.jsx:
//   { t:'p', text }                       paragraph (**bold** and `code` supported)
//   { t:'h', text }                       sub-heading
//   { t:'ul' | 'ol', items }              list
//   { t:'callout', title, text, warn }    tip (blue) or warning (orange)
//   { t:'example', title, text }          worked example box
//   { t:'table', headers, rows }          small data table

export const MODULES = [
  // ------------------------------------------------------------------
  {
    id: 'foundations',
    emoji: '🌱',
    level: 'Beginner',
    title: 'Investing Foundations',
    description: 'Start from absolute zero: what a stock is, how the market works, and how to set yourself up safely before risking a single dollar.',
    lessons: [
      {
        id: 'what-is-a-stock',
        title: 'What is a stock — and why invest at all?',
        minutes: 8,
        content: [
          { t: 'p', text: 'A **stock** (also called a *share* or *equity*) is a small piece of ownership in a real company. If a company is divided into 1 million shares and you buy 100, you own 0.01% of that business — including a claim on its future profits.' },
          { t: 'p', text: 'You can make money from stocks in two ways:' },
          { t: 'ul', items: [
            '**Price appreciation** — the company becomes more valuable, so your shares are worth more when you sell them.',
            '**Dividends** — some companies pay part of their profits directly to shareholders in cash, usually every quarter.',
          ]},
          { t: 'h', text: 'Why invest instead of just saving?' },
          { t: 'p', text: 'Because of **inflation** and **compounding**. Inflation quietly shrinks what your cash can buy — at 3% inflation, $10,000 under the mattress buys only about $7,400 worth of goods after 10 years. Investing puts your money to work so it grows *faster* than inflation erodes it.' },
          { t: 'example', title: 'Compounding in action', text: '$10,000 growing at 8% per year becomes $21,589 in 10 years, $46,610 in 20 years, and $100,627 in 30 years — without adding a cent. The growth itself starts generating growth. That is compounding, and time is its main ingredient.' },
          { t: 'callout', title: 'Key idea', text: 'A stock is not a lottery ticket or a line on a chart — it is a piece of a business. Everything else in this academy builds on that single idea.' },
          { t: 'p', text: 'Historically, broad stock markets have returned roughly 7–10% per year *on average* over long periods — but with big swings along the way, including years of -20% or worse. Understanding and managing those swings is what the Risk module is for.' },
        ],
      },
      {
        id: 'how-market-works',
        title: 'How the stock market actually works',
        minutes: 9,
        content: [
          { t: 'p', text: 'The **stock market** is a network of exchanges (like the NYSE or NASDAQ) where buyers and sellers meet. You never trade directly on an exchange — you place orders through a **broker**, an app or bank that executes trades for you.' },
          { t: 'h', text: 'Prices are set by supply and demand' },
          { t: 'p', text: 'At any moment there is a highest price buyers will pay (the **bid**) and a lowest price sellers will accept (the **ask**). The gap between them is the **spread**. When a buyer and seller agree, a trade happens and that becomes the latest "price" you see quoted.' },
          { t: 'p', text: 'This means prices move because *opinions and information* move — earnings reports, economic news, interest rates, fear, and greed. In the short run prices can swing wildly; in the long run they tend to follow the company\'s real earnings.' },
          { t: 'h', text: 'The two order types you must know' },
          { t: 'ul', items: [
            '**Market order** — "buy/sell right now at whatever the current price is." Fast, but in a fast-moving or thinly traded stock you might get a worse price than you saw on screen.',
            '**Limit order** — "buy/sell only at this price or better." You control the price, but the order may never fill if the market doesn\'t reach it.',
          ]},
          { t: 'callout', title: 'Beginner default', text: 'Prefer limit orders. They cost nothing extra and protect you from paying more (or receiving less) than you intended.' },
          { t: 'h', text: 'Who else is in the market?' },
          { t: 'p', text: 'You are trading alongside pension funds, hedge funds, index funds, and high-speed algorithms. You will not out-trade them on speed. Your real advantages as a small investor are **time** (you have no boss demanding quarterly results) and **patience** — you can hold great businesses for years.' },
        ],
      },
      {
        id: 'key-terms',
        title: 'The vocabulary you will see everywhere',
        minutes: 7,
        content: [
          { t: 'p', text: 'Learn these once and every article, app, and earnings report becomes readable. (The full Glossary page has many more.)' },
          { t: 'table', headers: ['Term', 'Plain-English meaning'], rows: [
            ['Ticker', 'The short code for a stock, like NOVA or AAPL.'],
            ['Market cap', 'Total value of the company: share price × number of shares.'],
            ['Dividend', 'Cash profit paid out to shareholders, usually quarterly.'],
            ['Index', 'A basket that tracks many stocks at once, like the S&P 500.'],
            ['ETF', 'A fund you can buy like a single stock that holds a whole basket (often an index).'],
            ['Bull market', 'A period of rising prices and optimism.'],
            ['Bear market', 'A fall of 20%+ from a peak; pessimism rules.'],
            ['Volume', 'How many shares changed hands — a measure of activity and interest.'],
            ['Portfolio', 'The collection of everything you own.'],
            ['Broker', 'The service that executes your buy and sell orders.'],
          ]},
          { t: 'h', text: 'Company sizes' },
          { t: 'ul', items: [
            '**Large-cap** (over ~$10B): established giants. Steadier, slower growth.',
            '**Mid-cap** ($2–10B): established but still expanding.',
            '**Small-cap** (under ~$2B): younger companies. More growth potential, more risk.',
          ]},
          { t: 'callout', title: 'Tip', text: 'When you meet an unknown term anywhere in this app, check the Glossary page — it is written for beginners, with examples.' },
        ],
      },
      {
        id: 'before-you-start',
        title: 'Set yourself up before risking real money',
        minutes: 8,
        content: [
          { t: 'p', text: 'The best investors win before they buy anything, by getting their foundations right. Work through this checklist in order:' },
          { t: 'ol', items: [
            '**Emergency fund first.** Keep 3–6 months of living expenses in cash savings. This is what stops you from being forced to sell investments at the worst moment.',
            '**Pay off expensive debt.** Credit card debt at 20% interest beats any realistic investment return. Clear it first — that is a guaranteed 20% "return".',
            '**Only invest money you won\'t need for 5+ years.** Stocks are unpredictable over months but historically rewarding over decades. Money for next year\'s rent does not belong in stocks.',
            '**Define your goal and horizon.** Retirement in 30 years and a house deposit in 5 years call for very different levels of risk.',
            '**Practice with paper trading.** Use this app\'s simulator with virtual money until buying, selling, position sizing, and reading charts all feel routine.',
          ]},
          { t: 'callout', warn: true, title: 'The golden rule', text: 'Never invest money you cannot afford to lose, and never invest in something you do not understand. Every scam and every blown-up account starts by breaking one of these two rules.' },
          { t: 'h', text: 'How much do you need to start?' },
          { t: 'p', text: 'Less than you think. Many brokers offer fractional shares, so you can start with $50–100 per month. Investing a fixed amount regularly (called **dollar-cost averaging**) also smooths out the risk of bad timing — you automatically buy more shares when prices are low and fewer when they are high.' },
          { t: 'p', text: 'Now open the **Market** page, pick any company, and just *look around* — the quote, the chart, the fundamentals tab. The next module teaches you how to read all of it.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'You buy 100 shares of a company that has 1 million shares total. What do you own?',
        options: ['A loan the company must repay you', '0.01% of the business, including a claim on its profits', 'A guarantee of dividend payments', 'The right to work at the company'],
        answer: 1,
        explain: 'A share is fractional ownership of the business. Dividends are only paid if the company chooses to; nothing is guaranteed.',
      },
      {
        q: 'Why do stocks generally beat keeping cash under the mattress over decades?',
        options: ['Stocks never lose value', 'Banks charge fees on cash', 'Compounding growth outpaces inflation over long periods', 'Cash expires after 10 years'],
        answer: 2,
        explain: 'Stocks swing a lot short-term and can lose value, but historically their compounded returns have outrun inflation over long horizons.',
      },
      {
        q: 'What does a limit order do?',
        options: ['Buys immediately at any price', 'Only executes at your chosen price or better', 'Limits how many stocks you can own', 'Guarantees your order will fill'],
        answer: 1,
        explain: 'A limit order controls your price but may never fill. A market order fills fast but at whatever the market offers.',
      },
      {
        q: 'Which money is appropriate to invest in stocks?',
        options: ['Next month\'s rent', 'Your emergency fund', 'Money you won\'t need for 5+ years', 'A credit card cash advance'],
        answer: 2,
        explain: 'Stocks are unpredictable over short periods. Emergency funds and near-term expenses stay in cash; expensive debt gets paid first.',
      },
      {
        q: 'A "bear market" means…',
        options: ['Prices rose 20% from a low', 'Prices fell 20%+ from a peak', 'The market is closed', 'Only small companies are trading'],
        answer: 1,
        explain: 'Bear = falling (20%+ from a peak), bull = rising. Bears hibernate; bulls charge.',
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'fundamental',
    emoji: '🔍',
    level: 'Beginner–Intermediate',
    title: 'Fundamental Analysis',
    description: 'Learn to read a company like an analyst: financial statements, the key ratios, and a repeatable checklist to judge whether a business is healthy and fairly priced.',
    lessons: [
      {
        id: 'three-statements',
        title: 'The three financial statements',
        minutes: 10,
        content: [
          { t: 'p', text: 'Every public company publishes three reports each quarter. Together they answer three questions: *Is it profitable? What does it own and owe? Where does the cash actually go?*' },
          { t: 'h', text: '1. Income statement — is it profitable?' },
          { t: 'p', text: 'A movie of the last quarter/year. It flows top to bottom:' },
          { t: 'ul', items: [
            '**Revenue** (the "top line") — total sales.',
            '**Gross profit** — revenue minus the direct cost of making the product.',
            '**Operating profit** — after salaries, marketing, R&D, rent.',
            '**Net income** (the "bottom line") — what is left after everything, including taxes and interest. Divided by share count, this becomes **EPS** (earnings per share).',
          ]},
          { t: 'h', text: '2. Balance sheet — what does it own and owe?' },
          { t: 'p', text: 'A photograph of one moment: **Assets** (cash, factories, inventory) on one side; **Liabilities** (debt, unpaid bills) and **Equity** (what belongs to shareholders) on the other. Always: Assets = Liabilities + Equity.' },
          { t: 'h', text: '3. Cash flow statement — where does cash really move?' },
          { t: 'p', text: 'Profit is an accounting opinion; **cash is a fact**. A company can report profits while bleeding cash (customers not paying yet, heavy equipment purchases). The star metric here is **free cash flow (FCF)**: cash generated by operations minus what must be reinvested. FCF funds dividends, buybacks, and growth without borrowing.' },
          { t: 'callout', title: 'Analyst habit', text: 'When profits grow but free cash flow doesn\'t, ask why. Persistent gaps between "earnings" and real cash are one of the oldest warning signs in investing.' },
          { t: 'example', title: 'Try it in this app', text: 'Open any stock in the Market page and look at the Fundamentals tab: revenue, net margin, and FCF margin come straight from these three statements.' },
        ],
      },
      {
        id: 'valuation-ratios',
        title: 'Valuation ratios: is the stock cheap or expensive?',
        minutes: 10,
        content: [
          { t: 'p', text: 'A great company can still be a terrible investment if you overpay. Valuation ratios compare the **price** you pay to what you **get** (earnings, sales, assets).' },
          { t: 'h', text: 'P/E — price to earnings (the classic)' },
          { t: 'p', text: '`P/E = share price ÷ earnings per share`. It answers: *how many dollars am I paying for each $1 of annual profit?* A P/E of 20 means $20 per $1 of yearly earnings — a 5% "earnings yield".' },
          { t: 'ul', items: [
            'Broad market average is historically around 15–20.',
            'High P/E (30+) = the market expects strong growth — and punishes the stock hard if growth disappoints.',
            'Low P/E (under 12) = cheap… or the market believes profits will shrink. Cheap for a reason is called a **value trap**.',
            'Negative earnings → P/E is meaningless (you\'ll see "—" in this app, like VOLT).',
          ]},
          { t: 'h', text: 'P/S — price to sales' },
          { t: 'p', text: '`Market cap ÷ annual revenue`. Useful for young companies that aren\'t profitable yet. Compare it only within the same industry — software runs far higher P/S than supermarkets because each dollar of software sales carries more profit.' },
          { t: 'example', title: 'Worked example', text: 'Two chipmakers each earn $5 per share. Stock A trades at $60 (P/E 12); Stock B at $150 (P/E 30). B is not "worse" — the market expects B to grow much faster. Your job as an analyst is to judge whether that expectation is realistic. If B grows earnings 25%/year for 5 years, today\'s price may be fair; if growth stalls, B can fall 50% while earnings stay flat, just from the P/E deflating.' },
          { t: 'callout', title: 'Golden rule of ratios', text: 'Never judge a ratio in isolation. Always compare against (1) the company\'s own history, (2) direct competitors, and (3) the growth rate you actually believe in.' },
        ],
      },
      {
        id: 'health-ratios',
        title: 'Profitability & financial health ratios',
        minutes: 10,
        content: [
          { t: 'p', text: 'Valuation tells you the price; these ratios tell you the **quality** of what you\'re buying.' },
          { t: 'table', headers: ['Ratio', 'Formula', 'What it tells you', 'Rules of thumb'], rows: [
            ['Net margin', 'Net income ÷ revenue', 'Profit kept from each $1 of sales', '>15% strong · 5–15% okay · <5% thin'],
            ['ROE', 'Net income ÷ shareholder equity', 'How hard shareholder money works', '>15% good, if not from huge debt'],
            ['Debt/Equity', 'Total debt ÷ equity', 'How leveraged the company is', '<0.5 conservative · >1.5 risky'],
            ['Current ratio', 'Current assets ÷ current liabilities', 'Can it pay bills due this year?', '>1.5 comfortable · <1 tight'],
            ['FCF margin', 'Free cash flow ÷ revenue', 'Real cash from each $1 of sales', '>10% strong · negative = burning cash'],
          ]},
          { t: 'h', text: 'Margins reveal the business model' },
          { t: 'p', text: 'A supermarket at 3% net margin and a software firm at 25% aren\'t "bad" and "good" — they are different machines. What matters is the **trend** (expanding margins = pricing power or efficiency; shrinking = competition or rising costs) and the comparison to direct rivals.' },
          { t: 'h', text: 'Debt: the amplifier' },
          { t: 'p', text: 'Debt magnifies everything. In good times it boosts ROE; in downturns interest payments don\'t pause, and a leveraged company can spiral while a debt-free one just rides it out. Check Debt/Equity together with interest coverage and whether cash flows are stable (a railroad can carry more debt safely than an EV startup).' },
          { t: 'example', title: 'Try it in this app', text: 'Compare BANQ (Debt/Equity 1.1 — normal for a bank), RAIL (0.95, but with fortress cash flows) and VOLT (1.35 while losing money — the dangerous combination). The Financial Health score on each stock page walks through exactly these components.' },
        ],
      },
      {
        id: 'growth-quality',
        title: 'Growth, quality, and economic moats',
        minutes: 9,
        content: [
          { t: 'p', text: 'Two companies with identical ratios today can have wildly different futures. Growth and durability are what separate them.' },
          { t: 'h', text: 'Revenue growth' },
          { t: 'ul', items: [
            '**20%+ per year** — hypergrowth. Usually young companies; expect volatility and rich valuations.',
            '**8–20%** — solid growth, often the sweet spot of growth vs. predictability.',
            '**0–8%** — mature. Fine if the price is low and dividends are healthy.',
            '**Negative** — shrinking. Only interesting if temporary and the price already reflects disaster.',
          ]},
          { t: 'p', text: 'Quality of growth matters as much as quantity: growth funded by profits and reinvested cash is durable; growth bought with debt or endless share issuance dilutes you.' },
          { t: 'h', text: 'Moats: why profits persist' },
          { t: 'p', text: 'High profits attract competitors like blood attracts sharks. A **moat** is whatever stops competitors from eating those profits:' },
          { t: 'ul', items: [
            '**Network effects** — each user makes the product better (marketplaces, social platforms).',
            '**Switching costs** — leaving is painful (business software, banks).',
            '**Brand** — people pay extra for the name (luxury goods like LUXE).',
            '**Cost advantage / scale** — nobody can make it cheaper (giant retailers).',
            '**Physical or legal barriers** — patents, licenses, or a rail network like RAIL that cannot be duplicated.',
          ]},
          { t: 'callout', title: 'The analyst question', text: 'For any company ask: "If a competitor with $1 billion attacked this business tomorrow, what would stop them?" If you can\'t answer, there is no moat — and today\'s fat margins are on borrowed time.' },
        ],
      },
      {
        id: 'stock-checklist',
        title: 'Putting it together: your stock analysis checklist',
        minutes: 8,
        content: [
          { t: 'p', text: 'Analysis becomes reliable when it becomes a **routine**. Run every candidate through the same questions, in the same order, and write your answers down.' },
          { t: 'ol', items: [
            '**Do I understand the business?** Can you explain in two sentences how it makes money? If not, stop here.',
            '**Is it growing?** Revenue trend over 3–5 years; is growth speeding up or slowing?',
            '**Is it profitable and cash-generative?** Positive, ideally expanding net margin; positive free cash flow.',
            '**Is it financially safe?** Debt/Equity reasonable for its industry; current ratio above ~1.2.',
            '**Does it have a moat?** Name the specific mechanism that protects its profits.',
            '**Is the price reasonable?** P/E and P/S vs. its history, its peers, and its realistic growth.',
            '**What could go wrong?** Write down 2–3 concrete risks *before* buying — you\'ll judge news much more calmly later.',
          ]},
          { t: 'callout', title: 'Practice now', text: 'Pick two stocks in the simulator — one "boring" (FRSH, RAIL) and one "exciting" (NOVA, VOLT) — and run the full checklist on both using their Fundamentals tabs. Notice how differently they score, and how the exciting one demands much stronger assumptions to justify its price.' },
          { t: 'p', text: 'A checklist doesn\'t make you right every time. It makes you **consistent**, and it makes your mistakes reviewable — which is how analysts actually improve.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'Which statement shows whether a company can pay its bills due this year?',
        options: ['Income statement', 'Balance sheet', 'Cash flow statement', 'The stock chart'],
        answer: 1,
        explain: 'The balance sheet is the snapshot of assets vs. liabilities; the current ratio (current assets ÷ current liabilities) comes from it.',
      },
      {
        q: 'A stock trades at $80 with EPS of $4. Its P/E is…',
        options: ['4', '76', '20', '320'],
        answer: 2,
        explain: 'P/E = price ÷ EPS = 80 ÷ 4 = 20. You pay $20 for each $1 of annual earnings.',
      },
      {
        q: 'A company reports rising profits but free cash flow is negative for the third year. The analyst response is:',
        options: ['Celebrate — profits are what matter', 'Investigate — earnings without cash is a classic warning sign', 'Ignore it — cash flow is only for banks', 'Buy more before others notice'],
        answer: 1,
        explain: 'Profit is an accounting result; cash is a fact. Persistent profit-without-cash deserves investigation before investing.',
      },
      {
        q: 'Why is a very low P/E not automatically a bargain?',
        options: ['Low P/E stocks are illegal to buy', 'The market may correctly expect profits to shrink — a value trap', 'P/E only applies to tech stocks', 'Because dividends are taxed'],
        answer: 1,
        explain: 'Price reflects expectations. A "cheap" ratio often prices in real deterioration; your job is to judge whether the market is wrong.',
      },
      {
        q: 'Which is a genuine moat?',
        options: ['Having a popular CEO on social media', 'This quarter\'s good earnings', 'High switching costs that make customers stay', 'A rising stock price'],
        answer: 2,
        explain: 'A moat is a structural barrier that protects future profits — switching costs, network effects, brand, scale, or legal/physical barriers.',
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'technical',
    emoji: '📈',
    level: 'Intermediate',
    title: 'Technical Analysis & Timing',
    description: 'Read price charts, use moving averages, RSI, MACD and Bollinger Bands, and learn what buy/sell signals really mean — including their limits.',
    lessons: [
      {
        id: 'charts-trends',
        title: 'Reading price charts: trend, support, resistance',
        minutes: 9,
        content: [
          { t: 'p', text: 'Fundamental analysis answers *what* to buy. Technical analysis studies price and volume to help decide *when* — on the theory that prices move in trends and that crowd behavior repeats.' },
          { t: 'h', text: 'Trend: the market\'s direction' },
          { t: 'ul', items: [
            '**Uptrend** — higher highs and higher lows. Buyers in control.',
            '**Downtrend** — lower highs and lower lows. Sellers in control.',
            '**Sideways / range** — price bouncing in a band; neither side winning.',
          ]},
          { t: 'p', text: 'The oldest rule in trading: **"the trend is your friend."** Buying strong companies in uptrends and avoiding falling knives in downtrends puts probability on your side, even though no rule works every time.' },
          { t: 'h', text: 'Support and resistance' },
          { t: 'p', text: '**Support** is a price level where falling stock repeatedly finds buyers (demand). **Resistance** is where rallies repeatedly stall (supply). They matter because thousands of traders remember them and place orders around them — making them partly self-fulfilling. When price finally breaks through resistance on strong volume, that old ceiling often becomes the new floor.' },
          { t: 'example', title: 'Try it', text: 'Open any stock chart in this app on the 1Y range. Find two or three price levels the stock bounced off repeatedly. You have just drawn your first support/resistance map.' },
          { t: 'callout', warn: true, title: 'Honest disclaimer', text: 'Technical analysis is about probabilities and risk points, not prophecy. Every pattern fails sometimes. That is why the Risk module — stop losses and position sizing — is inseparable from this one.' },
        ],
      },
      {
        id: 'moving-averages',
        title: 'Moving averages: the trend, smoothed',
        minutes: 9,
        content: [
          { t: 'p', text: 'A **moving average (MA)** is the average closing price over the last N days, redrawn each day. It filters daily noise so the underlying trend becomes visible.' },
          { t: 'ul', items: [
            '**SMA (simple)** — plain average of the last N closes. Smooth and slow.',
            '**EMA (exponential)** — weights recent days more heavily, so it reacts faster to new moves.',
          ]},
          { t: 'h', text: 'The classic periods' },
          { t: 'ul', items: [
            '**20-day** — the short-term trend (about one trading month).',
            '**50-day** — the medium-term trend. Widely watched.',
            '**200-day** — the long-term dividing line. Price above the 200-day is broadly considered a healthy uptrend; below it, a downtrend.',
          ]},
          { t: 'h', text: 'Signals traders watch' },
          { t: 'ul', items: [
            '**Price crosses above/below an MA** — early sign of a possible trend change.',
            '**Golden cross** — the 50-day crosses *above* the 200-day: a famous long-term bullish signal.',
            '**Death cross** — the 50-day crosses *below* the 200-day: bearish.',
            '**MA as dynamic support** — in strong uptrends, pullbacks often bounce near the 20- or 50-day MA, giving calmer entry points than chasing highs.',
          ]},
          { t: 'callout', title: 'Know the weakness', text: 'MAs are lagging — built from past prices, they confirm trends late and get chopped up in sideways markets (whipsaws). They work best as trend *filters* ("only buy while price is above the 200-day"), not as standalone triggers.' },
          { t: 'example', title: 'Try it', text: 'On any stock page, toggle SMA 20 and SMA 50 on the chart. Find a moment where the fast average crossed the slow one — then check what price did next. Sometimes it worked, sometimes it whipsawed. That ratio is the honest reality of every indicator.' },
        ],
      },
      {
        id: 'momentum',
        title: 'Momentum: RSI and MACD',
        minutes: 10,
        content: [
          { t: 'p', text: 'Momentum indicators measure the *speed* of price moves — helping spot when a move is getting stretched or losing force.' },
          { t: 'h', text: 'RSI — Relative Strength Index' },
          { t: 'p', text: 'RSI compares recent gains to recent losses and squeezes the result into a 0–100 scale (14 days is standard):' },
          { t: 'ul', items: [
            '**Above 70 — "overbought."** The rally has been unusually one-sided. Not an automatic sell: strong stocks can stay overbought for weeks. Read it as "late to chase; a pause or pullback is likelier."',
            '**Below 30 — "oversold."** Selling has been extreme. In quality stocks this often marks panic lows worth investigating — but in genuinely broken companies, oversold can stay oversold.',
            '**Divergence** — price makes a new high while RSI makes a lower high: the rally is running on fewer engines. A classic early warning.',
          ]},
          { t: 'h', text: 'MACD — Moving Average Convergence Divergence' },
          { t: 'p', text: 'MACD is the gap between a fast EMA (12) and a slow EMA (26). A 9-day EMA of that gap is the **signal line**; the bars (**histogram**) show the distance between them.' },
          { t: 'ul', items: [
            '**MACD crosses above the signal line** — momentum turning up (bullish).',
            '**MACD crosses below** — momentum turning down (bearish).',
            '**Histogram shrinking** — the current move is losing steam, often *before* the cross happens.',
            '**Above vs. below zero** — tells you whether the medium-term trend itself is up or down.',
          ]},
          { t: 'example', title: 'Try it', text: 'Open a stock page and enable the RSI and MACD panels. Find an RSI dip below 30 — did it mark a good entry? Then find one where price kept falling anyway. Both exist, which is exactly why signals need risk management around them.' },
        ],
      },
      {
        id: 'volatility-volume',
        title: 'Volatility and volume: Bollinger Bands',
        minutes: 8,
        content: [
          { t: 'p', text: '**Bollinger Bands** wrap a 20-day SMA with bands 2 standard deviations above and below. Because the bands widen when the stock is volatile and squeeze when it is calm, they show *how unusual* today\'s price is.' },
          { t: 'ul', items: [
            '**Touching the upper band** — the move is statistically stretched. In a range-bound market, often a fade point; in a strong trend, price can "walk the band" upward for weeks.',
            '**Touching the lower band** — stretched to the downside; watch for stabilization before catching it.',
            '**The squeeze** — bands pinching tight means energy is coiling. Big moves are often born from squeezes; the *direction* of the eventual breakout is the tradeable information.',
          ]},
          { t: 'h', text: 'Volume: the lie detector' },
          { t: 'p', text: 'Volume is conviction. A breakout on **high volume** means real money agrees; the same breakout on thin volume is fragile and often reverses. Rules of thumb:' },
          { t: 'ul', items: [
            'Rising price + rising volume = healthy trend.',
            'Rising price + fading volume = rally losing sponsorship.',
            'Panic-volume spikes after long declines often mark capitulation — the final flush.',
          ]},
          { t: 'callout', title: 'Concept that ties it together', text: 'Every indicator is a different lens on the same two forces: trend and its exhaustion. MAs define the trend, RSI/MACD measure its speed, Bollinger measures its stretch, volume measures its conviction.' },
        ],
      },
      {
        id: 'buy-sell-signals',
        title: 'When to buy, when to sell — signals and their limits',
        minutes: 10,
        content: [
          { t: 'p', text: 'No single indicator is a magic button. What professionals actually do is wait for **confluence** — several independent signals agreeing — and predefine their exit *before* entering.' },
          { t: 'h', text: 'A higher-probability BUY setup (for a stock you already like fundamentally)' },
          { t: 'ol', items: [
            'The long-term trend is up (price above the 200-day MA).',
            'A pullback has brought price near support or the 50-day MA — you are not chasing a spike.',
            'RSI has cooled from overbought (ideally 40–55, or a washout below 30 that is now recovering).',
            'MACD histogram is shrinking its red bars or has just crossed bullish.',
            'You know your exit: a stop-loss below support, sized so the loss is ≤1–2% of your portfolio (next module).',
          ]},
          { t: 'h', text: 'Legitimate reasons to SELL' },
          { t: 'ul', items: [
            '**Your stop-loss hits** — the trade idea was wrong. Take the small loss; that is the system working.',
            '**Your thesis breaks** — the reason you bought (growth, margins, moat) has factually deteriorated. Sell even at a loss.',
            '**Extreme overvaluation** — price has run far beyond any reasonable estimate of value; trimming locks in gains.',
            '**Rebalancing** — one winner has grown into a dangerously large share of your portfolio.',
            '**A better opportunity** — capital is finite; upgrading is allowed.',
          ]},
          { t: 'callout', warn: true, title: 'Never sell (or buy) because…', text: '…of a red day, a scary headline, or because a stranger online is certain. Emotional trades transfer money from the impatient to the patient. If you feel urgency, that is usually the signal to slow down.' },
          { t: 'p', text: 'Time-tested reality check: even good setups fail perhaps 40–50% of the time. The edge comes from losing small when wrong and letting winners run — which is mathematics, not prediction. That is the next module.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'A stock keeps making higher highs and higher lows. This is…',
        options: ['A downtrend', 'An uptrend', 'A squeeze', 'A death cross'],
        answer: 1,
        explain: 'Higher highs + higher lows define an uptrend — buyers in control.',
      },
      {
        q: 'The "golden cross" is:',
        options: ['RSI crossing 50', 'Price touching the upper Bollinger Band', 'The 50-day MA crossing above the 200-day MA', 'Volume doubling in one day'],
        answer: 2,
        explain: 'Golden cross = 50-day above 200-day (long-term bullish). The reverse is the death cross.',
      },
      {
        q: 'RSI is at 78. The most accurate reading is:',
        options: ['Guaranteed crash incoming — sell everything', 'The rally is stretched; chasing here is riskier, but strong stocks can stay overbought', 'The company is overvalued fundamentally', 'Volume must be low'],
        answer: 1,
        explain: 'Overbought describes recent price behavior, not fundamental value, and it is not an automatic sell signal.',
      },
      {
        q: 'A breakout above resistance happens on unusually LOW volume. You should treat it as…',
        options: ['Extra bullish', 'Fragile — breakouts need volume conviction to be trusted', 'A golden cross', 'Proof of insider buying'],
        answer: 1,
        explain: 'Volume is conviction. Thin-volume breakouts frequently fail and reverse.',
      },
      {
        q: 'Which is a legitimate reason to sell a stock?',
        options: ['It dropped 3% today', 'A stranger online posted a scary meme', 'The reason you bought it has factually broken down', 'It has gone up and you feel nervous'],
        answer: 2,
        explain: 'Sell on stops, broken theses, extreme overvaluation, rebalancing, or better opportunities — not on raw emotion.',
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'risk',
    emoji: '🛡️',
    level: 'Essential — all levels',
    title: 'Risk Management',
    description: 'The module that keeps you in the game: position sizing, stop losses, diversification, risk/reward math, and the classic traps that destroy beginner portfolios.',
    lessons: [
      {
        id: 'why-risk-first',
        title: 'Why risk comes before returns',
        minutes: 8,
        content: [
          { t: 'p', text: 'Ask a professional what they do and they rarely say "I pick winners." They say "I manage risk." The reason is brutal arithmetic: **losses hurt more than equal gains help.**' },
          { t: 'table', headers: ['If you lose…', 'You need this gain just to break even'], rows: [
            ['-10%', '+11%'],
            ['-20%', '+25%'],
            ['-33%', '+50%'],
            ['-50%', '+100%'],
            ['-80%', '+400%'],
          ]},
          { t: 'p', text: 'A -50% hole needs a +100% climb — and doubling your money typically takes *years*. This asymmetry is why rule #1 is "don\'t lose big," and rule #2 is "see rule #1."' },
          { t: 'h', text: 'Know your risks by name' },
          { t: 'ul', items: [
            '**Company risk** — this specific business fails or disappoints. (Diversification fixes this.)',
            '**Market risk** — everything falls together in crashes. (Time horizon and asset allocation handle this.)',
            '**Volatility risk** — wild swings shake you out of good positions at the worst time. (Position sizing fixes this.)',
            '**Liquidity risk** — you can\'t sell without moving the price. (Stick to liquid stocks.)',
            '**Behavioral risk** — the person in the mirror panic-sells lows and FOMO-buys highs. (Rules and automation fix this — it is the biggest risk of all.)',
          ]},
          { t: 'callout', title: 'Reframe', text: 'You cannot control returns — the market decides those. You CAN control how much you lose when you\'re wrong. Risk management is the only lever that is 100% in your hands.' },
        ],
      },
      {
        id: 'position-sizing',
        title: 'Position sizing and stop losses: the 1–2% rule',
        minutes: 10,
        content: [
          { t: 'p', text: 'The most important number in any trade is not the potential profit — it is **how much you lose if you\'re wrong**. Professionals cap that number before entering: risk no more than **1–2% of your total portfolio on any single idea**.' },
          { t: 'h', text: 'The formula' },
          { t: 'p', text: '`Shares = (Portfolio × Risk%) ÷ (Entry price − Stop price)`' },
          { t: 'example', title: 'Worked example', text: 'Portfolio $10,000, risk 1% = $100 maximum loss. You want to buy at $50 with a stop-loss at $45 (risking $5/share). Shares = $100 ÷ $5 = **20 shares** ($1,000 position). If the stop hits, you lose $100 — annoying, survivable, and you can be wrong ten times in a row and still have 90% of your capital.' },
          { t: 'p', text: 'Notice what the formula does: a wider stop (more volatile stock) automatically means a **smaller position**. Risk stays constant; size adapts. This is exactly what the Position Size calculator in the Tools page computes.' },
          { t: 'h', text: 'Stop losses: pre-deciding your exit' },
          { t: 'ul', items: [
            'Place stops **below a logical level** (support, recent swing low) — not at a round number where everyone else\'s stops sit.',
            'Give the stock room to breathe: a stop 2% below entry on a stock that swings 4% daily will be hit by pure noise.',
            '**Never move a stop further away** to avoid taking the loss. That single habit destroys more accounts than any crash.',
            'A **trailing stop** ratchets up as price rises — locking in gains while letting winners run.',
          ]},
          { t: 'callout', warn: true, title: 'The hard truth', text: 'A stop-loss hitting is not failure — it is the fee for finding out you were wrong while still rich. The failure is the account that "waits to get back to even" all the way down 80%.' },
        ],
      },
      {
        id: 'diversification',
        title: 'Diversification: the only free lunch',
        minutes: 9,
        content: [
          { t: 'p', text: 'Diversification means owning enough *different* things that no single failure can ruin you. Economist Harry Markowitz called it "the only free lunch in finance": done right, it lowers risk more than it lowers returns.' },
          { t: 'h', text: 'What "different" actually means' },
          { t: 'ul', items: [
            '**Different companies** — 10–20 stocks captures most of the benefit; 100 tiny positions just becomes an expensive index fund.',
            '**Different sectors** — five tech stocks are one bet in five costumes. Spread across tech, healthcare, staples, financials, industrials, energy…',
            '**Different economic sensitivities** — mix cyclicals (HOMR, LUXE — boom and bust with the economy) with defensives (FRSH, MEDX — people eat and take medicine in every economy).',
            '**Correlation is the key word** — the benefit comes from holdings that *don\'t move together*. In 2008, owning five different banks was not diversification.',
          ]},
          { t: 'h', text: 'Practical limits' },
          { t: 'ul', items: [
            'Keep any single position under **~10%** of your portfolio (a beginner\'s cap; concentrated pros break this rule *knowingly*).',
            'Keep any single sector under **~30%**.',
            'For most people, a broad **index fund as the core** with individual stock picks around it (the "core and satellite" model) is the sanest structure.',
          ]},
          { t: 'example', title: 'Try it', text: 'The Portfolio page in this app shows your allocation by stock and sector and flags concentration. Build a 5-stock portfolio in the simulator and watch the diversification feedback change as you add sectors.' },
        ],
      },
      {
        id: 'risk-reward',
        title: 'Risk/reward and expectancy: the gambler\'s math that isn\'t gambling',
        minutes: 9,
        content: [
          { t: 'p', text: 'Before any trade, compare what you\'re risking to what you realistically stand to gain. `Risk/Reward = (target − entry) ÷ (entry − stop)`.' },
          { t: 'example', title: 'Worked example', text: 'Buy at $100, stop at $95 (risk $5), target $115 (reward $15). Ratio = 3:1. With a 3:1 ratio you can be right only **40% of the time and still grow**: out of 10 trades, 4 winners × $15 = $60 gained, 6 losers × $5 = $30 lost → +$30 net.' },
          { t: 'p', text: 'This is **expectancy**: `(win% × avg win) − (loss% × avg loss)`. Positive expectancy — not a high win rate — is what makes an approach profitable. Beginners chase being right; professionals chase good ratios.' },
          { t: 'h', text: 'Practical rules' },
          { t: 'ul', items: [
            'Skip trades offering less than **2:1** — a 1:1 trade needs you to be right most of the time, and you won\'t be.',
            'Set the target from something real (resistance level, valuation estimate), not wishful thinking.',
            'Track every simulated trade\'s planned R:R and outcome in a journal — after 20 trades, your personal statistics will teach you more than any book.',
          ]},
          { t: 'callout', title: 'Tools page', text: 'The Risk/Reward calculator in Tools computes the ratio and the break-even win rate for any entry/stop/target you\'re considering.' },
        ],
      },
      {
        id: 'common-traps',
        title: 'The classic traps that destroy beginners',
        minutes: 9,
        content: [
          { t: 'p', text: 'Most beginner losses come from a short, well-documented list of mistakes. Read it now, and you\'ll recognize each one the moment it knocks.' },
          { t: 'ul', items: [
            '**FOMO buying** — a stock is up 60% and everyone is talking about it, so you buy the top. Fix: if you missed it, you missed it. There is always another train.',
            '**Catching falling knives** — "it fell 40%, it must be cheap!" Stocks down 40% can fall another 40%. Fix: wait for stabilization and ask *why* it fell.',
            '**Averaging down into a broken thesis** — adding money to a loser to "lower your average." Fix: only add if the business is intact and you\'d buy it fresh today.',
            '**Overtrading** — every trade costs spread, fees, taxes, and attention. Activity feels productive; it usually isn\'t.',
            '**Leverage and margin** — borrowed money turns a survivable -30% into a wipeout, and lets your broker force-sell you at the bottom. Skip it entirely as a beginner.',
            '**Penny stocks & hype coins** — cheap-looking prices, easy manipulation, "guaranteed 10x" stories. If someone is selling you certainty, ask what they gain from it.',
            '**No plan** — buying with no target, no stop, no thesis means every future decision is made emotionally, in the heat of the moment.',
          ]},
          { t: 'callout', warn: true, title: 'The scam filter', text: 'Guaranteed returns, urgency ("only today!"), secret strategies, and DMs from "advisors" — each one alone is a red flag; together they are a certainty. Real investing never requires hurry.' },
          { t: 'p', text: 'The pattern behind every trap is the same: an emotional shortcut around a rule. This is why your plan — sizing, stops, diversification limits — must be written **before** money moves, when you\'re calm.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'Your portfolio drops 50%. What gain do you now need to get back to even?',
        options: ['+50%', '+75%', '+100%', '+200%'],
        answer: 2,
        explain: 'From $100 to $50 is -50%; from $50 back to $100 requires +100%. Losses are asymmetric — this is why capping them is rule #1.',
      },
      {
        q: 'Portfolio $20,000, risking 1% per trade. Entry $40, stop $36. How many shares does the sizing formula allow?',
        options: ['500', '50', '125', '5'],
        answer: 1,
        explain: 'Max loss = $200. Risk per share = $4. Shares = 200 ÷ 4 = 50 (a $2,000 position).',
      },
      {
        q: 'Which portfolio is genuinely diversified?',
        options: ['Five different tech growth stocks', 'One index fund plus 100% margin', '12 stocks across 6 sectors mixing cyclical and defensive', 'One stock you know really well'],
        answer: 2,
        explain: 'Diversification requires holdings that don\'t move together — different sectors and economic sensitivities, not five costumes on the same bet.',
      },
      {
        q: 'A trade risks $5/share to make $15/share (3:1). What win rate do you need to avoid losing money over time?',
        options: ['75%', 'Above about 25%', '50%', '90%'],
        answer: 1,
        explain: 'Break-even win rate = risk ÷ (risk + reward) = 5/20 = 25%. Good ratios let you be wrong often and still profit — that is expectancy.',
      },
      {
        q: 'Your stock falls to your stop-loss. The disciplined action is:',
        options: ['Move the stop lower and wait', 'Sell as planned and review the trade calmly', 'Double the position to lower your average', 'Delete the app'],
        answer: 1,
        explain: 'The stop is the plan you made when calm. Moving stops away and averaging into broken theses are the two habits that destroy accounts.',
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'psychology',
    emoji: '🧠',
    level: 'Intermediate',
    title: 'Psychology & Strategy',
    description: 'Master the investor in the mirror: the biases that sabotage returns, the main investment strategies, and how to build a written plan you can actually follow.',
    lessons: [
      {
        id: 'biases',
        title: 'Your brain on stocks: the big five biases',
        minutes: 9,
        content: [
          { t: 'p', text: 'Studies of real brokerage accounts consistently find the same thing: the average investor underperforms the very funds they invest in, because they buy after rises and sell after falls. The gap is pure psychology. Know the culprits:' },
          { t: 'ul', items: [
            '**Loss aversion** — losses feel roughly twice as painful as equal gains feel good. Result: selling winners too early ("lock it in!") and clinging to losers ("it\'ll come back…"). The fix is mechanical: predefined stops and targets.',
            '**Confirmation bias** — once you own a stock, you hunt for good news about it and dismiss the bad. Fix: before buying, write down what would prove you wrong; re-read it monthly.',
            '**Herding / FOMO** — safety in crowds is ancient wiring, but markets pay the crowd worst at extremes. When everyone agrees, the price already reflects it.',
            '**Anchoring** — "I paid $80, I\'ll sell when it gets back to $80." The market does not know or care what you paid. Every day\'s question is only: would I buy this today at this price?',
            '**Overconfidence** — three lucky wins convince you it\'s skill; then position sizes grow just before the lesson arrives. Fix: a trade journal with honest statistics.',
          ]},
          { t: 'example', title: 'The Odean study', text: 'A famous analysis of 10,000 brokerage accounts found the stocks investors *sold* went on to outperform the stocks they *bought* to replace them — by about 3% over the following year. Activity driven by emotion has a measurable negative price.' },
          { t: 'callout', title: 'Master principle', text: 'You cannot delete these biases — they are firmware. You can only build **systems** (rules, checklists, automation, journals) so decisions get made by the calm you, not the excited you.' },
        ],
      },
      {
        id: 'strategies',
        title: 'The main strategies — and choosing yours',
        minutes: 10,
        content: [
          { t: 'p', text: 'There are many ways to win in markets, but each demands a different temperament. The worst results come from mixing them mid-flight — buying like a growth investor, then panicking like a trader.' },
          { t: 'table', headers: ['Strategy', 'The bet', 'Best for'], rows: [
            ['Index investing', 'Own everything cheaply; compound the market\'s average return for decades', 'Everyone — the default core'],
            ['Value', 'Buy businesses below intrinsic value; profit when price catches up', 'Patient contrarians who love accounting'],
            ['Growth', 'Pay up for companies compounding revenue fast; profit from years of expansion', 'High volatility tolerance, long horizon'],
            ['Dividend / income', 'Own mature cash-cows; compound reinvested payouts', 'Income seekers, lower drama'],
            ['Momentum / trading', 'Ride trends with strict stops; many small trades', 'Serious time commitment and iron discipline'],
          ]},
          { t: 'h', text: 'Dollar-cost averaging (DCA)' },
          { t: 'p', text: 'Investing a fixed amount on a fixed schedule — say $200 every month — regardless of headlines. It automatically buys more shares when prices are low, removes the impossible task of timing, and, most importantly, removes *decisions* (which is where errors live).' },
          { t: 'h', text: 'Core and satellite: the sane hybrid' },
          { t: 'p', text: 'A widely recommended structure for engaged beginners: a boring, diversified **core** (60–90% in broad index funds, built by DCA) plus **satellites** — individual stock picks where you apply everything from the Fundamental and Technical modules. The core guarantees you capture market returns; the satellites are where you learn, with limited downside.' },
          { t: 'callout', title: 'Choose by temperament, not by returns', text: 'The best strategy on paper is worthless if you abandon it in the first crash. The strategy you can *stick with through a -30% year* is the right one for you.' },
        ],
      },
      {
        id: 'when-to-sell',
        title: 'The hardest skill: knowing when to sell',
        minutes: 8,
        content: [
          { t: 'p', text: 'Buying gets all the attention, but selling determines your results. The core problem: every sell decision is attacked by two biases at once — loss aversion (won\'t sell losers) and fear (sells winners on every dip).' },
          { t: 'h', text: 'Sell — regardless of your entry price — when:' },
          { t: 'ol', items: [
            '**The thesis broke.** You bought for growth and growth stopped; the moat cracked; management damaged trust. The original reason is gone → the position is gone.',
            '**Your stop hit.** Automatic. No debate. The debate happened when you placed it.',
            '**Valuation went vertical.** Price now assumes a future even the optimists don\'t forecast. Trimming (selling part) is a legitimate compromise.',
            '**Rebalancing.** A winner grew to 25% of your portfolio. Trimming it back to 10–15% is risk management, not disloyalty.',
            '**You found something clearly better.** Comparing every holding to alternatives is what "managing a portfolio" means.',
          ]},
          { t: 'h', text: 'Do NOT sell because:' },
          { t: 'ul', items: [
            'The price is down but the business is fine. Volatility is the admission fee, not a signal.',
            'You want to "get back to even" — anchoring in action.',
            'A headline scared you. Check whether it changes long-term earnings; usually it doesn\'t.',
          ]},
          { t: 'callout', title: 'Practical device', text: 'For every holding, keep one written sentence: "I own this because ___. I will sell if ___." When news hits, you check the sentence — not your pulse.' },
        ],
      },
      {
        id: 'your-plan',
        title: 'Write your Investment Policy Statement',
        minutes: 8,
        content: [
          { t: 'p', text: 'Professionals manage money against a written document called an **Investment Policy Statement (IPS)**. Yours can fit on one page — but writing it transforms vague intentions into checkable rules.' },
          { t: 'h', text: 'The one-page template' },
          { t: 'ol', items: [
            '**Goal & horizon** — "Grow $X for retirement in 25 years" / "House deposit in 7 years."',
            '**Contribution** — "I invest $___ automatically every month, regardless of headlines."',
            '**Allocation** — "__% broad index core, __% individual stocks, __% cash. Rebalance yearly."',
            '**Position limits** — "Max __% per stock, max __% per sector, risk ≤1–2% per new idea."',
            '**Buy rules** — "Only after the full checklist (Fundamentals module) and a written thesis sentence."',
            '**Sell rules** — "Stops honored always; thesis broken → sell; winner >__% of portfolio → trim."',
            '**Forbidden list** — "No margin. No penny stocks. No buying within 24h of first hearing an idea."',
          ]},
          { t: 'callout', title: 'The 24-hour rule', text: 'That last rule is quietly powerful: any idea that is truly good today will still be good tomorrow. A mandatory cooling-off period filters out nearly all hype-driven mistakes at zero cost.' },
          { t: 'p', text: 'Review the IPS twice a year — and after any big win or loss (both distort judgment). Change rules only in writing, only when calm, never mid-crisis. Your future self will thank you in the next bear market.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'Loss aversion typically causes investors to…',
        options: ['Sell losers quickly and let winners run', 'Sell winners too early and hold losers too long', 'Avoid the stock market entirely', 'Buy only index funds'],
        answer: 1,
        explain: 'Losses hurt ~2× more than gains feel good, so people "lock in" wins fast and refuse to realize losses — the exact opposite of optimal.',
      },
      {
        q: '"I paid $80 for it, so I\'ll wait until it\'s back at $80 to sell." This is…',
        options: ['Sound strategy', 'Anchoring bias — the market doesn\'t know your entry price', 'Dollar-cost averaging', 'A value trap'],
        answer: 1,
        explain: 'Your purchase price is irrelevant to the stock\'s future. The only question is whether it\'s worth holding at today\'s price.',
      },
      {
        q: 'Dollar-cost averaging means…',
        options: ['Buying more of a falling stock to lower your average', 'Investing a fixed amount on a fixed schedule regardless of price', 'Only buying stocks under $1', 'Averaging analyst price targets'],
        answer: 1,
        explain: 'DCA automates buying on a schedule, removing timing decisions — and with them, most emotional errors.',
      },
      {
        q: 'Your stock fell 15%, but earnings, margins, and the moat are all intact. The disciplined response is:',
        options: ['Sell immediately — down is down', 'Check your thesis sentence; if intact, volatility alone is not a sell reason', 'Move your stop away so it can\'t trigger', 'Post angrily online'],
        answer: 1,
        explain: 'Price volatility with an intact thesis is the admission fee of investing. Sell on broken theses, stops, extreme valuation, or rebalancing.',
      },
      {
        q: 'The "core and satellite" structure means…',
        options: ['Buying space companies', 'A diversified index core with a smaller sleeve of individual picks', 'One big position and many tiny ones', 'Trading around a single stock'],
        answer: 1,
        explain: 'The core captures market returns reliably; satellites are where you apply stock-picking skills with capped downside.',
      },
    ],
  },

  // ------------------------------------------------------------------
  {
    id: 'analyst',
    emoji: '💼',
    level: 'Advanced',
    title: 'Think Like a Business Analyst',
    description: 'Go beyond ratios: analyze business models, industries and moats like a professional, estimate what a company is actually worth, and write investment theses.',
    lessons: [
      {
        id: 'business-models',
        title: 'Business model analysis: how does it actually make money?',
        minutes: 10,
        content: [
          { t: 'p', text: 'Before any spreadsheet, an analyst answers one question in plain words: **who pays this company, for what, how often, and why?** If you can\'t answer it, no ratio will save you.' },
          { t: 'h', text: 'The revenue model spectrum' },
          { t: 'ul', items: [
            '**One-time sales** (homebuilders, hardware) — every quarter starts at zero. Cyclical, hard to predict.',
            '**Repeat purchases** (groceries, razors) — habitual demand. Stable but competitive.',
            '**Subscriptions** (software like CLDW, streaming like STRM) — recurring revenue you can forecast; churn is the number to watch.',
            '**Take-rate / platforms** (marketplaces, payment networks) — a % of everyone else\'s activity. Beautiful economics *if* the network holds.',
            '**Interest spread** (banks like BANQ) — borrow cheap, lend dear; profits track interest rates and credit losses.',
          ]},
          { t: 'h', text: 'Unit economics: the analyst\'s microscope' },
          { t: 'p', text: 'Zoom into one unit — one subscriber, one store, one delivery — and ask: what does it cost to acquire and serve, and what revenue does it bring over its lifetime? Two terms worth knowing:' },
          { t: 'ul', items: [
            '**CAC** — customer acquisition cost (marketing spend ÷ new customers).',
            '**LTV** — lifetime value (profit a customer generates before leaving). Healthy businesses run LTV ≥ 3× CAC. A company scaling with LTV < CAC is burning the furniture to heat the house — growth makes it *worse*.',
          ]},
          { t: 'example', title: 'Try it', text: 'Take three companies from the Market page and classify their revenue model in one sentence each. VOLT (one-time vehicle sales, not yet profitable) vs. CLDW (recurring subscriptions, 25% FCF margin) is exactly the contrast this lens is built to expose.' },
        ],
      },
      {
        id: 'industry-analysis',
        title: 'Industry analysis: Five Forces and SWOT, minus the jargon',
        minutes: 10,
        content: [
          { t: 'p', text: 'A mediocre company in a wonderful industry often beats a brilliant company in a brutal one. Michael Porter\'s **Five Forces** is the standard tool for judging how brutal an industry is — here in plain English:' },
          { t: 'ol', items: [
            '**Competition intensity** — how bloody is the fight? Airlines: brutal price wars, identical product. Railroads: two players per route, rational pricing.',
            '**Threat of new entrants** — how easy is it to start a rival? A restaurant: one loan. A chip fab: $20 billion and a decade.',
            '**Supplier power** — can suppliers squeeze margins? If one company controls a key input, its customers\' profits are hostages.',
            '**Buyer power** — can customers demand discounts? Selling to three giant retailers = weak position; selling to millions of individuals = strong.',
            '**Substitutes** — can the need be met a completely different way? Streaming didn\'t out-compete DVDs; it made them irrelevant.',
          ]},
          { t: 'p', text: 'Score each force for an industry and you\'ll understand *why* software gross margins run at 80% while grocery margins run at 25% — before reading a single annual report.' },
          { t: 'h', text: 'SWOT: the one-company snapshot' },
          { t: 'p', text: 'For a specific company, a quick 2×2: **S**trengths and **W**eaknesses (internal, true today) vs. **O**pportunities and **T**hreats (external, about tomorrow). Its power is honesty — force yourself to fill all four boxes, especially W and T for companies you *like*.' },
          { t: 'example', title: 'Worked mini-SWOT: SOLR (Solaris Energy)', text: 'S: scale in a growing market. W: 8% margins, policy-dependent demand. O: energy transition tailwind for a decade. T: cheap imported panels, subsidy cuts, interest-rate-sensitive project financing. → A real thesis must argue why S+O outweigh W+T at today\'s price.' },
        ],
      },
      {
        id: 'moats-deep',
        title: 'Moats, deeply: durability is the product',
        minutes: 9,
        content: [
          { t: 'p', text: 'The Fundamentals module introduced moats; an analyst goes further and asks **how wide** and **how durable**. The market\'s biggest valuation mistakes are moat mistakes — paying a fortress price for a sandcastle, or a sandcastle price for a fortress.' },
          { t: 'h', text: 'Testing moat claims with evidence' },
          { t: 'ul', items: [
            '**Pricing power test** — has the company raised prices above inflation without losing customers? (Check revenue growth vs. volume growth.) That is a moat *speaking*.',
            '**Margin stability test** — gross margins stable or rising through a recession = structural advantage. Margins that collapse when demand dips = commodity in disguise.',
            '**Returns test** — ROE / return on capital persistently above ~15% for a decade attracts competitors; if it *stays* high anyway, something is defending it.',
            '**Churn test** (subscription businesses) — customers who don\'t leave are the moat, measurable directly.',
          ]},
          { t: 'h', text: 'Moats erode — watch the edges' },
          { t: 'p', text: 'Technology shifts dissolve switching costs (the cloud did this to on-premise software vendors). Brands age with their customers. Patents expire on a known date. Regulators break up network effects. An analyst re-examines the moat *every year*, and the moment the erosion story is clearer than the durability story, the thesis is broken — see the sell rules.' },
          { t: 'callout', title: 'Buffett\'s framing', text: '"In business, I look for economic castles protected by unbreachable moats." The castle is current profits; the moat is why they will still exist in ten years. Valuation (next lesson) is pricing the castle; moat analysis is deciding whether it will still be standing.' },
        ],
      },
      {
        id: 'intrinsic-value',
        title: 'Intrinsic value: what is a business actually worth?',
        minutes: 11,
        content: [
          { t: 'p', text: 'A share is worth the **present value of all the cash the business will generate for its owners** — discounted, because a dollar in 2035 is worth less than a dollar today. This idea (Discounted Cash Flow, **DCF**) underlies all serious valuation.' },
          { t: 'h', text: 'DCF in four steps (simplified)' },
          { t: 'ol', items: [
            'Start with current **free cash flow per share**.',
            'Project growth — e.g. 12%/year for 5 years, then 4% forever ("terminal growth"). Be conservative; heroic assumptions are where DCFs go to lie.',
            'Discount every future year back at your **required return** (the "discount rate," often 8–12% for stocks — higher for riskier businesses).',
            'Sum it all → **intrinsic value per share**. Compare with today\'s price.',
          ]},
          { t: 'example', title: 'The intuition without the spreadsheet', text: 'A stock earning $5/share of FCF, growing 10% for 5 years then 4% forever, discounted at 10%, is worth roughly $95–105. If it trades at $60, you have a bargain *if your assumptions hold*. At $150, the market believes something much rosier than you do — one of you is wrong.' },
          { t: 'h', text: 'Margin of safety: the professional habit' },
          { t: 'p', text: 'Your estimate WILL be off — inputs are guesses about the future. The defense is to buy only when price sits **25–40% below** your estimate. The gap absorbs your errors. If value ≈ $100, a purchase at $65 can survive being 20% too optimistic; a purchase at $95 cannot survive anything.' },
          { t: 'callout', title: 'Tools page', text: 'The Intrinsic Value calculator in Tools runs this exact simplified DCF — change growth and discount assumptions and watch how violently the "fair price" swings. That sensitivity is the real lesson: valuation is a range, never a number.' },
        ],
      },
      {
        id: 'investment-thesis',
        title: 'The deliverable: writing an investment thesis',
        minutes: 9,
        content: [
          { t: 'p', text: 'Everything converges here. A professional analyst\'s output is not a feeling — it is a short written document another person could challenge. Writing it exposes fuzzy thinking instantly.' },
          { t: 'h', text: 'The one-page thesis template' },
          { t: 'ol', items: [
            '**The business in two sentences.** Who pays, for what, why they stay. (Business model lesson.)',
            '**Why it wins.** The specific moat, with the evidence — pricing power, margin stability, churn. (Moat lesson.)',
            '**The industry weather.** Five Forces summary: is this a good neighborhood? (Industry lesson.)',
            '**The numbers.** Growth, margins, debt, cash generation — 3-year trend, vs. peers. (Fundamentals module.)',
            '**Valuation.** Your intrinsic value range, your margin of safety at today\'s price. (Previous lesson.)',
            '**The bear case — written honestly.** The 2–3 strongest arguments *against*. If you can\'t state them well, you haven\'t researched enough.',
            '**Kill criteria.** "I sell if ___" — measurable events, decided now, while calm.',
            '**Timing note.** Trend and entry zone from the Technical module: even a great thesis prefers not to buy a falling knife.',
          ]},
          { t: 'callout', title: 'The Feynman filter', text: 'Explain the thesis out loud to someone smart who knows nothing about stocks. Everywhere you reach for jargon is a place you don\'t understand yet.' },
          { t: 'p', text: '**Your graduation exercise:** pick any company in the simulator, write the full one-pager, then take the position with proper sizing (Risk module) and manage it by your own kill criteria. Review the thesis every month against new data. Do this ten times in the simulator and you will have built — deliberately — the complete skill loop of a working analyst: research → thesis → position → review → learn.' },
        ],
      },
    ],
    quiz: [
      {
        q: 'A software company\'s LTV is $300 and its CAC is $400. Scaling up marketing will…',
        options: ['Fix the problem automatically', 'Make losses bigger — each new customer destroys value', 'Double the moat', 'Raise the P/E'],
        answer: 1,
        explain: 'When acquiring a customer costs more than their lifetime value, growth accelerates the losses. LTV must comfortably exceed CAC first.',
      },
      {
        q: 'Which industry trait predicts chronically LOW profitability under Five Forces?',
        options: ['High barriers to entry', 'An identical product sold in constant price wars', 'Strong switching costs', 'Millions of small customers'],
        answer: 1,
        explain: 'Commodity products plus intense rivalry (think airlines) crush margins. The other three options all protect profitability.',
      },
      {
        q: 'The strongest EVIDENCE of a real moat is…',
        options: ['A famous brand logo', 'Management saying "our moat is wide"', 'Raising prices above inflation for years without losing customers', 'A high stock price'],
        answer: 2,
        explain: 'Pricing power that customers accept is a moat demonstrating itself. Claims and logos are hypotheses; retained customers at higher prices are proof.',
      },
      {
        q: 'Your DCF says a stock is worth ~$100. Margin-of-safety discipline means buying at…',
        options: ['$100 — fair is fair', '$95', 'Around $60–75, so your estimate can be wrong and you still do fine', 'Any price, if the moat is good'],
        answer: 2,
        explain: 'Valuations are ranges built on guesses. Buying 25–40% below your estimate absorbs estimation error — the professional habit.',
      },
      {
        q: 'Why does a written thesis include a "bear case" and "kill criteria"?',
        options: ['Regulators require it', 'To fight confirmation bias and pre-decide the exit while calm', 'To impress other investors', 'Because bull cases are illegal'],
        answer: 1,
        explain: 'Writing the strongest case against you counters confirmation bias; kill criteria move the sell decision from the emotional moment to the calm one.',
      },
    ],
  },
]

export function moduleProgress(mod, completedLessons) {
  const done = mod.lessons.filter((l) => completedLessons[l.id]).length
  return { done, total: mod.lessons.length, pct: Math.round((done / mod.lessons.length) * 100) }
}

export function findLesson(moduleId, lessonId) {
  const mod = MODULES.find((m) => m.id === moduleId)
  if (!mod) return {}
  const idx = mod.lessons.findIndex((l) => l.id === lessonId)
  return { mod, lesson: mod.lessons[idx], idx }
}
