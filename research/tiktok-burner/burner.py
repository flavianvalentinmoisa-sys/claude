"""TikTok burner product research.

    python burner.py login      # o singură dată: te loghezi cu contul burner
    python burner.py train      # doar antrenează For You (rulează zilnic primele 3-5 zile)
    python burner.py run        # tot: FYP + search + hashtag-uri + comentarii + analiză Claude + raport
    python burner.py analyze    # doar analiza pe ce e deja în DB
    python burner.py validate   # verifică WINNER/TEST în TikTok Ad Library + Meta Ad Library
    python burner.py report     # doar regenerează raportul
"""
import argparse
import json
import sys
import time
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


def cmd_validate(cfg, args):
    from adlibrary import AdLibrary, ads_score, saturation_flag
    from analyze import ProductVerdict, final_score
    from collector import Burner

    cutoff = int(time.time()) - cfg["ad_library"]["recheck_days"] * 86400
    with Burner(cfg, headless=args.headless) as b:
        rows = b.conn.execute(
            """SELECT a.video_id, a.result FROM analyses a LEFT JOIN ad_checks c ON c.video_id=a.video_id
               WHERE a.verdict IN ('WINNER','TEST') AND (c.checked_at IS NULL OR c.checked_at < ?)""",
            (cutoff,),
        ).fetchall()
        print(f"▶ Verific {len(rows)} produse în Ad Library (TikTok + Meta)...")
        lib = AdLibrary(b.ctx, cfg)
        for r in rows:
            result = json.loads(r["result"])
            result.setdefault("ad_search_keyword", "")
            p = ProductVerdict.model_validate(result)
            keyword = p.ad_search_keyword or p.product_name
            check = lib.check(keyword)
            ascore = ads_score(check["tiktok"], check["meta"])
            check["score"] = ascore
            score, verdict, gates = final_score(cfg, p, result["virality"], ascore)
            flag = saturation_flag(check["tiktok"], check["meta"], cfg)
            result.update(ads=check, failed_gates=gates, saturation=flag)
            db.save_ad_check(b.conn, r["video_id"], check)
            db.save_analysis(b.conn, r["video_id"], result, score, verdict)
            b.conn.commit()
            m, t = check["meta"], check["tiktok"]
            print(f"  {verdict:6} {score:4.1f}  {p.product_name}: Meta {m['active_ads']} active / {m['longest_days']}z, "
                  f"TikTok {t['ads']} reclame / {t['longest_days']}z{'  ⚠ ' + flag if flag else ''}")


def cmd_report(include_skip=False):
    path = report.build(db.connect(), include_skip)
    print(f"✓ Raport: {path}\n  CSV:    {path.with_suffix('.csv')}")


def main():
    ap = argparse.ArgumentParser(description="TikTok burner product research")
    ap.add_argument("cmd", choices=["login", "train", "run", "collect", "analyze", "validate", "report"])
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
    if args.cmd == "validate" or (args.cmd == "run" and cfg["ad_library"]["enabled"]):
        cmd_validate(cfg, args)
    if args.cmd in ("report", "run", "analyze", "validate"):
        cmd_report(args.all)


if __name__ == "__main__":
    sys.exit(main())
