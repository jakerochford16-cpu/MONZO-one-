"""
Pot-value estimator.

Monzo's API doesn't expose investment pots, so this can't read your real
balances. Instead it takes a baseline (what the app showed on a given day)
and tracks the underlying ETF prices from there.

Currency matters: CSPX and CNDX trade in USD on the LSE, your pot is in
GBP. A 1% USD gain with a 1% weaker pound is roughly flat to you. So each
price is converted to GBP before comparing.
"""

import sys
from datetime import datetime

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


def fetch_series(ticker, rng="6mo"):
    """Returns (list of closes, currency) or (None, None)."""
    try:
        r = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
            params={"range": rng, "interval": "1d"}, headers=UA, timeout=20)
        r.raise_for_status()
        res = r.json()["chart"]["result"][0]
        closes = [c for c in res["indicators"]["quote"][0]["close"] if c]
        cur = res["meta"].get("currency", "USD")
        return closes, cur
    except Exception as e:
        print(f"  price {ticker}: {e}", file=sys.stderr)
        return None, None


def to_gbp(price, currency, fx_cache):
    """Convert a quoted price into GBP."""
    if currency == "GBP":
        return price
    if currency == "GBp":              # LSE quotes many lines in pence
        return price / 100.0
    pair = f"GBP{currency}=X"
    if pair not in fx_cache:
        closes, _ = fetch_series(pair, "5d")
        fx_cache[pair] = closes[-1] if closes else None
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

        closes, cur = fetch_series(ticker)
        if not closes or len(closes) < 2:
            missing.append(name)
            rows.append({"name": name, "value": baseline, "pct": None,
                         "day": None, "estimated": False})
            continue

        now = to_gbp(closes[-1], cur, fx)
        then = to_gbp(closes[0], cur, fx)
        prev = to_gbp(closes[-2], cur, fx)
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

    lines = [f"<b>Pots — {datetime.now().strftime('%a %d %b')}</b>", ""]
    lines.append(f"Estimated total: <b>£{total:,.2f}</b>")
    delta = total - invested
    lines.append(f"vs {BASELINE_DATE} baseline: "
                 f"{'+' if delta >= 0 else ''}£{delta:,.2f} "
                 f"({delta / invested * 100:+.2f}%)")
    lines.append("")

    tracked = [r for r in rows if r["pct"] is not None]
    for r in sorted(rows, key=lambda x: -(x["pct"] if x["pct"] is not None else -999)):
        if r["pct"] is None:
            lines.append(f"{r['name']}: £{r['value']:,.2f}  <i>(not tracked)</i>")
        else:
            arrow = "▲" if r["pct"] >= 0 else "▼"
            lines.append(f"{r['name']}: £{r['value']:,.2f}  "
                         f"{arrow} {r['pct']:+.2f}%")

    if tracked:
        best = max(tracked, key=lambda x: x["pct"])
        worst = min(tracked, key=lambda x: x["pct"])
        lines += ["", f"Best: <b>{best['name']}</b> {best['pct']:+.2f}%",
                  f"Worst: {worst['name']} {worst['pct']:+.2f}%"]

    lines += ["", "<i>Estimated from ETF prices — Monzo's app is the "
              "real figure.</i>"]
    if missing:
        lines.append(f"<i>No price data: {', '.join(missing)}</i>")
    return "\n".join(lines)


if __name__ == "__main__":
    print(render())
