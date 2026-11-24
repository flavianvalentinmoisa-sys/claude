# Shopify – tema FLV

- Homepage-ul îl gestionezi direct din editorul Shopify.
- `base/product.base.json` – template-ul complet de produs din temă (folosește secțiunea `base/c-photo-reviews.liquid`, care trebuie urcată în temă).
- `products/<sufix>.json` – conținutul scurt pentru fiecare produs (vezi `products/exemplu.json`).
- `tools/make_product_template.py` – generează `templates/product.<sufix>.json`:

```bash
python3 tools/make_product_template.py products/exemplu.json
```

Orice cheie e opțională; `null` scoate secțiunea/blocul; `overrides` setează orice câmp prin cale (`"why.settings.style": "pop"`).
