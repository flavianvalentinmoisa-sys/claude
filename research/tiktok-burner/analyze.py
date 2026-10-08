"""Claude judges each candidate against the winning-product criteria."""
import base64
import json
from typing import Literal

import anthropic
from pydantic import BaseModel, Field

import db
from signals import age_days, rates, virality_score

COVERS_DIR = db.DATA_DIR / "covers"


class ProductVerdict(BaseModel):
    is_physical_product: bool = Field(description="True only if the video sells/shows one specific physical product")
    product_name: str = Field(description="Generic product name, e.g. 'magnetic cable organizer'. Empty if not a product.")
    category: str
    problem_solved: str = Field(description="The concrete, everyday problem the product solves, in one sentence")
    problem_score: int = Field(description="1-10: how real, frequent and painful the problem is for many people")
    wow_score: int = Field(description="1-10: visual 'wow' in a 3-second ad hook (instant before/after, satisfying, unexpected)")
    perceived_value_score: int = Field(description="1-10: how expensive it looks/feels vs. its real cost")
    cogs_min_usd: float = Field(description="Estimated AliExpress/1688 unit cost incl. shipping to EU/US, low end")
    cogs_max_usd: float = Field(description="Estimated unit cost, high end")
    retail_price_usd: float = Field(description="Realistic retail price buyers would pay after seeing the ad")
    aliexpress_query: str = Field(description="Best English search query to find it on AliExpress")
    ad_search_keyword: str = Field(description="2-4 word English phrase advertisers of this product use in ad copy, for Ad Library search")
    target_audience: str
    ad_hook_idea: str = Field(description="One-line hook for the first 3 seconds of an ad")
    red_flags: list[str] = Field(description="Saturation, IP/brand, fragile, sizing, batteries/liquids, regulated, returns...")
    verdict: Literal["WINNER", "TEST", "SKIP"]
    reasoning: str = Field(description="2-3 sentences, in Romanian")


SYSTEM = """You are a senior e-commerce product researcher (dropshipping / COD / TikTok Shop).
You evaluate TikTok videos to find WINNING physical products. A winner must:
1. Solve a REAL, frequent problem many people have (not a novelty toy).
2. Have WOW factor that shows in the first 3 seconds of an ad (demonstrable, visual).
3. Have HIGH PERCEIVED VALUE: looks worth far more than it costs.
4. Have a unit cost (COGS) between ${cogs_min} and ${cogs_max}, and a retail price of at least {markup}x the COGS.
Be strict and honest: most videos are SKIP. Use metrics as evidence: high shares = wow, high saves and
'link?/where to buy' comments = buying intent. Estimate COGS from your knowledge of AliExpress/1688 prices.
WINNER = all four criteria clearly met. TEST = promising with one doubt. SKIP = anything else."""


def _cover_block(video_id: str) -> list[dict]:
    path = COVERS_DIR / f"{video_id}.jpg"
    if not path.exists():
        return []
    data = base64.standard_b64encode(path.read_bytes()).decode()
    return [{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}}]


def _video_brief(v: dict, comments: list[str], intent: int) -> str:
    r = rates(v)
    return json.dumps({
        "caption": v["desc"],
        "hashtags": v["hashtags"],
        "author": v["author"],
        "views": v["views"], "likes": v["likes"], "comments": v["comments"],
        "shares": v["shares"], "saves": v["saves"],
        "share_rate_pct": round(r["share_rate"] * 100, 2),
        "save_rate_pct": round(r["save_rate"] * 100, 2),
        "age_days": round(age_days(v)),
        "is_paid_ad": bool(v["is_ad"]), "has_tiktok_shop_link": bool(v["has_shop_link"]),
        "purchase_intent_comments": intent,
        "sample_comments": comments[:40],
    }, ensure_ascii=False)


def judge(client: anthropic.Anthropic, cfg: dict, v: dict, comments: list[str], intent: int) -> ProductVerdict | None:
    crit = cfg["criteria"]
    system = SYSTEM.format(cogs_min=crit["cogs_min_usd"], cogs_max=crit["cogs_max_usd"], markup=crit["min_markup"])
    content = _cover_block(v["id"]) + [{
        "type": "text",
        "text": "Evaluate this TikTok video (cover image above if present):\n" + _video_brief(v, comments, intent),
    }]
    resp = client.beta.messages.parse(
        model=cfg["claude"]["model"],
        max_tokens=16000,
        system=system,
        thinking={"type": "adaptive"},
        output_config={"effort": cfg["claude"]["effort"]},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": content}],
        output_format=ProductVerdict,
    )
    if resp.stop_reason == "refusal" or resp.parsed_output is None:
        return None
    return resp.parsed_output


def final_score(cfg: dict, p: ProductVerdict, viral: float, ads: float | None = None) -> tuple[float, str, list[str]]:
    """Combine Claude's judgment with hard gates. Returns (score 0-10, verdict, failed gates).
    `ads` is the 0-10 Ad Library validation score, once the product has been checked there."""
    crit = cfg["criteria"]
    gates = []
    if not p.is_physical_product:
        return 0.0, "SKIP", ["nu e produs fizic"]
    cogs_mid = (p.cogs_min_usd + p.cogs_max_usd) / 2
    if not (crit["cogs_min_usd"] <= cogs_mid <= crit["cogs_max_usd"]):
        gates.append(f"COGS ~${cogs_mid:.0f} în afara ${crit['cogs_min_usd']}-{crit['cogs_max_usd']}")
    if p.retail_price_usd < crit["min_markup"] * max(p.cogs_max_usd, 0.01):
        gates.append(f"markup sub {crit['min_markup']}x")
    if ads is None:
        score = 0.30 * p.problem_score + 0.25 * p.wow_score + 0.25 * p.perceived_value_score + 0.20 * viral
    else:
        score = (0.25 * p.problem_score + 0.20 * p.wow_score + 0.20 * p.perceived_value_score
                 + 0.15 * viral + 0.20 * ads)
    score = round(score, 2)
    verdict = p.verdict
    if gates:
        verdict = "SKIP"
    elif verdict == "WINNER" and score < 7:
        verdict = "TEST"
    return score, verdict, gates


def analyze(cfg: dict, candidates: list[dict], conn) -> int:
    client = anthropic.Anthropic()
    done = 0
    for v in candidates:
        crow = conn.execute("SELECT texts, intent_count FROM comments WHERE video_id=?", (v["id"],)).fetchone()
        comments = json.loads(crow["texts"]) if crow else []
        intent = crow["intent_count"] if crow else 0
        viral = virality_score(v, intent)
        try:
            p = judge(client, cfg, v, comments, intent)
        except anthropic.AuthenticationError:
            raise SystemExit("✗ Cheie Claude invalidă/lipsă: setează ANTHROPIC_API_KEY.")
        except anthropic.APIStatusError as e:
            print(f"  ✗ {v['id']}: API {e.status_code} — {e.message}")
            continue
        except anthropic.APIConnectionError as e:
            print(f"  ✗ {v['id']}: conexiune — {e}")
            continue
        if p is None:
            print(f"  – {v['id']}: fără răspuns valid, sărit")
            continue
        score, verdict, gates = final_score(cfg, p, viral)
        result = {**p.model_dump(), "virality": viral, "intent_comments": intent, "failed_gates": gates}
        db.save_analysis(conn, v["id"], result, score, verdict)
        conn.commit()
        done += 1
        print(f"  {verdict:6} {score:4.1f}  {p.product_name or '-'}  ({', '.join(gates) or 'ok'})")
    return done
