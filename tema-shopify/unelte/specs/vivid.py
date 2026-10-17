from schemalib import *
P = PATH + "/sections/"
COLS = lambda d=3, mx=5: rng("columns_desktop", "Coloane pe desktop", 1, mx, 1, d)
CARD = lambda d="scheme-1": scheme("card_color_scheme", "Schemă de culori card", d)
GIF_INFO = "Poți încărca și GIF-uri animate – animația se păstrează."
VIDEO_INFO = "Video fără sunet, în buclă, ca un GIF (mai ușor decât un GIF). Are prioritate față de imagine."

# ---------- Recenzii cu poze ----------
write_schema(P + "c-photo-reviews.liquid", section_schema("Recenzii cu poze", [
    *heading_block("Recenzii reale", "Peste 2.000 de clienți <em>fericiți</em>", "", "h2"),
    hdr("Rezumat rating"),
    chk("show_summary", "Afișează rezumatul", True),
    text("rating_value", "Nota medie", "4.9"),
    text("rating_count", "Text număr recenzii", "din 2.143 de recenzii verificate"),
    chk("show_bars", "Bare pe stele", True),
    num("bar_5", "Procent 5 stele", 89),
    num("bar_4", "Procent 4 stele", 8),
    num("bar_3", "Procent 3 stele", 2),
    num("bar_2", "Procent 2 stele", 1),
    num("bar_1", "Procent 1 stea", 0),
    text("summary_button_label", "Text buton"),
    url("summary_button_link", "Link buton"),
    hdr("Recenzii"),
    sel("layout", "Aranjare", [("masonry", "Mozaic (Pinterest)"), ("grid", "Grilă egală")], "masonry"),
    COLS(4),
    rng("columns_mobile", "Coloane pe mobil", 1, 2, 1, 2),
    rng("initial_count", "Recenzii afișate la început", 2, 24, 1, 8, info="Restul apar la „Vezi mai multe”."),
    text("load_more_label", "Text buton „Vezi mai multe”", "Vezi mai multe recenzii"),
    chk("show_verified", "Bifă „Cumpărător verificat”", True),
    text("verified_text", "Text verificat", "Cumpărător verificat"),
    chk("show_date", "Afișează data", True),
    CARD("scheme-1"),
    *common_end("scheme-2"),
], [block("review", "Recenzie", [
    image("image", "Poză client", GIF_INFO),
    image("image_2", "A doua poză"),
    video("video", "Sau video", VIDEO_INFO),
    rng("rating", "Stele", 1, 5, 1, 5),
    text("title", "Titlu", "Exact ce căutam!"),
    rich("text", "Text", "<p>Am primit coletul în 2 zile, calitatea e peste așteptări. Recomand cu drag!</p>"),
    text("name", "Nume", "Andreea M."),
    text("city", "Oraș", "Cluj-Napoca"),
    text("review_time", "Când", "acum 3 zile"),
    image("avatar", "Poză profil"),
    chk("verified", "Cumpărător verificat", True),
    text("product_name", "Produs recenzat (opțional)", info="Ex: [produs] – pe pagina produsului devine numele lui."),
])], [{"name": "Recenzii cu poze", "blocks": [{"type": "review"}] * 4}]))

# ---------- Recenzii video ----------
write_schema(P + "c-video-reviews.liquid", section_schema("Recenzii video", [
    *heading_block("Văzut pe TikTok", "Clienții ne arată <em>rezultatele</em>", "", "h2"),
    COLS(4, 6),
    chk("show_dots", "Puncte paginare", True),
    par("Videoclipurile pornesc fără sunet când devin vizibile; o atingere pornește sunetul. Se încarcă doar când ajung pe ecran."),
    *common_end("scheme-1"),
], [block("video_review", "Recenzie video", [
    video("video", "Video (format vertical 9:16)"),
    image("cover", "Copertă (opțional)", GIF_INFO),
    text("badge", "Etichetă", "⭐ Top recenzie"),
    rng("rating", "Stele", 1, 5, 1, 5),
    text("text", "Text scurt", "Cel mai bun produs cumpărat anul ăsta!"),
    text("name", "Nume", "Ioana P."),
    chk("verified", "Cumpărător verificat", True),
    text("product_name", "Produs (opțional)", info="Ex: [produs] – pe pagina produsului devine numele lui."),
    text("product_price", "Preț afișat (opțional)", info="Ex: 149 lei"),
])], [{"name": "Recenzii video", "blocks": [{"type": "video_review"}] * 4}]))

# ---------- Pași ----------
write_schema(P + "c-steps.liquid", section_schema("Cum funcționează (pași)", [
    *heading_block("Simplu și rapid", "Cum <em>funcționează</em>", "", "h2"),
    sel("layout", "Aranjare", [("cards", "Carduri pe orizontală"), ("timeline", "Linie verticală (cronologie)")], "cards"),
    chk("show_line", "Linie de legătură între pași", True),
    chk("show_step_label", "Afișează „Pasul 1, 2...”", True),
    text("step_label", "Text pas", "Pasul"),
    CARD("scheme-1"),
    *buttons("Încearcă acum"),
    *common_end("scheme-2"),
], [block("step", "Pas", [
    image("image", "Imagine sau GIF", GIF_INFO),
    video("video", "Sau video", VIDEO_INFO),
    text("emoji", "Emoji în loc de număr", info="Ex: 📦"),
    color("accent", "Culoare pas"),
    inline("title", "Titlu", "Comanzi online"),
    rich("text", "Text", "<p>Alegi produsul și plătești ramburs, la curier.</p>"),
])], [{"name": "Cum funcționează (pași)", "blocks": [
    {"type": "step", "settings": {"title": "Comanzi în 30 de secunde", "accent": "#6B7F5E"}},
    {"type": "step", "settings": {"title": "Primești în 24–48h", "text": "<p>Curierul îți aduce coletul direct la ușă.</p>", "accent": "#C8664A"}},
    {"type": "step", "settings": {"title": "Te bucuri de rezultat", "text": "<p>Iar dacă nu-ți place, ai retur gratuit 30 de zile.</p>", "accent": "#55684A"}},
]}]))

# ---------- Carduri beneficii ----------
write_schema(P + "c-benefit-cards.liquid", section_schema("Carduri colorate", [
    *heading_block("De ce să ne alegi", "Beneficii pe care le <em>simți</em>", "", "h2"),
    COLS(3, 4),
    sel("style", "Stil", [("pop", "Pop (umbră colorată)"), ("soft", "Moale"), ("outline", "Contur")], "pop"),
    chk("mobile_slider", "Glisare pe mobil", True),
    *buttons(None),
    *common_end("scheme-1"),
], [block("card", "Card", [
    color("background", "Culoare fundal", "#F6E1D8"),
    color("text_color", "Culoare text", "#000000"),
    image("image", "Imagine sau GIF", GIF_INFO),
    video("video", "Sau video", VIDEO_INFO),
    sel("media_style", "Formă imagine", [("cover", "Imagine mare"), ("icon", "Mică (iconiță)")], "icon"),
    text("emoji", "Emoji", "⚡"),
    sel("icon", "Iconiță", ICONS, "none"),
    text("stat", "Număr mare", info="Ex: 98%"),
    inline("title", "Titlu", "Efect rapid"),
    rich("text", "Text", "<p>Simți diferența din primele zile de utilizare.</p>"),
    url("link", "Link"),
    text("link_label", "Text link", "Află mai multe"),
])], [{"name": "Carduri colorate", "blocks": [
    {"type": "card", "settings": {"background": "#F6E1D8", "emoji": "⚡", "title": "Efect rapid"}},
    {"type": "card", "settings": {"background": "#E6EBDF", "emoji": "🌿", "title": "100% natural", "text": "<p>Ingrediente curate, fără aditivi inutili.</p>"}},
    {"type": "card", "settings": {"background": "#F3EADD", "emoji": "🛡️", "title": "Garanție 30 de zile", "text": "<p>Nu-ți place? Îți dăm banii înapoi.</p>"}},
]}]))

# ---------- Problemă vs soluție ----------
write_schema(P + "c-problem-solution.liquid", section_schema("Problemă vs soluție", [
    *heading_block("Diferența se vede", "Fără noi vs. <em>cu noi</em>", "", "h2"),
    text("vs_text", "Text între coloane", "VS"),
    hdr("Coloana „problemă”"),
    image("bad_image", "Imagine sau GIF", GIF_INFO),
    video("bad_video", "Sau video", VIDEO_INFO),
    inline("bad_title", "Titlu", "Fără [produs]"),
    textarea("bad_list", "Probleme (câte una pe rând)", "Nopți agitate\nOboseală dimineața\nSoluții scumpe care nu țin"),
    hdr("Coloana „soluție”"),
    text("good_badge", "Etichetă", "Recomandat"),
    image("good_image", "Imagine sau GIF", GIF_INFO),
    video("good_video", "Sau video", VIDEO_INFO),
    chk("use_product_image", "Pe pagina de produs, folosește poza produsului dacă nu alegi alta", True),
    inline("good_title", "Titlu", "Cu [produs]"),
    textarea("good_list", "Beneficii (câte unul pe rând)", "Somn liniștit din prima noapte\nEnergie toată ziua\nO investiție care ține ani"),
    scheme("good_color_scheme", "Schemă de culori soluție", "scheme-4"),
    *buttons("Vreau și eu"),
    *common_end("scheme-1"),
]))

# ---------- Ingrediente ----------
write_schema(P + "c-ingredients.liquid", section_schema("Ingrediente", [
    *heading_block("Ce conține", "Ingrediente <em>atent alese</em>", "", "h2"),
    image("image", "Imagine produs (opțional)", GIF_INFO),
    chk("use_product_image", "Pe pagina de produs, folosește poza produsului dacă nu alegi alta", True),
    rng("columns_desktop", "Coloane pe desktop", 1, 4, 1, 2),
    chk("expanded", "Descrierile deschise implicit", False),
    CARD("scheme-1"),
    *common_end("scheme-6"),
], [block("ingredient", "Ingredient", [
    image("image", "Imagine", GIF_INFO),
    text("emoji", "Sau emoji", "🌱"),
    text("name", "Nume", "Ashwagandha"),
    text("amount", "Cantitate", "600 mg"),
    rich("text", "Descriere", "<p>Ajută la reducerea stresului și la un somn mai odihnitor.</p>"),
])], [{"name": "Ingrediente", "blocks": [
    {"type": "ingredient"},
    {"type": "ingredient", "settings": {"emoji": "🍋", "name": "Vitamina C", "amount": "80 mg", "text": "<p>Susține imunitatea și energia.</p>"}},
    {"type": "ingredient", "settings": {"emoji": "🧲", "name": "Magneziu", "amount": "200 mg", "text": "<p>Pentru relaxare musculară și oboseală redusă.</p>"}},
    {"type": "ingredient", "settings": {"emoji": "🍯", "name": "Zinc", "amount": "10 mg", "text": "<p>Contribuie la funcționarea normală a sistemului imunitar.</p>"}},
]}]))

# ---------- Garanție ----------
write_schema(P + "c-guarantee.liquid", section_schema("Garanție", [
    text("subheading", "Supratitlu", "Zero riscuri"),
    inline("heading", "Titlu", "Garanție <em>banii înapoi</em> 30 de zile"),
    sel("heading_size", "Mărime titlu", HEADING_SIZES, "h2"),
    rich("text", "Text", "<p>Încearcă produsul liniștit. Dacă nu ești mulțumit, ni-l trimiți înapoi și îți returnăm toți banii.</p>"),
    hdr("Sigiliu"),
    image("seal_image", "Imagine sigiliu (opțional)", "Dacă o lași goală, tema desenează un sigiliu animat."),
    text("seal_number", "Număr", "30"),
    text("seal_label", "Text sub număr", "zile"),
    text("ring_text", "Text pe cerc", "GARANȚIE BANII ÎNAPOI"),
    chk("rotate", "Cercul se rotește", True),
    scheme("box_color_scheme", "Schemă de culori casetă", "scheme-5"),
    *buttons("Comandă fără griji"),
    *common_end("scheme-1"),
], [block("point", "Punct", [
    *icon("icon", "check_circle"),
    inline("text", "Text", "Retur gratuit, fără întrebări"),
])], [{"name": "Garanție", "blocks": [
    {"type": "point"},
    {"type": "point", "settings": {"icon": "cash", "text": "Plata ramburs, la livrare"}},
    {"type": "point", "settings": {"icon": "support", "text": "Suport rapid pe WhatsApp și email"}},
]}]))

# ---------- Media cu text ----------
write_schema(P + "c-media-text.liquid", section_schema("Media cu text (GIF/video)", [
    image("image", "Imagine sau GIF", GIF_INFO),
    video("video", "Sau video", VIDEO_INFO),
    url("gif_url", "Sau link GIF extern", None, "Ex: un link direct .gif de pe Giphy. Folosit doar dacă nu ai imagine/video."),
    chk("use_product_image", "Pe pagina de produs, folosește poza produsului dacă nu alegi alta", True),
    sel("media_position", "Poziție media", [("left", "Stânga"), ("right", "Dreapta")], "left"),
    sel("media_style", "Formă media", [("rounded", "Colțuri rotunjite"), ("blob", "Formă organică"), ("tilt", "Înclinată, cu umbră colorată"), ("circle", "Cerc")], "tilt"),
    rng("media_width", "Lățime media", 30, 70, 5, 50, "%"),
    text("sticker", "Abțibild pe imagine", "-40%"),
    chk("above_fold", "Secțiunea e în primul ecran", False, "Încarcă imaginea imediat (bun pentru prima secțiune a paginii)."),
    *common_end("scheme-1"),
], [
    block("rating", "Rating", [rng("rating", "Stele", 1, 5, 1, 5), inline("text", "Text", "<strong>4.9/5</strong> din 2.000+ recenzii")], 1),
    block("subheading", "Supratitlu", [text("text", "Text", "Nou")]),
    block("heading", "Titlu", [inline("heading", "Titlu", "Rezultate pe care le <em>vezi</em>"), sel("heading_size", "Mărime", HEADING_SIZES, "h1")]),
    block("text", "Text", [rich("text", "Text", "<p>Spune pe scurt ce problemă rezolvă produsul și de ce e diferit.</p>")]),
    block("checklist", "Listă cu bife", [textarea("items", "Elemente (câte unul pe rând)", "Livrare în 24–48h\nPlata ramburs\nRetur gratuit 30 de zile")]),
    block("buttons", "Butoane", buttons("Cumpără acum")[1:]),
    block("custom_liquid", "Liquid personalizat", [liquid("custom_liquid", "Cod Liquid", "Poți afișa date dinamice: titlul produsului, prețul sau metacâmpuri.")]),
], [{"name": "Media cu text (GIF/video)", "blocks": [{"type": "rating"}, {"type": "heading"}, {"type": "text"}, {"type": "checklist"}, {"type": "buttons"}]}]))

# ---------- Bandă cu recenzii ----------
write_schema(P + "c-review-marquee.liquid", section_schema("Bandă cu recenzii", [
    *heading_block("", "Iubit de <em>mii</em> de români", "", "h2", with_text=False),
    sel("rows", "Rânduri", [("1", "Un rând"), ("2", "Două rânduri (sensuri opuse)")], "2"),
    rng("speed", "Durata unei treceri", 20, 120, 5, 50, "s"),
    CARD("scheme-1"),
    *common_end("scheme-2"),
], [block("review", "Recenzie", [
    image("image", "Poză", GIF_INFO),
    rng("rating", "Stele", 1, 5, 1, 5),
    textarea("text", "Text", "Super calitate, a ajuns super repede!"),
    text("name", "Nume", "Mihai T."),
    chk("verified", "Verificat", True),
])], [{"name": "Bandă cu recenzii", "blocks": [
    {"type": "review"},
    {"type": "review", "settings": {"text": "Am comandat al doilea, pentru mama. Recomand!", "name": "Elena D."}},
    {"type": "review", "settings": {"text": "Exact ca în poze. Plata la livrare a fost un mare plus.", "name": "Cristina V."}},
    {"type": "review", "settings": {"text": "Comunicare rapidă și colet bine ambalat.", "name": "Radu S."}},
    {"type": "review", "settings": {"text": "Cel mai bun raport calitate-preț.", "name": "Alina G."}},
    {"type": "review", "settings": {"text": "Copiii îl adoră, folosim zilnic!", "name": "Bogdan F."}},
]}]))
