import json, sys
root = sys.argv[1]
RO = {
 "general": {"meta": {"tags": "etichete „{{ tags }}”", "page": "Pagina {{ page }}"}},
 "carpatica": {
  "general": {"copy": "Copiază", "copied": "Copiat!", "free": "GRATUIT", "added": "Adăugat", "select_option": "Alege", "close": "Închide", "previous": "Anterior", "next": "Următor", "play": "Redă", "pause": "Pauză", "mute": "Fără sonor", "unmute": "Cu sonor", "view_product": "Vezi produsul", "shop_now": "Cumpără acum", "you_save": "Economisești {{ amount }}", "you_save_html": "Economisești {{ amount }}", "save_percent": "-{{ percent }}%", "save_amount": "-{{ amount }}", "each": "{{ price }} / buc.", "pieces": {"one": "{{ count }} bucată", "few": "{{ count }} bucăți", "other": "{{ count }} de bucăți"}},
  "dates": {"days": "duminică, luni, marți, miercuri, joi, vineri, sâmbătă", "days_short": "Dum, Lun, Mar, Mie, Joi, Vin, Sâm", "months": "ianuarie, februarie, martie, aprilie, mai, iunie, iulie, august, septembrie, octombrie, noiembrie, decembrie", "months_short": "ian., feb., mar., apr., mai, iun., iul., aug., sept., oct., nov., dec."},
  "product": {"required_field": "Completează acest câmp", "reviews_count": {"one": "{{ count }} recenzie", "few": "{{ count }} recenzii", "other": "{{ count }} de recenzii"}, "verified_buyer": "Cumpărător verificat", "total": "Total", "add_bundle": "Adaugă pachetul în coș", "selected": "Selectat", "most_popular": "Cel mai popular", "gift_unlocked": "Cadou deblocat!", "gift_locked": "Blocat", "in_stock": "În stoc, gata de livrare", "low_stock": "Doar {{ count }} bucăți rămase", "size_chart": "Ghid mărimi", "added_to_order": "Adăugat la comandă"},
  "cart": {"remaining_for_goal": "Mai ai {{ amount }} până la {{ goal }}", "goal_reached": "Felicitări! Ai deblocat {{ goal }}", "you_saved": "Ai economisit", "discount_placeholder": "Cod de reducere", "apply": "Aplică", "discount_applied": "Codul {{ code }} a fost aplicat", "discount_invalid": "Codul nu este valid sau nu se aplică produselor din coș", "remove_discount": "Elimină codul {{ code }}", "terms_error": "Te rugăm să accepți termenii și condițiile pentru a continua", "add": "Adaugă", "added": "Adăugat", "upsell_heading": "Ți-ar mai putea plăcea", "free_gift": "Cadou gratuit", "reserved_for": "Coșul tău este rezervat pentru"},
  "popup": {"email_placeholder": "Adresa ta de email", "success": "Mulțumim pentru abonare!"},
  "track": {"placeholder": "Numărul AWB", "error": "Introdu numărul AWB"},
  "music": {"play": "Pornește muzica", "pause": "Oprește muzica"}
 }
}
EN = {
 "general": {"meta": {"tags": "tagged \"{{ tags }}\"", "page": "Page {{ page }}"}},
 "carpatica": {
  "general": {"copy": "Copy", "copied": "Copied!", "free": "FREE", "added": "Added", "select_option": "Select", "close": "Close", "previous": "Previous", "next": "Next", "play": "Play", "pause": "Pause", "mute": "Mute", "unmute": "Unmute", "view_product": "View product", "shop_now": "Shop now", "you_save": "You save {{ amount }}", "you_save_html": "You save {{ amount }}", "save_percent": "-{{ percent }}%", "save_amount": "-{{ amount }}", "each": "{{ price }} each", "pieces": {"one": "{{ count }} item", "other": "{{ count }} items"}},
  "dates": {"days": "Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday", "days_short": "Sun, Mon, Tue, Wed, Thu, Fri, Sat", "months": "January, February, March, April, May, June, July, August, September, October, November, December", "months_short": "Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec"},
  "product": {"required_field": "Please fill in this field", "reviews_count": {"one": "{{ count }} review", "other": "{{ count }} reviews"}, "verified_buyer": "Verified buyer", "total": "Total", "add_bundle": "Add bundle to cart", "selected": "Selected", "most_popular": "Most popular", "gift_unlocked": "Gift unlocked!", "gift_locked": "Locked", "in_stock": "In stock, ready to ship", "low_stock": "Only {{ count }} left", "size_chart": "Size guide", "added_to_order": "Added to order"},
  "cart": {"remaining_for_goal": "You're {{ amount }} away from {{ goal }}", "goal_reached": "Congrats! You unlocked {{ goal }}", "you_saved": "You saved", "discount_placeholder": "Discount code", "apply": "Apply", "discount_applied": "Code {{ code }} applied", "discount_invalid": "This code is not valid for the items in your cart", "remove_discount": "Remove code {{ code }}", "terms_error": "Please accept the terms and conditions to continue", "add": "Add", "added": "Added", "upsell_heading": "You may also like", "free_gift": "Free gift", "reserved_for": "Your cart is reserved for"},
  "popup": {"email_placeholder": "Your email address", "success": "Thanks for subscribing!"},
  "track": {"placeholder": "Tracking number", "error": "Please enter your tracking number"},
  "music": {"play": "Play music", "pause": "Pause music"}
 }
}
def merge(a, b):
    for k, v in b.items():
        if isinstance(v, dict) and isinstance(a.get(k), dict): merge(a[k], v)
        else: a[k] = v
for f, add in [('locales/ro.default.json', RO), ('locales/en.json', EN)]:
    p = f"{root}/{f}"
    d = json.load(open(p, encoding='utf-8'))
    merge(d, add)
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
