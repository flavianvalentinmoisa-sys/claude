"""Cheap, offline signals: is this a product video, do people want to buy it, is it going viral."""
import math
import re
import time

# Purchase-intent phrases seen in comments (EN + RO + a few EU languages).
INTENT_PATTERNS = [
    r"\blink\b", r"where (can|do) i (get|buy)", r"where.*(buy|get) (it|this|one)",
    r"\bi need (this|it|one)", r"need this", r"how much", r"\bprice\b", r"what('s| is) it called",
    r"name of (the|this) product", r"just ordered", r"ordered (it|one|mine)", r"added to cart",
    r"take my money", r"want (this|one)", r"does it (work|really)", r"\bshop\b",
    r"\bunde\b", r"\bcat costa\b", r"\bcât costă\b", r"\bpret\b", r"\bpreț\b", r"\bvreau\b",
    r"\bwo kaufen\b", r"\bwaar\b.*kopen", r"\bvar köper\b", r"\bprix\b", r"\bdónde\b",
]
_INTENT_RE = re.compile("|".join(INTENT_PATTERNS), re.IGNORECASE)


def count_intent(texts: list[str]) -> int:
    return sum(1 for t in texts if t and _INTENT_RE.search(t))


def product_signal(text: str, signals: list[str]) -> int:
    low = (text or "").lower()
    return sum(1 for s in signals if s in low)


def rates(v: dict) -> dict:
    views = max(v["views"], 1)
    return {
        "like_rate": v["likes"] / views,
        "share_rate": v["shares"] / views,
        "save_rate": v["saves"] / views,
        "comment_rate": v["comments"] / views,
    }


def age_days(v: dict) -> float:
    if not v["create_time"]:
        return 9999.0
    return (time.time() - v["create_time"]) / 86400


def virality_score(v: dict, intent_count: int = 0) -> float:
    """0-10. Shares = wow factor, saves = perceived value / intent, views = proof, recency = trend."""
    r = rates(v)
    views_pts = min(math.log10(max(v["views"], 1)) / 7, 1) * 3          # 10M views -> 3 pts
    share_pts = min(r["share_rate"] / 0.01, 1) * 2.5                     # 1% shares -> 2.5
    save_pts = min(r["save_rate"] / 0.015, 1) * 2.5                      # 1.5% saves -> 2.5
    intent_pts = min(intent_count / 8, 1) * 1.5                           # 8 "link?" comments -> 1.5
    age = age_days(v)
    recency_pts = 0.5 if age <= 30 else 0.25 if age <= 90 else 0
    return round(views_pts + share_pts + save_pts + intent_pts + recency_pts, 2)


def passes_prefilter(v: dict, cfg: dict, signals: list[str]) -> bool:
    pf = cfg["prefilter"]
    if v["views"] < pf["min_views"] or age_days(v) > pf["max_age_days"]:
        return False
    r = rates(v)
    if r["share_rate"] < pf["min_share_rate"] and r["save_rate"] < pf["min_save_rate"]:
        return False
    text = f"{v['desc']} {v['hashtags']}"
    return bool(v["is_ad"] or v["has_shop_link"] or product_signal(text, signals))
