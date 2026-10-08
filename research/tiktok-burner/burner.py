"""TikTok burner product research.

    python burner.py login      # o singură dată: te loghezi cu contul burner
    python burner.py train      # doar antrenează For You (rulează zilnic primele 3-5 zile)
    python burner.py run        # tot: FYP + search + hashtag-uri + comentarii + analiză Claude + raport
    python burner.py analyze    # doar analiza pe ce e deja în DB
    python burner.py report     # doar regenerează raportul
"""
import argparse
import json
import sys
from pathlib import Path

import db
import report
from signals import passes_prefilter, virality_score

ROOT = Path(__file__).parent


def load_cfg() -> dict:
    return json.loads((ROOT / "config.json").read_text(encoding="utf-8"))


def candidates(conn, cfg: dict, limit: int, only_unanalyzed: bool = True) -> list[dict]:
    rows = conn.execute(
        """SELECT v.*, COALESCE(c.intent_count,0) AS intent FROM videos v
           LEFT JOIN comments c ON c.video_id=v.id
           LEFT JOIN analyses a ON a.video_id=v.id
           WHERE (? = 0 OR a.video_id IS NULL)""",
        (int(only_unanalyzed),),
    ).fetchall()
    good = [dict(r) for r in rows if passes_prefilter(dict(r), cfg, cfg["product_signals"])]
    good.sort(key=lambda v: virality_score(v, v["intent"]), reverse=True)
    return good[:limit]


def cmd_collect(cfg, args, train_only=False):
    from collector import Burner

    with Burner(cfg, headless=args.headless) as b:
        if args.cmd == "login":
            b.login()
            return
        print("▶ Antrenez For You...")
        b.train_fyp(args.minutes or cfg["fyp_minutes"])
        if train_only:
            return
        print("▶ Search pe cuvinte cheie...")
        b.search(cfg["search_keywords"], cfg["search_scrolls"])
        print("▶ Hashtag-uri...")
        b.hashtags(cfg["hashtags"], cfg["search_scrolls"])
        top = candidates(b.conn, cfg, cfg["comments_top_n"])
        print(f"▶ Citesc comentariile la top {len(top)} candidați...")
        b.pull_comments(top)
        b.download_covers(candidates(b.conn, cfg, cfg["analyze_top_n"]))


def cmd_analyze(cfg):
    from analyze import analyze

    conn = db.connect()
    todo = candidates(conn, cfg, cfg["analyze_top_n"])
    print(f"▶ Claude analizează {len(todo)} candidați noi...")
    analyze(cfg, todo, conn)


def cmd_report(include_skip=False):
    path = report.build(db.connect(), include_skip)
    print(f"✓ Raport: {path}\n  CSV:    {path.with_suffix('.csv')}")


def main():
    ap = argparse.ArgumentParser(description="TikTok burner product research")
    ap.add_argument("cmd", choices=["login", "train", "run", "collect", "analyze", "report"])
    ap.add_argument("--minutes", type=float, help="minute de scroll pe For You (suprascrie config)")
    ap.add_argument("--headless", action="store_true", help="fără fereastră (nerecomandat, TikTok blochează mai des)")
    ap.add_argument("--all", action="store_true", help="include și SKIP în raport")
    args = ap.parse_args()
    cfg = load_cfg()

    if args.cmd in ("login", "collect", "run"):
        cmd_collect(cfg, args)
    elif args.cmd == "train":
        cmd_collect(cfg, args, train_only=True)
    if args.cmd in ("analyze", "run"):
        cmd_analyze(cfg)
    if args.cmd in ("report", "run", "analyze"):
        cmd_report(args.all)


if __name__ == "__main__":
    sys.exit(main())
