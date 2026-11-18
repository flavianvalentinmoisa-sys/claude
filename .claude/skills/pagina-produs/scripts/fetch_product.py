"""Extract raw product data from a competitor / AliExpress / Alibaba / Temu / Shopify URL.

Prints normalized JSON on stdout:
  {source_url, platform, title, description, price, compare_at_price, currency,
   images:[...], options:[{name, values}], variants:[{options, price, compare_at_price}], notes:[...]}

Usage:
  python3 fetch_product.py URL                 # HTTP fetch (Shopify .js endpoint first)
  python3 fetch_product.py URL --browser       # render with Playwright (AliExpress/Alibaba often need it)
  python3 fetch_product.py URL --html page.html  # parse a page saved by the user
"""
import argparse
import html as htmlmod
import json
import re
import sys
import urllib.parse
import urllib.request

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")


def platform_of(url):
    host = urllib.parse.urlparse(url).netloc.lower()
    for k in ("aliexpress", "alibaba", "1688", "temu", "amazon", "emag"):
        if k in host:
            return k
    return "site"


def strip_tags(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s or "", flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>|</p>|</li>|</h\d>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = htmlmod.unescape(s)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", s)).strip()


def abs_img(u, base):
    if not u:
        return None
    u = u.strip()
    if u.startswith("//"):
        u = "https:" + u
    u = urllib.parse.urljoin(base, u)
    # drop resize suffixes used by AliExpress/Alibaba CDNs: .jpg_220x220.jpg / _Q90.jpg_.webp
    u = re.sub(r"(\.(?:jpe?g|png|webp))_[^/?#]*$", r"\1", u, flags=re.I)
    return u


def uniq(seq):
    seen, out = set(), []
    for x in seq:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


def try_shopify(url):
    pr = urllib.parse.urlparse(url)
    m = re.search(r"/products/([^/?#]+)", pr.path)
    if not m:
        return None
    js_url = f"{pr.scheme}://{pr.netloc}/products/{m.group(1)}.js"
    try:
        d = json.loads(get(js_url))
    except Exception:
        return None
    cents = lambda v: None if v in (None, 0) else round(v / 100, 2)  # noqa: E731
    variants = [{"options": v.get("options", []), "price": cents(v.get("price")),
                 "compare_at_price": cents(v.get("compare_at_price")), "sku": v.get("sku") or "",
                 "image": abs_img((v.get("featured_image") or {}).get("src"), url)}
                for v in d.get("variants", [])]
    opts = d.get("options") or []
    opts = [{"name": o["name"], "values": o["values"]} for o in opts if isinstance(o, dict)]
    if len(opts) == 1 and opts[0]["name"] == "Title":
        opts = []
    return {"platform": "shopify", "title": d.get("title"), "description": strip_tags(d.get("description")),
            "description_html": d.get("description"), "vendor": d.get("vendor"), "type": d.get("type"),
            "tags": d.get("tags", []), "price": cents(d.get("price")),
            "compare_at_price": cents(d.get("compare_at_price")),
            "images": uniq(abs_img(i, url) for i in d.get("images", [])), "options": opts,
            "variants": variants}


def parse_html(page, url):
    out = {"platform": platform_of(url), "title": None, "description": None, "price": None,
           "compare_at_price": None, "currency": None, "images": [], "options": [], "variants": [], "notes": []}

    # JSON-LD Product
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(block.strip())
        except Exception:
            continue
        stack = data if isinstance(data, list) else [data]
        while stack:
            n = stack.pop()
            if isinstance(n, dict):
                if "@graph" in n:
                    stack += n["@graph"]
                t = n.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    out["title"] = out["title"] or n.get("name")
                    out["description"] = out["description"] or strip_tags(n.get("description"))
                    imgs = n.get("image") or []
                    imgs = imgs if isinstance(imgs, list) else [imgs]
                    out["images"] += [abs_img(i if isinstance(i, str) else i.get("url"), url) for i in imgs]
                    offers = n.get("offers") or {}
                    offers = offers[0] if isinstance(offers, list) and offers else offers
                    if isinstance(offers, dict):
                        out["price"] = out["price"] or offers.get("price") or offers.get("lowPrice")
                        out["currency"] = out["currency"] or offers.get("priceCurrency")
                    agg = n.get("aggregateRating")
                    if agg:
                        out["notes"].append(f"rating sursă: {agg.get('ratingValue')} din {agg.get('reviewCount') or agg.get('ratingCount')} (doar informativ, NU se copiază pe pagina ta)")

    def meta(prop):
        m = re.search(r'<meta[^>]+(?:property|name)=["\']%s["\'][^>]+content=["\']([^"\']*)' % re.escape(prop), page, re.I) \
            or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']%s["\']' % re.escape(prop), page, re.I)
        return htmlmod.unescape(m.group(1)) if m else None

    out["title"] = out["title"] or meta("og:title") or strip_tags((re.search(r"<title>(.*?)</title>", page, re.S | re.I) or [None, ""])[1])
    out["description"] = out["description"] or meta("og:description") or meta("description")
    out["price"] = out["price"] or meta("product:price:amount") or meta("og:price:amount")
    out["currency"] = out["currency"] or meta("product:price:currency") or meta("og:price:currency")
    if meta("og:image"):
        out["images"].append(abs_img(meta("og:image"), url))

    # AliExpress / Alibaba embedded data
    for key in ("imagePathList", "imageList", "images"):
        m = re.search(r'"%s"\s*:\s*(\[[^\]]*\])' % key, page)
        if m:
            try:
                out["images"] += [abs_img(x if isinstance(x, str) else (x.get("url") or x.get("imageUrl")), url)
                                  for x in json.loads(m.group(1))]
            except Exception:
                pass
    m = re.search(r'"subject"\s*:\s*"([^"]{5,300})"', page)
    if m and out["platform"] in ("aliexpress", "alibaba", "1688"):
        out["title"] = out["title"] or json.loads(f'"{m.group(1)}"')
    for name, values in re.findall(r'"skuPropertyName"\s*:\s*"([^"]+)".{0,4000}?"skuPropertyValues"\s*:\s*(\[.*?\])\s*[,}]', page, re.S)[:3]:
        vals = re.findall(r'"propertyValueDisplayName"\s*:\s*"([^"]+)"', values)
        if vals:
            out["options"].append({"name": name, "values": uniq(vals)})
    if out["platform"] in ("aliexpress", "alibaba", "1688", "temu"):
        out["images"] += [abs_img(u, url) for u in re.findall(
            r'(?:https?:)?//[a-z0-9.-]*(?:alicdn|aliexpress-media|kwcdn)\.com/[^"\'\s)]+?\.(?:jpe?g|png|webp)', page, re.I)]

    imgs = [i for i in uniq(out["images"]) if i and not re.search(r"(logo|icon|sprite|avatar|flag)", i, re.I)]
    out["images"] = imgs[:25]
    if not out["description"]:
        body = re.search(r"<body.*?</body>", page, re.S | re.I)
        out["description"] = strip_tags(body.group(0))[:6000] if body else None
    return out


def render_with_browser(url):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(user_agent=UA, locale="ro-RO", viewport={"width": 1366, "height": 900})
        pg.goto(url, wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(4000)
        for _ in range(6):
            pg.mouse.wheel(0, 1500)
            pg.wait_for_timeout(500)
        html = pg.content()
        b.close()
    return html


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--browser", action="store_true")
    ap.add_argument("--html")
    a = ap.parse_args()

    data = None
    if not a.html and not a.browser:
        data = try_shopify(a.url)
    if data is None:
        try:
            if a.html:
                page = open(a.html, encoding="utf-8", errors="replace").read()
            elif a.browser:
                page = render_with_browser(a.url)
            else:
                page = get(a.url)
        except Exception as e:
            print(json.dumps({"source_url": a.url, "error": f"{type(e).__name__}: {e}",
                              "hint": "Încearcă --browser; dacă rețeaua blochează host-ul, cere utilizatorului "
                                      "să salveze pagina (Ctrl+S) și rulează cu --html, sau să lipească textul/pozele."},
                             ensure_ascii=False, indent=2))
            sys.exit(2)
        data = parse_html(page, a.url)
    data["source_url"] = a.url
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
