from schemalib import *
from patchlib import load, save
def extra_blocks():
    return [
        block("rating_stars", "Stele rating", [rng("rating", "Notă", 1, 5, 0.1, 4.9), inline("text", "Text", "<strong>4.9</strong> din 2.000+ recenzii"), rng("star_size", "Mărime stele", 12, 32, 1, 18, "px")], 1),
        block("trustpilot_stars", "Stele Trustpilot", [rng("rating", "Notă", 1, 5, 0.1, 4.8), inline("text", "Text", "Excelent pe <strong>Trustpilot</strong>"), rng("star_size", "Mărime stele", 12, 32, 1, 20, "px")], 1),
        block("atc_button", "Buton adaugă în coș", [product("product", "Produs"), text("label", "Text buton"), chk("show_price", "Afișează prețul", True), chk("secondary", "Stil contur", False)], 1),
        block("text_with_icon", "Text cu iconiță", [rich("text", "Text", "<p>Livrare gratuită peste 200 lei</p>"), *icon(default="truck"), chk("boxed", "Casetă", False)]),
    ]
for f in ['image-banner', 'image-with-text', 'rich-text']:
    p = PATH + f'/sections/{f}.liquid'
    t, m, s = load(p)
    new = extra_blocks()
    s['blocks'] = [b for b in s['blocks'] if b['type'] not in {n['type'] for n in new}] + new
    save(p, t, m, s)
