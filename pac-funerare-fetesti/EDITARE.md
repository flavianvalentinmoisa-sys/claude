# Cum modificați site-ul PAC Funerare Fetești

Acest ghid este pentru persoana care întreține site-ul. Nu aveți nevoie de cunoștințe tehnice.

---

## 1. Unde se schimbă textele

**Aproape totul se schimbă dintr-un singur fișier:**

```
src/content/site.ts
```

Acolo găsiți, pe rând, cu titluri numerotate:

| Nr. | Ce găsiți | Exemple |
|----|-----------|---------|
| 1 | Ordinea și vizibilitatea secțiunilor | ascundeți galeria, mutați Pachetele mai sus |
| 2 | Datele firmei | telefoane, adresă, email, Facebook, program |
| 3 | Google | titlul paginii, descrierea din căutări |
| 4–5 | Butoane mărunte și meniul de sus | textul „Meniu”, legăturile din meniu |
| 6 | Hero (primul ecran) | titlul mare, butonul „Sunați acum” |
| 7 | Ce faceți în primele ore | pașii pentru familie |
| 8 | Servicii | cardurile cu servicii |
| 9 | Flota noastră | mașinile |
| 10 | Pachete | nume, prețuri, ce include fiecare |
| 11 | De ce PAC Funerare | argumentele |
| 12 | Echipa | nume, rol, poză |
| 13 | Anunțuri și condoleanțe | anunțurile de deces |
| 14 | Întrebări frecvente | întrebările și răspunsurile |
| 15 | Contact | textele din Contact, harta, formularul |
| 16 | Subsol | partea de jos a paginii |

**Reguli simple:**
- Schimbați doar textul dintre ghilimele: `"așa"`. Nu ștergeți ghilimelele.
- După fiecare rând urmează o virgulă `,`. Nu o ștergeți.
- Prețurile se scriu doar cu cifre, fără puncte și fără „lei”: `pretDeLa: 3500`.
  Pe site va apărea automat „de la 3.500 lei”.
- Telefoanele se scriu o singură dată, la „Datele firmei”. Ele se schimbă automat
  peste tot: în Hero, în butonul de jos de pe mobil, în Contact, în subsol și în datele pentru Google.

**Culorile și fonturile** se schimbă (rar) din `src/stiluri/tema.css`, la începutul fișierului.

---

## 2. Cum ascundeți sau mutați o secțiune

La începutul fișierului `site.ts` există lista:

```ts
export const sectiuni = [
  { id: "hero", vizibil: true },
  { id: "primii-pasi", vizibil: true },
  { id: "servicii", vizibil: true },
  { id: "flota", vizibil: true },
  ...
];
```

- **Ascundere:** schimbați `vizibil: true` în `vizibil: false`.
  Legătura din meniu dispare singură.
- **Afișare din nou:** puneți înapoi `vizibil: true`.
- **Mutare:** mutați rândul întreg mai sus sau mai jos în listă.

Fundalurile (închis / deschis) se alternează automat, oricum ați aranja secțiunile.

Numele secțiunilor: `hero` (primul ecran), `primii-pasi`, `servicii`, `flota` (galeria cu mașini),
`pachete`, `de-ce-noi`, `echipa`, `anunturi`, `intrebari`, `contact`.

---

## 3. Cum adăugați un anunț de condoleanțe

În `site.ts`, la secțiunea **13. ANUNȚURI ȘI CONDOLEANȚE**, în `lista: [ ... ]`,
adăugați un bloc nou **la începutul listei** (anunțul cel mai nou apare primul):

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

- `exemplu: false` – anunțurile reale au mereu `false`.
- `inmormantare: ""` – dacă nu doriți să apară locul înmormântării.
- `poza: null` – fără poză. Cu poză:
  `poza: { fisier: "/images/anunt-ionescu.jpg", descriere: "Fotografia lui Gheorghe Ionescu" },`
- **Ștergeți cele două anunțuri exemplu** (cele cu `exemplu: true`) când puneți primul anunț real.
- Pentru a șterge un anunț vechi, ștergeți blocul lui întreg, de la `{` până la `},`.
- Dacă lista rămâne goală, pe site apare „Momentan nu există anunțuri.”

---

## 4. Cum înlocuiți o poză

Pozele stau în folderul **`public/images/`**.

**Varianta cea mai simplă:** puneți poza nouă cu **exact același nume** ca cea veche
(de exemplu `flota-1.jpg`) și înlocuiți fișierul vechi. Nu trebuie schimbat nimic altceva.

| Fișier | Unde apare |
|--------|-----------|
| `logo.png` | sigla (sus, în Hero, în subsol, iconița din browser) |
| `hero-flota.jpg` | fundalul primului ecran |
| `flota-1.jpg`, `flota-2.jpg`, `flota-3.jpg` | galeria Flota noastră |
| `echipa-1.jpg`, `echipa-2.jpg`, `echipa-3.jpg` | Echipa (se afișează rotund) |
| `anunt-exemplu.jpg` | poza din anunțul exemplu |
| `imagine-partajare.jpg` | imaginea care apare când cineva trimite site-ul pe Facebook / WhatsApp |

**Cu nume nou:** puneți poza în `public/images/` și scrieți în `site.ts` calea ei,
de exemplu `fisier: "/images/mercedes-negru.jpg"`. Schimbați și `descriere:`
cu o propoziție care spune ce se vede în poză (ajută persoanele nevăzătoare și Google).

Sfaturi: poze orizontale pentru flotă (format 4:3), pătrate pentru echipă,
cel mult 300–500 KB fiecare. Sigla se arată cel mai bine cu fundal transparent (PNG).

---

## 5. Exemple de cereri sigure (prompturi)

Le puteți trimite așa cum sunt asistentului care modifică site-ul:

1. „Schimbă prețul la pachetul 2 (Pachetul Tradițional) în 4.900 lei.”
2. „Ascunde galeria cu flota de pe site.”
3. „Adaugă un anunț de deces pentru Vasile Marin, 1950 – 2026, slujba sâmbătă,
   14 noiembrie 2026, ora 12:00, la Biserica din Vlașca. Șterge anunțurile exemplu.”
4. „Înlocuiește poza flota-2.jpg cu poza nouă pe care am pus-o în public/images
   și scrie la descriere «Mercedes-Benz E-Class negru, mașină funerară».”
5. „Adaugă la Întrebări frecvente întrebarea «Lucrați și în zilele de sărbătoare?»
   cu răspunsul «Da, suntem disponibili NON-STOP, inclusiv în sărbători.»”

Alte idei: „mută secțiunea Pachete înaintea secțiunii Servicii”,
„schimbă numele lui «Nume și prenume» de la echipă în Ion Ionescu”,
„adaugă un serviciu nou: Monumente funerare, cu pictograma lumanare”.

---

## 6. Verificare și publicare (pentru cine se ocupă de partea tehnică)

```bash
npm install        # o singură dată
npm run dev        # site-ul pe calculator, se actualizează la fiecare salvare
npm run build      # verifică greșelile și pregătește site-ul în folderul dist/
```

Dacă `npm run build` arată o eroare, mesajul spune fișierul și rândul unde lipsește
o ghilimea, o virgulă sau un câmp. Folderul `dist/` se urcă pe găzduire.
După ce site-ul are domeniu, completați `adresaSite` la secțiunea 3 din `site.ts`.
