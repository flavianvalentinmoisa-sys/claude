# Analiza completă Shrine Pro 1.3.0 – specificație pentru tema proprie

Scopul documentului: tot ce **face** tema Shrine Pro, ca listă de funcții, ca să construim
o temă proprie, scrisă de la zero pe baza **Dawn** (tema oficială open-source Shopify),
cu aceleași funcții și cu tot editorul + magazinul în limba română.

> Nu copiem cod din Shrine. Arhiva analizată este o copie „nulled” care conține un script
> malițios (`layout/theme.liquid`, linia 29: `https://shopify.jsdeliver.cloud/js/config.js`)
> și un `main.js` obfuscat. Nu trebuie urcată pe niciun magazin.

Fișiere de referință din acest folder:
- `inventar-setari-globale.txt` – toate cele ~300 de setări globale (Theme settings).
- `inventar-setari-sectiuni.txt` – fiecare secțiune, fiecare bloc și fiecare setare (~4.700 linii).

---

## 1. Structura generală

| Componentă | Număr | Observații |
|---|---|---|
| Secțiuni | 79 `.liquid` + 6 grupuri JSON | ~70 configurabile din editor |
| Snippet-uri | 84 | din care ~35 iconițe |
| Template-uri | 16 + 7 cont client | inclusiv `page.faq`, `page.track-order`, `page.contact` |
| Asset-uri | 37 | `base.css` 376 KB, `main.js` 196 KB (obfuscat) |
| Limbi magazin | 30 | există `ro-RO.json` (468 linii) |
| Limbi editor | 21 `.schema.json` | **nu există română** – editorul e în engleză |

**Concluzie tehnică:** Shrine este construită pe **Dawn** (aceleași fișiere de bază:
`facets.js`, `media-gallery.js`, `predictive-search`, `cart-notification`, `quick-add`,
`pickup-availability`, `customer.css` etc.), peste care s-au adăugat funcții de conversie
pentru dropshipping. Deci pornind de la Dawn avem aceeași fundație, legal și curat.

Pagini implicite în demo:
- **Acasă:** slideshow → tabel comparație → bară iconițe → rezultate → formular contact
- **Produs:** info produs → produse similare → coloane custom → slider imagini/video → iconițe cu conținut → testimoniale → separator
- **Coș:** produse → subtotal → colecție recomandată → newsletter

---

## 2. Setări globale (Theme settings) – 30 de grupuri

| Grup | Ce conține |
|---|---|
| Logo | logo, logo secundar, lățime desktop/mobil, favicon |
| Culori | accent 1/2 (+gradient), text, fundal 1/2 (+gradient), etichete butoane |
| Tipografie | font titluri/corp din Shopify **sau font custom prin link** (nume, greutate, bold separat), scară, înălțime rând, spațiere litere, RTL pe limbi |
| Animații | animații la încărcarea secțiunilor, repetare, durată, întârzieri, poziție/opacitate/zoom de start |
| Badge-uri | poziție pe carduri, rază, schemă culoare reducere/stoc epuizat, text reducere, iconiță procent |
| Controale slider | săgeți (mărime, rază, iconiță), puncte paginare (lățime, înălțime, scalare activă, spațiere) |
| Layout | lățime pagină, spațiu între secțiuni, grilă orizontal/vertical |
| Butoane | efect hover link/acțiune, bordură, rază, umbră |
| Swatch-uri culoare | rază, bordură, **listă de culori predefinite** (nume → cod) |
| Variant pills | culoare, overlay inactiv, text bold, mărime, padding, bordură, umbră |
| Dropdown variante | fundal, bordură, text, overlay, hover |
| Selector cantitate | fundal, bordură, culori, overlay, hover |
| Inputuri, Media, Pop-up-uri, Drawere, Containere text | bordură + rază + umbră pentru fiecare |
| Carduri produs | stil, padding imagine, aliniere, badge (poziție, **badge-uri custom pe tag**), limitare titlu pe rânduri, stil buton „Adaugă” |
| Carduri colecție / blog | stil, padding, aliniere, bordură, umbră |
| Informații brand | titlu, descriere, imagine |
| Social media | Facebook, Instagram, YouTube, TikTok, Twitter, Snapchat, Pinterest, Tumblr, Vimeo |
| Căutare | sugestii predictive, vendor, preț |
| Monedă | afișare cod monedă |
| Scrollbar & cursor | stil scrollbar desktop, culori, lățime, **cursor custom** |
| Coș | tip coș (drawer/pagină/notificare), iconiță coș, vendor, notă, colecție pe coș gol, buton „Continuă cumpărăturile” |
| Securitate | blocare copiere/click dreapta/Inspect, **blocare țări** (listă coduri, mesaj) |

> **Recomandare:** blocarea de țări și „anti-Inspect” sunt făcute în JavaScript, deci le ocolește
> oricine dezactivează JS. Le putem reface identic (sunt simple), dar blocarea reală de țări
> se face din Shopify Markets.

---

## 3. Pagina de produs – `main-product` (37 de blocuri, ~1.300 setări)

Acesta e „motorul” de conversie al temei. Blocuri:

### Bază
- **Titlu**, **Preț** (badge reducere, sumă/procent economisit), **SKU**, **Descriere**, **Share**
- **Status stoc** (prag „stoc limitat”, afișare număr bucăți)
- **Selector variante** – pills, dropdown, swatch-uri culoare/imagine (42 setări)
- **Butoane cumpărare** – ATC + buy now, culori custom, iconițe (26 setări)
- **Rating produs** (metafield), **Stele rating** custom cu text, **Stele Trustpilot**
- **Text cu iconiță** (33 setări), **Iconițe cu text**, **Imagine**, **Video**, **Divider**, **Buton link**
- **Rând pliabil** (accordion), **Pop-up** (ex. ghid mărimi/politici), **Custom liquid**, **Blocuri de aplicații**

### Conversie / AOV
- **Selector cantitate cu Quantity Breaks** (100 setări): până la 4 oferte (1 / 2 / 3 / 4 buc.),
  fiecare cu badge, imagine, etichetă, beneficiu, subtitlu, % reducere sau sumă fixă, preț barat
  calculat; stil normal / compact / vertical; selectoare de variantă per bucată; ofertă preselectată
- **Bundle offer** (66 setări): produsul curent + până la 3 produse, reducere procent/sumă per produs,
  total cu economie, selector variante, „GRATUIT” pentru produse cu preț 0
- **Cadouri la cantitate** (36 setări): până la 4 cadouri deblocate la X bucăți, cutie cadou animată, blocat/deblocat
- **Upsell-uri produs** (61 setări): până la 3 produse bifabile lângă ATC, cu reducere, imagine, descriere, preselectare
- **Produse complementare** (recomandări Shopify)
- **Discount click-abil** (34 setări): bandă „Click pentru a aplica codul X” → aplică codul automat, 2 stări (înainte/după)
- **Text de urgență** („Doar 7 bucăți rămase”)
- **Sticky Add to Cart** (30 setări): bară fixă jos, setări separate desktop/mobil (imagine, titlu, stele, preț, badge, variante, preț în buton), funcție ATC sau scroll la formular
- **Livrare estimată** (14 setări): „Primești comanda între **Lun, 20 Oct** și **Joi, 23 Oct**”, cu zile/luni traduse
- **Puncte de livrare** (42 setări): timeline Comandat → Expediat → Livrat cu date calculate
- **Butoane scroll-to** (54 setări): scroll la recenzii/beneficii etc.
- **Avatare recenzii** (52 setări): „+10.000 clienți mulțumiți” cu poze suprapuse
- **Beneficii emoji**, **Badge-uri plată**
- **Tabel mărimi** (31 setări): tabel în pop-up/drawer
- **Câmp personalizat** (30 setări): text, număr, textarea, dropdown, swatch-uri; obligatoriu/opțional; salvat ca proprietate pe linia de comandă (gravură, nume etc.)
- **Recenzii** (35 setări): recenzii manuale în slider/grilă

Setările secțiunii: layout galerie (stacked / thumbnails / slider), zoom, video loop, sticky info,
lățime media, culori custom etc. (59 setări).

---

## 4. Coș – `cart-drawer` (16 blocuri)

| Bloc | Funcție |
|---|---|
| Produse coș | layout, imagini, variante, preț barat, buton ștergere (35 setări) |
| Subtotal | subtotal, economii, reduceri afișate (25 setări) |
| Buton checkout | text, iconițe, preț în buton (13 setări) |
| Bară progres | „Mai ai **X lei** până la livrare gratuită” – pe sumă sau nr. produse |
| Bară cu checkpoint-uri | 3 praguri (ex. livrare gratuită / 10% / cadou) cu iconițe |
| Timer countdown | „Coșul tău e rezervat **09:59**” |
| Upsell-uri | produse recomandate în coș, afișare pe toate sau doar pe anumite produse, ascunse dacă sunt deja în coș (67 setări) |
| Cadou gratuit/condiționat | se adaugă automat la atingerea pragului (46 setări) |
| Text cu iconiță, Iconițe cu text, Imagine | trust / garanții |
| Badge-uri plată, Cod reducere, Notă comandă | |
| Checkbox termeni | blochează checkout-ul până la bifare |
| Custom liquid | |

---

## 5. Secțiuni pentru pagini (homepage / landing)

**Hero & media:** Slideshow, Slideshow hero (46 setări/slide), Image banner, **3D Parallax hero**
(până la 10 straturi de imagine), Image/Video slider, Video, Collage, **Shoppable image** (hotspot-uri cu produse),
Image with text, Multirow, Multicolumn.

**Social proof:** Testimonials, **Facebook testimonials** (aspect de comentariu FB cu reacții),
**Trustpilot reviews**, **Instagram stories** (cercuri + vizualizator stories), **Featured on** (logo-uri presă),
**Results** (statistici cu procente), **Before & After slider**.

**Vânzare:** Featured product (aproape toate blocurile din pagina de produs), Featured collection,
Collection list, **Bundle deals** (până la 5 produse, reducere pe pachet), **Comparison table**
(noi vs. alții), **Pricing table**, **Product features** (hotspot-uri + bullet-uri pe imagine).

**Conținut:** Rich text, Custom columns (14 tipuri de blocuri), Content tabs, Collapsible content (FAQ),
Icon bar, Icons with content, Horizontal ticker (text/imagini/recenzii), Vertical ticker,
Blog posts, Section divider, **Sections group** (pune 2 secțiuni una lângă alta), Custom Liquid, Apps.

**Formulare:** Contact form cu câmpuri configurabile, Newsletter, Email signup banner,
**Promo pop-up** (cod reducere după abonare, timer, frecvență, buton copiere), **Track order**.

**Globale / utilitare:** Announcement bar (rotativ, cod reducere copiabil, social, timer),
Header (sticky, mega menu cu produse și colecții, meniu mobil secundar, poziție logo),
Footer (meniuri, brand, newsletter, produs/colecție recomandate, plată, social),
**Music player** + **Global music player**, **Scroll to top**, **Store colors changer**.

---

## 6. Ce trebuie reconstruit în JavaScript

Componente proprii Shrine (peste Dawn): `quantity-breaks`, `quantity-gifts`, `main-bundle-offer`,
`bundle-deals`, `product-info-upsell`, `cart-drawer-upsell`, `cart-drawer-gift`, `clickable-discount`,
`sticky-atc`, `custom-product-field`, `countdown-timer`, `dynamic-dates` (livrare estimată),
`comparison-slider`, `parallax-hero`, `insta-stories`, `promo-popup`, `products-mega-menu`,
`content-tabs`, `hotspot-button`, `copy-button`, `tnc-checkbox`, `splide-component` (slider-e),
`secondary-variant-select` (variante per bucată la quantity breaks).

Toate se pot scrie curat, ca Web Components (stilul Dawn), fără obfuscare și fără dependențe externe.

---

## 7. Plan de construcție (temă proprie, 100% română)

Fiecare etapă = temă instalabilă și testabilă pe magazin.

1. **Fundație** – Dawn + setările globale de mai sus + editor tradus (`ro.schema.json`) +
   texte magazin (`ro.json`) + header/footer/announcement bar.
2. **Pagina de produs – conversie** – quantity breaks, bundle offer, upsell-uri, sticky ATC,
   livrare estimată, puncte de livrare, urgență, discount click-abil, câmp custom, avatare recenzii.
3. **Coș** – cart drawer cu bară progres/checkpoint-uri, timer, upsell-uri, cadou gratuit, checkbox termeni.
4. **Secțiuni social proof** – testimoniale, Facebook, Trustpilot, Instagram stories, before/after, rezultate, comparație.
5. **Secțiuni de landing** – parallax hero, shoppable image, product features, bundle deals, pricing,
   tickere, tabs, sections group, colors changer, music player, promo pop-up, track order, FAQ.
6. **Finisaje** – animații, scrollbar/cursor, securitate (anti-copiere, blocare țări), testare pe
   mobil, Theme Check, performanță.
