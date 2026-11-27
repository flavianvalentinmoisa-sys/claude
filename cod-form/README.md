# Formular COD (plata la livrare) pentru Shopify

Formular de comandă cu plata la livrare, făcut pentru clienții din România, în locul checkout-ului Shopify (ca Releasit COD Form).

Clientul apasă „Cumpără acum” sau „Adaugă în coș” și se deschide o fereastră cu:

- rezumatul comenzii: produsul, oferta aleasă (1, 2 sau 3 bucăți), livrarea de 19,99 lei, totalul și cât economisește;
- câmpurile de livrare: nume și prenume, telefon, județ (listă cu toate cele 42), localitate, adresă, e-mail opțional;
- plata la livrare (ramburs);
- butonul „Finalizează comanda · 149,97 lei”.

După trimitere vede confirmarea, cu numărul comenzii și adresa de livrare. Comanda apare direct în Shopify, la **Comenzi**, cu plata „În așteptare” și etichetele `COD` și `formular-cod`.

## Cum funcționează

```
Pagina de produs (tema)  ──►  Server (Cloudflare Worker)  ──►  Shopify Admin API (orderCreate)
   formularul COD               recalculează prețurile          creează comanda
```

- **Tema** (`theme/`): blocul „Formular COD” din secțiunea produsului. Preia oferta aleasă la „Alege oferta”, cadourile și upsell-urile, la fel ca butonul de coș.
- **Serverul** (`worker/`): prețurile vin **din Shopify**, nu din browser, deci nimeni nu poate trimite o comandă cu alt preț. Reducerea din ofertă e acceptată doar până la `MAX_DISCOUNT_PERCENT` (40%). Serverul are și:
  - verificarea telefonului românesc (07xx…, +40…, 0040…, fixe 02x/03x);
  - un câmp ascuns, care oprește roboții;
  - maximum 5 comenzi la 10 minute de pe aceeași adresă IP;
  - protecție la dublu-click: aceeași comandă nu se creează de două ori.
- Dacă magazinul are pixel Meta sau TikTok, formularul trimite automat `InitiateCheckout` și `Purchase`, cu valoarea comenzii.
- **Până nu completezi adresa serverului în temă, nu se schimbă nimic**: butonul adaugă în coș, ca înainte.

## Instalare (o singură dată, cam 15 minute)

### 1. Creează aplicația în Shopify (pentru cheia de acces)

1. Intră pe **dev.shopify.com** cu contul magazinului și deschide **Apps → Create app**. Nume: „Formular COD”.
2. La **Versions → Create version**, bifează permisiunile (Access scopes):
   - `write_orders`
   - `read_products`
3. Salvează versiunea (Release), apoi **Install app** pe magazin.
4. În **Settings** ai **Client ID** și **Client secret**. Le folosești la pasul 2.

> Dacă primești eroarea `shop_not_permitted`, magazinul nu e în aceeași organizație cu aplicația. Verifică în Dev Dashboard, la **Stores**, că magazinul apare acolo.

### 2. Pune serverul online (Cloudflare Workers, gratuit)

Ai nevoie de un cont gratuit pe **cloudflare.com** și de Node.js instalat pe calculator.

```bash
cd cod-form/worker
```

```bash
npm install
```

```bash
npx wrangler login
```

```bash
npx wrangler secret put SHOPIFY_CLIENT_ID
```

```bash
npx wrangler secret put SHOPIFY_CLIENT_SECRET
```

Pune în `wrangler.toml`, la `ALLOWED_ORIGINS`, adresele site-ului, separate prin virgulă. Exemplu: `https://utilperfect.ro,https://www.utilperfect.ro,https://qyxgje-xz.myshopify.com`. Apoi:

```bash
npx wrangler deploy
```

Primești o adresă de forma `https://formular-cod.<cont>.workers.dev`. Verifică în browser `https://formular-cod.<cont>.workers.dev/health`. Trebuie să vezi `{"ok":true,"shop":"..."}`.

### 3. Pornește formularul în temă

1. **Magazin online → Teme → Personalizează** pe pagina produsului.
2. În secțiunea produsului, blocul **„Formular COD”** (e deja adăugat).
3. La **Adresa serverului** pune adresa de la pasul 2 și salvează.
4. Fă o comandă de test de pe telefon, apoi șterge-o din **Comenzi**.

## Setări utile

Toate textele din formular (titlu, buton, confirmare, plata) se schimbă din editorul temei, în blocul „Formular COD”.

În `worker/wrangler.toml`:

| Setare | Ce face |
| --- | --- |
| `SHIPPING_PRICE` | Costul livrării (acum `19.99`) |
| `SHIPPING_TITLE` | Numele livrării pe comandă |
| `MAX_DISCOUNT_PERCENT` | Reducerea maximă acceptată din ofertă |
| `MAX_ORDERS_PER_IP` | Câte comenzi pot veni de pe același IP în 10 minute |

După orice schimbare: `npx wrangler deploy`.

## Teste

```bash
cd cod-form/worker && npm test
```

## Fișierele din temă

Copiile din `theme/` sunt deja urcate în tema „UtilPerfect - final”:

- `snippets/c-pb-cod-form.liquid`: fereastra formularului
- `assets/c-cod-form.js`: preluarea butonului, rezumatul, trimiterea, confirmarea
- `assets/c-cod-form.css`: aspectul (de jos în sus pe mobil, centrat pe desktop)
- În `sections/main-product.liquid` s-a adăugat blocul `cod_form`, iar în `snippets/c-product-block.liquid`, afișarea lui.
