"""Burner-account browser: trains the For You feed on product videos and harvests video data.

Data comes from TikTok's own JSON responses (intercepted), not from fragile DOM scraping.
Runs a real, visible Chromium with a persistent profile, so you log in once and stay logged in.
"""
import random
import time
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import BrowserContext, Page, Response, sync_playwright

import db
from signals import count_intent, product_signal

PROFILE_DIR = Path(__file__).parent / "profile"
COVERS_DIR = db.DATA_DIR / "covers"


def _walk_items(obj, out: list):
    """Find every dict that looks like a TikTok video item anywhere in a JSON payload."""
    if isinstance(obj, dict):
        if ("id" in obj or "aweme_id" in obj) and ("stats" in obj or "statistics" in obj) and "author" in obj:
            out.append(obj)
            return
        for v in obj.values():
            _walk_items(v, out)
    elif isinstance(obj, list):
        for v in obj:
            _walk_items(v, out)


class Burner:
    def __init__(self, cfg: dict, headless: bool = False):
        self.cfg = cfg
        self.headless = headless
        self.conn = db.connect()
        self.source = "unknown"
        self.new_count = 0
        self.comment_buffer: dict[str, list[str]] = {}
        self._pw = None
        self.ctx: BrowserContext | None = None
        self.page: Page | None = None

    # ---------- lifecycle ----------
    def __enter__(self):
        self._pw = sync_playwright().start()
        self.ctx = self._pw.chromium.launch_persistent_context(
            str(PROFILE_DIR),
            headless=self.headless,
            viewport={"width": 1280, "height": 860},
            locale="en-US",
            args=["--disable-blink-features=AutomationControlled"],
        )
        self.page = self.ctx.pages[0] if self.ctx.pages else self.ctx.new_page()
        self.page.on("response", self._on_response)
        return self

    def __exit__(self, *exc):
        self.conn.commit()
        self.ctx.close()
        self._pw.stop()

    # ---------- interception ----------
    def _on_response(self, resp: Response):
        url = resp.url
        if "tiktok.com/api/" not in url:
            return
        try:
            data = resp.json()
        except Exception:
            return
        if "/api/comment/list" in url:
            vid = _qs(url, "aweme_id")
            texts = [c.get("text", "") for c in data.get("comments") or []]
            if vid:
                self.comment_buffer.setdefault(vid, []).extend(texts)
            return
        items: list = []
        _walk_items(data, items)
        for it in items:
            row = db.normalize_item(it)
            if row and db.upsert_video(self.conn, row, self.source):
                self.new_count += 1
        if items:
            self.conn.commit()

    # ---------- helpers ----------
    def _sleep(self, lo: float, hi: float):
        time.sleep(random.uniform(lo, hi))

    def _wait_captcha(self):
        """If TikTok shows a captcha, wait for you to solve it by hand."""
        sel = "#captcha-verify-container, .captcha_verify_container, [id*='captcha']"
        if self.page.locator(sel).count():
            print("\n⚠️  Captcha pe ecran — rezolv-o manual în fereastra browserului. Aștept...")
            while self.page.locator(sel).count():
                time.sleep(2)
            print("✓ Captcha rezolvat, continui.")

    def _goto(self, url: str):
        self.page.goto(url, wait_until="domcontentloaded", timeout=60000)
        self._sleep(3, 5)
        self._wait_captcha()

    def _scroll(self, times: int):
        for _ in range(times):
            self.page.mouse.wheel(0, random.randint(1400, 2600))
            self._sleep(1.8, 3.6)
            self._wait_captcha()

    # ---------- actions ----------
    def login(self):
        self._goto("https://www.tiktok.com/login")
        input("\n👉 Loghează-te în fereastra deschisă cu contul BURNER, apoi apasă Enter aici... ")
        print("✓ Sesiune salvată în ./profile — nu mai trebuie să te loghezi data viitoare.")

    def train_fyp(self, minutes: float):
        """Scroll the For You feed like a buyer: skip noise fast, watch/like/save product videos.
        This is what turns the account into a product-research burner over a few days."""
        self.source = "fyp"
        pace = self.cfg["human_pacing"]
        signals = self.cfg["product_signals"]
        self._goto("https://www.tiktok.com/foryou")
        self.page.mouse.click(640, 430)  # focus the feed so arrow keys work
        end = time.time() + minutes * 60
        seen = liked = 0
        while time.time() < end:
            info = self._current_video()
            text = f"{info.get('desc', '')} {info.get('author', '')}"
            is_product = info.get("ad") or product_signal(text, signals) > 0
            seen += 1
            if is_product:
                self._sleep(*pace["watch_product_seconds"])
                if random.random() < pace["like_probability"]:
                    liked += self._click_in_current('[data-e2e="like-icon"], [data-e2e="browse-like-icon"]')
                if random.random() < pace["favorite_probability"]:
                    self._click_in_current('[data-e2e="undefined-icon"], [data-e2e="favorite-icon"]')
            else:
                self._sleep(*pace["skip_seconds"])
            self.page.keyboard.press("ArrowDown")
            self._sleep(0.8, 1.6)
            self._wait_captcha()
        print(f"  FYP: {seen} clipuri parcurse, {liked} like-uri pe produse, {self.new_count} clipuri noi în DB")

    def _current_video(self) -> dict:
        try:
            return self.page.evaluate(
                """() => {
                  const el = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
                  const art = el && (el.closest('article') || el.closest('[data-e2e="recommend-list-item-container"]'));
                  if (!art) return {};
                  const q = s => (art.querySelector(s) || {}).innerText || '';
                  return { desc: q('[data-e2e="video-desc"]'), author: q('[data-e2e="video-author-uniqueid"]'),
                           ad: /sponsored|promoted|ad\\b/i.test(art.innerText.slice(0, 400)) };
                }"""
            )
        except Exception:
            return {}

    def _click_in_current(self, selector: str) -> int:
        try:
            box = self.page.evaluate_handle(
                """() => { const el = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
                           return el && (el.closest('article') || el.closest('[data-e2e="recommend-list-item-container"]')); }"""
            ).as_element()
            target = box.query_selector(selector) if box else None
            if target:
                target.click()
                self._sleep(0.4, 1.0)
                return 1
        except Exception:
            pass
        return 0

    def search(self, keywords: list[str], scrolls: int):
        for kw in keywords:
            self.source = f"search:{kw}"
            before = self.new_count
            self._goto(f"https://www.tiktok.com/search/video?q={quote(kw)}")
            self._scroll(scrolls)
            print(f"  search '{kw}': +{self.new_count - before}")
            self._sleep(4, 9)

    def hashtags(self, tags: list[str], scrolls: int):
        for tag in tags:
            self.source = f"tag:{tag}"
            before = self.new_count
            self._goto(f"https://www.tiktok.com/tag/{quote(tag)}")
            self._scroll(scrolls)
            print(f"  #{tag}: +{self.new_count - before}")
            self._sleep(4, 9)

    def pull_comments(self, videos: list[dict]):
        """Open each candidate and read its comments: 'link?', 'where to buy' = real demand."""
        for v in videos:
            self.source = "comments"
            self._goto(f"https://www.tiktok.com/@{v['author']}/video/{v['id']}")
            icon = self.page.locator('[data-e2e="comment-icon"], [data-e2e="browse-comment-icon"]').first
            try:
                if icon.count():
                    icon.click()
            except Exception:
                pass
            self._sleep(2.5, 4)
            # scroll the comment panel a bit to load more
            for _ in range(3):
                self.page.mouse.move(1050, 500)
                self.page.mouse.wheel(0, 1500)
                self._sleep(1.2, 2.2)
            texts = self.comment_buffer.pop(v["id"], [])
            db.save_comments(self.conn, v["id"], texts[:200], count_intent(texts))
            self.conn.commit()
            print(f"  comentarii @{v['author']}/{v['id']}: {len(texts)} citite, {count_intent(texts)} cu intenție de cumpărare")

    def download_covers(self, videos: list[dict]):
        COVERS_DIR.mkdir(parents=True, exist_ok=True)
        for v in videos:
            path = COVERS_DIR / f"{v['id']}.jpg"
            if path.exists() or not v["cover_url"]:
                continue
            try:
                r = self.ctx.request.get(v["cover_url"], timeout=20000)
                if r.ok:
                    path.write_bytes(r.body())
            except Exception:
                pass


def _qs(url: str, key: str) -> str:
    from urllib.parse import parse_qs, urlparse
    return (parse_qs(urlparse(url).query).get(key) or [""])[0]

