import json
from patchlib import *
from product_blocks import *
for name, exclude in [('main-product', set()), ('featured-product', {'sticky_atc'})]:
    p = PATH + f'/sections/{name}.liquid'
    t, m, s = load(p)
    existing = {b['type'] for b in s['blocks']}
    new = [b for b in all_blocks() if b['type'] not in exclude]
    # actualizează dacă există deja (rulări repetate)
    s['blocks'] = [b for b in s['blocks'] if b['type'] not in {n['type'] for n in new}] + new
    price = find_block(s, 'price')
    price['settings'] = [x for x in price.get('settings', []) if x.get('id') not in ('show_savings', 'price_size')] + price_settings()
    if name == 'main-product':
        title = find_block(s, 'title')
        title['settings'] = [x for x in title.get('settings', []) if x.get('id') not in ('title_size', 'show_tag_badges')] + title_settings()
    names = [b.get('name', '') for b in s['blocks']]
    too_long = [n for n in names if len(n) > 25]
    assert not too_long, too_long
    save(p, t, m, s)
    print(name, 'blocks:', len(s['blocks']), 'max_blocks:', s.get('max_blocks'))
