"""
News sources. All free, no API keys, no signup.

Headlines only - no links, per request. Sources are named so you can tell
where something came from.
"""

import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

import requests

UA = {"User-Agent": "Mozilla/5.0 (portfolio-brief)"}

GOOGLE = "https://news.google.com/rss/search"

TOPICS = {
    "ai": {
        "label": "AI &amp; ROBOTICS",
        "url": GOOGLE,
        "params": {"q": "(artificial intelligence OR robotics) "
                        "(breakthrough OR launch OR research OR milestone) "
                        "when:1d",
                   "hl": "en-GB", "gl": "GB", "ceid": "GB:en"},
        "max": 4,
    },
    "world": {
        "label": "WORLD",
        "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
        "params": {},
        "max": 4,
    },
    "corporate": {
        "label": "COMPANY MOVES",
        "url": GOOGLE,
        "params": {"q": "(Nvidia OR Tesla OR Apple OR Microsoft OR Amazon OR "
                        "AMD OR Coinbase OR Intel OR Meta OR Broadcom OR "
                        "\"Elon Musk\") (announces OR acquires OR invests OR "
                        "unveils OR partnership OR deal OR launches) when:1d",
                   "hl": "en-GB", "gl": "GB", "ceid": "GB:en"},
        "max": 5,
    },
    "markets": {
        "label": "MARKETS &amp; BUSINESS",
        "url": "https://feeds.bbci.co.uk/news/business/rss.xml",
        "params": {},
        "max": 3,
    },
}


def _clean(title):
    """Google News appends ' - Publisher'. Split it into title + source."""
    if " - " in title:
        head, _, tail = title.rpartition(" - ")
        if head and len(tail) < 40:
            return head.strip(), tail.strip()
    return title.strip(), ""


def fetch_topic(key, hours=24):
    cfg = TOPICS[key]
    try:
        r = requests.get(cfg["url"], params=cfg["params"], headers=UA, timeout=20)
        r.raise_for_status()
        root = ET.fromstring(r.content)
    except Exception as e:
        print(f"  feed {key}: {e}", file=sys.stderr)
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    out = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        if not title:
            continue
        ts = datetime.now(timezone.utc)
        pub = item.findtext("pubDate")
        if pub:
            try:
                ts = datetime.strptime(pub.strip(), "%a, %d %b %Y %H:%M:%S %z")
            except ValueError:
                pass
        if ts < cutoff:
            continue
        headline, source = _clean(title)
        out.append({"title": headline, "source": source, "ts": ts})
    return out
