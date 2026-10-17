# Carpatica – ghid de instalare și configurare

Carpatica este o temă Shopify proprie, construită pe Dawn 16 (tema oficială gratuită a Shopify,
licență care permite modificarea). Editorul și magazinul sunt **doar în limba română**: nu există
selector de limbă sau de țară.

## 1. Instalare

1. Descarcă `carpatica-1.1.0.zip` (din acest folder).
2. Shopify Admin → **Magazin online → Teme → Adaugă temă → Încarcă fișier zip**.
3. Apasă **Personalizează** pentru a o configura, apoi **Publică**.

## 2. Primii pași recomandați

| Unde | Ce faci |
|---|---|
| Setări temă → Logo | Încarci logo-ul și favicon-ul |
| Setări temă → Culori / Culori conversie | Paleta vie: albastru electric, galben, portocaliu, mentă, roz (7 scheme) |
| Setări temă → Tipografie → Combinație fonturi | Energic (implicit), Prietenos, Modern sau Clasic – toate cu ș, ț, ă, â, î |
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

**Noi în 1.1:** Recenzii cu poze (rezumat cu bare pe stele, mozaic, galerie mărită, „Vezi mai multe”) ·
Recenzii video (format TikTok, pornesc singure fără sunet, atingi pentru sunet) · Bandă cu recenzii ·
Cum funcționează (pași) · Carduri colorate · Problemă vs soluție · Ingrediente · Garanție (sigiliu animat) ·
Media cu text (GIF/video, forme: înclinată, organică, cerc, abțibild „-40%”, bloc Liquid personalizat).

Secțiunile Dawn **Banner imagine**, **Imagine cu text** și **Text formatat** au în plus blocurile
Stele rating, Stele Trustpilot, Buton adaugă în coș și Text cu iconiță. Pe cardurile de produs poți afișa
„Economisești X lei” din Setări temă → Carduri produs.

## 6. GIF-uri și video

- **GIF**: încarcă-l ca pe orice imagine (Conținut → Fișiere sau direct în câmpul de imagine). Tema îl
  recunoaște și îl afișează la mărimea originală, ca animația să se păstreze. Funcționează în toate
  secțiunile Carpatica, în Imagine cu text și în Coloane cu imagini.
- **Video ca GIF** (recomandat): în câmpul „Sau video” încarci un MP4 scurt. Rulează fără sunet, în buclă,
  și se încarcă doar când ajunge pe ecran. Un MP4 are de obicei de 5–10 ori mai puțini MB decât același GIF.
- **GIF extern** (Giphy etc.): în Media cu text există câmpul „Sau link GIF extern”.
- Păstrează GIF-urile sub 3–4 MB; peste asta pagina se încarcă greu pe mobil.

## 7. Titluri colorate

În orice titlu, un cuvânt scris *cursiv* primește un gradient colorat, iar unul **îngroșat** primește o
subliniere galbenă de tip marker. Pe fundalurile închise gradientul devine automat galben-portocaliu.

## 8. Viteză și SEO

- Se încarcă doar fonturile combinației alese (preîncărcate), iar video-urile și imaginile de sub primul
  ecran se încarcă abia când ajung în vizor.
- La secțiunea Media cu text bifează „Secțiunea e în primul ecran” dacă e prima pe pagină.
- Date structurate incluse: Organizație, Site cu căutare, Produs, Breadcrumb (Acasă › Colecție › Produs),
  FAQ (din secțiunea Conținut pliabil, se poate dezactiva) și `og:locale ro_RO` pentru Facebook.
- Completează din Admin: titlu și descriere SEO pentru fiecare produs și colecție, plus text alternativ
  la imagini.

## 9. Pagini

- **Întrebări frecvente**: creează o pagină și alege șablonul `page.faq`.
- **Urmărire comandă**: creează o pagină cu șablonul `page.track-order`; în secțiune pui linkurile
  de urmărire ale curierilor tăi (format `Nume|link-cu-{awb}`).

## 10. Diacritice

Fonturile incluse conțin toate literele românești. Opțiunea **Corectează automat ş/ţ** (Setări temă →
Tipografie) înlocuiește pe site literele greșite cu sedilă (din texte copiate) cu ș/ț corecte.

## 11. Securitate

Setări temă → Securitate: blocarea copierii și blocarea pe țări sunt descurajante, nu protecții
reale (se ocolesc dezactivând JavaScript). Restricțiile reale de vânzare se fac din Setări → Piețe.
