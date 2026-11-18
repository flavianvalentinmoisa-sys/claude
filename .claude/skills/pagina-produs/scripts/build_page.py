"""Build a Shopify product page from a product spec (JSON).

Produces, in --out (default: produse/<handle>/):
  - product.<handle>.json  : template-ul paginii (se pune în templates/ în temă)
  - import-produs.csv      : produsul, pentru Shopify Admin → Produse → Import
  - checklist.md           : ce mai trebuie făcut manual în Shopify
With --install, also copies the template into <theme>/templates/.
With --zip, also writes the whole theme (with the new template) as an upload-ready zip.

Usage:
  python3 build_page.py spec.json --theme shopify/theme [--install] [--zip]
"""
import argparse
import copy
import csv
import json
import os
import re
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from theme_schema import validate_template  # noqa: E402

CARD_BG = ["#E6EBDF", "#F6E1D8", "#F3EADD", "#E3E8EE"]
STEP_ACCENT = ["#6B7F5E", "#C8664A", "#55684A", "#8A6F4E"]
# Sections that only appear when the spec provides their content.
CONTENT_SECTIONS = ["benefits_band", "why", "inside", "problem_solution", "results",
                    "compare", "steps", "photo_reviews", "guarantee", "faq"]
DEFAULT_ORDER = ["main", "benefits_band", "why", "inside", "problem_solution", "results",
                 "compare", "steps", "photo_reviews", "guarantee", "faq",
                 "related-products", "disclosures"]

warnings = []


def p(html_or_text):
    """Make sure a richtext value is wrapped in <p>."""
    if not html_or_text:
        return ""
    s = html_or_text.strip()
    return s if re.match(r"^<(p|ul|ol|h[1-6])[\s>]", s) else f"<p>{s}</p>"


def blocks_from(items, prefix, btype, make):
    blocks, order = {}, []
    for i, it in enumerate(items):
        bid = f"{prefix}_{i}"
        blocks[bid] = {"type": btype, "settings": make(i, it)}
        order.append(bid)
    return blocks, order


def drop_empty(d):
    return {k: v for k, v in d.items() if v is not None}


def build_main(sec, spec):
    page = spec.get("page", {})
    prod = spec["product"]
    b = sec["blocks"]
    order = list(sec["block_order"])

    sp = page.get("social_proof")
    if sp and sp.get("rating") and sp.get("review_count"):
        r = float(sp["rating"])
        cnt = f"{int(sp['review_count']):,}".replace(",", ".")
        b["rating"]["settings"].update({"rating": r, "text": f"<strong>{r:g}</strong> ({cnt} recenzii)",
                                         "link_to": "#recenzii" if page.get("reviews") else ""})
        b["sticky"]["settings"].update({"rating": r, "rating_text": f"<strong>{r:g}</strong> ({cnt})"})
    else:
        order.remove("rating")
        b.pop("rating")
        b["sticky"]["settings"].update({"desktop_show_rating": False, "mobile_show_rating": False,
                                         "rating_text": ""})
        b["sticky"]["settings"].pop("rating", None)
    if sp and sp.get("customers_text"):
        b["avatars"]["settings"]["text"] = sp["customers_text"]
    else:
        order.remove("avatars")
        b.pop("avatars")

    offers = page.get("offers")
    if offers:
        s = {"heading": page.get("offers_heading", "Alege oferta potrivită"),
             "preselected": str(page.get("offers_preselected", 2 if len(offers) > 1 else 1)),
             "compare_price": "compare_at" if prod.get("compare_at_price") else "price"}
        for i in range(1, 5):
            o = offers[i - 1] if i <= len(offers) else None
            if o is None:
                s[f"option_{i}_quantity"] = 0
                continue
            s.update(drop_empty({
                f"option_{i}_quantity": int(o["quantity"]),
                f"option_{i}_label": o.get("label", f"{o['quantity']} bucăți"),
                f"option_{i}_badge": o.get("badge", ""),
                f"option_{i}_badge_style": o.get("badge_style"),
                f"option_{i}_benefit": o.get("benefit", ""),
                f"option_{i}_caption": o.get("caption", ""),
                f"option_{i}_discount_percent": int(o.get("discount_percent", 0)),
            }))
        b["quantity_breaks"]["settings"] = s
    else:
        order.remove("quantity_breaks")
        b.pop("quantity_breaks")

    if page.get("benefits"):
        b["benefits"]["settings"]["benefits"] = "\n".join(page["benefits"])
    if page.get("guarantee_note"):
        b["guarantee"]["settings"]["text"] = p(page["guarantee_note"])
    if page.get("delivery_days"):
        lo, hi = page["delivery_days"]
        b["eta"]["settings"].update({"min_days": lo, "max_days": hi})
    if page.get("urgency") is False:
        order.remove("urgency")
        b.pop("urgency")

    tabs = page.get("tabs")
    if tabs:
        for k in [k for k, v in list(b.items()) if v["type"] == "collapsible_tab"]:
            b.pop(k)
            order.remove(k)
        tb, to = blocks_from(tabs, "tab", "collapsible_tab", lambda i, t: drop_empty({
            "heading": t["heading"], "icon": t.get("icon", "check_mark"), "content": p(t["content"])}))
        b.update(tb)
        at = order.index("description") + 1
        order[at:at] = to
    sec["block_order"] = order


def section_header(s, data, keys=("subheading", "heading", "text")):
    for k in keys:
        if k in data:
            s[k] = p(data[k]) if k == "text" else data[k]


def build_sections(t, spec):
    page = spec.get("page", {})
    S = t["sections"]

    if page.get("ticker"):
        bl, bo = blocks_from(page["ticker"], "t", "text", lambda i, x: {
            "text": x["text"], "icon_emoji": x.get("emoji", "")})
        S["benefits_band"].update(blocks=bl, block_order=bo)

    if page.get("why"):
        d = page["why"]
        section_header(S["why"]["settings"], d)
        S["why"]["settings"]["columns_desktop"] = min(max(len(d["cards"]), 1), 4)
        bl, bo = blocks_from(d["cards"], "c", "card", lambda i, c: {
            "background": c.get("background", CARD_BG[i % len(CARD_BG)]),
            "emoji": c.get("emoji", ""), "title": c["title"], "text": p(c["text"])})
        S["why"].update(blocks=bl, block_order=bo)

    if page.get("inside"):
        d = page["inside"]
        st = S["inside"]["settings"]
        st["sticker"] = d.get("sticker", "")
        items = []
        if d.get("subheading"):
            items.append(("subheading", {"text": d["subheading"]}))
        items.append(("heading", {"heading": d["heading"], "heading_size": "h2"}))
        if d.get("text"):
            items.append(("text", {"text": p(d["text"])}))
        if d.get("checklist"):
            items.append(("checklist", {"items": "\n".join(d["checklist"])}))
        items.append(("buttons", {"button_label_1": d.get("button_label", "Comandă acum")}))
        S["inside"]["blocks"] = {f"m_{i}": {"type": ty, "settings": se} for i, (ty, se) in enumerate(items)}
        S["inside"]["block_order"] = [f"m_{i}" for i in range(len(items))]

    if page.get("problem_solution"):
        d = page["problem_solution"]
        st = S["problem_solution"]["settings"]
        section_header(st, d)
        st.update(drop_empty({
            "bad_title": d.get("bad_title", "Fără [produs]"),
            "bad_list": "\n".join(d["bad_list"]),
            "good_title": d.get("good_title", "Cu [produs]"),
            "good_list": "\n".join(d["good_list"]),
            "good_badge": d.get("good_badge"),
            "button_label_1": d.get("button_label", "Vreau și eu"),
        }))

    if page.get("results"):
        d = page["results"]
        section_header(S["results"]["settings"], d)
        S["results"]["settings"]["footnote"] = d.get("footnote", "")
        bl, bo = blocks_from(d["items"], "r", "result", lambda i, r: {
            "percent": int(r["percent"]), "emoji": r.get("emoji", ""), "text": r["text"]})
        S["results"].update(blocks=bl, block_order=bo)

    if page.get("compare"):
        d = page["compare"]
        st = S["compare"]["settings"]
        section_header(st, d)
        st.update(drop_empty({"brand_name": d.get("brand_name"), "competitor_1": d.get("competitor_1"),
                              "competitor_2": d.get("competitor_2"), "button_label": d.get("button_label")}))
        bl, bo = blocks_from(d["rows"], "row", "row", lambda i, r: drop_empty({
            "feature": r["feature"], "us": r.get("us", "yes"), "comp_1": r.get("comp_1", "no"),
            "comp_2": r.get("comp_2")}))
        S["compare"].update(blocks=bl, block_order=bo)

    if page.get("steps"):
        d = page["steps"]
        section_header(S["steps"]["settings"], d)
        bl, bo = blocks_from(d["steps"], "step", "step", lambda i, s: {
            "emoji": s.get("emoji", ""), "accent": s.get("accent", STEP_ACCENT[i % len(STEP_ACCENT)]),
            "title": s["title"], "text": p(s["text"])})
        S["steps"].update(blocks=bl, block_order=bo)

    if page.get("reviews"):
        d = page["reviews"]
        st = S["photo_reviews"]["settings"]
        section_header(st, d)
        if d.get("rating_value"):
            st["rating_value"] = str(d["rating_value"])
            st["rating_count"] = d.get("rating_count", "")
        else:
            st["show_summary"] = False
        if d.get("bars"):
            for star, val in zip([5, 4, 3, 2, 1], d["bars"]):
                st[f"bar_{star}"] = val
        else:
            st["show_bars"] = False
        bl, bo = blocks_from(d["items"], "review", "review", lambda i, r: drop_empty({
            "title": r.get("title", ""), "text": p(r["text"]), "name": r["name"],
            "city": r.get("city", ""), "review_time": r.get("review_time", ""),
            "rating": int(r.get("rating", 5)), "verified": r.get("verified", True),
            "image": r.get("image")}))
        S["photo_reviews"].update(blocks=bl, block_order=bo)

    if page.get("guarantee"):
        d = page["guarantee"]
        st = S["guarantee"]["settings"]
        section_header(st, d)
        st.update(drop_empty({"seal_number": d.get("seal_number"), "seal_label": d.get("seal_label"),
                              "ring_text": d.get("ring_text"),
                              "button_label_1": d.get("button_label", "Comandă fără griji")}))
        if d.get("points"):
            bl, bo = blocks_from(d["points"], "point", "point", lambda i, x: {
                "icon": x.get("icon", "check"), "text": x["text"]})
            S["guarantee"].update(blocks=bl, block_order=bo)

    if page.get("faq"):
        d = page["faq"]
        S["faq"]["settings"]["heading"] = d.get("heading", "Întrebări frecvente")
        bl, bo = blocks_from(d["items"], "q", "collapsible_row", lambda i, q: {
            "heading": q["q"], "icon": q.get("icon", "question_mark"), "row_content": p(q["a"])})
        S["faq"].update(blocks=bl, block_order=bo)

    if page.get("related_heading"):
        S["related-products"]["settings"]["heading"] = page["related_heading"]

    # Which content sections stay on the page
    present = {"benefits_band": "ticker", "why": "why", "inside": "inside",
               "problem_solution": "problem_solution", "results": "results", "compare": "compare",
               "steps": "steps", "photo_reviews": "reviews", "guarantee": "guarantee", "faq": "faq"}
    keep = [k for k in (page.get("order") or DEFAULT_ORDER) if k in S]
    for key in CONTENT_SECTIONS:
        if not page.get(present[key]) and key in keep:
            keep.remove(key)
            warnings.append(f"Secțiunea '{key}' scoasă: lipsește '{present[key]}' din spec.")
    for key in page.get("hide", []):
        if key in keep:
            keep.remove(key)
    for key in list(S):
        if key not in keep:
            S.pop(key)
    t["order"] = keep


def money(v):
    return "" if v in (None, "") else f"{float(v):.2f}"


def write_csv(path, spec):
    prod = spec["product"]
    handle = spec["handle"]
    opts = prod.get("options") or []
    variants = prod.get("variants") or [{"options": [], "price": prod["price"],
                                         "compare_at_price": prod.get("compare_at_price")}]
    images = [i if isinstance(i, dict) else {"src": i} for i in prod.get("images", [])]
    cols = ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
            "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
            "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
            "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price",
            "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
            "Image Src", "Image Position", "Image Alt Text", "SEO Title", "SEO Description",
            "Variant Image", "Variant Weight Unit", "Status"]
    rows = []
    n = max(len(variants), len(images), 1)
    for i in range(n):
        r = {c: "" for c in cols}
        r["Handle"] = handle
        if i == 0:
            r.update({"Title": prod["title"], "Body (HTML)": prod.get("body_html", ""),
                      "Vendor": prod.get("vendor", ""), "Type": prod.get("type", ""),
                      "Tags": ", ".join(prod.get("tags", [])), "Published": "FALSE",
                      "SEO Title": prod.get("seo_title", ""), "SEO Description": prod.get("seo_description", ""),
                      "Status": "draft"})
            if not opts:
                r.update({"Option1 Name": "Title", "Option1 Value": "Default Title"})
        if i < len(variants):
            v = variants[i]
            for j, o in enumerate(opts[:3], 1):
                if i == 0:
                    r[f"Option{j} Name"] = o["name"]
                r[f"Option{j} Value"] = v["options"][j - 1]
            r.update({"Variant SKU": v.get("sku", prod.get("sku", "")),
                      "Variant Grams": v.get("grams", prod.get("grams", 0)),
                      "Variant Inventory Tracker": "shopify",
                      "Variant Inventory Qty": v.get("inventory", prod.get("inventory", 100)),
                      "Variant Inventory Policy": "deny", "Variant Fulfillment Service": "manual",
                      "Variant Price": money(v.get("price", prod["price"])),
                      "Variant Compare At Price": money(v.get("compare_at_price", prod.get("compare_at_price"))),
                      "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
                      "Variant Image": v.get("image", ""), "Variant Weight Unit": "g"})
        if i < len(images):
            r.update({"Image Src": images[i]["src"], "Image Position": i + 1,
                      "Image Alt Text": images[i].get("alt", prod["title"])})
        rows.append(r)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)


def write_checklist(path, spec, template_name):
    page = spec.get("page", {})
    lines = [f"# Checklist — {spec['product']['title']}", "",
             "1. Shopify Admin → Produse → Import → încarcă `import-produs.csv` (produsul intră ca **draft**).",
             f"2. Online Store → Teme → Editează cod → `templates/` → Adaugă template `product` cu numele "
             f"`{template_name}` și lipește conținutul din `product.{template_name}.json` "
             "(sau urcă tema din zip, dacă ai folosit `--zip`).",
             f"3. În pagina produsului (Admin) → Theme template → alege **product.{template_name}**.",
             "4. Verifică pozele importate; înlocuiește pozele luate de la competitor cu poze proprii/ale furnizorului."]
    if page.get("offers"):
        disc = ", ".join(f"{o['quantity']} buc → -{o.get('discount_percent', 0)}%"
                         for o in page["offers"] if o.get("discount_percent"))
        if disc:
            lines.append(f"5. Creează reducerea automată de volum în Shopify (Discounts) — tema doar AFIȘEAZĂ "
                         f"prețul ofertelor, reducerea reală trebuie setată: {disc}.")
    if not page.get("reviews"):
        lines.append("- Recenzii: secțiunea de recenzii e scoasă. Adaug-o după ce ai recenzii reale (import din app/clienți).")
    if not page.get("social_proof"):
        lines.append("- Rating/număr clienți: ascunse până ai date reale.")
    if not page.get("results"):
        lines.append("- Secțiunea de rezultate procentuale e scoasă (nu avem date măsurate).")
    lines.append("- Publică produsul (Status: Active) după ce verifici pagina în preview.")
    if warnings:
        lines += ["", "## Note de la build"] + [f"- {w}" for w in warnings]
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--theme", default="shopify/theme")
    ap.add_argument("--base", default="product.json", help="template de pornire din <theme>/templates")
    ap.add_argument("--out")
    ap.add_argument("--install", action="store_true", help="copiază template-ul în <theme>/templates")
    ap.add_argument("--zip", action="store_true", help="scrie și tema completă ca zip")
    a = ap.parse_args()

    with open(a.spec, encoding="utf-8") as f:
        spec = json.load(f)
    handle = spec["handle"]
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", handle):
        sys.exit(f"handle invalid: {handle!r} (doar litere mici, cifre, cratimă)")
    out = a.out or os.path.join("produse", handle)
    os.makedirs(out, exist_ok=True)

    with open(os.path.join(a.theme, "templates", a.base), encoding="utf-8") as f:
        t = json.load(f)
    t = copy.deepcopy(t)
    build_main(t["sections"]["main"], spec)
    build_sections(t, spec)

    errors = validate_template(a.theme, t)
    if errors:
        print("ERORI de validare față de tema:", *errors, sep="\n  ", file=sys.stderr)
        sys.exit(1)

    tpl_file = f"product.{handle}.json"
    with open(os.path.join(out, tpl_file), "w", encoding="utf-8") as f:
        json.dump(t, f, ensure_ascii=False, indent=2)
    write_csv(os.path.join(out, "import-produs.csv"), spec)
    write_checklist(os.path.join(out, "checklist.md"), spec, handle)

    if a.install or a.zip:
        with open(os.path.join(a.theme, "templates", tpl_file), "w", encoding="utf-8") as f:
            json.dump(t, f, ensure_ascii=False, indent=2)
    if a.zip:
        zpath = os.path.join(out, f"tema-cu-{handle}.zip")
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(a.theme):
                for fn in files:
                    full = os.path.join(root, fn)
                    z.write(full, os.path.relpath(full, a.theme))
        print("zip:", zpath)

    for w in warnings:
        print("atenție:", w, file=sys.stderr)
    print("OK →", out)


if __name__ == "__main__":
    main()
