import json, re, os
root = '/home/user/claude/carpatica'
def schema(t):
    s = open(f'{root}/sections/{t}.liquid').read()
    return json.loads(re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema', s, re.S).group(1))
def preset_section(t, settings=None, block_overrides=None):
    pr = (schema(t).get('presets') or [{}])[0]
    blocks, order = {}, []
    for i, b in enumerate(pr.get('blocks', [])):
        bid = f"{b['type']}_{i}"
        st = dict(b.get('settings', {}))
        if block_overrides and i in block_overrides: st.update(block_overrides[i])
        blocks[bid] = {"type": b['type'], "settings": st}; order.append(bid)
    sec = {"type": t, "settings": {**pr.get('settings', {}), **(settings or {})}}
    if blocks: sec["blocks"] = blocks; sec["block_order"] = order
    return sec
def load(p):
    t = open(p).read(); t = re.sub(r'/\*.*?\*/', '', t, flags=re.S); return json.loads(t)
def save(p, d):
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=2)

# ---------- produs ----------
p = f'{root}/templates/product.json'; d = load(p)
main = d['sections']['main']
B = {
 "rating": {"type": "rating_stars", "settings": {"rating": 4.8, "text": "<strong>4.8</strong> (2.341 recenzii)", "link_to": "#recenzii"}},
 "title": {"type": "title", "settings": {"title_size": "h2", "show_tag_badges": True}},
 "price": {"type": "price", "settings": {"show_savings": "amount", "price_size": "medium"}},
 "avatars": {"type": "review_avatars", "settings": {"text": "Peste <strong>10.000</strong> de clienți mulțumiți", "show_stars": False}},
 "variant_picker": {"type": "variant_picker", "settings": {"picker_type": "button", "swatch_shape": "circle"}},
 "quantity_breaks": {"type": "quantity_breaks", "settings": {}},
 "quantity_selector": {"type": "quantity_selector", "settings": {}},
 "buy_buttons": {"type": "buy_buttons", "settings": {"show_dynamic_checkout": False, "show_gift_card_recipient": True}},
 "urgency": {"type": "urgency", "settings": {"only_low_stock": True, "threshold": 10}},
 "eta": {"type": "estimated_shipping", "settings": {}},
 "benefits": {"type": "emoji_benefits", "settings": {}},
 "guarantee": {"type": "text_with_icon", "settings": {}},
 "payments": {"type": "payment_badges", "settings": {"alignment": "center", "text": "Plată 100% sigură"}},
 "description": {"type": "collapsible_tab", "settings": {"heading": "Descriere", "icon": "clipboard", "content": "<p>Descrierea produsului apare aici automat. Editează textul în Produse > produsul tău.</p>"}},
 "shipping": {"type": "collapsible_tab", "settings": {"heading": "Livrare și plată", "icon": "truck", "content": "<p>Livrare prin curier în 24–48 de ore lucrătoare. Plata ramburs, la primirea coletului, sau online cu cardul.</p>"}},
 "returns": {"type": "collapsible_tab", "settings": {"heading": "Retur și garanție", "icon": "return", "content": "<p>Ai 30 de zile pentru retur gratuit. Toate produsele au garanție 2 ani.</p>"}},
 "sticky": {"type": "sticky_atc", "settings": {"rating": 4.8, "rating_text": "<strong>4.8</strong> (2.341)"}},
}
# păstrăm descrierea reală a produsului prin blocul „description” al Dawn
B["description"] = {"type": "description", "settings": {}}
main['blocks'] = B; main['block_order'] = list(B.keys())
main['settings'].update({"gallery_layout": "thumbnail_slider", "media_size": "large", "mobile_thumbnails": "show", "media_fit": "cover", "image_zoom": "lightbox", "enable_sticky_info": True})
d['sections']['related-products']['settings']['heading'] = 'Ți-ar putea plăcea și'
d['sections']['icon_bar'] = preset_section('c-icon-bar')
d['sections']['compare'] = preset_section('c-comparison-table')
d['sections']['reviews'] = preset_section('c-review-wall', {"anchor": "recenzii"})
d['order'] = ['main', 'icon_bar', 'compare', 'reviews', 'disclosures', 'related-products']
save(p, d)

# ---------- prima pagină ----------
p = f'{root}/templates/index.json'
hero = preset_section('c-parallax-hero')
hero['blocks'] = {k: v for k, v in hero['blocks'].items() if v['type'] == 'content'}
hero['block_order'] = [k for k in hero['block_order'] if k in hero['blocks']]
fc = load(p)['sections']['featured_collection']
fc['settings'].update({"title": "Cele mai vândute", "heading_size": "h2", "collection": "all", "products_to_show": 8, "columns_desktop": 4, "enable_quick_add": True, "show_view_all": True, "color_scheme": "scheme-1"})
idx = {"sections": {
  "hero": hero,
  "icon_bar": preset_section('c-icon-bar'),
  "featured_collection": fc,
  "ticker": preset_section('c-ticker'),
  "testimonials": preset_section('c-testimonials'),
  "compare": preset_section('c-comparison-table'),
  "results": preset_section('c-results'),
  "faq": load(f'{root}/templates/page.faq.json')['sections']['faq'],
  "newsletter": {"type": "newsletter", "blocks": {
      "heading": {"type": "heading", "settings": {"heading": "Abonează-te și primești 10% reducere", "heading_size": "h2"}},
      "paragraph": {"type": "paragraph", "settings": {"text": "<p>Află primul despre oferte și produse noi.</p>"}},
      "email_form": {"type": "email_form", "settings": {}}},
    "block_order": ["heading", "paragraph", "email_form"],
    "settings": {"color_scheme": "scheme-2", "full_width": True, "padding_top": 48, "padding_bottom": 56}},
}, "order": ["hero", "icon_bar", "featured_collection", "ticker", "testimonials", "compare", "results", "faq", "newsletter"]}
idx['sections']['faq']['settings']['heading_size'] = 'h2'
save(p, idx)

# ---------- coș ----------
p = f'{root}/templates/cart.json'; d = load(p)
foot = d['sections']['cart-footer'] if 'cart-footer' in d['sections'] else [v for v in d['sections'].values() if v['type'] == 'main-cart-footer'][0]
foot.setdefault('blocks', {})
foot['blocks'].update({
  "progress": {"type": "progress_bar", "settings": {}},
  "discount": {"type": "discount_field", "settings": {}},
  "payments": {"type": "payment_badges", "settings": {}},
})
order = foot.get('block_order', [])
foot['block_order'] = ['progress', 'discount'] + [o for o in order if o not in ('progress', 'discount', 'payments')] + ['payments']
for sid, s in d['sections'].items():
    if s['type'] == 'featured-collection':
        s['settings']['title'] = 'Poate te interesează și'
    if s['type'] == 'newsletter':
        for b in s.get('blocks', {}).values():
            if b['type'] == 'heading': b['settings']['heading'] = 'Abonează-te la noutăți'
            if b['type'] == 'paragraph': b['settings']['text'] = '<p>Află primul despre oferte și produse noi.</p>'
save(p, d)

# ---------- parolă ----------
p = f'{root}/templates/password.json'; d = load(p)
for s in d['sections'].values():
    for b in (s.get('blocks') or {}).values():
        if b['type'] == 'heading': b['settings']['heading'] = 'Deschidem în curând'
        if b['type'] == 'paragraph': b['settings']['text'] = '<p>Lasă-ne adresa de email și află primul când ne lansăm.</p>'
save(p, d)

# ---------- subsol ----------
p = f'{root}/sections/footer-group.json'; d = load(p)
f = d['sections']['footer']
f['settings']['newsletter_heading'] = 'Abonează-te la noutăți'
f['blocks'] = {
  "menu": {"type": "link_list", "settings": {"heading": "Magazin", "menu": "footer"}},
  "info": {"type": "link_list", "settings": {"heading": "Informații", "menu": "main-menu"}},
  "contact": {"type": "contact", "settings": {}},
  "anpc": {"type": "anpc", "settings": {"heading": "Protecția consumatorilor"}},
}
f['block_order'] = ["menu", "info", "contact", "anpc"]
save(p, d)
print('șabloane actualizate')
