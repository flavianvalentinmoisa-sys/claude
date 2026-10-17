"""Definițiile blocurilor Carpatica pentru secțiunile de produs (main-product, featured-product)."""
from schemalib import *

DATE_FORMATS = [
    ("weekday_day_month", "luni, 20 octombrie"),
    ("weekday_short_day_month", "Lun, 20 oct."),
    ("day_month", "20 octombrie"),
    ("day_month_short", "20 oct."),
    ("numeric", "20.10"),
    ("numeric_year", "20.10.2026"),
]
CONV_COLORS = [("accent", "Accent"), ("savings", "Economii (verde)"), ("urgency", "Urgență (roșu)")]
BADGE_STYLES = [("accent", "Accent"), ("savings", "Economii"), ("urgency", "Urgență"), ("dark", "Închis")]


def quantity_breaks():
    s = [
        par("Afișează oferte pe cantitate (1 / 2 / 3 bucăți). Reducerile se aplică doar dacă creezi reducerea automată corespunzătoare în Shopify > Reduceri."),
        inline("heading", "Titlu", "Alege oferta potrivită"),
        sel("style", "Stil", [("normal", "Normal (listă)"), ("compact", "Compact"), ("horizontal", "Orizontal (coloane)")], "normal"),
        sel("preselected", "Opțiune selectată implicit", [("1", "#1"), ("2", "#2"), ("3", "#3"), ("4", "#4")], "2"),
        chk("show_radio", "Afișează cerculețul de selecție", True),
        chk("show_savings", "Afișează „Economisești X”", True),
        sel("compare_price", "Preț tăiat calculat din", [("price", "Prețul normal × cantitate"), ("compare_at", "Prețul comparat (tăiat) × cantitate")], "compare_at"),
        rng("border_radius", "Rotunjire colțuri", 0, 24, 1, 12, "px"),
        rng("image_width", "Lățime imagini", 32, 96, 4, 56, "px"),
        hdr("Variante per bucată"),
        chk("enable_variant_selectors", "Permite alegerea variantei pentru fiecare bucată", False, "Ex: 2 tricouri în mărimi diferite."),
        chk("skip_unavailable", "Ascunde variantele epuizate", True),
    ]
    defaults = {
        1: ("1", "1 bucată", "", "", 0, "Preț standard"),
        2: ("2", "2 bucăți", "Cel mai popular", "Economisești 15%", 15, "Livrare gratuită inclusă"),
        3: ("3", "3 bucăți", "Cea mai bună ofertă", "Economisești 25%", 25, "Livrare gratuită + cadou"),
        4: ("0", "4 bucăți", "", "", 30, ""),
    }
    for i in range(1, 5):
        q, label, badge, benefit, pct, caption = defaults[i]
        s += [
            hdr(f"Opțiunea #{i}"),
            rng(f"option_{i}_quantity", "Cantitate", 0, 10, 1, int(q), info="0 = ascunde opțiunea"),
            text(f"option_{i}_label", "Text", label),
            text(f"option_{i}_badge", "Etichetă", badge or None),
            sel(f"option_{i}_badge_style", "Culoare etichetă", BADGE_STYLES, "accent" if i != 3 else "savings"),
            text(f"option_{i}_benefit", "Beneficiu", benefit or None),
            inline(f"option_{i}_caption", "Subtext", caption or None),
            image(f"option_{i}_image", "Imagine"),
            rng(f"option_{i}_discount_percent", "Reducere procentuală", 0, 90, 1, pct, "%"),
            num(f"option_{i}_discount_amount", "Sau reducere fixă (lei)", info="Folosită doar dacă reducerea procentuală este 0."),
            text(f"option_{i}_price_text", "Text preț personalizat", info="Opțional. Poți folosi [price] și [unit_price]. Ex: [unit_price] / buc."),
        ]
    s += margins(12, 16)
    return block("quantity_breaks", "Reduceri la cantitate", s, 1)


def bundle_offer():
    s = [
        par("Produsul curent + până la 3 produse, adăugate împreună în coș cu un singur buton. Reducerile afișate se aplică doar dacă creezi o reducere automată pentru pachet."),
        inline("title", "Titlu", "Cumpărate frecvent împreună"),
        text("main_label", "Etichetă produs curent", "Acest produs"),
        rng("main_discount_percent", "Reducere produs curent", 0, 90, 1, 0, "%"),
        chk("show_images", "Afișează imaginile", True),
        chk("title_link", "Titlurile duc la pagina produsului", False),
        chk("use_compare_at", "Folosește prețul comparat ca preț tăiat", True),
        chk("show_savings", "Afișează „Economisești X”", True),
        text("total_label", "Text total", "Total pachet:"),
        text("button_label", "Text buton", "Adaugă pachetul în coș"),
        scheme(default="scheme-1"),
    ]
    for i in range(1, 4):
        s += [
            hdr(f"Produsul #{i}"),
            product(f"product_{i}", "Produs"),
            inline(f"product_{i}_desc", "Descriere scurtă"),
            rng(f"product_{i}_discount", "Reducere", 0, 100, 1, 10 if i == 1 else 0, "%", "100% = gratuit"),
        ]
    s += margins(12, 16)
    return block("bundle_offer", "Ofertă pachet", s, 1)


def product_upsell():
    s = [
        par("Produse bifabile adăugate în coș împreună cu produsul principal."),
        inline("heading", "Titlu", "Adaugă la comandă"),
        product_list("products", "Produse", 3),
        sel("layout", "Aranjare", [("list", "Listă"), ("grid", "Grilă")], "list"),
        chk("show_images", "Afișează imaginile", True),
        chk("show_variant_picker", "Afișează selectorul de variante", True),
        chk("hide_compare_price", "Ascunde prețul tăiat", False),
        scheme(default="scheme-1"),
    ]
    for i in range(1, 4):
        s += [
            hdr(f"Produsul #{i} din listă"),
            chk(f"product_{i}_preselected", "Bifat implicit", False),
            inline(f"product_{i}_desc", "Descriere scurtă"),
            rng(f"product_{i}_discount", "Reducere afișată", 0, 100, 1, 0, "%"),
        ]
    s += margins(12, 16)
    return block("product_upsell", "Produse upsell", s)


def quantity_gifts():
    s = [
        par("Cadourile se deblochează la cantitatea aleasă și se adaugă automat în coș. Setează prețul cadoului la 0 lei sau creează o reducere automată pentru el."),
        inline("heading", "Titlu", "🎁 Cadouri incluse în comandă"),
        text("locked_text", "Text cadou blocat", "De la [quantity] buc."),
    ]
    for i in range(1, 5):
        s += [
            hdr(f"Cadoul #{i}"),
            product(f"gift_{i}", "Produs cadou"),
            num(f"gift_{i}_quantity", "Cantitate minimă", i + 1),
            image(f"gift_{i}_image", "Imagine (opțional)"),
            inline(f"gift_{i}_label", "Text", info="Implicit: titlul produsului. Poți folosi [quantity]."),
        ]
    s += margins(12, 16)
    return block("quantity_gifts", "Cadouri la cantitate", s, 1)


def sticky_atc():
    s = [
        sel("function", "La apăsare", [("add", "Adaugă în coș"), ("scroll", "Derulează la formular")], "add"),
        sel("display_when", "Afișează", [("after", "După ce clientul trece de butonul principal"), ("always", "Oricând butonul principal nu e vizibil")], "after"),
        text("button_label", "Text buton", info="Implicit: „Adaugă în coș”."),
        chk("price_in_button", "Afișează prețul în buton", False),
        color("button_color", "Culoare buton (opțional)"),
        scheme(default="scheme-1"),
        hdr("Rating"),
        rng("rating", "Notă", 3, 5, 0.1, 4.9),
        inline("rating_text", "Text rating", info="Ex: 4.9 (1.200+ recenzii). Lasă gol pentru a ascunde."),
        hdr("Desktop"),
        chk("desktop_show_image", "Imagine produs", True),
        chk("desktop_show_title", "Titlu produs", True),
        chk("desktop_show_price", "Preț", True),
        chk("desktop_show_rating", "Rating", True),
        chk("desktop_show_variants", "Selector variante", True),
        hdr("Mobil"),
        chk("mobile_show_image", "Imagine produs", True),
        chk("mobile_show_title", "Titlu produs", True),
        chk("mobile_show_price", "Preț", True),
        chk("mobile_show_rating", "Rating", False),
        chk("mobile_show_variants", "Selector variante", False),
        chk("mobile_full_button", "Doar butonul, pe toată lățimea", False),
    ]
    return block("sticky_atc", "Adaugă în coș fix", s, 1)


def stars(trustpilot=False):
    s = [
        rng("rating", "Notă", 1, 5, 0.1, 4.8),
        inline("text", "Text", "<strong>4.8</strong> (2.341 recenzii)" if not trustpilot else "Excelent pe <strong>Trustpilot</strong>"),
        chk("use_metafield", "Folosește ratingul din aplicația de recenzii (metafield)", False, "Poți folosi [rating] și [count] în text."),
        rng("star_size", "Mărime stele", 12, 32, 1, 18 if not trustpilot else 20, "px"),
    ]
    if not trustpilot:
        s.append(color("star_color", "Culoare stele", info="Implicit: din Setări temă > Culori conversie."))
    s += [
        url("link_to", "Link (opțional)", info="Ex: #recenzii pentru a derula la secțiunea de recenzii."),
        sel("alignment", "Aliniere", ALIGN, "left"),
        *margins(0, 10),
    ]
    return block("trustpilot_stars" if trustpilot else "rating_stars", "Stele Trustpilot" if trustpilot else "Stele rating", s, 1)


def clickable_discount():
    s = [
        text("code", "Cod de reducere", "BINE10", "Creează codul în Shopify > Reduceri."),
        inline("text", "Text", "Click aici pentru a aplica <strong>10% reducere</strong>"),
        inline("applied_text", "Text după aplicare", "Codul <strong>[code]</strong> a fost aplicat! Reducerea apare la finalizarea comenzii."),
        *icon(default="percent")[:2],
        color("bg_color", "Fundal"),
        color("text_color", "Text"),
        color("bg_color_applied", "Fundal după aplicare"),
        color("text_color_applied", "Text după aplicare"),
        *margins(8, 12),
    ]
    return block("clickable_discount", "Cod reducere cu un click", s, 1)


def urgency():
    s = [
        inline("text", "Text", "🔥 Doar <strong>[stock]</strong> bucăți rămase în stoc", "Folosește [stock] pentru stocul real al variantei."),
        sel("style", "Stil", [("plain", "Simplu"), ("boxed", "Casetă colorată")], "plain"),
        sel("color", "Culoare indicator", CONV_COLORS, "urgency"),
        chk("show_pulse", "Punct pulsatil", True),
        chk("only_low_stock", "Afișează doar când stocul este redus", True),
        rng("threshold", "Prag stoc redus", 1, 50, 1, 10),
        chk("show_bar", "Bară de stoc", False),
        rng("bar_max", "Stoc corespunzător barei pline", 10, 100, 5, 30),
        *margins(4, 12),
    ]
    return block("urgency", "Text urgență", s, 1)


def emoji_benefits():
    return block("emoji_benefits", "Beneficii (emoji)", [
        textarea("benefits", "Beneficii", "✅ Livrare în 24–48 de ore\n💵 Plata ramburs la curier\n↩️ Retur gratuit în 30 de zile\n🇷🇴 Stoc în România", "Câte un beneficiu pe rând."),
        sel("layout", "Aranjare", [("one-column", "O coloană"), ("two-columns", "Două coloane")], "one-column"),
        *margins(8, 12),
    ], 1)


def payment_badges():
    return block("payment_badges", "Metode de plată", [
        inline("text", "Text", "Plată 100% sigură"),
        chk("show_cod", "Afișează „Ramburs”", True),
        text("cod_label", "Text ramburs", "Ramburs"),
        sel("alignment", "Aliniere", ALIGN, "left"),
        *margins(8, 12),
    ], 1)


def estimated_shipping():
    return block("estimated_shipping", "Livrare estimată", [
        inline("text", "Text", "Comanzi azi și primești între [min_date] și [max_date]", "[min_date] și [max_date] se înlocuiesc cu datele calculate."),
        num("min_days", "Zile minime", 1),
        num("max_days", "Zile maxime", 3),
        chk("skip_weekends", "Doar zile lucrătoare", True),
        rng("cutoff_hour", "Ora limită pentru expediere azi", 0, 23, 1, 0, "h", "După această oră se pornește de mâine. 0 = dezactivat."),
        sel("date_format", "Format dată", DATE_FORMATS, "weekday_day_month"),
        sel("style", "Stil", [("plain", "Simplu"), ("boxed", "Casetă")], "boxed"),
        *icon(default="truck"),
        icon_size(default=24),
        *margins(8, 12),
    ], 1)


def shipping_checkpoints():
    s = [
        inline("heading", "Titlu"),
        sel("date_format", "Format dată", DATE_FORMATS, "day_month_short"),
        chk("skip_weekends", "Doar zile lucrătoare", True),
        rng("cutoff_hour", "Ora limită pentru expediere azi", 0, 23, 1, 0, "h"),
        sel("accent", "Culoare", CONV_COLORS, "accent"),
    ]
    defaults = [("Comandat", 0, "check"), ("Expediat", 1, "package"), ("Livrat", 3, "home"), ("", 0, "check")]
    for i, (label, days, ic) in enumerate(defaults, start=1):
        s += [
            hdr(f"Pasul #{i}"),
            text(f"step_{i}_label", "Text", label or None, "Lasă gol pentru a ascunde." if i == 4 else None),
            num(f"step_{i}_days", "Zile de la comandă", days),
            sel(f"step_{i}_icon", "Iconiță", ICONS, ic),
        ]
    s += margins(8, 12)
    return block("shipping_checkpoints", "Pași de livrare", s, 1)


def scroll_buttons():
    s = [
        par("Butoane care derulează la alte secțiuni din pagină. Ținta este ID-ul secțiunii sau un selector, ex: #recenzii."),
        sel("layout", "Aranjare", [("inline", "Pe un rând"), ("grid", "Grilă 2 coloane")], "inline"),
    ]
    defaults = [("Recenzii", "#recenzii", "star"), ("Detalii", "#detalii", "info"), ("", "", "check"), ("", "", "check")]
    for i, (label, target, ic) in enumerate(defaults, start=1):
        s += [
            hdr(f"Butonul #{i}"),
            text(f"button_{i}_label", "Text", label or None),
            text(f"button_{i}_target", "Țintă", target or None),
            sel(f"button_{i}_icon", "Iconiță", ICONS, ic),
        ]
    s += margins(8, 12)
    return block("scroll_buttons", "Butoane de derulare", s)


def review_avatars():
    s = [
        inline("text", "Text", "Peste <strong>10.000</strong> de clienți mulțumiți"),
        chk("show_stars", "Afișează stele", True),
        rng("rating", "Notă", 3, 5, 0.1, 4.9),
        rng("avatar_size", "Mărime poze", 24, 64, 2, 36, "px"),
        sel("alignment", "Aliniere", ALIGN, "left"),
    ]
    for i in range(1, 6):
        s.append(image(f"avatar_{i}", f"Poza #{i}"))
    s += margins(8, 12)
    return block("review_avatars", "Avatare recenzii", s)


def text_with_icon():
    return block("text_with_icon", "Text cu iconiță", [
        rich("text", "Text", "<p><strong>Garanție 2 ani.</strong> Îți înlocuim produsul gratuit dacă apare orice problemă.</p>"),
        *icon(default="shield"),
        icon_size(default=24),
        color("icon_color", "Culoare iconiță"),
        chk("show_background", "Fundal (casetă)", True),
        color("background", "Culoare fundal"),
        color("text_color", "Culoare text"),
        sel("alignment", "Aliniere", ALIGN, "left"),
        *margins(8, 12),
    ])


def image_block():
    return block("image", "Imagine", [
        image("image", "Imagine"),
        url("link", "Link"),
        rng("width", "Lățime", 20, 100, 5, 100, "%"),
        rng("radius", "Rotunjire colțuri", 0, 40, 2, 12, "px"),
        sel("alignment", "Aliniere", ALIGN, "center"),
        *margins(8, 12),
    ])


def video_block():
    return block("video", "Video", [
        video("video", "Video găzduit pe Shopify"),
        video_url("video_url", "Sau link YouTube / Vimeo"),
        chk("autoplay", "Redare automată fără sonor (în buclă)", True),
        chk("controls", "Afișează controalele", False),
        rng("radius", "Rotunjire colțuri", 0, 40, 2, 12, "px"),
        *margins(8, 12),
    ])


def divider():
    return block("divider", "Separator", [
        text("text", "Text în mijloc (opțional)"),
        rng("thickness", "Grosime", 1, 6, 1, 1, "px"),
        rng("opacity", "Opacitate", 5, 100, 5, 15, "%"),
        *margins(12, 12),
    ])


def link_button():
    return block("link_button", "Buton link", [
        text("label", "Text", "Vezi detaliile"),
        url("link", "Link"),
        sel("style", "Stil", [("primary", "Buton plin"), ("secondary", "Buton contur"), ("link", "Link subliniat")], "secondary"),
        sel("icon", "Iconiță", ICONS, "none"),
        chk("full_width", "Lățime completă", True),
        chk("new_tab", "Deschide în tab nou", False),
        sel("alignment", "Aliniere", ALIGN, "left"),
        *margins(8, 12),
    ])


def reviews():
    s = [
        inline("heading", "Titlu", "Ce spun clienții"),
        sel("layout", "Aranjare", [("slider", "Slider"), ("list", "Listă")], "slider"),
        chk("autoplay", "Derulare automată", True),
        chk("show_verified", "Afișează „Cumpărător verificat”", True),
        scheme("card_color_scheme", "Schemă de culori card", "scheme-1"),
    ]
    defaults = [
        ("Andreea M.", "<p>Calitate excelentă, a ajuns în 2 zile. Recomand cu încredere!</p>"),
        ("Mihai P.", "<p>Exact ca în poze. Am plătit ramburs, totul a mers perfect.</p>"),
        ("Ioana D.", "<p>Al doilea comandat, de data asta pentru mama. Mulțumim!</p>"),
    ]
    for i in range(1, 7):
        name, txt_ = defaults[i - 1] if i <= 3 else (None, None)
        s += [
            hdr(f"Recenzia #{i}"),
            text(f"review_{i}_name", "Nume", name),
            rich(f"review_{i}_text", "Text", txt_),
            rng(f"review_{i}_rating", "Notă", 1, 5, 0.5, 5),
            image(f"review_{i}_image", "Poză"),
        ]
    s += margins(12, 16)
    return block("reviews", "Recenzii", s, 2)


def size_chart():
    return block("size_chart", "Ghid mărimi", [
        text("label", "Text link", "Ghid mărimi"),
        sel("icon", "Iconiță", ICONS, "ruler"),
        inline("heading", "Titlu pop-up", "Ghid mărimi"),
        image("image", "Imagine (opțional)"),
        rich("content", "Conținut", "<p>Măsoară-te și alege mărimea potrivită. Dacă ești între două mărimi, alege-o pe cea mai mare.</p>"),
        page("page", "Sau conținut dintr-o pagină", "Recomandat pentru tabele: creează o pagină cu tabelul de mărimi."),
        sel("alignment", "Aliniere", ALIGN, "left"),
        *margins(4, 12),
    ])


def custom_field():
    return block("custom_field", "Câmp personalizat", [
        sel("type", "Tip câmp", [("text", "Text scurt"), ("textarea", "Text lung"), ("number", "Număr"), ("select", "Listă de opțiuni"), ("swatches", "Culori")], "text"),
        text("field_name", "Nume câmp în comandă", "Personalizare", "Apare în comandă, ex: „Text gravură”."),
        inline("label", "Etichetă", "Text pentru gravură"),
        text("placeholder", "Text ajutător (placeholder)", "Ex: Andrei & Maria"),
        inline("info", "Informație sub câmp"),
        chk("required", "Câmp obligatoriu", False),
        text("error_message", "Mesaj de eroare", "Te rugăm să completezi acest câmp"),
        chk("full_width", "Lățime completă", False),
        hdr("Text"),
        num("max_characters", "Număr maxim de caractere", 30),
        rng("rows", "Rânduri (text lung)", 2, 8, 1, 3),
        hdr("Număr"),
        num("number_min", "Minim"),
        num("number_max", "Maxim"),
        hdr("Listă / culori"),
        text("options", "Opțiuni separate prin virgulă", "Opțiunea 1, Opțiunea 2", "Pentru culori: Roșu: #DC2626, Negru: #111111"),
        *margins(8, 12),
    ])


def all_blocks():
    return [
        quantity_breaks(), bundle_offer(), product_upsell(), quantity_gifts(), sticky_atc(),
        stars(False), stars(True), clickable_discount(), urgency(), emoji_benefits(), payment_badges(),
        estimated_shipping(), shipping_checkpoints(), scroll_buttons(), review_avatars(), text_with_icon(),
        image_block(), video_block(), divider(), link_button(), reviews(), size_chart(), custom_field(),
    ]


def price_settings():
    return [
        sel("show_savings", "Etichetă economie lângă preț", [("none", "Nu afișa"), ("amount", "Economisești X lei"), ("percent", "-X%"), ("both", "Sumă și procent")], "amount"),
        sel("price_size", "Mărime preț", [("small", "Mic"), ("medium", "Mediu"), ("large", "Mare")], "medium"),
    ]


def title_settings():
    return [
        sel("title_size", "Mărime titlu", [("h3", "Mic"), ("h2", "Mediu"), ("default", "Mare (implicit)")], "h2"),
        chk("show_tag_badges", "Afișează etichetele din tag-uri (badge:...)", True),
    ]
