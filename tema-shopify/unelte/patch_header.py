import sys; sys.path.insert(0, sys.argv[2])
from patchlib import *; from schemalib import *
p = sys.argv[1] + '/sections/header.liquid'
t, m, s = load(p)
insert_after(s['settings'], 'menu_type_desktop', [
  hdr("Mega meniu cu produse"),
  text("mega_menu_products_links", "Meniuri cu produse", info="Titlurile elementelor de meniu (separate prin virgulă) în care mega meniul afișează produse. Ex: Bărbați, Femei. Produsele sunt luate din colecția la care duce linkul."),
  rng("mega_menu_products_count", "Număr produse", 2, 8, 1, 4),
  chk("mega_menu_collection_images", "Afișează imaginile colecțiilor din submeniu", False),
])
save(p, t, m, s)
print('ok')
