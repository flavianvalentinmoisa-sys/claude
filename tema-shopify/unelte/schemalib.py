"""Ajutoare pentru generarea schemelor JSON ale secțiunilor Carpatica (în română)."""
import json, re, os

ICONS = [
    ("none", "Fără iconiță"), ("check", "Bifă"), ("check_circle", "Bifă în cerc"), ("truck", "Camion livrare"),
    ("truck_fast", "Livrare rapidă"), ("package", "Colet"), ("box_open", "Cutie deschisă"), ("return", "Retur"),
    ("shield", "Garanție / protecție"), ("lock", "Plată sigură"), ("card", "Card"), ("cash", "Numerar / ramburs"),
    ("wallet", "Portofel"), ("star", "Stea"), ("heart", "Inimă"), ("gift", "Cadou"), ("fire", "Foc / popular"),
    ("clock", "Ceas"), ("calendar", "Calendar"), ("phone", "Telefon"), ("chat", "Chat"), ("support", "Asistență"),
    ("email", "Email"), ("map_pin", "Locație"), ("leaf", "Natural / frunză"), ("water", "Picătură apă"),
    ("recycle", "Reciclare"), ("sparkle", "Strălucire"), ("thumbs_up", "Like"), ("users", "Clienți"),
    ("award", "Premiu"), ("medal", "Medalie"), ("percent", "Procent / reducere"), ("tag", "Etichetă"),
    ("eye", "Ochi"), ("lightning", "Fulger / rapid"), ("bolt_battery", "Baterie"), ("globe", "Glob"),
    ("plane", "Avion"), ("home", "Casă"), ("sun", "Soare"), ("moon", "Lună / somn"), ("baby", "Copii"),
    ("paw", "Animale"), ("dumbbell", "Sport / fitness"), ("ruler", "Riglă / mărimi"), ("smile", "Zâmbet"),
    ("info", "Informație"), ("warning", "Atenționare"), ("question", "Întrebare"), ("romania", "Steag"),
    ("flag", "Fanion"), ("arrow_right", "Săgeată"),
]

SIZES = [("small", "Mic"), ("medium", "Mediu"), ("large", "Mare")]
HEADING_SIZES = [("h4", "Mic"), ("h3", "Mediu"), ("h2", "Mare"), ("h1", "Foarte mare"), ("h0", "Extra mare")]
ALIGN = [("left", "Stânga"), ("center", "Centru"), ("right", "Dreapta")]


def hdr(text, info=None):
    o = {"type": "header", "content": text}
    if info: o["info"] = info
    return o


def par(text):
    return {"type": "paragraph", "content": text}


def _base(t, id, label, default=None, info=None, **kw):
    o = {"type": t, "id": id, "label": label}
    if default is not None: o["default"] = default
    if info: o["info"] = info
    o.update(kw)
    return o


def text(id, label, default=None, info=None, placeholder=None):
    o = _base("text", id, label, default, info)
    if placeholder: o["placeholder"] = placeholder
    return o


def textarea(id, label, default=None, info=None, placeholder=None):
    o = _base("textarea", id, label, default, info)
    if placeholder: o["placeholder"] = placeholder
    return o


def inline(id, label, default=None, info=None):
    return _base("inline_richtext", id, label, default, info)


def rich(id, label, default=None, info=None):
    return _base("richtext", id, label, default, info)


def chk(id, label, default=False, info=None):
    return _base("checkbox", id, label, default, info)


def num(id, label, default=None, info=None, placeholder=None):
    o = _base("number", id, label, default, info)
    if placeholder: o["placeholder"] = placeholder
    return o


def rng(id, label, mn, mx, step, default, unit=None, info=None):
    o = {"type": "range", "id": id, "label": label, "min": mn, "max": mx, "step": step, "default": default}
    if unit: o["unit"] = unit
    if info: o["info"] = info
    return o


def sel(id, label, options, default=None, info=None):
    o = {"type": "select", "id": id, "label": label, "options": [{"value": v, "label": l} for v, l in options]}
    o["default"] = default if default is not None else options[0][0]
    if info: o["info"] = info
    return o


def color(id, label, default=None, info=None):
    return _base("color", id, label, default, info)


def color_bg(id, label, info=None):
    return _base("color_background", id, label, None, info)


def image(id, label, info=None):
    return _base("image_picker", id, label, None, info)


def video(id, label, info=None):
    return _base("video", id, label, None, info)


def video_url(id, label, info=None):
    return {"type": "video_url", "id": id, "label": label, "accept": ["youtube", "vimeo"], **({"info": info} if info else {})}


def url(id, label, default=None, info=None):
    return _base("url", id, label, default, info)


def product(id, label, info=None):
    return _base("product", id, label, None, info)


def product_list(id, label, limit=None, info=None):
    o = _base("product_list", id, label, None, info)
    if limit: o["limit"] = limit
    return o


def collection(id, label, info=None):
    return _base("collection", id, label, None, info)


def page(id, label, info=None):
    return _base("page", id, label, None, info)


def link_list(id, label, default=None, info=None):
    return _base("link_list", id, label, default, info)


def liquid(id, label, info=None):
    return _base("liquid", id, label, None, info)


def scheme(id="color_scheme", label="Schemă de culori", default="scheme-1", info=None):
    return _base("color_scheme", id, label, default, info)


def icon(prefix="icon", default="check", label="Iconiță", size=True):
    out = [
        sel(prefix, label, ICONS, default),
        text(f"{prefix}_emoji", "Sau emoji", info="Ex: 🚚. Înlocuiește iconița."),
        image(f"{prefix}_image", "Sau imagine proprie"),
    ]
    return out


def icon_size(id="icon_size", default=22):
    return rng(id, "Mărime iconiță", 12, 64, 2, default, "px")


def margins(top=0, bottom=12):
    return [
        rng("margin_top", "Margine sus", 0, 60, 2, top, "px"),
        rng("margin_bottom", "Margine jos", 0, 60, 2, bottom, "px"),
    ]


def padding(top=36, bottom=36):
    return [
        hdr("Spațiere secțiune"),
        rng("padding_top", "Spațiere sus", 0, 120, 4, top, "px"),
        rng("padding_bottom", "Spațiere jos", 0, 120, 4, bottom, "px"),
    ]


def heading_block(sub="", heading="", text_default="", size="h2", align="center", with_text=True):
    out = [
        text("subheading", "Supratitlu", sub or None),
        inline("heading", "Titlu", heading or None, "Scrie un cuvânt cu italic ca să primească culoarea de accent."),
        sel("heading_size", "Mărime titlu", HEADING_SIZES, size),
    ]
    if with_text:
        out.append(rich("text", "Text", text_default or None))
    out.append(sel("header_alignment", "Aliniere titlu", ALIGN, align))
    return out


def visibility():
    return sel("visibility", "Afișează pe", [("all", "Toate dispozitivele"), ("desktop", "Doar desktop"), ("mobile", "Doar mobil")], "all")


def block(type, name, settings, limit=None):
    o = {"type": type, "name": name, "settings": settings}
    if limit: o["limit"] = limit
    return o


def write_schema(path, schema):
    """Înlocuiește conținutul dintre {% schema %} și {% endschema %} din fișier."""
    t = open(path, encoding="utf-8").read()
    js = json.dumps(schema, ensure_ascii=False, indent=2)
    pat = re.compile(r"{%-?\s*schema\s*-?%}.*?{%-?\s*endschema\s*-?%}", re.S)
    new = "{% schema %}\n" + js + "\n{% endschema %}"
    if pat.search(t):
        t = pat.sub(lambda m: new, t)
    else:
        t = t.rstrip() + "\n\n" + new + "\n"
    open(path, "w", encoding="utf-8").write(t)
    # verificare: ID-uri unice
    def check(settings, where):
        ids = [s["id"] for s in settings if "id" in s]
        dup = {i for i in ids if ids.count(i) > 1}
        assert not dup, f"{path} {where}: ID-uri duplicate {dup}"
    check(schema.get("settings", []), "section")
    for b in schema.get("blocks", []):
        check(b.get("settings", []), b.get("type"))


def anchor():
    return text("anchor", "ID secțiune (ancoră)", info="Folosit de butoanele de derulare. Ex: recenzii → link #recenzii.")


def common_end(color_default="scheme-1", top=48, bottom=48):
    return [hdr("Stil secțiune"), scheme(default=color_default), visibility(), anchor(), *padding(top, bottom)[1:]]


def section_schema(name, settings, blocks=None, presets=None, max_blocks=None, tag="section", cls="section", enabled_on=None, disabled_on=None):
    o = {"name": name, "tag": tag, "class": cls, "settings": settings}
    if blocks is not None: o["blocks"] = blocks
    if max_blocks: o["max_blocks"] = max_blocks
    if presets is not None: o["presets"] = presets
    if enabled_on: o["enabled_on"] = enabled_on
    if disabled_on: o["disabled_on"] = disabled_on
    return o


def buttons(label1="Cumpără acum", link1=None, label2=None):
    BS = [("primary", "Plin"), ("secondary", "Contur"), ("white", "Alb")]
    return [
        hdr("Butoane"),
        text("button_label_1", "Text buton 1", label1),
        url("button_link_1", "Link buton 1", link1),
        sel("button_style_1", "Stil buton 1", BS, "primary"),
        text("button_label_2", "Text buton 2", label2),
        url("button_link_2", "Link buton 2"),
        sel("button_style_2", "Stil buton 2", BS, "secondary"),
    ]

POSITIONS9 = [("top-left", "Sus stânga"), ("top-center", "Sus centru"), ("middle-left", "Mijloc stânga"), ("middle-center", "Mijloc centru"),
              ("middle-right", "Mijloc dreapta"), ("bottom-left", "Jos stânga"), ("bottom-center", "Jos centru")]
