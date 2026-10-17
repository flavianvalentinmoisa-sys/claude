from cart_blocks import *
from patchlib import *
schema = {
  "name": "Coș lateral",
  "class": "c-cart-drawer-section",
  "settings": [
    par("Coșul lateral apare când „Tip coș” este „Panou lateral” (Setări temă > Coș). Ordinea blocurilor se respectă în fiecare zonă: sus, după produse, jos."),
    text("heading", "Titlu", "Coșul tău"),
    chk("show_count", "Afișează numărul de produse", True),
    rng("width", "Lățime pe desktop", 360, 560, 10, 440, "px"),
    scheme(default="scheme-1"),
    hdr("Produse"),
    chk("show_vendor", "Afișează producătorul", False),
    chk("show_compare_price", "Afișează prețul tăiat", True),
    chk("show_line_savings", "Afișează „Economisești X” la fiecare produs", True),
    hdr("Coș gol"),
    text("empty_heading", "Titlu", "Coșul tău este gol"),
    rich("empty_text", "Text", "<p>Descoperă produsele noastre preferate.</p>"),
    chk("show_login", "Afișează link de conectare", False),
  ],
  "blocks": drawer_blocks(),
}
write_schema(PATH + "/sections/cart-drawer.liquid", schema)

# pagina de coș: blocuri suplimentare
p = PATH + '/sections/main-cart-footer.liquid'
t, m, s = load(p)
types = {b['type'] for b in page_blocks()}
s['blocks'] = [b for b in s['blocks'] if b['type'] not in types] + page_blocks()
save(p, t, m, s)
