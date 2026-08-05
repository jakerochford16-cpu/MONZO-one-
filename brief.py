#!/usr/bin/env python3
"""
Portfolio brief -> Telegram.

Sections:
  1. Portfolio value and movement
  2. Your best and worst performers today
  3. Market benchmarks
  4. News on companies you hold
  5. AI & robotics
  6. World and business

Env: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID
Run: python brief.py            send
     python brief.py --dry-run  print only
"""

import argparse
import html
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

import analysis
import feeds
import markets
import pots

# Companies you hold, deduplicated across all five funds.
# (symbol, name, % of your total pot)
HOLDINGS = [
    ('NVDA', 'Nvidia', 4.12), ('AAPL', 'Apple', 2.67),
    ('MSFT', 'Microsoft', 2.17), ('AMD', 'AMD', 2.10),
    ('AMZN', 'Amazon', 1.76), ('COIN', 'Coinbase', 1.53),
    ('GOOGL', 'Alphabet', 1.31), ('MU', 'Micron', 1.12),
    ('AVGO', 'Broadcom', 1.12), ('INTC', 'Intel', 1.04),
    ('META', 'Meta', 0.93), ('IREN', 'IREN', 0.88),
    ('KLAC', 'KLA', 0.79), ('TSLA', 'Tesla', 0.78),
    ('HUT', 'Hut 8', 0.78), ('CRCL', 'Circle', 0.77),
    ('SNOW', 'Snowflake', 0.76), ('MA', 'Mastercard', 0.73),
    ('ISRG', 'Intuitive Surgical', 0.68), ('EMR', 'Emerson', 0.67),
]

MAX_COMPANY_NEWS = 5
SEEN_FILE = Path(__file__).parent / "seen.json"
SEEN_KEEP = 800
UK = ZoneInfo("Europe/London")

TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
UA = {"User-Agent": "Mozilla/5.0 (portfolio-brief)"}

RULE = "──────────────"


def esc(s):
    return html.escape(str(s), quote=False)


def head(label):
    return f"▎<b>{label}</b>"


def load_seen():
    try:
        return json.loads(SEEN_FILE.read_text())
    except Exception:
        return []


def save_seen(seen):
    SEEN_FILE.write_text(json.dumps(seen[-SEEN_KEEP:]))


def company_news(symbol, name):
    """Yahoo per-ticker RSS, headline only."""
    import xml.etree.ElementTree as ET
    try:
        r = requests.get("https://feeds.finance.yahoo.com/rss/2.0/headline",
                         params={"s": symbol, "region": "US", "lang": "en-US"},
                         headers=UA, timeout=15)
        r.raise_for_status()
        root = ET.fromstring(r.content)
    except Exception:
        return []
    return [{"title": (i.findtext("title") or "").strip(), "company": name}
            for i in root.iter("item") if i.findtext("title")]


def build(seen_set, seen_list):
    now = datetime.now(UK)
    L = ["<b>MONZO PORTFOLIO BRIEF</b>",
         f"<i>{now.strftime('%A %d %B %Y · %H:%M')} UK</i>", ""]

    # 1. Portfolio ---------------------------------------------------------
    L.append(head("PORTFOLIO POTS"))
    try:
        L.append(pots.render())
    except Exception as e:
        print(f"pots: {e}", file=sys.stderr)
        L.append("<i>Portfolio values unavailable.</i>")
    L += ["", RULE, ""]

    # 2. Your movers -------------------------------------------------------
    names = {s: n for s, n, _ in HOLDINGS}
    try:
        best, worst = markets.movers([s for s, _, _ in HOLDINGS], top=3)
        if best:
            L.append(head("YOUR MOVERS TODAY"))
            combined = [(t, c, "▲") for t, c in best] + [(t, c, "▼") for t, c in worst]
            name_w = max(len(names.get(t, t)) for t, _, _ in combined)
            table = ["<pre>"]
            for t, c, arrow in combined:
                label = names.get(t, t)
                table.append(html.escape(f"{arrow} {label.ljust(name_w)}  {c:+.2f}%"))
            table.append("</pre>")
            L += table
            L += ["", RULE, ""]
    except Exception as e:
        print(f"movers: {e}", file=sys.stderr)

    # 3. Benchmarks --------------------------------------------------------
    try:
        rows = markets.render()
        if rows:
            L.append(head("MARKETS"))
            L += rows
            L += ["", RULE, ""]
    except Exception as e:
        print(f"markets: {e}", file=sys.stderr)

    # 4. Company news ------------------------------------------------------
    picked = []
    for symbol, name, _ in HOLDINGS:
        if len(picked) >= MAX_COMPANY_NEWS:
            break
        for a in company_news(symbol, name):
            key = a["title"].lower()[:110]
            if key in seen_set:
                continue
            seen_set.add(key)
            seen_list.append(key)
            picked.append(a)
            break
        time.sleep(0.2)

    if picked:
        L.append(head("YOUR COMPANIES"))
        for a in picked:
            L.append(f"• <b>{esc(a['company'])}</b> — {esc(a['title'][:120])}")
        L += ["", RULE, ""]

    # 5 & 6. Topical feeds -------------------------------------------------
    all_headlines = []
    for key in ("ai", "corporate", "world", "markets"):
        cfg = feeds.TOPICS[key]
        items, count = [], 0
        for a in feeds.fetch_topic(key):
            k = a["title"].lower()[:110]
            if k in seen_set:
                continue
            seen_set.add(k)
            seen_list.append(k)
            items.append(a)
            all_headlines.append(a["title"])
            count += 1
            if count >= cfg["max"]:
                break
        if items:
            L.append(head(cfg["label"]))
            for a in items:
                src = f"  <i>{esc(a['source'])}</i>" if a["source"] else ""
                L.append(f"• {esc(a['title'][:130])}{src}")
            L += ["", RULE, ""]

    # Optional AI read - skipped entirely if no API key is set
    reads = analysis.analyse(all_headlines + [a["title"] for a in picked])
    if reads:
        L.append(head("WHAT THIS TOUCHES"))
        for line in reads:
            L.append(f"• {esc(line)}")
        L.append("<i>Mechanism only — not a forecast.</i>")
        L += ["", RULE, ""]

    while L and L[-1] in ("", RULE):
        L.pop()
    L += ["", RULE, "", "<i>Automated brief · informational only, not financial advice.</i>"]
    return "\n".join(L)


def split_message(text, limit=3500):
    chunks, cur = [], ""
    for line in text.split("\n"):
        if len(cur) + len(line) + 1 > limit and cur:
            chunks.append(cur.rstrip())
            cur = ""
        cur += line + "\n"
    if cur.strip():
        chunks.append(cur.rstrip())
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
            print(f"TELEGRAM {r.status_code}: {r.text}", file=sys.stderr)
            failures.append(r.text)
        time.sleep(0.5)
    if failures:
        sys.exit(f"{len(failures)} chunk(s) failed")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    seen = load_seen()
    seen_set = set(seen)
    text = build(seen_set, seen)

    if args.dry_run:
        print(text)
    else:
        send(text)
        save_seen(seen)
        print("sent", file=sys.stderr)


if __name__ == "__main__":
    main()
