from schemalib import *
from product_blocks import ICONS
P = PATH + "/sections/"
OVERLAY = {"groups": ["custom.overlay"]}
NOT_OVERLAY = {"groups": ["custom.overlay"]}

# ---------- Hero parallax ----------
write_schema(P + "c-parallax-hero.liquid", section_schema("Hero parallax 3D", [
    image("background", "Imagine fundal"),
    rng("background_depth", "Adâncime fundal", 0, 10, 1, 2),
    rng("overlay_opacity", "Întunecare fundal", 0, 90, 5, 20, "%"),
    sel("mode", "Efect", [("mouse", "La mișcarea mouse-ului"), ("scroll", "La derulare"), ("both", "Ambele")], "both"),
    rng("intensity", "Intensitate", 5, 100, 5, 30),
    sel("content_position", "Poziție conținut", [("left", "Stânga"), ("center", "Centru"), ("right", "Dreapta")], "left"),
    rng("min_height", "Înălțime minimă desktop", 40, 100, 5, 85, "vh"),
    rng("min_height_mobile", "Înălțime minimă mobil", 40, 100, 5, 75, "vh"),
    *common_end("scheme-3", 0, 0),
], [
    block("content", "Conținut", [
        inline("rating_text", "Text rating", "<strong>4.9</strong> din 2.000+ recenzii"),
        text("subheading", "Supratitlu", "Nou în 2026"),
        inline("heading", "Titlu", "Dormi mai bine din <em>prima noapte</em>"),
        sel("heading_size", "Mărime titlu", HEADING_SIZES, "h0"),
        rich("text", "Text", "<p>Perna ergonomică recomandată de kinetoterapeuți. Livrare în 24–48 de ore.</p>"),
        textarea("benefits", "Beneficii (câte unul pe rând)", "Plata ramburs la curier\nRetur gratuit 30 de zile"),
        sel("alignment", "Aliniere", ALIGN, "left"),
        chk("boxed", "Casetă în spatele textului", False),
        scheme("box_color_scheme", "Schemă de culori casetă", "scheme-1"),
        *buttons("Comandă acum", None, "Află mai multe"),
    ], 1),
    block("layer", "Strat imagine", [
        image("image", "Imagine (PNG transparent)"),
        rng("depth", "Adâncime (mișcare)", -10, 10, 1, 4, info="Valori mari = mișcare mai puternică. Negativ = direcție opusă."),
        rng("x", "Poziție orizontală", -20, 100, 2, 60, "%"),
        rng("y", "Poziție verticală", -20, 100, 2, 16, "%"),
        rng("width", "Lățime", 5, 100, 1, 30, "%"),
        rng("width_mobile", "Lățime pe mobil", 5, 100, 1, 45, "%"),
        rng("z_index", "Ordine (în față)", 1, 10, 1, 1),
        chk("float", "Plutire continuă", True),
        chk("hide_mobile", "Ascunde pe mobil", False),
    ]),
], [{"name": "Hero parallax 3D", "blocks": [{"type": "content"}, {"type": "layer"}]}], max_blocks=11))

# ---------- Hero cu slide-uri ----------
write_schema(P + "c-slideshow-hero.liquid", section_schema("Hero cu slide-uri", [
    rng("min_height", "Înălțime desktop", 40, 100, 5, 75, "vh"),
    rng("min_height_mobile", "Înălțime mobil", 40, 100, 5, 70, "vh"),
    chk("autoplay", "Schimbare automată", True),
    rng("autoplay_speed", "Schimbă la fiecare", 3, 12, 1, 6, "s"),
    chk("show_arrows", "Săgeți", True),
    chk("show_dots", "Puncte", True),
    scheme(default="scheme-3"), visibility(), anchor(),
], [block("slide", "Slide", [
    image("image", "Imagine desktop"),
    image("image_mobile", "Imagine mobil (opțional)"),
    rng("overlay_opacity", "Întunecare imagine", 0, 90, 5, 25, "%"),
    url("link", "Link pe tot slide-ul", info="Folosit doar dacă nu ai butoane."),
    inline("rating_text", "Text rating"),
    text("subheading", "Supratitlu", "Ofertă de lansare"),
    inline("heading", "Titlu", "Până la <em>40% reducere</em> la colecția nouă"),
    sel("heading_size", "Mărime titlu", HEADING_SIZES, "h0"),
    rich("text", "Text", "<p>Livrare gratuită peste 200 lei și plata la livrare.</p>"),
    sel("position", "Poziție conținut", POSITIONS9, "middle-left"),
    sel("alignment", "Aliniere text", ALIGN, "left"),
    chk("boxed", "Casetă în spatele textului", False),
    scheme(default="scheme-3"),
    *buttons("Vezi oferta"),
])], [{"name": "Hero cu slide-uri", "blocks": [{"type": "slide"}, {"type": "slide", "settings": {"heading": "Livrare în <em>24 de ore</em>", "subheading": "Din stoc în România", "position": "middle-center", "alignment": "center"}}]}], max_blocks=8))

# ---------- Slider imagini/video ----------
write_schema(P + "c-media-slider.liquid", section_schema("Slider imagini și video", [
    *heading_block("", "Văzut în <em>acțiune</em>", "", "h2"),
    rng("per_view", "Slide-uri vizibile desktop", 1, 6, 1, 4),
    rng("per_view_mobile", "Slide-uri vizibile mobil", 1, 3, 1, 1),
    rng("gap", "Spațiu între slide-uri", 0, 40, 2, 16, "px"),
    sel("aspect_ratio", "Proporție", [("1", "Pătrat"), ("4 / 5", "Portret"), ("9 / 16", "Story / Reel"), ("16 / 9", "Lat")], "9 / 16"),
    rng("radius", "Rotunjire colțuri", 0, 40, 2, 16, "px"),
    chk("autoplay", "Derulare automată", False),
    rng("autoplay_speed", "Schimbă la fiecare", 2, 10, 1, 4, "s"),
    chk("show_dots", "Puncte", True),
    chk("arrows_overlay", "Săgeți peste slide-uri", False),
    chk("full_width", "Lățime completă", False),
    *common_end("scheme-1"),
], [
    block("image_slide", "Imagine", [image("image", "Imagine"), url("link", "Link"), inline("caption", "Text sub imagine")]),
    block("video_slide", "Video", [video("video", "Video Shopify (redare automată fără sonor)"), video_url("video_url", "Sau link YouTube/Vimeo"), inline("caption", "Text sub video")]),
], [{"name": "Slider imagini și video", "blocks": [{"type": "video_slide"}, {"type": "video_slide"}, {"type": "video_slide"}, {"type": "video_slide"}]}]))

# ---------- Imagine cu produse ----------
write_schema(P + "c-shoppable-image.liquid", section_schema("Imagine cu produse", [
    *heading_block("", "Cumpără <em>look-ul</em>", "", "h2"),
    image("image", "Imagine"),
    color("hotspot_color", "Culoare puncte", "#FFFFFF"),
    chk("show_add", "Buton „Adaugă în coș” (produse fără variante)", True),
    scheme("card_color_scheme", "Schemă de culori card", "scheme-1"),
    rng("radius", "Rotunjire colțuri", 0, 40, 2, 12, "px"),
    chk("full_width", "Lățime completă", False),
    *common_end("scheme-1"),
], [block("hotspot", "Punct produs", [
    product("product", "Produs"),
    text("title", "Sau titlu (fără produs)", "Detaliu"),
    rich("text", "Text"),
    rng("x", "Poziție orizontală", 0, 100, 1, 40, "%"),
    rng("y", "Poziție verticală", 0, 100, 1, 50, "%"),
    rng("x_mobile", "Poziție orizontală mobil", 0, 100, 1, 40, "%"),
    rng("y_mobile", "Poziție verticală mobil", 0, 100, 1, 50, "%"),
])], [{"name": "Imagine cu produse", "blocks": [{"type": "hotspot"}, {"type": "hotspot", "settings": {"x": 65, "y": 30, "x_mobile": 65, "y_mobile": 30}}]}]))

# ---------- Caracteristici produs ----------
write_schema(P + "c-product-features.liquid", section_schema("Caracteristici produs", [
    *heading_block("", "Gândită pentru <em>confortul</em> tău", "", "h2"),
    image("image", "Imagine produs"),
    sel("layout", "Aranjare", [("three", "Beneficii în ambele părți"), ("right", "Imagine stânga, beneficii dreapta")], "three"),
    rng("radius", "Rotunjire colțuri imagine", 0, 40, 2, 16, "px"),
    *buttons(None),
    *common_end("scheme-1"),
], [
    block("bullet", "Beneficiu", [
        sel("side", "Partea", [("left", "Stânga"), ("right", "Dreapta")], "left"),
        *icon(default="leaf"),
        inline("title", "Titlu", "Materiale naturale"),
        inline("text", "Text", "Bumbac organic, fără substanțe iritante."),
    ]),
    block("hotspot", "Punct pe imagine", [
        text("title", "Titlu", "Spumă cu memorie"),
        rich("text", "Text"),
        rng("x", "Poziție orizontală", 0, 100, 1, 50, "%"),
        rng("y", "Poziție verticală", 0, 100, 1, 50, "%"),
    ]),
], [{"name": "Caracteristici produs", "blocks": [
    {"type": "bullet"}, {"type": "bullet", "settings": {"icon": "shield", "title": "Garanție 2 ani", "text": "Înlocuire gratuită în caz de defect."}},
    {"type": "bullet", "settings": {"side": "right", "icon": "water", "title": "Husă lavabilă", "text": "Se spală la 40°C, se usucă rapid."}},
    {"type": "bullet", "settings": {"side": "right", "icon": "moon", "title": "Somn liniștit", "text": "Susține gâtul în orice poziție."}},
    {"type": "hotspot"}]}]))

# ---------- Pachete ----------
write_schema(P + "c-bundle-deals.liquid", section_schema("Pachet de produse", [
    *heading_block("Ofertă specială", "Cumpără setul și <em>economisești</em>", "", "h2"),
    rng("discount_percent", "Reducere afișată pentru set", 0, 70, 1, 15, "%", "Creează în Shopify > Reduceri reducerea automată corespunzătoare."),
    text("total_label", "Text total", "Total set"),
    text("benefit_text", "Text beneficiu", "Economisești [percent]% cumpărând setul"),
    text("button_label", "Text buton", "Adaugă setul în coș"),
    scheme("box_color_scheme", "Schemă de culori casetă total", "scheme-1"),
    *common_end("scheme-2"),
], [block("product", "Produs", [product("product", "Produs")])],
 [{"name": "Pachet de produse", "blocks": [{"type": "product"}, {"type": "product"}, {"type": "product"}]}], max_blocks=5))

# ---------- Tabel prețuri ----------
write_schema(P + "c-pricing-table.liquid", section_schema("Tabel de prețuri", [
    *heading_block("", "Alege <em>pachetul</em> potrivit", "", "h2"),
    scheme("card_color_scheme", "Schemă de culori card", "scheme-1"),
    scheme("highlight_color_scheme", "Schemă de culori card evidențiat", "scheme-1"),
    *common_end("scheme-2"),
], [block("plan", "Pachet", [
    text("badge", "Etichetă"),
    image("image", "Imagine"),
    text("name", "Nume", "Standard"),
    inline("description", "Descriere", "Ideal pentru început"),
    text("price", "Preț", "149 lei"),
    text("compare_price", "Preț tăiat"),
    text("price_note", "Notă preț", "plată ramburs, TVA inclus"),
    textarea("features", "Caracteristici", "1 pernă\nHusă din bumbac\n- Husă de rezervă\n- Cadou", "Câte una pe rând. Începe cu „-” pentru caracteristică inclusă doar în alte pachete."),
    chk("highlight", "Evidențiază acest pachet", False),
    text("button_label", "Text buton", "Alege"),
    product("product", "Produs (link buton)"),
    url("button_link", "Sau link"),
])], [{"name": "Tabel de prețuri", "blocks": [
    {"type": "plan"},
    {"type": "plan", "settings": {"badge": "Cel mai popular", "name": "Duo", "price": "249 lei", "compare_price": "298 lei", "features": "2 perne\nHusă din bumbac\nHusă de rezervă\n- Cadou", "highlight": True}},
    {"type": "plan", "settings": {"name": "Familie", "price": "449 lei", "compare_price": "596 lei", "features": "4 perne\nHusă din bumbac\nHusă de rezervă\nCadou surpriză"}}]}], max_blocks=4))

# ---------- Ticker ----------
write_schema(P + "c-ticker.liquid", section_schema("Bandă derulantă", [
    *heading_block("", "", "", "h3", with_text=False),
    sel("direction", "Direcție", [("left", "Spre stânga"), ("right", "Spre dreapta")], "left"),
    rng("speed", "Durată tură", 10, 120, 5, 40, "s"),
    rng("text_size", "Mărime text", 12, 60, 1, 18, "px"),
    rng("gap", "Spațiu între elemente", 8, 120, 4, 40, "px"),
    rng("image_height", "Înălțime imagini", 16, 120, 4, 40, "px"),
    rng("icon_size", "Mărime iconițe", 12, 48, 2, 20, "px"),
    text("separator", "Separator", "✦"),
    chk("uppercase", "Majuscule", True),
    chk("pause_on_hover", "Oprește la trecerea cursorului", True),
    rng("rotate", "Înclinare", -5, 5, 1, 0, "°"),
    scheme("card_color_scheme", "Schemă de culori recenzii", "scheme-1"),
    *common_end("scheme-4", 16, 16),
], [
    block("text", "Text", [inline("text", "Text", "Livrare gratuită peste 200 lei"), sel("icon", "Iconiță", ICONS, "none"), text("icon_emoji", "Sau emoji")]),
    block("image", "Imagine", [image("image", "Imagine")]),
    block("review", "Recenzie", [rng("rating", "Notă", 1, 5, 0.5, 5), text("text", "Text", "Cel mai bun cadou pe care l-am făcut!"), text("author", "Nume", "Ana")]),
], [{"name": "Bandă derulantă", "blocks": [{"type": "text"}, {"type": "text", "settings": {"text": "Plata ramburs"}}, {"type": "text", "settings": {"text": "Retur 30 de zile"}}, {"type": "text", "settings": {"text": "Peste 10.000 de clienți"}}]}]))

# ---------- Ticker vertical ----------
write_schema(P + "c-vertical-ticker.liquid", section_schema("Bandă derulantă verticală", [
    *heading_block("De ce noi", "Tot ce primești când comanzi de la noi", "", "h2", "left"),
    sel("layout", "Aranjare", [("side", "Text și bandă alăturate"), ("stacked", "Una sub alta")], "side"),
    rng("height", "Înălțime bandă", 160, 600, 20, 360, "px"),
    rng("speed", "Durată tură", 5, 60, 1, 18, "s"),
    *buttons(None),
    *common_end("scheme-1"),
], [block("text", "Text", [inline("text", "Text", "✔ Livrare în 24–48 de ore")])],
 [{"name": "Bandă derulantă verticală", "blocks": [{"type": "text"}, {"type": "text", "settings": {"text": "✔ Plata ramburs la curier"}}, {"type": "text", "settings": {"text": "✔ Retur gratuit 30 de zile"}}, {"type": "text", "settings": {"text": "✔ Garanție 2 ani"}}, {"type": "text", "settings": {"text": "✔ Suport în română"}}]}]))

# ---------- Tab-uri ----------
write_schema(P + "c-content-tabs.liquid", section_schema("Conținut în tab-uri", [
    *heading_block("", "Tot ce trebuie să știi", "", "h2"),
    sel("style", "Stil tab-uri", [("pills", "Butoane rotunjite"), ("underline", "Subliniat")], "pills"),
    *common_end("scheme-1"),
], [block("tab", "Tab", [
    text("title", "Titlu tab", "Descriere"),
    sel("icon", "Iconiță", ICONS, "none"),
    inline("heading", "Titlu conținut"),
    rich("content", "Conținut", "<p>Scrie aici detaliile despre produs: materiale, dimensiuni, mod de folosire.</p>"),
    page("page", "Sau conținut dintr-o pagină"),
    image("image", "Imagine"),
    sel("image_position", "Poziție imagine", [("left", "Stânga"), ("right", "Dreapta")], "left"),
    text("button_label", "Text buton"),
    url("button_link", "Link buton"),
])], [{"name": "Conținut în tab-uri", "blocks": [{"type": "tab"}, {"type": "tab", "settings": {"title": "Livrare și retur", "content": "<p>Livrare în 24–48 de ore prin curier. Retur gratuit în 30 de zile.</p>"}}, {"type": "tab", "settings": {"title": "Îngrijire", "content": "<p>Husa se spală la 40°C.</p>"}}]}]))

# ---------- Coloane personalizate ----------
COLUMN = sel("column", "Coloana", [("1", "1"), ("2", "2"), ("3", "3"), ("4", "4")], "1")
AL = sel("alignment", "Aliniere", ALIGN, "left")
MG = margins(0, 16)
write_schema(P + "c-custom-columns.liquid", section_schema("Coloane personalizate", [
    *heading_block("", "", "", "h2"),
    rng("columns", "Număr coloane", 1, 4, 1, 2),
    rng("gap", "Spațiu între coloane", 0, 80, 4, 48, "px"),
    sel("vertical_alignment", "Aliniere verticală", [("top", "Sus"), ("center", "Centru"), ("bottom", "Jos")], "center"),
    chk("mobile_reverse", "Inversează ordinea pe mobil", False),
    chk("boxed_columns", "Coloane în casete", False),
    scheme("box_color_scheme", "Schemă de culori casete", "scheme-2"),
    *common_end("scheme-1"),
], [
    block("heading", "Titlu", [COLUMN, text("subheading", "Supratitlu"), inline("heading", "Titlu", "Titlu coloană"), sel("heading_size", "Mărime", HEADING_SIZES, "h2"), AL, *MG]),
    block("richtext", "Text", [COLUMN, rich("text", "Text", "<p>Scrie un text care să explice beneficiile produsului.</p>"), AL, *MG]),
    block("rating_stars", "Stele rating", [COLUMN, rng("rating", "Notă", 1, 5, 0.1, 4.9), inline("text", "Text", "<strong>4.9</strong> din 2.000+ recenzii"), AL, *MG]),
    block("buttons", "Butoane", [COLUMN, *buttons("Cumpără acum")[1:], AL, *MG]),
    block("atc_button", "Buton adaugă în coș", [COLUMN, product("product", "Produs"), text("label", "Text buton", "Adaugă în coș"), chk("full_width", "Lățime completă", False), AL, *MG]),
    block("text_with_icon", "Text cu iconiță", [COLUMN, rich("text", "Text", "<p><strong>Livrare rapidă</strong> în toată țara</p>"), *icon(default="truck"), icon_size(default=28), chk("boxed", "Casetă", False), AL, *MG]),
    block("image", "Imagine", [COLUMN, image("image", "Imagine"), url("link", "Link"), rng("width", "Lățime", 20, 100, 5, 100, "%"), rng("radius", "Rotunjire colțuri", 0, 40, 2, 12, "px"), AL, *MG]),
    block("video", "Video", [COLUMN, video("video", "Video Shopify"), video_url("video_url", "Sau link YouTube/Vimeo"), chk("autoplay", "Redare automată fără sonor", True), chk("controls", "Controale", False), rng("radius", "Rotunjire colțuri", 0, 40, 2, 12, "px"), *MG]),
    block("accordion", "Rând pliabil", [COLUMN, text("heading", "Titlu", "Întrebare frecventă"), rich("content", "Conținut", "<p>Răspunsul la întrebare.</p>"), sel("icon", "Iconiță", ICONS, "none"), chk("open", "Deschis implicit", False), *MG]),
    block("payment_badges", "Metode de plată", [COLUMN, AL, *MG]),
    block("email_signup", "Abonare email", [COLUMN, *MG]),
    block("custom_liquid", "Cod Liquid", [COLUMN, liquid("custom_liquid", "Cod Liquid"), *MG]),
], [{"name": "Coloane personalizate", "blocks": [
    {"type": "image", "settings": {"column": "1"}},
    {"type": "heading", "settings": {"column": "2", "subheading": "Povestea noastră", "heading": "Creat în <em>România</em>, cu grijă"}},
    {"type": "richtext", "settings": {"column": "2"}},
    {"type": "buttons", "settings": {"column": "2"}}]}]))

# ---------- Bară iconițe ----------
write_schema(P + "c-icon-bar.liquid", section_schema("Bară cu iconițe", [
    *heading_block("", "", "", "h3", with_text=False),
    sel("layout", "Aranjare", [("row", "Un rând")], "row"),
    sel("item_layout", "Iconiță față de text", [("inline", "Lângă text"), ("stacked", "Deasupra textului")], "inline"),
    sel("mobile_layout", "Pe mobil", [("grid", "Grilă 2 coloane"), ("marquee", "Bandă derulantă")], "grid"),
    rng("speed", "Durată bandă pe mobil", 8, 60, 2, 20, "s"),
    rng("icon_size", "Mărime iconițe", 16, 64, 2, 32, "px"),
    color("icon_color", "Culoare iconițe"),
    chk("dividers", "Separatoare", False),
    *common_end("scheme-2", 24, 24),
], [block("item", "Iconiță", [*icon(default="truck"), inline("title", "Titlu", "Livrare 24–48h"), inline("text", "Text", "În toată țara")])],
 [{"name": "Bară cu iconițe", "blocks": [
    {"type": "item"}, {"type": "item", "settings": {"icon": "cash", "title": "Plata ramburs", "text": "Plătești la curier"}},
    {"type": "item", "settings": {"icon": "return", "title": "Retur 30 de zile", "text": "Gratuit, fără întrebări"}},
    {"type": "item", "settings": {"icon": "shield", "title": "Garanție 2 ani", "text": "Pentru toate produsele"}}]}], max_blocks=8))

# ---------- Iconițe cu conținut ----------
write_schema(P + "c-icons-with-content.liquid", section_schema("Iconițe în jurul imaginii", [
    *heading_block("", "De ce o să-ți <em>placă</em>", "", "h2"),
    image("image", "Imagine"),
    video("video", "Sau video (redare automată)"),
    rng("radius", "Rotunjire colțuri", 0, 40, 2, 16, "px"),
    *buttons(None),
    hdr("Buton adaugă în coș"),
    product("atc_product", "Produs (fără variante)"),
    text("atc_label", "Text buton", "Adaugă în coș"),
    *common_end("scheme-1"),
], [block("icon", "Iconiță cu text", [*icon(default="check_circle"), inline("title", "Titlu", "Ușor de folosit"), inline("text", "Text", "Gata de folosire din prima zi.")])],
 [{"name": "Iconițe în jurul imaginii", "blocks": [
    {"type": "icon"}, {"type": "icon", "settings": {"icon": "leaf", "title": "Materiale naturale"}}, {"type": "icon", "settings": {"icon": "shield", "title": "Garanție 2 ani"}},
    {"type": "icon", "settings": {"icon": "truck", "title": "Livrare rapidă"}}, {"type": "icon", "settings": {"icon": "return", "title": "Retur gratuit"}}, {"type": "icon", "settings": {"icon": "heart", "title": "Peste 10.000 de clienți"}}]}], max_blocks=8))

# ---------- Grup secțiuni ----------
write_schema(P + "c-section-group.liquid", section_schema("Grup de secțiuni", [
    par("Afișează două secțiuni din aceeași pagină una lângă alta. Completează în fiecare secțiune Carpatica câmpul „ID secțiune (ancoră)” și scrie aici ID-urile."),
    text("section_1_id", "ID secțiunea 1", placeholder="ex: poveste"),
    text("section_2_id", "ID secțiunea 2", placeholder="ex: video"),
    sel("ratio", "Proporție coloane", [("1fr 1fr", "50 / 50"), ("2fr 1fr", "66 / 33"), ("1fr 2fr", "33 / 66"), ("3fr 2fr", "60 / 40"), ("2fr 3fr", "40 / 60")], "1fr 1fr"),
    rng("gap", "Spațiu între secțiuni", 0, 80, 4, 32, "px"),
    chk("mobile_reverse", "A doua secțiune prima pe mobil", False),
    chk("full_width", "Lățime completă", False),
    *common_end("scheme-1", 0, 0),
], None, [{"name": "Grup de secțiuni"}]))

# ---------- Separator decorativ ----------
write_schema(P + "c-section-divider.liquid", section_schema("Separator decorativ", [
    sel("shape", "Formă", [("wave", "Val"), ("curve", "Curbă"), ("tilt", "Înclinat"), ("zigzag", "Zigzag"), ("triangle", "Triunghi"), ("mountains", "Munți"), ("line", "Linie")], "wave"),
    color("top_color", "Culoare sus (secțiunea de deasupra)", "#FFFFFF"),
    color("bottom_color", "Culoare jos (secțiunea de dedesubt)", "#F1F5F9"),
    rng("height", "Înălțime", 20, 160, 4, 60, "px"),
    chk("flip_x", "Oglindește orizontal", False),
    chk("flip_y", "Oglindește vertical", False),
], None, [{"name": "Separator decorativ"}], tag="div", cls="c-divider-section"))

# ---------- Schimbător culori ----------
write_schema(P + "c-colors-changer.liquid", section_schema("Schimbător culori pagină", [
    par("Schimbă culorile doar pe paginile care folosesc acest șablon (ex: o pagină de produs cu identitate diferită). Lasă gol ce nu vrei să modifici."),
    hdr("Culori conversie"),
    color("accent", "Accent"), color("accent_text", "Text pe accent"), color("savings", "Economii"), color("urgency", "Urgență"), color("highlight_bg", "Fundal evidențiere"),
    hdr("Schemă de culori"),
    scheme("scheme_target", "Schema modificată", "scheme-1"),
    color("background", "Fundal"), color("text", "Text"), color("button", "Fundal buton"), color("button_text", "Text buton"),
], None, [{"name": "Schimbător culori pagină"}], tag="div", cls="c-colors-changer-section"))

# ---------- Player muzică ----------
write_schema(P + "c-music-player.liquid", section_schema("Player muzică", [
    text("audio_url", "Link fișier audio (.mp3)", info="Încarcă fișierul în Conținut > Fișiere și lipește linkul aici."),
    image("cover", "Copertă"),
    text("title", "Titlu", "Muzica magazinului"),
    text("artist", "Artist"),
    rng("volume", "Volum", 5, 100, 5, 50, "%"),
    chk("loop", "Repetă", True),
    *common_end("scheme-1", 24, 24),
], None, [{"name": "Player muzică"}]))

write_schema(P + "c-global-music-player.liquid", section_schema("Muzică pe tot site-ul", [
    chk("enabled", "Activează", False),
    text("audio_url", "Link fișier audio (.mp3)", info="Muzica pornește doar când vizitatorul apasă butonul (browserele blochează redarea automată). Continuă de unde a rămas pe paginile următoare."),
    rng("volume", "Volum", 5, 100, 5, 40, "%"),
    sel("position", "Poziție", [("left", "Stânga jos"), ("right", "Dreapta jos")], "left"),
    rng("offset_x", "Distanță orizontală", 0, 80, 2, 20, "px"),
    rng("offset_y", "Distanță verticală", 0, 120, 2, 20, "px"),
    chk("ripple", "Animație unde când rulează", True),
    scheme(default="scheme-1"),
], None, [{"name": "Muzică pe tot site-ul"}], tag="div", cls="c-overlay-section", enabled_on=OVERLAY))

# ---------- Buton înapoi sus ----------
write_schema(P + "c-scroll-top.liquid", section_schema("Buton înapoi sus", [
    chk("enabled", "Activează", True),
    rng("display_after", "Apare după derularea a", 100, 2000, 100, 600, "px"),
    sel("position", "Poziție", [("right", "Dreapta"), ("left", "Stânga"), ("center", "Centru")], "right"),
    rng("offset_x", "Distanță orizontală", 0, 80, 2, 20, "px"),
    rng("offset_y", "Distanță verticală", 0, 160, 2, 20, "px"),
    text("label", "Text accesibilitate", "Înapoi sus"),
    scheme(default="scheme-1"),
], None, [{"name": "Buton înapoi sus"}], tag="div", cls="c-overlay-section", enabled_on=OVERLAY))

# ---------- Pop-up promoțional ----------
write_schema(P + "c-promo-popup.liquid", section_schema("Pop-up promoțional", [
    chk("enabled", "Activează", True),
    sel("mode", "Tip", [("signup", "Abonare email + cod reducere"), ("link", "Anunț cu buton")], "signup"),
    sel("trigger", "Când apare", [("delay", "După câteva secunde"), ("exit", "Când vizitatorul vrea să plece"), ("scroll", "După 40% din pagină")], "delay"),
    rng("delay", "Întârziere", 1, 60, 1, 8, "s"),
    rng("frequency", "Nu mai apare timp de (zile)", 0, 30, 1, 3, info="0 = la fiecare vizită."),
    sel("show_on", "Pagini", [("all", "Toate paginile"), ("home", "Doar prima pagină"), ("product", "Doar paginile de produs")], "all"),
    image("image", "Imagine"),
    sel("layout", "Poziție imagine", [("left", "Stânga"), ("right", "Dreapta"), ("top", "Sus")], "left"),
    scheme(default="scheme-1"),
    hdr("Conținut"),
    text("subheading", "Supratitlu", "Doar pentru abonați"),
    inline("heading", "Titlu", "<em>10% reducere</em> la prima comandă"),
    rich("text", "Text", "<p>Abonează-te la noutăți și primești codul pe loc.</p>"),
    chk("show_timer", "Timer", False),
    rng("timer_minutes", "Durată timer", 5, 240, 5, 15, "min"),
    text("button_label", "Text buton", "Vreau reducerea"),
    url("button_link", "Link buton (tip anunț)"),
    text("dismiss_label", "Text refuz", "Nu, mulțumesc"),
    inline("legal_text", "Text legal", "Te poți dezabona oricând. Vezi <a href=\"/policies/privacy-policy\">politica de confidențialitate</a>."),
    hdr("După abonare"),
    inline("success_heading", "Titlu", "Mulțumim! 🎉"),
    rich("success_text", "Text", "<p>Folosește codul de mai jos la finalizarea comenzii:</p>"),
    text("discount_code", "Cod de reducere", "BINE10"),
    text("success_button", "Text buton", "Continuă cumpărăturile"),
], None, [{"name": "Pop-up promoțional"}], tag="div", cls="c-overlay-section", enabled_on=OVERLAY))

# ---------- Urmărire comandă ----------
write_schema(P + "c-track-order.liquid", section_schema("Urmărire comandă", [
    *heading_block("", "Unde este <em>coletul</em> meu?", "<p>Introdu numărul AWB primit pe email sau SMS.</p>", "h2"),
    text("input_label", "Text câmp", "Număr AWB"),
    text("button_label", "Text buton", "Urmărește coletul"),
    chk("button_full_width", "Buton pe toată lățimea", True),
    text("tracking_url", "Link urmărire implicit", "https://t.17track.net/ro#nums={awb}", "{awb} se înlocuiește cu numărul introdus."),
    chk("show_courier", "Alegere firmă de curierat", False),
    text("courier_label", "Text alegere curier", "Firma de curierat"),
    textarea("couriers", "Firme de curierat", "Toate (17track)|https://t.17track.net/ro#nums={awb}", "Câte una pe rând: Nume|link cu {awb}. Copiază linkul de urmărire de pe site-ul curierului tău."),
    rich("note", "Notă", "<p>Ai nevoie de ajutor? Scrie-ne la contact și îți răspundem în aceeași zi.</p>"),
    *common_end("scheme-1"),
], None, [{"name": "Urmărire comandă"}]))

# ---------- Formular contact ----------
write_schema(P + "c-contact-form.liquid", section_schema("Formular contact avansat", [
    *heading_block("", "Contactează-ne", "<p>Îți răspundem în maximum 24 de ore lucrătoare.</p>", "h2"),
    text("button_label", "Text buton", "Trimite mesajul"),
    chk("button_full_width", "Buton pe toată lățimea", False),
    inline("consent_text", "Acord (opțional)", "Sunt de acord cu <a href=\"/policies/privacy-policy\">prelucrarea datelor</a>."),
    inline("success_message", "Mesaj succes", "Mulțumim! Am primit mesajul tău."),
    *common_end("scheme-1"),
], [block("field", "Câmp", [
    sel("type", "Tip", [("text", "Text"), ("email", "Email"), ("tel", "Telefon"), ("number", "Număr"), ("textarea", "Mesaj (text lung)"), ("select", "Listă")], "text"),
    text("label", "Etichetă", "Nume"),
    chk("required", "Obligatoriu", False),
    sel("width", "Lățime", [("half", "Jumătate"), ("full", "Completă")], "half"),
    rng("rows", "Rânduri (mesaj)", 2, 12, 1, 5),
    text("options", "Opțiuni listă (separate prin virgulă)", "Comandă, Retur, Altceva"),
])], [{"name": "Formular contact avansat", "blocks": [
    {"type": "field", "settings": {"label": "Nume", "required": True}},
    {"type": "field", "settings": {"type": "email", "label": "Email", "required": True}},
    {"type": "field", "settings": {"type": "tel", "label": "Telefon"}},
    {"type": "field", "settings": {"type": "select", "label": "Subiect"}},
    {"type": "field", "settings": {"type": "textarea", "label": "Mesaj", "width": "full", "required": True}}]}]))
