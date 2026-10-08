"""Ad Library validation: is anyone already spending money on this product?

For every WINNER/TEST product we search:
  - TikTok Ad Library (library.tiktok.com): ads shown in the EU, with first/last shown dates.
  - Meta Ad Library (facebook.com/ads/library): active ads, "Started running on", duplicated creatives.
Many active ads running 30+ days, from several advertisers = proven, profitable product.
Thousands of ads = probably saturated.
"""
import math
import re
import time
from datetime import datetime
from urllib.parse import quote, quote_plus

from playwright.sync_api import BrowserContext, Page, Response

# ---------- links (also used by the report) ----------

def tiktok_url(keyword: str, days: int = 90) -> str:
    end = int(time.time() * 1000)
    start = end - days * 86400 * 1000
    return (f"https://library.tiktok.com/ads?region=all&start_time={start}&end_time={end}"
            f"&adv_name={quote(keyword)}&adv_biz_ids=&query_type=1&sort_type=last_shown_date,desc")


def meta_url(keyword: str, country: str = "ALL") -> str:
    return (f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country={country}"
            f"&q={quote_plus(keyword)}&search_type=keyword_unordered&media_type=all")


# ---------- parsing helpers ----------

def _to_epoch(v) -> float | None:
    """TikTok returns dates as seconds, milliseconds or 'YYYY-MM-DD'."""
    if v in (None, "", 0):
        return None
    try:
        n = float(v)
        return n / 1000 if n > 1e12 else n
    except (TypeError, ValueError):
        pass
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(v)[:10], fmt).timestamp()
        except ValueError:
            continue
    return None


def _walk_ads(obj, out: list):
    if isinstance(obj, dict):
        keys = obj.keys()
        if any(k in keys for k in ("first_shown_date", "firstShownDate", "last_shown_date", "lastShownDate")):
            out.append(obj)
            return
        for v in obj.values():
            _walk_ads(v, out)
    elif isinstance(obj, list):
        for v in obj:
            _walk_ads(v, out)


def _find_total(obj) -> int | None:
    if isinstance(obj, dict):
        for k in ("total_count", "totalCount", "total"):
            if isinstance(obj.get(k), (int, float)) and not isinstance(obj.get(k), bool):
                return int(obj[k])
        for v in obj.values():
            t = _find_total(v)
            if t is not None:
                return t
    return None


def summarize_tiktok(payloads: list) -> dict:
    ads, total = [], None
    for p in payloads:
        _walk_ads(p, ads)
        total = total or _find_total(p)
    now = time.time()
    advertisers, ages, active = set(), [], 0
    for a in ads:
        name = a.get("name") or a.get("advertiser_name") or (a.get("advertiser") or {}).get("name")
        if name:
            advertisers.add(str(name))
        first = _to_epoch(a.get("first_shown_date") or a.get("firstShownDate"))
        last = _to_epoch(a.get("last_shown_date") or a.get("lastShownDate"))
        if first:
            ages.append(((last or now) - first) / 86400)
        if last and now - last < 3 * 86400:
            active += 1
    return {
        "ads": max(total or 0, len(ads)),
        "active_last_3d": active,
        "advertisers": len(advertisers),
        "longest_days": round(max(ages)) if ages else 0,
    }


_META_COUNT = re.compile(r"~?\s*([\d.,]+)\s*([KkMm])?\s+results?", re.IGNORECASE)
_META_STARTED = re.compile(r"Started running on\s+([A-Z][a-z]{2,8}\.? \d{1,2}, \d{4})")
_META_DUPES = re.compile(r"(\d+)\s+ads use this creative")


def summarize_meta(text: str) -> dict:
    count = 0
    m = _META_COUNT.search(text)
    if m:
        n = float(m.group(1).replace(",", ""))
        mult = {"k": 1e3, "m": 1e6}.get((m.group(2) or "").lower(), 1)
        count = int(n * mult)
    now = time.time()
    ages = []
    for d in _META_STARTED.findall(text):
        for fmt in ("%b %d, %Y", "%B %d, %Y"):
            try:
                ages.append((now - datetime.strptime(d.replace(".", ""), fmt).timestamp()) / 86400)
                break
            except ValueError:
                continue
    dupes = [int(x) for x in _META_DUPES.findall(text)]
    return {
        "active_ads": count,
        "longest_days": round(max(ages)) if ages else 0,
        "running_30d_plus": sum(1 for a in ages if a >= 30),
        "max_creative_dupes": max(dupes) if dupes else 0,
    }


def ads_score(tt: dict, meta: dict) -> float:
    """0-10. Proof that advertisers are profitably spending on this product."""
    meta_pts = min(math.log10(meta["active_ads"] + 1) / math.log10(500), 1) * 3.5       # 500+ active ads
    longevity = max(meta["longest_days"], tt["longest_days"])
    long_pts = min(longevity / 60, 1) * 3                                               # running 60+ days
    tt_pts = min(math.log10(tt["ads"] + 1) / math.log10(50), 1) * 2                     # 50+ TikTok ads
    scale_pts = min(meta["max_creative_dupes"] / 10, 1) * 1.5                           # same creative x10 = scaling
    return round(meta_pts + long_pts + tt_pts + scale_pts, 2)


def saturation_flag(tt: dict, meta: dict, cfg: dict) -> str | None:
    if meta["active_ads"] >= cfg["ad_library"]["saturated_meta_ads"]:
        return f"posibil saturat: {meta['active_ads']} reclame Meta active"
    return None


# ---------- browser side ----------

class AdLibrary:
    def __init__(self, ctx: BrowserContext, cfg: dict):
        self.ctx = ctx
        self.cfg = cfg["ad_library"]
        self.page: Page = ctx.new_page()
        self._tt_payloads: list = []
        self.page.on("response", self._on_response)

    def _on_response(self, resp: Response):
        if "library.tiktok.com" not in resp.url or "/api/" not in resp.url:
            return
        try:
            self._tt_payloads.append(resp.json())
        except Exception:
            pass

    def _dismiss_cookies(self):
        for label in ("Allow all cookies", "Decline optional cookies", "Only allow essential cookies",
                      "Accept all", "Decline all", "Reject all"):
            btn = self.page.get_by_role("button", name=label)
            try:
                if btn.count():
                    btn.first.click(timeout=2000)
                    time.sleep(1)
                    return
            except Exception:
                continue

    def tiktok(self, keyword: str) -> dict:
        self._tt_payloads = []
        self.page.goto(tiktok_url(keyword, self.cfg["tiktok_days"]), wait_until="domcontentloaded", timeout=60000)
        time.sleep(4)
        self._dismiss_cookies()
        for _ in range(2):
            self.page.mouse.wheel(0, 2500)
            time.sleep(2)
        return summarize_tiktok(self._tt_payloads)

    def meta(self, keyword: str) -> dict:
        self.page.goto(meta_url(keyword, self.cfg["meta_country"]), wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        self._dismiss_cookies()
        for _ in range(self.cfg["meta_scrolls"]):
            self.page.mouse.wheel(0, 3000)
            time.sleep(2)
        try:
            text = self.page.inner_text("body", timeout=10000)
        except Exception:
            text = ""
        return summarize_meta(text)

    def check(self, keyword: str) -> dict:
        tt, meta = self.tiktok(keyword), self.meta(keyword)
        time.sleep(2)
        return {"keyword": keyword, "tiktok": tt, "meta": meta}
