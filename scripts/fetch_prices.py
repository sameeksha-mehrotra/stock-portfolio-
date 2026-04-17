#!/usr/bin/env python3
"""
Fetches daily closing prices for all tickers in portfolio.json
and writes updated data/prices.json.

Run via GitHub Actions on weekdays at market close.
"""
import json
import sys
from datetime import datetime, timezone

try:
    import yfinance as yf
except ImportError:
    print("Installing yfinance...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yfinance"])
    import yfinance as yf


def fetch_prices(tickers: list[str]) -> dict:
    prices = {}
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="5d")

            if hist.empty:
                print(f"  [{ticker}] No history returned — skipping")
                continue

            current = float(hist["Close"].iloc[-1])
            prev = float(hist["Close"].iloc[-2]) if len(hist) >= 2 else current
            change = current - prev
            change_pct = change / prev if prev > 0 else 0.0

            info = stock.fast_info
            high52 = round(float(getattr(info, "year_high", 0) or 0), 2)
            low52  = round(float(getattr(info, "year_low",  0) or 0), 2)

            prices[ticker] = {
                "price":     round(current,    2),
                "change":    round(change,     2),
                "changePct": round(change_pct, 6),
                "high52":    high52,
                "low52":     low52,
            }
            arrow = "▲" if change >= 0 else "▼"
            print(f"  [{ticker}] ${current:.2f}  {arrow} {change:+.2f} ({change_pct*100:+.2f}%)")

        except Exception as exc:
            print(f"  [{ticker}] ERROR: {exc}")

    return prices


def main():
    # Read tickers from portfolio.json
    with open("data/portfolio.json", "r") as f:
        portfolio = json.load(f)

    tickers = [h["ticker"] for h in portfolio.get("holdings", [])]
    if not tickers:
        print("No tickers found in data/portfolio.json — nothing to do.")
        return

    print(f"Fetching prices for: {', '.join(tickers)}\n")
    prices = fetch_prices(tickers)

    output = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "prices": prices,
    }

    with open("data/prices.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone — updated {len(prices)}/{len(tickers)} tickers.")
    if len(prices) < len(tickers):
        missing = set(tickers) - set(prices.keys())
        print(f"Missing: {', '.join(missing)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
