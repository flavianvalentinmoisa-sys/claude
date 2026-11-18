# Checklist — Bandă de noapte pentru picioarele neliniștite (pereche)

1. Shopify Admin → Produse → Import → încarcă `import-produs.csv` (produsul intră ca **draft**).
2. Online Store → Teme → Editează cod → `templates/` → Adaugă template `product` cu numele `banda-noapte-picioare-nelinistite` și lipește conținutul din `product.banda-noapte-picioare-nelinistite.json` (sau urcă tema din zip, dacă ai folosit `--zip`).
3. În pagina produsului (Admin) → Theme template → alege **product.banda-noapte-picioare-nelinistite**.
4. Verifică pozele importate; înlocuiește pozele luate de la competitor cu poze proprii/ale furnizorului.
5. Creează reducerea automată de volum în Shopify (Discounts) — tema doar AFIȘEAZĂ prețul ofertelor, reducerea reală trebuie setată: 2 buc → -20%, 3 buc → -30%.
- Recenzii: secțiunea de recenzii e scoasă. Adaug-o după ce ai recenzii reale (import din app/clienți).
- Rating/număr clienți: ascunse până ai date reale.
- Secțiunea de rezultate procentuale e scoasă (nu avem date măsurate).
- Publică produsul (Status: Active) după ce verifici pagina în preview.

## Note de la build
- Secțiunea 'results' scoasă: lipsește 'results' din spec.
- Secțiunea 'photo_reviews' scoasă: lipsește 'reviews' din spec.
