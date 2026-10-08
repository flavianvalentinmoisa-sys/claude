"""Daily report: HTML cards + CSV, best products first."""
import csv
import html
import json
import time
from pathlib import Path
from urllib.parse import quote_plus

import db

REPORTS_DIR = db.DATA_DIR / "reports"
VERDICT_ORDER = {"WINNER": 0, "TEST": 1, "SKIP": 2}


def _rows(conn, include_skip: bool):
    q = """SELECT v.*, a.result, a.score, a.verdict FROM analyses a JOIN videos v ON v.id=a.video_id"""
    rows = []
    for r in conn.execute(q):
        if r["verdict"] == "SKIP" and not include_skip:
            continue
        d = dict(r)
        d["result"] = json.loads(d["result"])
        rows.append(d)
    rows.sort(key=lambda d: (VERDICT_ORDER.get(d["verdict"], 3), -d["score"]))
    return rows


def _fmt(n: int) -> str:
    return f"{n/1e6:.1f}M" if n >= 1e6 else f"{n/1e3:.0f}K" if n >= 1e3 else str(n)


def build(conn, include_skip: bool = False) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y-%m-%d")
    rows = _rows(conn, include_skip)

    csv_path = REPORTS_DIR / f"{stamp}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["verdict", "score", "product", "problem", "cogs_min", "cogs_max", "retail",
                    "wow", "perceived_value", "problem_score", "virality", "views", "shares", "saves",
                    "intent_comments", "tiktok_url", "aliexpress_url", "hook", "red_flags", "reasoning"])
        for d in rows:
            p = d["result"]
            w.writerow([d["verdict"], d["score"], p["product_name"], p["problem_solved"], p["cogs_min_usd"],
                        p["cogs_max_usd"], p["retail_price_usd"], p["wow_score"], p["perceived_value_score"],
                        p["problem_score"], p["virality"], d["views"], d["shares"], d["saves"],
                        p["intent_comments"], _tt(d), _ali(p), p["ad_hook_idea"], "; ".join(p["red_flags"]),
                        p["reasoning"]])

    cards = "\n".join(_card(d) for d in rows) or "<p class=empty>Niciun produs încă. Rulează <code>python burner.py run</code>.</p>"
    html_path = REPORTS_DIR / f"{stamp}.html"
    html_path.write_text(PAGE.format(date=stamp, count=len(rows), cards=cards), encoding="utf-8")
    return html_path


def _tt(d) -> str:
    return f"https://www.tiktok.com/@{d['author']}/video/{d['id']}"


def _ali(p) -> str:
    return f"https://www.aliexpress.com/w/wholesale-{quote_plus(p['aliexpress_query'])}.html?sortType=total_tranpro_desc"


def _card(d) -> str:
    p = d["result"]
    e = html.escape
    cover = Path("..") / "covers" / f"{d['id']}.jpg"
    flags = "".join(f"<li>{e(f)}</li>" for f in p["red_flags"] + p.get("failed_gates", []))
    return f"""
<article class="card {e(d['verdict']).lower()}">
  <a href="{_tt(d)}" target="_blank"><img src="{cover.as_posix()}" alt="" loading="lazy"></a>
  <div class="body">
    <div class="top"><span class="badge">{e(d['verdict'])}</span><span class="score">{d['score']:.1f}</span></div>
    <h2>{e(p['product_name'] or '—')}</h2>
    <p class="problem">🩹 {e(p['problem_solved'])}</p>
    <div class="nums">
      <span>COGS <b>${p['cogs_min_usd']:.0f}–{p['cogs_max_usd']:.0f}</b></span>
      <span>Retail <b>${p['retail_price_usd']:.0f}</b></span>
      <span>Problemă <b>{p['problem_score']}</b></span>
      <span>Wow <b>{p['wow_score']}</b></span>
      <span>Valoare <b>{p['perceived_value_score']}</b></span>
      <span>Viral <b>{p['virality']}</b></span>
    </div>
    <p class="meta">{_fmt(d['views'])} views · {_fmt(d['shares'])} share · {_fmt(d['saves'])} save · {p['intent_comments']} „link?”</p>
    <p class="hook">🎬 {e(p['ad_hook_idea'])}</p>
    <p class="why">{e(p['reasoning'])}</p>
    {f'<ul class="flags">{flags}</ul>' if flags else ''}
    <div class="links"><a href="{_tt(d)}" target="_blank">TikTok</a><a href="{_ali(p)}" target="_blank">AliExpress</a></div>
  </div>
</article>"""


PAGE = """<!doctype html><html lang="ro"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Radar TikTok {date}</title>
<style>
:root{{--bg:#f6f6f4;--card:#fff;--ink:#1b1b1b;--mute:#6b6b6b;--line:#e4e4e0;--win:#1f8a4c;--test:#b7791f;--skip:#9b9b9b}}
@media (prefers-color-scheme:dark){{:root{{--bg:#141414;--card:#1e1e1e;--ink:#eee;--mute:#9a9a9a;--line:#2e2e2e}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,sans-serif}}
header{{padding:24px 16px 8px;max-width:1200px;margin:auto}} h1{{margin:0;font-size:22px}} header p{{color:var(--mute);margin:4px 0 0}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;padding:16px;max-width:1200px;margin:auto}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}}
.card img{{width:100%;aspect-ratio:3/4;object-fit:cover;background:var(--line);display:block}}
.body{{padding:12px 14px 14px}} .top{{display:flex;justify-content:space-between;align-items:center}}
.badge{{font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;color:#fff;background:var(--skip)}}
.winner .badge{{background:var(--win)}} .test .badge{{background:var(--test)}} .score{{font-size:22px;font-weight:700}}
h2{{font-size:17px;margin:6px 0}} .problem,.hook{{margin:6px 0}} .why,.meta{{color:var(--mute);font-size:13px}}
.nums{{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:13px}} .flags{{color:#c0392b;font-size:13px;padding-left:18px;margin:6px 0}}
.links{{display:flex;gap:10px;margin-top:8px}} .links a{{color:var(--ink);font-weight:600}} .empty{{padding:16px}}
</style></head><body>
<header><h1>Radar produse TikTok — {date}</h1><p>{count} produse · sortate după verdict și scor</p></header>
<main>{cards}</main></body></html>"""
