#!/usr/bin/env python3
"""
Portfolio digest -> Telegram.  Single file, one dependency (requests).

Your holdings are baked into WATCHLIST below, already de-duplicated across
your S&P 500, Nasdaq 100 and Automation & Robotics funds. Weights are the
% of your WHOLE pot, so a name in two funds shows its combined exposure.

Env vars needed:  TELEGRAM_TOKEN, TELEGRAM_CHAT_ID
Run:              python digest.py           (send)
                  python digest.py --dry-run (print only)
"""

import argparse
import html
import json
import os
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

import pots

# --- your portfolio ------------------------------------------------------
# (symbol, name, % of your total pot, which funds it comes from)
# To re-weight: change the numbers. To drop a name: delete the line.
WATCHLIST = [
    ('NVDA', 'Nvidia Corp', 4.12, 'S&P500+Nasdaq+Robotics+Blockchain'),
    ('AAPL', 'Apple Inc', 2.67, 'S&P500+Nasdaq'),
    ('MSFT', 'Microsoft Corp', 2.17, 'S&P500+Nasdaq'),
    ('AMD', 'Advanced Micro Devices Inc', 2.1, 'S&P500+Nasdaq+Robotics+Blockchain'),
    ('AMZN', 'Amazon.Com Inc', 1.76, 'S&P500+Nasdaq'),
    ('COIN', 'Coinbase Global Inc Class A', 1.53, 'S&P500+Blockchain'),
    ('GOOGL', 'Alphabet Inc Class A', 1.31, 'S&P500+Nasdaq'),
    ('GOOG', 'Alphabet Inc Class C', 1.15, 'S&P500+Nasdaq'),
    ('MU', 'Micron Technology Inc', 1.12, 'S&P500+Nasdaq'),
    ('AVGO', 'Broadcom Inc', 1.12, 'S&P500+Nasdaq'),
    ('INTC', 'Intel Corporation', 1.04, 'S&P500+Nasdaq+Robotics'),
    ('META', 'Meta Platforms Inc Class A', 0.93, 'S&P500+Nasdaq'),
    ('IREN', 'Iren Ltd', 0.88, 'Blockchain'),
    ('KLAC', 'Kla Corp', 0.79, 'S&P500+Nasdaq+Robotics'),
    ('TSLA', 'Tesla Inc', 0.78, 'S&P500+Nasdaq'),
    ('HUT', 'Hut Corp', 0.78, 'Blockchain'),
    ('CRCL', 'Circle Internet Group Inc Class A', 0.77, 'Blockchain'),
    ('SNOW', 'Snowflake Inc', 0.76, 'Robotics'),
    ('MA', 'Mastercard Inc Class A', 0.73, 'S&P500+Blockchain'),
    ('6857.T', 'Advantest', 0.73, 'Robotics'),
    ('ISRG', 'Intuitive Surgical Inc', 0.68, 'S&P500+Nasdaq+Robotics'),
    ('BMNR', 'Bitmine Immersion Technologies Inc', 0.67, 'Blockchain'),
    ('EMR', 'Emerson Electric', 0.67, 'S&P500+Robotics'),
    ('NOW', 'Servicenow Inc', 0.66, 'S&P500+Robotics'),
]

# Gold has no companies inside it - it's bullion. Price only.
COMMODITIES = [('SGLN.L', 'Gold')]

MAX_HEADLINES = 2      # per company
LOOKBACK_DAYS = 1
SEEN_FILE = Path(__file__).parent / "seen.json"
SEEN_KEEP = 600

TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
UA = {"User-Agent": "Mozilla/5.0 (portfolio-digest)"}


def load_seen():
    try:
        return json.loads(SEEN_FILE.read_text())
    except Exception:
        return []


def save_seen(seen):
    SEEN_FILE.write_text(json.dumps(seen[-SEEN_KEEP:]))


def get_news(symbol):
    """Yahoo Finance RSS. No API key, no quota, no signup."""
    try:
        r = requests.get("https://feeds.finance.yahoo.com/rss/2.0/headline",
                         params={"s": symbol, "region": "US", "lang": "en-US"},
                         headers=UA, timeout=15)
        r.raise_for_status()
        root = ET.fromstring(r.content)
    except Exception as e:
        print(f"  news {symbol}: {e}", file=sys.stderr)
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)
    out = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        if not title or not link:
            continue
        ts = datetime.now(timezone.utc)
        pub = item.findtext("pubDate")
        if pub:
            try:
                ts = datetime.strptime(pub.strip(), "%a, %d %b %Y %H:%M:%S %z")
            except ValueError:
                pass
        if ts >= cutoff:
            out.append({"title": title, "url": link})
    return out


def get_change(symbol):
    """Daily % move from Yahoo's public chart endpoint."""
    try:
        r = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}",
            params={"range": "5d", "interval": "1d"}, headers=UA, timeout=15)
        r.raise_for_status()
        res = r.json()["chart"]["result"][0]
        closes = [c for c in res["indicators"]["quote"][0]["close"] if c]
        if len(closes) >= 2:
            return (closes[-1] / closes[-2] - 1) * 100
    except Exception:
        pass
    return None


def esc(s):
    return html.escape(s, quote=False)


def split_message(text, limit=3500):
    """
    Split on line boundaries, never mid-tag. Chopping through an <a href="...">
    produces malformed HTML and Telegram rejects the whole message.
    """
    chunks, current = [], ""
    for line in text.split("\n"):
        if len(current) + len(line) + 1 > limit and current:
            chunks.append(current.rstrip())
            current = ""
        current += line + "\n"
    if current.strip():
        chunks.append(current.rstrip())
    return chunks or [text]


def send(text):
    if not TOKEN or not CHAT_ID:
        sys.exit("TELEGRAM_TOKEN / TELEGRAM_CHAT_ID not set")

    failures = []
    for chunk in split_message(text):
        r = requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage",
                          json={"chat_id": CHAT_ID, "text": chunk,
                                "parse_mode": "HTML",
                                "disable_web_page_preview": True}, timeout=20)
        if not r.ok:
            print(f"TELEGRAM ERROR {r.status_code}: {r.text}", file=sys.stderr)
            failures.append(r.text)
        time.sleep(0.5)

    # Fail loudly. A green tick with no message is worse than a red X.
    if failures:
        sys.exit(f"{len(failures)} chunk(s) failed to send")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    seen = load_seen()
    seen_set = set(seen)
    lines = [f"<b>Portfolio — {datetime.now().strftime('%a %d %b')}</b>", ""]
    found = 0

    for symbol, name, weight, funds in WATCHLIST:
        fresh = []
        for a in get_news(symbol):
            key = a["title"].lower().strip()[:120]
            if key not in seen_set:
                fresh.append(a)
                seen_set.add(key)
                seen.append(key)
            if len(fresh) >= MAX_HEADLINES:
                break
        if not fresh:
            continue

        chg = get_change(symbol)
        move = ""
        if chg is not None:
            move = f"  {'▲' if chg >= 0 else '▼'} {abs(chg):.1f}%"

        lines.append(f"<b>{esc(symbol)}</b> · {weight}% of pot{move}")
        lines.append(f"<i>{esc(funds)}</i>")
        for a in fresh:
            lines.append(f"• <a href=\"{esc(a['url'])}\">{esc(a['title'][:110])}</a>")
        lines.append("")
        found += 1
        time.sleep(0.3)

    for symbol, label in COMMODITIES:
        chg = get_change(symbol)
        if chg is not None:
            lines.append(f"<b>{label}</b>  {'▲' if chg >= 0 else '▼'} {abs(chg):.1f}%")

    if found == 0:
        lines.append("<i>Nothing new since the last run.</i>")

    try:
        text = pots.render() + "\n\n" + "\n".join(lines)
    except Exception as e:
        print(f"pots section failed: {e}", file=sys.stderr)
        text = "\n".join(lines)
    if args.dry_run:
        print(text)
    else:
        send(text)
        save_seen(seen)
        print(f"sent ({found} companies)", file=sys.stderr)


if __name__ == "__main__":
    main()
