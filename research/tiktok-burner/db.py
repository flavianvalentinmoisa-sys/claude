"""SQLite storage: videos seen, comments pulled, Claude analyses. Dedups across runs."""
import json
import sqlite3
import time
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DB_PATH = DATA_DIR / "burner.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    author TEXT,
    desc TEXT,
    hashtags TEXT,
    views INTEGER, likes INTEGER, comments INTEGER, shares INTEGER, saves INTEGER,
    duration INTEGER,
    create_time INTEGER,
    is_ad INTEGER,
    has_shop_link INTEGER,
    cover_url TEXT,
    sources TEXT,
    first_seen INTEGER,
    last_seen INTEGER
);
CREATE TABLE IF NOT EXISTS comments (
    video_id TEXT PRIMARY KEY,
    texts TEXT,
    intent_count INTEGER,
    fetched_at INTEGER
);
CREATE TABLE IF NOT EXISTS ad_checks (
    video_id TEXT PRIMARY KEY,
    result TEXT,
    checked_at INTEGER
);
CREATE TABLE IF NOT EXISTS analyses (
    video_id TEXT PRIMARY KEY,
    result TEXT,
    score REAL,
    verdict TEXT,
    analyzed_at INTEGER
);
"""


def connect() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def _int(v) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


def normalize_item(item: dict) -> dict | None:
    """Turn a raw TikTok web item (any endpoint) into a flat row."""
    vid = str(item.get("id") or item.get("aweme_id") or "")
    if not vid or not isinstance(item.get("stats") or item.get("statistics"), dict):
        return None
    stats = item.get("stats") or item.get("statistics") or {}
    stats2 = item.get("statsV2") or {}

    def stat(*keys):
        return max([_int(stats.get(k)) for k in keys] + [_int(stats2.get(k)) for k in keys])

    author = item.get("author") or {}
    if isinstance(author, dict):
        author = author.get("uniqueId") or author.get("unique_id") or ""
    video = item.get("video") or {}
    tags = [t.get("hashtagName") for t in item.get("textExtra") or [] if t.get("hashtagName")]
    has_shop = bool(item.get("anchors") or item.get("products") or item.get("productInfo")
                    or item.get("ecommerce") or item.get("shopProduct"))
    return {
        "id": vid,
        "author": str(author),
        "desc": item.get("desc") or "",
        "hashtags": " ".join(tags),
        "views": stat("playCount", "play_count"),
        "likes": stat("diggCount", "digg_count"),
        "comments": stat("commentCount", "comment_count"),
        "shares": stat("shareCount", "share_count"),
        "saves": stat("collectCount", "collect_count"),
        "duration": _int(video.get("duration")),
        "create_time": _int(item.get("createTime") or item.get("create_time")),
        "is_ad": int(bool(item.get("isAd") or item.get("is_ads"))),
        "has_shop_link": int(has_shop),
        "cover_url": video.get("originCover") or video.get("cover") or "",
    }


def upsert_video(conn: sqlite3.Connection, row: dict, source: str) -> bool:
    """Insert or refresh a video. Returns True if it is new."""
    now = int(time.time())
    existing = conn.execute("SELECT sources FROM videos WHERE id=?", (row["id"],)).fetchone()
    if existing:
        sources = set(json.loads(existing["sources"]))
        sources.add(source)
        conn.execute(
            """UPDATE videos SET views=MAX(views,?), likes=MAX(likes,?), comments=MAX(comments,?),
               shares=MAX(shares,?), saves=MAX(saves,?), cover_url=COALESCE(NULLIF(?,''),cover_url),
               sources=?, last_seen=? WHERE id=?""",
            (row["views"], row["likes"], row["comments"], row["shares"], row["saves"],
             row["cover_url"], json.dumps(sorted(sources)), now, row["id"]),
        )
        return False
    conn.execute(
        """INSERT INTO videos (id, author, desc, hashtags, views, likes, comments, shares, saves,
           duration, create_time, is_ad, has_shop_link, cover_url, sources, first_seen, last_seen)
           VALUES (:id,:author,:desc,:hashtags,:views,:likes,:comments,:shares,:saves,:duration,
           :create_time,:is_ad,:has_shop_link,:cover_url,:sources,:now,:now)""",
        {**row, "sources": json.dumps([source]), "now": now},
    )
    return True


def save_comments(conn, video_id: str, texts: list[str], intent_count: int) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO comments VALUES (?,?,?,?)",
        (video_id, json.dumps(texts, ensure_ascii=False), intent_count, int(time.time())),
    )


def save_analysis(conn, video_id: str, result: dict, score: float, verdict: str) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO analyses VALUES (?,?,?,?,?)",
        (video_id, json.dumps(result, ensure_ascii=False), score, verdict, int(time.time())),
    )


def save_ad_check(conn, video_id: str, result: dict) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO ad_checks VALUES (?,?,?)",
        (video_id, json.dumps(result, ensure_ascii=False), int(time.time())),
    )
