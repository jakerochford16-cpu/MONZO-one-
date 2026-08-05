"""
Pot-value estimator.

Monzo's API doesn't expose investment pots, so this can't read your real
balances. Instead it takes a baseline (what the app showed on a given day)
and tracks the underlying ETF prices from there.

Currency matters: CSPX and CNDX trade in USD on the LSE, your pot is in
GBP. A 1% USD gain with a 1% weaker pound is roughly flat to you. So each
price is converted to GBP before comparing.
"""

import html
import sys
from datetime import date, datetime

import requests

UA = {"User-Agent": "Mozilla/5.0 (portfolio-digest)"}

# (pot name, yahoo ticker, baseline £ value, baseline date)
# Baseline taken from the Monzo app on 05 Aug 2026.
POTS = [
    ("Automation & Robotics", "RBOT.L",  1250.00),
    ("Tech Focused",          "CNDX.L",  1250.00),
    ("American Companies",    "CSPX.L",  1021.48),
    ("Gold",                  "SGLN.L",   900.00),
    ("Blockchain Creators",   "BLKC.L",   723.50),
    ("Balanced",              None,       847.03),  # OEIC, no live price
]
BASELINE_DATE = "2026-08-05"


def fetch_series(ticker, rng="1y"):
    """Returns (list of (date, close), currency) or (None, None)."""
    try:
        r = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
            params={"range": rng, "interval": "1d"}, headers=UA, timeout=20)
        r.raise_for_status()
        res = r.json()["chart"]["result"][0]
        stamps = res["timestamp"]
        raw = res["indicators"]["quote"][0]["close"]
        series = [(datetime.utcfromtimestamp(t).date(), c)
                  for t, c in zip(stamps, raw) if c]
        return series, res["meta"].get("currency", "USD")
    except Exception as e:
        print(f"  price {ticker}: {e}", file=sys.stderr)
        return None, None


def price_on(series, target):
    """Close on the baseline date, or the nearest trading day before it."""
    before = [c for d, c in series if d <= target]
    return before[-1] if before else series[0][1]


def to_gbp(price, currency, fx_cache):
    """Convert a quoted price into GBP."""
    if currency == "GBP":
        return price
    if currency == "GBp":              # LSE quotes many lines in pence
        return price / 100.0
    pair = f"GBP{currency}=X"
    if pair not in fx_cache:
        s, _ = fetch_series(pair, "1y")
        fx_cache[pair] = s[-1][1] if s else None
    rate = fx_cache[pair]
    return price / rate if rate else None


def snapshot():
    """Estimated current value of each pot, plus movement."""
    fx = {}
    rows, missing = [], []

    for name, ticker, baseline in POTS:
        if ticker is None:
            rows.append({"name": name, "value": baseline, "pct": None,
                         "day": None, "estimated": False})
            continue

        series, cur = fetch_series(ticker)
        if not series or len(series) < 2:
            missing.append(name)
            rows.append({"name": name, "value": baseline, "pct": None,
                         "day": None, "estimated": False})
            continue

        base_date = date.fromisoformat(BASELINE_DATE)
        now = to_gbp(series[-1][1], cur, fx)
        then = to_gbp(price_on(series, base_date), cur, fx)
        prev = to_gbp(series[-2][1], cur, fx)
        if not now or not then:
            missing.append(name)
            rows.append({"name": name, "value": baseline, "pct": None,
                         "day": None, "estimated": False})
            continue

        rows.append({
            "name": name,
            "value": baseline * (now / then),
            "pct": (now / then - 1) * 100,
            "day": (now / prev - 1) * 100,
            "estimated": True,
        })

    return rows, missing


def render():
    rows, missing = snapshot()
    total = sum(r["value"] for r in rows)
    invested = sum(p[2] for p in POTS)
    delta = total - invested

    lines = [f"Total: <b>£{total:,.2f}</b>  "
             f"({'+' if delta >= 0 else ''}£{delta:,.2f}, "
             f"{delta / invested * 100:+.2f}% vs {BASELINE_DATE})", ""]

    ordered = sorted(rows, key=lambda x: -(x["pct"] if x["pct"] is not None else -999))
    name_w = max(len(r["name"]) for r in ordered)
    value_w = max(len(f"£{r['value']:,.2f}") for r in ordered)

    table = ["<pre>"]
    for r in ordered:
        value_s = f"£{r['value']:,.2f}"
        pct_s = f"{r['pct']:+.2f}%" if r["pct"] is not None else "not tracked"
        table.append(html.escape(
            f"{r['name'].ljust(name_w)}  {value_s.rjust(value_w)}  {pct_s.rjust(12)}"))
    table.append("</pre>")
    lines += table

    tracked = [r for r in rows if r["pct"] is not None]
    if tracked:
        best = max(tracked, key=lambda x: x["pct"])
        worst = min(tracked, key=lambda x: x["pct"])
        lines += ["", f"Best: <b>{html.escape(best['name'])}</b> {best['pct']:+.2f}%   "
                  f"Worst: {html.escape(worst['name'])} {worst['pct']:+.2f}%"]

    lines += ["", "<i>Estimated from ETF prices — Monzo's app shows the "
              "real figure.</i>"]
    if missing:
        lines.append(f"<i>No price data: {', '.join(missing)}</i>")
    return "\n".join(lines)


if __name__ == "__main__":
    print(render())
