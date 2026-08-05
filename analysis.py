"""
Optional AI read on the day's headlines.

Needs ANTHROPIC_API_KEY. Without it this section is silently skipped and
the rest of the brief works exactly as before.

Deliberately does NOT predict prices. It explains the mechanism - what the
news is, which of your holdings it touches, and why that connection exists.
A language model has no forecasting ability, and dressing guesses up as
predictions would be worse than saying nothing.
"""

import json
import os
import sys

import requests

KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-haiku-4-5-20251001"

SYSTEM = """You analyse news for a UK retail investor's brief.

Their holdings, as % of total portfolio:
Nvidia 4.1, Apple 2.7, Microsoft 2.2, AMD 2.1, Amazon 1.8, Coinbase 1.5,
Alphabet 1.3, Micron 1.1, Broadcom 1.1, Intel 1.0, Meta 0.9, IREN 0.9,
KLA 0.8, Tesla 0.8, Hut 8 0.8, Circle 0.8, Snowflake 0.8, Mastercard 0.7.
They also hold gold (15% of pot) and a bitcoin-miner ETF (12%).

Given today's headlines, pick the 2-3 MOST relevant to these holdings.
For each, write ONE line, maximum 30 words:
- What happened
- Which holding it touches and the mechanism connecting them

Rules:
- Never predict a price or direction. No "should rise", "bullish", "expect".
- Explain causal links only: who supplies whom, who competes, what demand shifts.
- If a headline has no real connection to their holdings, leave it out.
- If nothing is genuinely relevant, return an empty list.
- Plain factual English. No hype, no advice.

Return ONLY a JSON array of strings. No markdown, no preamble."""


def analyse(headlines):
    if not KEY or not headlines:
        return []

    joined = "\n".join(f"- {h}" for h in headlines[:25])
    try:
        r = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": KEY,
                     "anthropic-version": "2023-06-01",
                     "content-type": "application/json"},
            json={"model": MODEL, "max_tokens": 400, "system": SYSTEM,
                  "messages": [{"role": "user", "content": joined}]},
            timeout=45)
        r.raise_for_status()
        text = "".join(b.get("text", "") for b in r.json()["content"])
        text = text.strip().removeprefix("```json").removeprefix("```")
        text = text.removesuffix("```").strip()
        items = json.loads(text)
        return [str(i) for i in items if str(i).strip()][:3]
    except Exception as e:
        print(f"  analysis: {e}", file=sys.stderr)
        return []
