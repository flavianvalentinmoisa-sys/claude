from schemalib import *
P = PATH + "/sections/"
COLS = lambda d=3: rng("columns_desktop", "Coloane pe desktop", 1, 5, 1, d)

# ---------- Testimoniale ----------
write_schema(P + "c-testimonials.liquid", section_schema("Testimoniale", [
    *heading_block("Recenzii", "Ce spun <em>clienții</em> noștri", "", "h2"),
    sel("layout", "Aranjare", [("slider", "Slider"), ("grid", "Grilă")], "slider"),
    COLS(3),
    sel("card_style", "Stil card", [("bordered", "Cu bordură"), ("shadow", "Cu umbră"), ("plain", "Simplu")], "shadow"),
    scheme("card_color_scheme", "Schemă de culori card", "scheme-1"),
    chk("show_quote_icon", "Afișează ghilimele", True),
    chk("show_verified", "Bifă de client verificat", True),
    hdr("Slider"),
    chk("autoplay", "Derulare automată", False),
    rng("autoplay_speed", "Schimbă la fiecare", 3, 10, 1, 5, "s"),
    chk("show_dots", "Puncte paginare", True),
    chk("arrows_overlay", "Săgeți peste carduri", False),
    *common_end("scheme-2"),
], [block("testimonial", "Testimonial", [
    rng("rating", "Notă", 0, 5, 0.5, 5, info="0 = fără stele"),
    inline("title", "Titlu"),
    rich("text", "Text", "<p>Am cumpărat pentru mine și apoi încă una pentru soț. Dormim amândoi mult mai bine, fără dureri de gât dimineața.</p>"),
    text("author", "Nume", "Elena V."),
    text("location", "Oraș / detalii", "Cluj-Napoca"),
    image("avatar", "Poză autor"),
    image("image", "Imagine card (opțional)"),
    product("product", "Produs cumpărat (opțional)"),
])], [{"name": "Testimoniale", "blocks": [{"type": "testimonial"}, {"type": "testimonial", "settings": {"author": "Radu M.", "location": "București", "text": "<p>Livrare rapidă, plata la curier, produs exact ca în descriere. Recomand!</p>"}}, {"type": "testimonial", "settings": {"author": "Ioana P.", "location": "Iași", "text": "<p>Calitate foarte bună la prețul ăsta. Am primit și un cadou mic în colet, drăguț gest.</p>"}}]}]))

# ---------- Comentarii Facebook ----------
write_schema(P + "c-facebook-reviews.liquid", section_schema("Comentarii Facebook", [
    *heading_block("", "Ce spun oamenii pe <em>Facebook</em>", "", "h2"),
    sel("layout", "Aranjare", [("list", "Listă"), ("masonry", "Coloane")], "masonry"),
    COLS(3),
    text("like_label", "Text „Apreciază”", "Apreciază"),
    text("reply_label", "Text „Răspunde”", "Răspunde"),
    *common_end("scheme-1"),
], [block("comment", "Comentariu", [
    text("name", "Nume", "Maria Popescu"),
    image("avatar", "Poză profil"),
    rich("text", "Comentariu", "<p>Am primit-o ieri și deja simt diferența. Mulțumesc pentru livrarea atât de rapidă! 😍</p>"),
    image("image", "Imagine atașată"),
    num("likes", "Număr reacții", 24),
    chk("reaction_like", "Reacție „Like”", True),
    chk("reaction_love", "Reacție „Love”", True),
    text("time", "Timp", "2 z"),
])], [{"name": "Comentarii Facebook", "blocks": [{"type": "comment"}, {"type": "comment", "settings": {"name": "Andrei Ionescu", "text": "<p>A doua comandă de la voi, la fel de mulțumit. Recomand cu încredere!</p>", "likes": 12, "time": "5 z"}}, {"type": "comment", "settings": {"name": "Cristina D.", "text": "<p>Calitate peste așteptări, iar curierul a sunat înainte. Super!</p>", "likes": 31, "time": "1 săpt."}}]}]))

# ---------- Perete recenzii (stil Trustpilot) ----------
write_schema(P + "c-review-wall.liquid", section_schema("Recenzii verificate", [
    *heading_block("", "Peste <em>2.000</em> de recenzii de 5 stele", "", "h2"),
    chk("show_summary", "Afișează rezumatul notei", True),
    text("summary_label", "Calificativ", "Excelent"),
    rng("summary_rating", "Notă medie", 3, 5, 0.1, 4.8),
    inline("summary_text", "Text rezumat", "Bazat pe <strong>2.341</strong> recenzii"),
    sel("star_style", "Stil stele", [("trustpilot", "Pătrate verzi (stil Trustpilot)"), ("stars", "Stele clasice")], "trustpilot"),
    sel("layout", "Aranjare", [("slider", "Slider"), ("grid", "Grilă")], "slider"),
    COLS(3),
    chk("autoplay", "Derulare automată", False),
    chk("show_verified", "„Cumpărător verificat”", True),
    scheme("card_color_scheme", "Schemă de culori card", "scheme-1"),
    *common_end("scheme-2"),
], [block("review", "Recenzie", [
    rng("rating", "Notă", 1, 5, 0.5, 5),
    inline("title", "Titlu", "Exact ce căutam"),
    rich("text", "Text", "<p>Comandă simplă, livrare în două zile, produs de calitate. Voi mai comanda.</p>"),
    text("author", "Nume", "Daniel S."),
    text("date", "Dată", "acum 3 zile"),
])], [{"name": "Recenzii verificate", "blocks": [{"type": "review"}, {"type": "review", "settings": {"author": "Alina G.", "title": "Recomand 100%", "text": "<p>Am avut o întrebare și am primit răspuns imediat. Produsul e superb.</p>", "date": "acum o săptămână"}}, {"type": "review", "settings": {"author": "Mihai T.", "title": "Raport calitate-preț excelent", "text": "<p>Mi-a depășit așteptările. Ambalaj frumos și livrare rapidă.</p>", "date": "acum 2 săptămâni"}}]}]))

# ---------- Instagram stories ----------
write_schema(P + "c-insta-stories.liquid", section_schema("Instagram stories", [
    *heading_block("", "Urmărește-ne pe <em>Instagram</em>", "", "h3"),
    text("account_name", "Nume cont", "@magazinul.meu"),
    image("account_avatar", "Poză cont"),
    rng("thumb_size", "Mărime cercuri", 56, 120, 4, 84, "px"),
    sel("thumbs_alignment", "Aliniere cercuri", [("left", "Stânga"), ("center", "Centru")], "center"),
    rng("story_duration", "Durată story (imagini)", 3, 15, 1, 5, "s"),
    *common_end("scheme-1", 32, 32),
], [block("story", "Story", [
    text("label", "Etichetă", "Noutăți"),
    image("thumbnail", "Imagine cerc"),
    image("image", "Imagine story (9:16)"),
    video("video", "Sau video story"),
    rich("caption", "Text"),
    text("button_label", "Text buton"),
    url("button_link", "Link buton"),
    product("product", "Sau produs (link)"),
])], [{"name": "Instagram stories", "blocks": [{"type": "story", "settings": {"label": "Noutăți"}}, {"type": "story", "settings": {"label": "Recenzii"}}, {"type": "story", "settings": {"label": "Cum se folosește"}}, {"type": "story", "settings": {"label": "Oferte"}}]}]))

# ---------- Înainte / după ----------
write_schema(P + "c-before-after.liquid", section_schema("Înainte și după", [
    *heading_block("Rezultate reale", "Vezi <em>diferența</em>", "<p>Trage de bara din mijloc pentru a compara.</p>", "h2", "left"),
    text("button_label", "Text buton"),
    url("button_link", "Link buton"),
    sel("layout", "Aranjare", [("image-right", "Text stânga, imagine dreapta"), ("image-left", "Imagine stânga, text dreapta"), ("stacked", "Text deasupra")], "image-right"),
    hdr("Imagini"),
    image("image_before", "Imagine înainte"),
    image("image_after", "Imagine după"),
    text("label_before", "Etichetă înainte", "Înainte"),
    text("label_after", "Etichetă după", "După"),
    rng("start_position", "Poziție inițială", 10, 90, 5, 50, "%"),
    sel("aspect_ratio", "Proporție", [("1", "Pătrat"), ("4 / 5", "Portret"), ("4 / 3", "Peisaj"), ("16 / 9", "Lat")], "1"),
    rng("radius", "Rotunjire colțuri", 0, 40, 2, 16, "px"),
    *common_end("scheme-1"),
], None, [{"name": "Înainte și după"}]))

# ---------- Rezultate ----------
write_schema(P + "c-results.liquid", section_schema("Rezultate", [
    *heading_block("Studiu pe 500 de clienți", "Rezultate <em>dovedite</em>", "", "h2", "left"),
    sel("style", "Stil", [("bars", "Bare"), ("circles", "Cercuri")], "bars"),
    sel("accent", "Culoare", [("accent", "Accent"), ("savings", "Economii (verde)"), ("urgency", "Urgență (roșu)")], "accent"),
    image("image", "Imagine"),
    sel("image_position", "Poziție imagine", [("left", "Stânga"), ("right", "Dreapta")], "left"),
    inline("footnote", "Notă de subsol", "*Rezultate raportate de clienți după 30 de zile de utilizare."),
    *common_end("scheme-1"),
], [block("result", "Rezultat", [
    rng("percent", "Valoare", 0, 100, 1, 94),
    text("suffix", "Sufix", "%"),
    inline("text", "Text", "au dormit mai bine încă din prima săptămână"),
])], [{"name": "Rezultate", "blocks": [{"type": "result"}, {"type": "result", "settings": {"percent": 89, "text": "au scăpat de durerile de gât"}}, {"type": "result", "settings": {"percent": 97, "text": "ar recomanda produsul unui prieten"}}]}]))

# ---------- Tabel comparativ ----------
VAL = [("yes", "Da (bifă)"), ("no", "Nu (x)"), ("partial", "Parțial (~)")]
write_schema(P + "c-comparison-table.liquid", section_schema("Tabel comparativ", [
    *heading_block("", "De ce să ne <em>alegi</em> pe noi?", "", "h2"),
    text("feature_label", "Titlu coloană caracteristici", "Caracteristici"),
    text("brand_name", "Numele tău", "Noi"),
    image("logo", "Sau logo"),
    text("competitor_1", "Concurent 1", "Alții"),
    text("competitor_2", "Concurent 2 (opțional)"),
    sel("accent", "Culoare coloana ta", [("accent", "Accent"), ("savings", "Verde")], "accent"),
    text("button_label", "Text buton", "Comandă acum"),
    url("button_link", "Link buton"),
    *common_end("scheme-1"),
], [block("row", "Rând", [
    inline("feature", "Caracteristică", "Livrare în 24–48 de ore"),
    text("us", "Valoare noi", "yes", "yes = bifă, no = x, partial = ~ sau orice text."),
    text("comp_1", "Valoare concurent 1", "no"),
    text("comp_2", "Valoare concurent 2", "no"),
])], [{"name": "Tabel comparativ", "blocks": [{"type": "row"}, {"type": "row", "settings": {"feature": "Plata ramburs la curier", "comp_1": "partial"}}, {"type": "row", "settings": {"feature": "Retur gratuit 30 de zile"}}, {"type": "row", "settings": {"feature": "Garanție 2 ani"}}, {"type": "row", "settings": {"feature": "Suport clienți în română"}}]}]))

# ---------- Logo-uri ----------
write_schema(P + "c-logo-list.liquid", section_schema("Apărut în (logo-uri)", [
    *heading_block("", "Au scris despre noi", "", "h4", "center", with_text=False),
    sel("layout", "Aranjare", [("grid", "Rând fix"), ("marquee", "Bandă derulantă")], "grid"),
    rng("logo_height", "Înălțime logo", 16, 80, 2, 36, "px"),
    chk("grayscale", "Logo-uri alb-negru", True),
    rng("speed", "Viteză bandă", 10, 80, 2, 30, "s"),
    chk("full_width", "Lățime completă", False),
    *common_end("scheme-1", 32, 32),
], [block("logo", "Logo", [image("image", "Logo"), text("name", "Nume (dacă nu ai logo)", "Logo"), url("link", "Link")])],
 [{"name": "Apărut în (logo-uri)", "blocks": [{"type": "logo", "settings": {"name": "Logo 1"}}, {"type": "logo", "settings": {"name": "Logo 2"}}, {"type": "logo", "settings": {"name": "Logo 3"}}, {"type": "logo", "settings": {"name": "Logo 4"}}]}]))
