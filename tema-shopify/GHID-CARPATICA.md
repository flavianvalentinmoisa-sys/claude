# Carpatica – ghid de instalare și configurare

Carpatica este o temă Shopify proprie, construită pe Dawn 16 (tema oficială gratuită a Shopify,
licență care permite modificarea). Editorul și magazinul sunt **doar în limba română**: nu există
selector de limbă sau de țară.

## 1. Instalare

1. Descarcă `carpatica-1.2.1.zip` (din acest folder).
2. Shopify Admin → **Magazin online → Teme → Adaugă temă → Încarcă fișier zip**.
3. Apasă **Personalizează** pentru a o configura, apoi **Publică**.

## 2. Primii pași recomandați

| Unde | Ce faci |
|---|---|
| Setări temă → Logo | Încarci logo-ul și favicon-ul |
| Setări temă → Culori | Stilul implicit „Default”: crem `#FBF6EE`, verde salvie `#6B7F5E`, teracotă `#C8664A`, text negru (vezi mai jos) |
| Setări temă → Tipografie → Combinație fonturi | Energic (implicit), Prietenos, Modern sau Clasic – toate cu ș, ț, ă, â, î |
| Setări temă → Coș | Tip coș: Panou lateral (implicit) |
| Secțiunea **Coș lateral** (între Antet și secțiunile paginii) | Bară livrare gratuită, upsell, cadou, cod reducere, termeni |
| Subsol → blocul **Badge-uri ANPC** | Obligatoriu în România: pictograma SAL cu link la ANPC |
| Elemente plutitoare | Buton „sus”, pop-up promoțional, muzică |

## 2b. Paleta implicită (stilul „Default”)

| Schemă | Fundal | Folosită pentru |
|---|---|---|
| Schema 1 | Crem `#FBF6EE` | Fundalul paginii; butoane de comandă teracotă, butoane contur salvie |
| Schema 2 | Crem închis `#F3EADD` | Secțiunile alternate și cardurile de produs |
| Schema 3 | Salvie `#6B7F5E` | Benzi cu titluri mari (hero, bandă derulantă, coloana „Cu produsul”) |
| Schema 4 | Teracotă `#C8664A` | Banda finală (abonare) |
| Schema 5 | Alb | Cardurile de recenzii |
| Schema 6 | Salvie închis `#55684A` | Bara de anunțuri și subsolul – text mic, contrast 5,6:1 (salvie normal ar fi 4,05:1) |
| Schema 7 | Teracotă | Eticheta de reducere |

Setări temă → Culori conversie: **Accent** (salvie) colorează varianta selectată, bifele, chenarele și progresul;
**Accent 2** (teracotă) colorează eticheta „CEL MAI ALES”, abțibildurile și cuvintele scrise cursiv în titluri.
**Culoare titluri și meniu** (salvie) se aplică titlurilor mari și meniului doar pe fundaluri deschise.

## 2c. Adaptarea la orice produs

- Șablonul **Produs implicit** se aplică automat tuturor produselor: titlul, pozele, prețul, variantele și
  recenziile se schimbă singure.
- Scrie **[produs]** în orice titlu sau text al secțiunilor Carpatica: pe pagina produsului devine numele lui
  (ex. „Fără [produs]” → „Fără Pernă cervicală…”). Pe alte pagini apare „produsul nostru”.
- Media cu text, Problemă vs soluție și Ingrediente folosesc automat **poza produsului** dacă nu alegi alta
  (opțiunea „folosește poza produsului” se poate dezactiva).
- Text diferit pentru fiecare produs: lângă orice câmp din editor apasă iconița **Conectează sursa dinamică**
  și alege un metacâmp al produsului (Setări → Date personalizate → Produse → Adaugă definiție).
- Pagină complet diferită pentru un produs: în editor, la Produse → **Creează șablon**, pornești de la cel
  implicit, îl modifici și apoi, în Admin → Produse → produsul → **Șablon tema**, îl alegi.

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

În orice titlu, un cuvânt scris *cursiv* primește culoarea Accent 2 (teracotă; poți alege și accent sau
gradient), iar unul **îngroșat** primește o subliniere discretă de tip marker. Pe fundalurile închise
cuvântul rămâne în culoarea textului, ca să se citească.

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
