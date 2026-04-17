# 📈 Stock Portfolio Tracker

A personal, editable portfolio dashboard hosted on GitHub Pages with automatic daily price updates.

**Live site:** https://sameeksha-mehrotra.github.io/stock-portfolio/

---

## Features

- **Daily price updates** — GitHub Actions fetches closing prices via `yfinance` every weekday at 5:35 PM ET and commits updated `data/prices.json` automatically
- **Editable positions** — Buy, sell, add, or remove any stock or ETF directly in the browser
- **Cash management** — Deposit or withdraw cash, tracked in your portfolio value
- **Transaction log** — Every buy/sell recorded with date, price, and notes; exportable as CSV
- **Allocation chart** — Interactive donut chart showing portfolio breakdown by position
- **Persistent state** — Portfolio holdings saved in browser `localStorage` between visits
- **Responsive** — Works on desktop and mobile

---

## Quick Start (deploy your own copy)

### 1. Create a GitHub repo

```bash
# In your terminal, from this folder:
git init
git add .
git commit -m "Initial portfolio tracker"
gh repo create stock-portfolio --public --source=. --push
```

### 2. Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` · Folder: `/ (root)`
4. Click **Save** — your site will be live at `https://sameeksha-mehrotra.github.io/stock-portfolio/`

### 3. That's it!

The GitHub Action (`update-prices.yml`) runs automatically at market close every weekday.
You can also trigger it manually: **Actions → Update Stock Prices → Run workflow**.

---

## Adding a new stock

1. Open the site → click **Add Stock**
2. Fill in the ticker, name, type, shares, and average cost
3. To enable daily price updates for the new ticker, **also update `data/portfolio.json`** in the repo:
   ```json
   { "ticker": "AAPL", "name": "Apple Inc.", "type": "Stock", "shares": 10, "avgCost": 185.00 }
   ```
   Add it to the `holdings` array, then commit and push.

---

## File structure

```
stock-portfolio/
├── index.html                    # Main portfolio page
├── styles.css                    # Styles (matches sameeksha-mehrotra.github.io)
├── app.js                        # Portfolio logic (buy/sell, charts, localStorage)
├── data/
│   ├── prices.json               # Updated daily by GitHub Actions
│   └── portfolio.json            # Source-of-truth ticker list for the Action
├── scripts/
│   └── fetch_prices.py           # Python script run by the Action
└── .github/workflows/
    └── update-prices.yml         # Scheduled workflow (weekdays 5:35 PM ET)
```

---

## How prices update

1. GitHub Actions runs `scripts/fetch_prices.py` at 9:35 PM UTC (5:35 PM ET) Mon–Fri
2. The script reads tickers from `data/portfolio.json`, fetches closing prices via `yfinance` (free, no API key needed)
3. It writes `data/prices.json` and commits the change
4. Your site fetches this file on load — always showing the latest closing prices

You can also click **↺** in the nav bar to re-fetch `prices.json` without reloading the page.

---

## Data privacy

All portfolio holdings (shares, cost basis) are stored in your **browser's localStorage** only — they never leave your device. The GitHub repo only contains the ticker list in `portfolio.json`, not your share counts or cost basis.
