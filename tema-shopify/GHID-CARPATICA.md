# Carpatica – ghid de instalare și configurare

Carpatica este o temă Shopify proprie, construită pe Dawn 16 (tema oficială gratuită a Shopify,
licență care permite modificarea). Editorul și magazinul sunt integral în limba română.

## 1. Instalare

1. Descarcă `carpatica-1.0.0.zip` (din acest folder).
2. Shopify Admin → **Magazin online → Teme → Adaugă temă → Încarcă fișier zip**.
3. Apasă **Personalizează** pentru a o configura, apoi **Publică**.

## 2. Primii pași recomandați

| Unde | Ce faci |
|---|---|
| Setări temă → Logo | Încarci logo-ul și favicon-ul |
| Setări temă → Culori / Culori conversie | Culorile brandului (implicit: albastru „încredere”) |
| Setări temă → Tipografie | Plus Jakarta Sans + Inter sunt incluse în temă, cu diacritice ș, ț, ă, â, î |
| Setări temă → Coș | Tip coș: Panou lateral (implicit) |
| Secțiunea **Coș lateral** (între Antet și secțiunile paginii) | Bară livrare gratuită, upsell, cadou, cod reducere, termeni |
| Subsol → blocul **Badge-uri ANPC** | Obligatoriu în România: pictograma SAL cu link la ANPC |
| Elemente plutitoare | Buton „sus”, pop-up promoțional, muzică |

## 3. Reducerile trebuie create și în Shopify

Tema **afișează** ofertele, dar prețul final îl calculează Shopify. Pentru fiecare ofertă creezi
reducerea în **Admin → Reduceri**:

- **Reduceri la cantitate** (1/2/3 bucăți): reducere automată „Cantitate minimă de articole”.
- **Ofertă pachet / Pachet de produse**: reducere automată „Cumpără X, primești Y” sau pe colecție.
- **Cadouri** (pe pagina produsului și în coș): pune produsul cadou la 0 lei sau creează o reducere
  automată de 100% pentru el. Cadourile se adaugă în coș cu proprietatea ascunsă `_cadou`.
- **Cod cu un click / pop-up / bara de anunțuri**: creează codul (ex. BINE10) în Reduceri → Cod.

## 4. Blocuri pe pagina de produs (Personalizează → Produse)

Stele rating · Stele Trustpilot · Reduceri la cantitate (cu variante per bucată) · Ofertă pachet ·
Produse upsell · Cadouri la cantitate · Adaugă în coș fix · Cod reducere cu un click · Text urgență
(stoc real) · Beneficii emoji · Metode de plată (cu „Ramburs”) · Livrare estimată (zile lucrătoare,
date în română) · Pași de livrare · Butoane de derulare · Avatare recenzii · Recenzii · Ghid mărimi ·
Câmp personalizat (gravură etc.) · Text cu iconiță · Imagine · Video · Separator · Buton link,
plus toate blocurile Dawn.

Pentru etichete pe produse adaugă tag-uri de forma `badge:Nou`, `badge:Best seller`.

## 5. Secțiuni noi (Adaugă secțiune)

Testimoniale · Comentarii Facebook · Recenzii verificate · Instagram stories · Înainte și după ·
Rezultate · Tabel comparativ · Apărut în (logo-uri) · Hero parallax 3D · Hero cu slide-uri ·
Slider imagini și video · Imagine cu produse · Caracteristici produs · Pachet de produse ·
Tabel de prețuri · Bandă derulantă · Bandă derulantă verticală · Conținut în tab-uri ·
Coloane personalizate · Bară cu iconițe · Iconițe în jurul imaginii · Grup de secțiuni ·
Separator decorativ · Schimbător culori pagină · Player muzică · Urmărire comandă ·
Formular contact avansat. În grupul „Elemente plutitoare”: Pop-up promoțional, Buton înapoi sus,
Muzică pe tot site-ul.

Secțiunile Dawn **Banner imagine**, **Imagine cu text** și **Text formatat** au în plus blocurile
Stele rating, Stele Trustpilot, Buton adaugă în coș și Text cu iconiță. Pe cardurile de produs poți afișa
„Economisești X lei” din Setări temă → Carduri produs.

## 6. Pagini

- **Întrebări frecvente**: creează o pagină și alege șablonul `page.faq`.
- **Urmărire comandă**: creează o pagină cu șablonul `page.track-order`; în secțiune pui linkurile
  de urmărire ale curierilor tăi (format `Nume|link-cu-{awb}`).

## 7. Diacritice

Fonturile incluse conțin toate literele românești. Opțiunea **Corectează automat ş/ţ** (Setări temă →
Tipografie) înlocuiește pe site literele greșite cu sedilă (din texte copiate) cu ș/ț corecte.

## 8. Securitate

Setări temă → Securitate: blocarea copierii și blocarea pe țări sunt descurajante, nu protecții
reale (se ocolesc dezactivând JavaScript). Restricțiile reale de vânzare se fac din Setări → Piețe.
