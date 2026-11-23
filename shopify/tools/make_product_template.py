#!/usr/bin/env python3
"""Generează templates/product.<sufix>.json pentru un produs, pornind de la
base/product.base.json (template-ul complet al temei) și un fișier scurt de
conținut din products/<sufix>.json.

Utilizare:
    python3 tools/make_product_template.py products/exemplu.json
    python3 tools/make_product_template.py products/*.json

Fiecare cheie din fișierul de conținut e opțională. Ce lipsește rămâne ca în
template-ul de bază. O secțiune setată pe null e scoasă din pagină.
"""
import copy
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = ROOT / "base" / "product.base.json"
OUT = ROOT / "templates"

CARD_COLORS = ["#E6EBDF", "#F6E1D8", "#F3EADD", "#FBE9D9"]
STEP_ACCENTS = ["#6B7F5E", "#C8664A", "#55684A", "#C8664A"]


def blocks(prefix, items, build):
    out = {f"{prefix}_{i}": build(i, it) for i, it in enumerate(items)}
    return out, list(out)


def set_blocks(section, prefix, items, build):
    section["blocks"], section["block_order"] = blocks(prefix, items, build)


def lines(v):
    return "\n".join(v) if isinstance(v, list) else v


def apply(spec, tpl):
    S = tpl["sections"]
    main = S["main"]["blocks"]

    # ---- zona de cumpărare (main-product) ----
    if "rating" in spec:
        r = spec["rating"]
        if r is None:
            main.pop("rating", None)
        else:
            main["rating"]["settings"].update(rating=r["value"], text=r["text"])
            main["sticky"]["settings"].update(rating=r["value"], rating_text=r.get("short", r["text"]))
    if "avatars_text" in spec:
        if spec["avatars_text"] is None:
            main.pop("avatars", None)
        else:
            main["avatars"]["settings"]["text"] = spec["avatars_text"]
    if "benefits_list" in spec:
        main["benefits"]["settings"]["benefits"] = lines(spec["benefits_list"])
    if "guarantee_text" in spec:
        main["guarantee"]["settings"]["text"] = spec["guarantee_text"]
    if "tabs" in spec:
        for key, tab in zip(("shipping", "returns"), spec["tabs"]):
            main[key]["settings"].update(heading=tab["heading"], content=tab["content"])
    if "quantity_breaks" in spec and spec["quantity_breaks"] is None:
        main.pop("quantity_breaks", None)
    order = S["main"].get("block_order")
    if order:
        S["main"]["block_order"] = [b for b in order if b in main]

    # ---- secțiunile de sub produs ----
    if spec.get("ticker"):
        set_blocks(S["benefits_band"], "t", spec["ticker"], lambda i, t: {
            "type": "text", "settings": {"text": t["text"], "icon_emoji": t.get("emoji", "")}})

    if spec.get("why"):
        w = spec["why"]
        st = S["why"]["settings"]
        for k in ("subheading", "heading"):
            if k in w:
                st[k] = w[k]
        if "cards" in w:
            st["columns_desktop"] = min(4, len(w["cards"]))
            set_blocks(S["why"], "c", w["cards"], lambda i, c: {"type": "card", "settings": {
                "background": c.get("background", CARD_COLORS[i % 4]), "emoji": c.get("emoji", ""),
                "title": c["title"], "text": c["text"]}})

    if spec.get("inside"):
        m = spec["inside"]
        b = S["inside"]["blocks"]
        if "subheading" in m: b["m_0"]["settings"]["text"] = m["subheading"]
        if "heading" in m: b["m_1"]["settings"]["heading"] = m["heading"]
        if "text" in m: b["m_2"]["settings"]["text"] = m["text"]
        if "checklist" in m: b["m_3"]["settings"]["items"] = lines(m["checklist"])
        if "button" in m: b["m_4"]["settings"]["button_label_1"] = m["button"]
        if "image" in m:
            S["inside"]["settings"].update(image=m["image"], use_product_image=False)

    if spec.get("problem_solution"):
        p = dict(spec["problem_solution"])
        for k in ("bad_list", "good_list"):
            if k in p: p[k] = lines(p[k])
        S["problem_solution"]["settings"].update(p)

    if spec.get("results"):
        r = spec["results"]
        for k in ("subheading", "heading", "footnote"):
            if k in r: S["results"]["settings"][k] = r[k]
        if "items" in r:
            set_blocks(S["results"], "r", r["items"], lambda i, x: {"type": "result", "settings": {
                "percent": x["percent"], "emoji": x.get("emoji", ""), "text": x["text"]}})

    if spec.get("compare"):
        c = spec["compare"]
        for k in ("heading", "brand_name", "competitor_1"):
            if k in c: S["compare"]["settings"][k] = c[k]
        if "rows" in c:
            set_blocks(S["compare"], "row", c["rows"], lambda i, r: {"type": "row", "settings": {
                "feature": r[0], "us": r[1] if len(r) > 1 else "yes", "comp_1": r[2] if len(r) > 2 else "no"}})

    if spec.get("steps"):
        s = spec["steps"]
        for k in ("subheading", "heading"):
            if k in s: S["steps"]["settings"][k] = s[k]
        if "items" in s:
            set_blocks(S["steps"], "step", s["items"], lambda i, x: {"type": "step", "settings": {
                "emoji": x.get("emoji", ""), "title": x["title"], "text": x["text"],
                "accent": x.get("accent", STEP_ACCENTS[i % 4])}})

    if spec.get("reviews"):
        set_blocks(S["photo_reviews"], "review", spec["reviews"], lambda i, r: {"type": "review", "settings": {
            k: v for k, v in r.items() if k in ("title", "text", "name", "city", "rating", "review_time", "image", "image_2")}})

    if spec.get("faq"):
        set_blocks(S["faq"], "q", spec["faq"], lambda i, q: {"type": "collapsible_row", "settings": {
            "heading": q["q"], "icon": q.get("icon", "question_mark"), "row_content": q["a"]}})

    # ---- setări arbitrare: {"sectiune.settings.cheie": valoare} ----
    for path, value in spec.get("overrides", {}).items():
        node = S
        *parts, last = path.split(".")
        for part in parts:
            node = node[part]
        node[last] = value

    # ---- secțiuni scoase din pagină ----
    for key, val in spec.items():
        if val is None and key in S:
            del S[key]
    for key in spec.get("remove", []):
        S.pop(key, None)
    tpl["order"] = [k for k in tpl["order"] if k in S]
    return tpl


def main(paths):
    base = json.loads(BASE.read_text(encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    for p in paths:
        spec = json.loads(pathlib.Path(p).read_text(encoding="utf-8"))
        suffix = spec.get("template_suffix") or pathlib.Path(p).stem
        tpl = apply(spec, copy.deepcopy(base))
        out = OUT / f"product.{suffix}.json"
        out.write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{p} -> {out.relative_to(ROOT)}  ({len(tpl['order'])} secțiuni)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
