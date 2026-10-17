from schemalib import *
ACC = [("accent", "Accent"), ("savings", "Economii (verde)"), ("urgency", "Urgență (roșu)")]
POS = sel("position", "Poziție în coș", [("top", "Sus, sub titlu"), ("body", "După produse"), ("footer", "Jos, lângă total")], "body")

def progress_bar():
    return block("progress_bar", "Bară de progres", [
        sel("goal_type", "Obiectiv calculat după", [("amount", "Valoarea coșului (lei)"), ("quantity", "Numărul de produse")], "amount"),
        num("goal", "Obiectiv", 200, "Ex: 200 pentru livrare gratuită de la 200 lei."),
        inline("progress_message", "Mesaj progres", "Mai adaugă <strong>[remaining]</strong> pentru <strong>livrare gratuită</strong>", "[remaining] = suma sau numărul de produse rămase."),
        inline("success_message", "Mesaj obiectiv atins", "🎉 Felicitări! Ai <strong>livrare gratuită</strong>"),
        *icon(default="truck")[:2],
        sel("accent", "Culoare", ACC, "accent"),
    ], 1)

def checkpoints_bar():
    s = [
        sel("goal_type", "Praguri calculate după", [("amount", "Valoarea coșului (lei)"), ("quantity", "Numărul de produse")], "amount"),
        inline("progress_message", "Mesaj progres", "Mai adaugă <strong>[remaining]</strong> pentru <strong>[goal]</strong>", "[remaining] = cât mai lipsește, [goal] = următorul prag."),
        inline("success_message", "Mesaj toate pragurile atinse", "🎉 Ai deblocat toate recompensele!"),
        sel("accent", "Culoare", ACC, "accent"),
    ]
    defaults = [("Livrare gratuită", 150, "truck"), ("10% reducere", 250, "percent"), ("Cadou surpriză", 350, "gift")]
    for i, (label, amount, ic) in enumerate(defaults, start=1):
        s += [
            hdr(f"Pragul #{i}"),
            chk(f"goal_{i}_enable", "Activ", True),
            inline(f"goal_{i}_label", "Recompensă", label),
            num(f"goal_{i}_amount", "Valoare prag", amount),
            sel(f"goal_{i}_icon", "Iconiță", ICONS, ic),
        ]
    return block("checkpoints_bar", "Bară cu praguri", s, 1)

def countdown():
    return block("countdown_timer", "Timer coș", [
        inline("text", "Text", "⏰ Coșul tău este rezervat pentru <strong>[timer]</strong> minute", "[timer] = timerul."),
        num("duration", "Durată (secunde)", 600),
        chk("restart", "Repornește după expirare", True),
        chk("hide_on_end", "Ascunde după expirare", False),
        scheme(default="scheme-5"),
    ], 1)

def upsells():
    return block("product_upsells", "Produse upsell", [
        POS,
        inline("heading", "Titlu", "Ți-ar mai putea plăcea"),
        product_list("products", "Produse", 10),
        sel("layout", "Aranjare", [("slider", "Slider"), ("list", "Listă")], "slider"),
        text("button_label", "Text buton", "Adaugă"),
        chk("hide_in_cart", "Ascunde produsele care sunt deja în coș", True),
        sel("display", "Afișează", [("all", "Mereu"), ("products", "Doar când în coș sunt anumite produse")], "all"),
        product_list("trigger_products", "Produse care declanșează afișarea", 20),
    ])

def gift():
    return block("gift", "Cadou gratuit", [
        POS,
        par("Cadoul se adaugă automat în coș când clientul atinge pragul și se scoate dacă scade sub prag. Setează prețul produsului cadou la 0 lei sau creează o reducere automată de 100% pentru el."),
        product("product", "Produs cadou"),
        image("image", "Imagine (opțional)"),
        inline("description", "Descriere", "Cadou la comenzile peste 250 lei"),
        sel("goal_type", "Prag calculat după", [("amount", "Valoarea coșului (lei)"), ("quantity", "Numărul de produse")], "amount"),
        num("requirement", "Prag", 250),
        inline("locked_text", "Text blocat", "Mai adaugă <strong>[remaining]</strong> și îl primești gratuit"),
        inline("unlocked_text", "Text deblocat", "🎁 Cadoul a fost adăugat în coș!"),
        chk("auto_add", "Adaugă și elimină automat cadoul", True),
    ])

def text_with_icon():
    return block("text_with_icon", "Text cu iconiță", [
        POS,
        rich("text", "Text", "<p><strong>Plata ramburs</strong> la curier – plătești doar când primești coletul.</p>"),
        *icon(default="cash"),
        chk("boxed", "Casetă colorată", True),
    ])

def icons_with_text():
    s = [POS]
    defaults = [("Livrare 24–48h", "truck"), ("Retur 30 de zile", "return"), ("Plată sigură", "lock")]
    for i, (t_, ic) in enumerate(defaults, start=1):
        s += [hdr(f"Iconița #{i}"), sel(f"icon_{i}", "Iconiță", ICONS, ic), inline(f"text_{i}", "Text", t_)]
    return block("icons_with_text", "Iconițe cu text", s)

def image_b():
    return block("image", "Imagine", [POS, image("image", "Imagine"), url("link", "Link")])

def payments():
    return block("payment_badges", "Metode de plată", [chk("show_cod", "Afișează „Ramburs”", True), text("cod_label", "Text ramburs", "Ramburs")], 1)

def discount_field():
    return block("discount_field", "Cod de reducere", [
        text("placeholder", "Text câmp", "Cod de reducere"),
        text("button_label", "Text buton", "Aplică"),
    ], 1)

def cart_note():
    return block("cart_note", "Notă comandă", [
        text("label", "Titlu", "Adaugă o mențiune la comandă"),
        text("placeholder", "Text ajutător", "Ex: Sunați înainte de livrare"),
    ], 1)

def subtotals():
    return block("subtotals", "Total", [
        chk("show_subtotal", "Afișează totalul fără reduceri (tăiat)", True),
        text("subtotal_label", "Text total inițial", "Preț inițial"),
        chk("show_savings", "Afișează economia totală", True),
        text("savings_label", "Text economie", "Ai economisit"),
        text("total_label", "Text total", "Total"),
        chk("show_tax_note", "Afișează nota despre TVA și livrare", True),
    ], 1)

def tnc():
    return block("tnc_checkbox", "Acord termeni", [
        inline("text", "Text", "Sunt de acord cu <a href=\"/policies/terms-of-service\">termenii și condițiile</a>"),
        inline("warning", "Mesaj eroare", "Te rugăm să accepți termenii și condițiile"),
        chk("disable_checkout", "Butonul de comandă arată dezactivat până la bifare", True),
    ], 1)

def checkout_button():
    return block("checkout_button", "Buton finalizare", [
        text("label", "Text buton", "Finalizează comanda"),
        chk("show_lock", "Iconiță lacăt", True),
        chk("price_in_button", "Afișează totalul în buton", False),
        chk("show_continue", "Link „Continuă cumpărăturile”", True),
        text("continue_label", "Text link", "Continuă cumpărăturile"),
        chk("show_dynamic_checkout", "Butoane de plată rapidă (Shop Pay, Apple Pay...)", False),
    ], 1)

def custom_liquid():
    return block("custom_liquid", "Cod Liquid", [POS, liquid("custom_liquid", "Cod Liquid")])

def drawer_blocks():
    return [progress_bar(), checkpoints_bar(), countdown(), upsells(), gift(), text_with_icon(), icons_with_text(),
            image_b(), payments(), discount_field(), cart_note(), subtotals(), tnc(), checkout_button(), custom_liquid()]

def page_blocks():
    # blocuri suplimentare pentru pagina de coș (main-cart-footer)
    pb = progress_bar(); pb['settings'] = pb['settings']
    t = text_with_icon(); t['settings'] = [s for s in t['settings'] if s.get('id') != 'position']
    i = icons_with_text(); i['settings'] = [s for s in i['settings'] if s.get('id') != 'position']
    return [pb, checkpoints_bar(), discount_field(), payments(), t, i, tnc()]
