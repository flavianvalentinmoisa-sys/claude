# Cum modificați site-ul (tema „Liniște” pentru servicii funerare)

Ghid pentru persoana care întreține site-ul. Nu aveți nevoie de cunoștințe tehnice.

Site-ul este **doar informativ**: nu are produse, coș de cumpărături sau plată online.
Oamenii sună, scriu un email sau vin la sediu.

---

## 1. Cum e construit site-ul (pe scurt)

Totul se schimbă dintr-un singur fișier: **`src/content/site.ts`**. Are trei părți:

| Partea | Ce conține | Exemplu de folosire |
|-------|------------|---------------------|
| **1. ORDINEA** | lista secțiunilor, câte un rând fiecare | mutați, ascundeți, afișați o secțiune |
| **2. SETĂRI** | datele firmei, Google, bara de sus, meniul, butonul de pe mobil, subsolul, texte mărunte | schimbați un telefon, textul din bara de sus |
| **3. SECȚIUNILE** | conținutul fiecărei secțiuni | texte, poze, prețuri, anunțuri, întrebări |

Fiecare secțiune are:
- un **nume** (de exemplu `servicii`), folosit în ORDINE, în meniu și la butoane (`#servicii`);
- un **tip** (de exemplu `coloane`), care spune cum arată.

Același tip se poate folosi de mai multe ori. De exemplu, „Serviciile noastre” și
„De ce PAC Funerare” sunt amândouă de tipul `coloane`.

**Reguli simple:**
- Schimbați doar textul dintre ghilimele: `"așa"`. Nu ștergeți ghilimelele.
- După fiecare rând urmează o virgulă `,`. Nu o ștergeți.
- Prețurile se scriu doar cu cifre: `pretDeLa: 3500` → pe site apare „de la 3.500 lei”.
- Telefoanele, adresa și emailul se scriu **o singură dată**, la SETĂRI → `firma`.
  Se schimbă singure peste tot (bara de sus, butoane, Contact, subsol, Google).

---

## 2. Ascundeți, afișați sau mutați o secțiune

La începutul fișierului `site.ts`:

```ts
export const ordine = [
  { id: "acasa", vizibil: true },
  { id: "primii-pasi", vizibil: true },
  { id: "servicii", vizibil: true },
  { id: "flota", vizibil: true },
  ...
];
```

- **Ascundere:** `vizibil: true` → `vizibil: false`. Legăturile către ea din meniu și butoane dispar singure.
- **Afișare:** `vizibil: false` → `vizibil: true`.
- **Mutare:** mutați rândul întreg mai sus sau mai jos.

Două secțiuni sunt deja pregătite, dar ascunse. Le puteți afișa oricând:
- `despre-noi`: poză și text despre firmă;
- `apel-final`: o bandă neagră cu „Suntem aici, oricând aveți nevoie” și ambele telefoane.

---

## 3. Adăugați o secțiune nouă (în 2 pași)

**Pasul 1.** În partea 3 (SECȚIUNILE), copiați un model de mai jos și lipiți-l
înainte de rândul `} satisfies Record<string, Sectiune>;`. Dați-i un nume nou
între ghilimele, scris cu litere mici, fără spații și fără diacritice (de ex. `"monumente"`).

**Pasul 2.** În ORDINE, adăugați rândul `{ id: "monumente", vizibil: true },` acolo unde vreți să apară.

Dacă ați greșit numele sau un câmp, `npm run build` spune exact rândul cu problema.

### Câmpuri pe care le poate avea orice secțiune

| Câmp | Ce face | Obligatoriu? |
|------|---------|--------------|
| `titlu` | titlul mare | nu |
| `eticheta` | text mic, cu majuscule, deasupra titlului | nu |
| `introducere` | un rând de explicație sub titlu | nu |
| `culori` | `"inchis"`, `"deschis"` sau `"negru"` | nu (fără el, culorile alternează automat) |

### Câmpul „catre” de la butoane

| Scrieți | Ce face butonul |
|---------|-----------------|
| `"telefon"` | sună la numărul principal (numărul apare sub text) |
| `"telefon-2"` | sună la al doilea număr |
| `"email"` | deschide aplicația de email |
| `"facebook"` | deschide pagina de Facebook |
| `"#servicii"` | duce la secțiunea cu acel nume |
| `"https://..."` | deschide altă adresă, într-o filă nouă |

Stilul butonului: `stil: "plin"` (implicit) sau `stil: "contur"`.

### Pictograme disponibile

`masina`, `glob`, `maini`, `sicriu`, `flori`, `acte`, `lumanare`, `masa`, `telefon`,
`ceas`, `inima`, `scut`, `verificat`, `locatie`, `email`, `facebook`, `porumbel`

---

## 4. Modele de secțiuni, gata de copiat

### `banner`: poză mare de fundal, titlu, butoane

```ts
  "banner-nou": {
    tip: "banner",
    poza: { fisier: "/images/hero-flota.jpg", descriere: "Ce se vede în poză" },
    inaltime: "mare",          // "mica", "mare" sau "ecran"
    intunecare: 70,            // de la 0 (deloc) la 90 (foarte întunecat)
    arataLogo: false,
    arataPorumbel: true,
    eticheta: "Text mic deasupra",
    titlu: "Titlul mare",
    text: "Un rând de explicație.",
    butoane: [{ text: "Sunați acum", catre: "telefon" }],
    arataAlDoileaTelefon: false,
  },
```

### `pasi`: pași numerotați

```ts
  "pasi-noi": {
    tip: "pasi",
    titlu: "Titlul secțiunii",
    elemente: [
      { titlu: "Primul pas", text: "Ce trebuie făcut." },
      { titlu: "Al doilea pas", text: "Ce trebuie făcut.", lista: ["un punct", "alt punct"] },
    ],
    notaFinala: "O notă la final (opțional).",
  },
```

### `coloane`: carduri cu pictogramă sau poză

```ts
  "monumente": {
    tip: "coloane",
    titlu: "Monumente funerare",
    coloanePeRand: 3,          // 2, 3 sau 4
    stil: "carduri",           // "carduri" sau "simplu"
    elemente: [
      { pictograma: "scut", titlu: "Cruci din granit", text: "Scurtă descriere." },
      { poza: { fisier: "/images/monument-1.jpg", descriere: "Monument din marmură" }, titlu: "Monumente", text: "Scurtă descriere." },
    ],
  },
```

### `galerie`: poze cu titlu (mașini, echipă, locuri)

```ts
  "capela": {
    tip: "galerie",
    titlu: "Capela de priveghi",
    coloanePeRand: 3,
    forma: "dreptunghi",       // "dreptunghi" sau "rotund" (pentru portrete)
    elemente: [
      { poza: { fisier: "/images/capela-1.jpg", descriere: "Interiorul capelei" }, titlu: "Sala mare", text: "Opțional." },
    ],
  },
```

### `pachete`: prețuri orientative (fără plată online)

```ts
  "pachete-incinerare": {
    tip: "pachete",
    titlu: "Pachete",
    elemente: [
      {
        nume: "Pachetul 1",
        pretDeLa: 3000,
        descriere: "O propoziție.",
        include: ["primul lucru", "al doilea lucru"],
        recomandat: false,
      },
    ],
    mentiune: "Prețurile sunt orientative, vă oferim o ofertă exactă la telefon.",
    butoane: [{ text: "Cereți o ofertă", catre: "telefon" }],
  },
```

### `anunturi`: anunțuri de deces (vezi și capitolul 5)

```ts
  "anunturi": {
    tip: "anunturi",
    titlu: "Anunțuri și condoleanțe",
    elemente: [ /* anunțurile */ ],
  },
```

### `intrebari`: întrebări frecvente

```ts
  "intrebari-acte": {
    tip: "intrebari",
    titlu: "Întrebări despre acte",
    elemente: [
      { intrebare: "Întrebarea?", raspuns: "Răspunsul." },
    ],
  },
```

### `contact`: telefoane, adresă, hartă, formular

```ts
  "contact": {
    tip: "contact",
    titlu: "Contact",
    arataHarta: true,
    cautareHarta: "Strada Călărași, Fetești, Ialomița",
    arataFormular: true,
  },
```

### `imagine-cu-text`: poză pe o parte, text pe cealaltă

```ts
  "despre-noi": {
    tip: "imagine-cu-text",
    eticheta: "Despre noi",
    titlu: "Titlul",
    poza: { fisier: "/images/despre-noi.jpg", descriere: "Ce se vede în poză" },
    pozitiePoza: "stanga",     // "stanga" sau "dreapta"
    paragrafe: ["Primul paragraf.", "Al doilea paragraf."],
    butoane: [{ text: "Sunați-ne", catre: "telefon" }],
  },
```

### `text`: text centrat cu butoane (îndemn la apel, anunț important)

```ts
  "anunt-sarbatori": {
    tip: "text",
    culori: "negru",
    titlu: "Program de sărbători",
    paragrafe: ["Suntem disponibili și de Crăciun și de Anul Nou."],
    butoane: [{ text: "Sunați acum", catre: "telefon" }],
    arataPorumbel: false,
  },
```

---

## 5. Adăugați un anunț de condoleanțe

În `site.ts`, la secțiunea `anunturi`, în `elemente: [ ... ]`, lipiți un bloc nou
**la începutul listei** (anunțul cel mai nou apare primul):

```ts
      {
        exemplu: false,
        nume: "Gheorghe Ionescu",
        perioada: "1945 – 2026",
        mesaj: "Cu durere în suflet anunțăm trecerea la cele veșnice a celui drag. Dumnezeu să-l odihnească!",
        slujba: {
          data: "Marți, 10 noiembrie 2026",
          ora: "11:00",
          loc: "Biserica „Sfântul Nicolae”, Fetești",
        },
        inmormantare: "Cimitirul din Fetești-Gară",
        poza: null,
      },
```

- Anunțurile reale au mereu `exemplu: false`.
- `inmormantare: ""` dacă nu doriți să apară locul înmormântării.
- Poză: `poza: { fisier: "/images/anunt-ionescu.jpg", descriere: "Fotografia lui Gheorghe Ionescu" },`
- **Ștergeți cele două anunțuri exemplu** (`exemplu: true`) când puneți primul anunț real.
- Dacă lista rămâne goală, pe site apare „Momentan nu există anunțuri.”

---

## 6. Înlocuiți o poză

Pozele stau în **`public/images/`**. Cel mai simplu: puneți poza nouă cu **exact același nume**
(de ex. `flota-1.jpg`) peste cea veche. Nu mai trebuie schimbat nimic.

| Fișier | Unde apare |
|--------|-----------|
| `logo.png` | sigla (sus, în banner, în subsol). Cel mai bine cu fundal transparent |
| `hero-flota.jpg` | fundalul primului ecran |
| `flota-1.jpg` … `flota-3.jpg` | Flota noastră (format orizontal 4:3) |
| `echipa-1.jpg` … `echipa-3.jpg` | Echipa (pătrate, se afișează rotund) |
| `despre-noi.jpg` | secțiunea Despre noi (4:3) |
| `anunt-exemplu.jpg` | poza din anunțul exemplu |
| `imagine-partajare.jpg` | imaginea care apare când cineva trimite site-ul pe Facebook / WhatsApp |

Cu nume nou: puneți poza în `public/images/`, apoi scrieți în `site.ts`
`fisier: "/images/nume-nou.jpg"` și o `descriere` a ceea ce se vede în poză.
Țineți pozele sub 300–500 KB.

---

## 7. Culori, fonturi, forme

Se schimbă rar, din **`src/stiluri/tema.css`**, la începutul fișierului:
- **Culori:** de exemplu `--color-auriu: #c9b787;` (accentul de pe butoane și linii fine).
- **Scheme de culori:** `inchis`, `deschis`, `negru`. Fiecare secțiune o poate alege cu `culori: "..."`.
- **Forme:** `--radius-card` (colțurile cardurilor), `--radius-buton` (colțurile butoanelor).
- **Fonturi:** `--font-titluri` și `--font-text`.

---

## 8. Exemple de cereri sigure (prompturi)

1. „Schimbă prețul la pachetul 2 (Pachetul Tradițional) în 4.900 lei.”
2. „Ascunde galeria cu flota.”
3. „Adaugă un anunț de deces pentru Vasile Marin, 1950 – 2026, slujba sâmbătă,
   14 noiembrie 2026, ora 12:00, la Biserica din Vlașca. Șterge anunțurile exemplu.”
4. „Afișează secțiunea despre-noi și mut-o după Servicii.”
5. „Adaugă o secțiune nouă de tip coloane, «Monumente funerare», cu 3 carduri,
   și pune-o înainte de Contact. Adaug-o și în meniu.”

Alte idei: „schimbă textul din bara de sus”, „pune secțiunea Întrebări pe fundal negru”,
„înlocuiește poza flota-2.jpg cu poza nouă din public/images”,
„adaugă la Întrebări întrebarea «Lucrați și în sărbători?» cu răspunsul «Da, NON-STOP.»”.

---

## 9. Verificare și publicare (pentru partea tehnică)

```bash
npm install        # o singură dată
npm run dev        # site-ul pe calculator, se actualizează la fiecare salvare
npm run build      # verifică greșelile și pregătește site-ul în folderul dist/
```

Folderul `dist/` se urcă pe găzduire. După ce site-ul are domeniu, completați
`adresaSite` la SETĂRI → `seo`.

**Pentru programatori:** un tip nou de secțiune se adaugă în `src/content/tipuri.ts`
(schema), apoi ca fișier în `src/sections/` și ca rând în `src/sections/index.tsx`.
