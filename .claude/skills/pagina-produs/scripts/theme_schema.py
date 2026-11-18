"""Read section schemas from the Shopify theme and validate template JSON against them.

Usage as a script (regenerates the human-readable reference):
    python3 theme_schema.py --theme shopify/theme --out references/sectiuni-tema.md
"""
import argparse
import json
import os
import re
import sys

SCHEMA_RE = re.compile(r"{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema\s*-?%}", re.S)


def load_schema(theme_dir, section_type):
    path = os.path.join(theme_dir, "sections", section_type + ".liquid")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        m = SCHEMA_RE.search(f.read())
    return json.loads(m.group(1)) if m else None


def _settings_map(settings):
    return {s["id"]: s for s in settings or [] if "id" in s}


def _check_value(where, sdef, value, errors):
    t = sdef["type"]
    if t == "select" or t == "radio":
        allowed = [o["value"] for o in sdef.get("options", [])]
        if value not in allowed:
            errors.append(f"{where}: '{value}' nu e permis (opțiuni: {allowed})")
    elif t == "range":
        if not isinstance(value, (int, float)):
            errors.append(f"{where}: trebuie număr, nu {value!r}")
        elif not (sdef["min"] <= value <= sdef["max"]):
            errors.append(f"{where}: {value} în afara intervalului {sdef['min']}-{sdef['max']}")
    elif t == "checkbox":
        if not isinstance(value, bool):
            errors.append(f"{where}: trebuie true/false")
    elif t == "number":
        if value not in ("", None) and not isinstance(value, (int, float)):
            errors.append(f"{where}: trebuie număr")
    elif t == "richtext":
        if value and not re.match(r"^\s*<(p|ul|ol|h[1-6])[\s>]", value):
            errors.append(f"{where}: richtext trebuie să înceapă cu <p>, <ul>, <ol> sau <hN>")
    elif t == "inline_richtext":
        if value and re.search(r"<(p|ul|ol|div|h[1-6])[\s>]", value):
            errors.append(f"{where}: inline_richtext nu acceptă <p>/<ul>/<div>/<hN>")
    elif t in ("image_picker", "video"):
        if value and not str(value).startswith("shopify://"):
            errors.append(f"{where}: {t} acceptă doar shopify://shop_images/... (fișiere urcate în Shopify)")


def validate_template(theme_dir, template):
    errors = []
    sections = template.get("sections", {})
    for key in template.get("order", []):
        if key not in sections:
            errors.append(f"order conține '{key}' care nu există în sections")
    for key, sec in sections.items():
        schema = load_schema(theme_dir, sec["type"])
        if schema is None:
            errors.append(f"[{key}] secțiunea '{sec['type']}' nu există în temă")
            continue
        smap = _settings_map(schema.get("settings"))
        for sid, val in (sec.get("settings") or {}).items():
            if sid not in smap:
                errors.append(f"[{key}] setare necunoscută '{sid}'")
            else:
                _check_value(f"[{key}].{sid}", smap[sid], val, errors)
        bdefs = {b["type"]: b for b in schema.get("blocks", [])}
        counts = {}
        blocks = sec.get("blocks") or {}
        for bid in sec.get("block_order", []):
            if bid not in blocks:
                errors.append(f"[{key}] block_order conține '{bid}' inexistent")
        for bid, blk in blocks.items():
            btype = blk["type"]
            if btype not in bdefs:
                errors.append(f"[{key}/{bid}] tip de bloc necunoscut '{btype}'")
                continue
            counts[btype] = counts.get(btype, 0) + 1
            lim = bdefs[btype].get("limit")
            if lim and counts[btype] > lim:
                errors.append(f"[{key}] prea multe blocuri '{btype}' (limită {lim})")
            bmap = _settings_map(bdefs[btype].get("settings"))
            for sid, val in (blk.get("settings") or {}).items():
                if sid not in bmap:
                    errors.append(f"[{key}/{bid}] setare necunoscută '{sid}'")
                else:
                    _check_value(f"[{key}/{bid}].{sid}", bmap[sid], val, errors)
        if schema.get("max_blocks") and len(blocks) > schema["max_blocks"]:
            errors.append(f"[{key}] max {schema['max_blocks']} blocuri")
    return errors


def _fmt_settings(settings, indent):
    lines = []
    for s in settings or []:
        if "id" not in s:
            continue
        extra = ""
        if "options" in s:
            opts = [o["value"] for o in s["options"]]
            extra = " [" + ("|".join(opts) if len(opts) < 12 else f"{len(opts)} opțiuni, ex: " + "|".join(opts[:10]) + "…") + "]"
        if "min" in s:
            extra += f" ({s['min']}–{s['max']})"
        if "default" in s:
            d = json.dumps(s["default"], ensure_ascii=False)
            extra += " = " + (d if len(d) < 70 else d[:67] + "…")
        lines.append(f"{indent}- `{s['id']}` {s['type']}{extra}")
    return lines


def render_reference(theme_dir, section_types):
    out = ["# Secțiunile temei folosite de pagina de produs", "",
           "Generat automat din schema fiecărei secțiuni (`theme_schema.py`). Nu edita de mână.", ""]
    for st in section_types:
        schema = load_schema(theme_dir, st)
        if not schema:
            continue
        out.append(f"## `{st}` — {schema.get('name', '')}")
        out += _fmt_settings(schema.get("settings"), "")
        for b in schema.get("blocks", []):
            if b["type"].startswith("@"):
                continue
            lim = f" (max {b['limit']})" if b.get("limit") else ""
            out.append(f"- **bloc `{b['type']}`**{lim}")
            out += _fmt_settings(b.get("settings"), "  ")
        out.append("")
    return "\n".join(out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--theme", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--sections", nargs="*", default=[
        "main-product", "c-ticker", "c-benefit-cards", "c-media-text", "c-problem-solution",
        "c-results", "c-comparison-table", "c-steps", "c-photo-reviews", "c-guarantee",
        "collapsible-content", "related-products", "c-before-after", "c-product-features",
        "c-icons-with-content", "c-review-marquee", "c-video-reviews"])
    a = ap.parse_args()
    with open(a.out, "w", encoding="utf-8") as f:
        f.write(render_reference(a.theme, a.sections))
    print("scris", a.out, file=sys.stderr)
