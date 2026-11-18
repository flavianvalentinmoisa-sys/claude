---
name: pagina-produs
description: Creează fișierul JSON al paginii de produs (template product.<handle>.json pe tema standard a magazinului) pentru orice produs primit ca link — competitor (alt magazin, Shopify sau nu), AliExpress, Alibaba, 1688, Temu, Amazon, eMAG. Folosește ori de câte ori utilizatorul dă un link de produs și cere pagină de produs / landing / „bagă-l pe site”, inclusiv pentru mai multe linkuri odată.
---

# Pagină de produs din link

Tema magazinului e în `shopify/theme/` (tema Carpatica, română, piață RO, plata ramburs).
Pagina de pornire e `shopify/theme/templates/product.json`. Pentru fiecare produs se generează
un template nou `product.<handle>.json` cu textele produsului.

**Livrabilul este DOAR `product.<handle>.json`.** Tema e standard și utilizatorul o are deja în
Shopify: nu livra zip de temă, CSV sau checklist și nu modifica `shopify/theme/` (tema din repo e
doar referință pentru schema secțiunilor). CSV-ul de import (`--extras`) sau zip-ul (`--zip`) doar
dacă sunt cerute explicit.

Fișiere de lucru în `produse/<handle>/`: `sursa.json` (date brute din link), `spec.json` (texte +
date produs, scris de tine) și livrabilul `product.<handle>.json`.

## Pași

### 1. Extrage datele din link
```bash
python3 .claude/skills/pagina-produs/scripts/fetch_product.py "<URL>" > produse/<handle>/sursa.json
```
- Magazin Shopify: scriptul ia automat `/products/<handle>.js` (titlu, variante, prețuri, toate pozele).
- AliExpress/Alibaba/Temu: dacă HTTP simplu dă puține date, rulează cu `--browser` (Playwright).
- Dacă host-ul e blocat de rețeaua sesiunii (eroare `403` de la proxy / `ENOTFOUND`): încearcă WebFetch;
  dacă și acela e blocat, spune-i utilizatorului că domeniul trebuie permis în setările de rețea ale
  mediului și cere-i între timp fie pagina salvată (Ctrl+S → rulezi cu `--html fișier.html`), fie
  textul + pozele lipite în chat. Nu inventa date despre produs.

Handle: scurt, în română, fără diacritice, cu cratimă (ex. `perna-cervicala-ergonomica`).

### 2. Înțelege produsul și unghiul
- **Link de competitor**: notează promisiunea principală, obiecțiile tratate, structura ofertei
  (bucăți, reduceri), prețul. Le folosești ca *inspirație*; textele se scriu de la zero, nu se
  traduc/copiază. Pozele competitorului se marchează în checklist pentru înlocuire.
- **Link de furnizor** (AliExpress/Alibaba): titlurile sunt pline de keyword-uri — extrage ce face
  produsul de fapt (material, dimensiuni, ce e în cutie). Dacă e util, caută 1–2 competitori RO/US
  cu WebSearch ca să vezi cum e vândut.
- Specificațiile (dimensiuni, material, conținut pachet) vin doar din sursă. Ce nu e clar → întrebi.

### 3. Prețul
- Dacă utilizatorul a dat prețul, folosește-l.
- Altfel propune: preț de vânzare în lei terminat în `,99` (ex. 129,99 / 149,99), aliniat cu
  competitorul dacă există; `compare_at_price` ~ +40–70% peste. Pentru furnizor, raportează
  marja (cost × curs) și marchează prețul ca **propus** în răspuns.
- Ofertele pe cantitate (1/2/3 buc, −15%/−25%) sunt implicite; tema doar le afișează — checklist-ul
  amintește să fie create reducerile reale în Shopify.

### 4. Scrie textele
Dacă skill-ul `copywriting-pagini-produs-ro` e disponibil, încarcă-l înainte și urmează-l.
Reguli de bază: română naturală (nu tradusă), „tu”, propoziții scurte, beneficiu concret înainte de
caracteristică, fără superlative goale, plata ramburs și returul ca elemente de încredere.

**Nu se inventează dovezi sociale sau rezultate.** Fără recenzii, nume de clienți, rating,
„peste X clienți”, procente de tip „94% au dormit mai bine” — decât dacă utilizatorul le dă ca date
reale ale magazinului lui. Fără afirmații medicale/de vindecare. Dacă lipsesc, câmpurile
`social_proof`, `reviews`, `results` se omit și build-ul scoate secțiunile respective
(checklist-ul notează că pot fi adăugate ulterior). Ratingul din sursă e doar informativ.

### 5. Completează `spec.json`
Pornește de la `references/exemplu-spec.json` (copiază-l și înlocuiește tot). Câmpurile din `page`
corespund secțiunilor din `product.json`; dacă un câmp lipsește, secțiunea lui e scoasă din pagină:

| câmp `page` | secțiune / bloc | conținut |
|---|---|---|
| `offers` (1–4) | bloc `quantity_breaks` | `quantity, label, badge, badge_style, benefit, caption, discount_percent` |
| `benefits` | bloc `emoji_benefits` | linii cu emoji |
| `guarantee_note` | bloc `text_with_icon` | richtext scurt |
| `delivery_days` | bloc `estimated_shipping` | `[min, max]` |
| `tabs` | blocuri `collapsible_tab` după descriere | `heading, icon, content` |
| `social_proof` | `rating_stars`, `review_avatars`, rating în sticky | **doar date reale** |
| `ticker` | `benefits_band` (c-ticker) | 3–5 × `emoji, text` |
| `why` | `c-benefit-cards` | `subheading, heading, cards[emoji,title,text]` (3–4) |
| `inside` | `c-media-text` (poza produsului) | `subheading, heading, text, checklist[], sticker, button_label` |
| `problem_solution` | `c-problem-solution` | `bad_title, bad_list[], good_title, good_list[]` (`[produs]` = titlul) |
| `results` | `c-results` | **doar date reale** |
| `compare` | `c-comparison-table` | `rows[feature, us, comp_1]`, valori `yes`/`no`/`partial`/text |
| `steps` | `c-steps` | 3 × `emoji, title, text` |
| `reviews` | `c-photo-reviews` | **doar recenzii reale** |
| `guarantee` | `c-guarantee` | `heading, text, seal_number, seal_label, points[icon,text]` |
| `faq` | `collapsible-content` | 4–6 × `q, a, icon` |
| `order` / `hide` | ordinea secțiunilor / secțiuni ascunse | chei de secțiune din `product.json` |

`heading`-urile acceptă `<em>cuvânt</em>` pentru accent. Câmpurile `text` primesc text simplu sau
HTML (`<p>`, `<ul>`). Iconițe și opțiuni permise: `references/sectiuni-tema.md`.
`product.body_html` = descrierea scurtă de sub butoane (1 paragraf + 3–5 bullet-uri).
`product.images` = URL-uri publice (Shopify le descarcă la import) — preferă pozele furnizorului.

### 6. Generează și validează
```bash
python3 .claude/skills/pagina-produs/scripts/build_page.py produse/<handle>/spec.json \
  --theme shopify/theme --out produse/<handle>
```
Scriptul verifică fiecare setare față de schema secțiunilor din temă (id-uri, opțiuni, intervale,
richtext). La eroare: corectezi `spec.json` și rulezi din nou — nu edita template-ul generat de mână.
Nu folosi `--install` / `--zip` / `--extras` decât la cerere.

### 7. Predare
- Commit + push pe branch-ul de lucru (`produse/<handle>/`).
- Trimite utilizatorului doar `product.<handle>.json` (SendUserFile).
- Răspuns scurt, în română: numele produsului, prețul propus (titlu, preț, preț tăiat, descriere
  scurtă le pune el pe produs în Admin — dă-le în răspuns, gata de copiat), ce secțiuni are pagina,
  ce a fost scos (recenzii/rezultate fără date reale) și informațiile care lipseau din sursă.
  Ofertele pe cantitate sunt doar afișate: amintește în 1 rând de reducerea din Shopify.
- Mai multe linkuri: repetă pașii 1–6 pentru fiecare, apoi un singur rezumat la final (tabel:
  produs · preț · handle · probleme).

## Întreținere
Dacă tema se schimbă (zip nou de la utilizator): înlocuiește `shopify/theme/` și regenerează
referința:
```bash
python3 .claude/skills/pagina-produs/scripts/theme_schema.py --theme shopify/theme \
  --out .claude/skills/pagina-produs/references/sectiuni-tema.md
```
Dacă secțiunile din `templates/product.json` au alte chei decât cele din tabel, actualizează
`scripts/build_page.py`.
