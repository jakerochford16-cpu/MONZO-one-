"""Index and currency snapshot - the stats line of the brief."""

import sys
import requests

UA = {"User-Agent": "Mozilla/5.0 (portfolio-brief)"}

BENCHMARKS = [
    ("American Companies (S&amp;P 500)", "^GSPC", "{:,.0f}"),
    ("Tech Focused (Nasdaq)",           "^IXIC", "{:,.0f}"),
    ("Gold (spot)",                     "GC=F",  "${:,.0f}"),
    ("FTSE 100",                        "^FTSE", "{:,.0f}"),
    ("Bitcoin",                         "BTC-USD", "${:,.0f}"),
    ("GBP/USD",                         "GBPUSD=X", "{:.3f}"),
]


def quote(ticker):
    """(last, day % change) or (None, None)."""
    try:
        r = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
            params={"range": "5d", "interval": "1d"}, headers=UA, timeout=15)
        r.raise_for_status()
        res = r.json()["chart"]["result"][0]
        closes = [c for c in res["indicators"]["quote"][0]["close"] if c]
        if len(closes) >= 2:
            return closes[-1], (closes[-1] / closes[-2] - 1) * 100
        if closes:
            return closes[-1], None
    except Exception as e:
        print(f"  quote {ticker}: {e}", file=sys.stderr)
    return None, None


def render():
    lines = []
    for label, ticker, fmt in BENCHMARKS:
        last, chg = quote(ticker)
        if last is None:
            continue
        move = ""
        if chg is not None:
            move = f"  {'▲' if chg >= 0 else '▼'}{abs(chg):.2f}%"
        lines.append(f"{label}  {fmt.format(last)}{move}")
    return lines


def movers(tickers, top=3):
    """Best and worst performers among your own holdings today."""
    scored = []
    for t in tickers:
        _, chg = quote(t)
        if chg is not None:
            scored.append((t, chg))
    scored.sort(key=lambda x: -x[1])
    return scored[:top], scored[-top:][::-1]
