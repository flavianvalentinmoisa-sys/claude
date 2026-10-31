# Tema Shopify „Liniște”: ghid de instalare și editare

Temă Shopify (Online Store 2.0), inspirată de Dawn, dar mult mai simplă.
Este **doar informativă**: nu are produse, coș sau plată. Vizitatorii sună, scriu sau vin la sediu.

Arhiva temei: `tema-liniste-shopify.zip` (conținutul folderului `tema-shopify-liniste/`).

---

## 1. Instalare

1. În Shopify: **Magazin online → Teme → Adăugați o temă → Încărcați fișierul zip**.
2. Alegeți `tema-liniste-shopify.zip`.
3. La tema „Liniște” apăsați **Personalizați** ca să o vedeți, apoi **Publicați**.

După instalare:
- **Emailul pentru formularul de contact:** mesajele ajung la emailul magazinului
  (Setări → Informații magazin → Email de contact). Puneți acolo `pacfunerare@gmail.com`.
- **Parola magazinului:** cât timp magazinul are parolă (Magazin online → Preferințe),
  vizitatorii văd doar pagina „Site-ul se deschide în curând”, cu telefonul. Scoateți parola când sunteți gata.
- **Produse:** nu adăugați niciunul. Paginile de produs, colecție și coș arată doar
  „Informații la telefon”, cu butonul de apel.

---

## 2. Unde se schimbă lucrurile

Totul se face din **Personalizați** (editorul de teme), fără cod.

| Ce vreți să schimbați | Unde |
|-----------------------|------|
| Telefoane, email, adresă, program, Facebook | ⚙️ Setări temă → **Datele firmei** (se schimbă peste tot automat) |
| Sigla | ⚙️ Setări temă → **Sigla** |
| Culori, colțuri rotunjite | ⚙️ Setări temă → **Culori** / **Forme** |
| Titlul și descrierea din Google | ⚙️ Setări temă → **Google și partajare** |
| Butonul de apel de jos, pe telefon | ⚙️ Setări temă → **Buton de apel pe telefon** |
| Textul din bara subțire de sus | Antet → **Bara de anunț** |
| Legăturile din meniu | Antet → **Antet** → blocurile „Link” |
| Orice text, poză sau preț de pe pagină | apăsați pe secțiunea respectivă, în stânga |

---

## 3. Secțiuni: ascundere, mutare, adăugare

În stânga editorului vedeți lista de secțiuni a paginii principale.

- **Ascundere:** treceți cu mouse-ul peste secțiune și apăsați pe ochi 👁.
- **Mutare:** trageți secțiunea de cele 6 puncte ⋮⋮, mai sus sau mai jos.
- **Adăugare:** „Adăugați secțiunea”, apoi alegeți una dintre:

| Secțiune | La ce folosește |
|----------|-----------------|
| Banner cu poză | primul ecran: poză mare, titlu, butoane de apel |
| Pași numerotați | „Ce faceți în primele ore” |
| Coloane cu pictograme | servicii, argumente „De ce noi” |
| Galerie de poze | flota (dreptunghiuri), echipa (cercuri) |
| Pachete și prețuri | „de la … lei”, fără plată online |
| Anunțuri și condoleanțe | anunțurile de deces |
| Întrebări frecvente | întrebări care se deschid la apăsare |
| Imagine cu text | „Despre noi” |
| Text cu butoane | îndemn la apel, anunț important |
| Contact | telefoane, adresă, hartă, formular |

Două secțiuni sunt deja pregătite, dar ascunse: **Despre noi** și **Suntem aici, oricând aveți nevoie**.
Le afișați apăsând pe ochi.

**Butoanele** au câmpul „Ce face”: sună la numărul principal, sună la al doilea număr,
deschide emailul, deschide Facebook sau duce la un link scris de dvs.
Pentru o secțiune de pe pagină, linkul este `#` + numele secțiunii, de exemplu `#servicii`.
Numele fiecărei secțiuni apare în setările ei, la „Numele secțiunii (pentru linkuri)”.

---

## 4. Adăugați un anunț de condoleanțe

1. Apăsați pe secțiunea **Anunțuri și condoleanțe**.
2. **Adăugați bloc → Anunț**.
3. Completați numele, anii, mesajul, data, ora și locul slujbei (opțional locul înmormântării și o poză).
4. Trageți anunțul nou **primul** în listă.
5. Ștergeți cele două anunțuri exemplu (au bifat „Este anunț exemplu”).
6. **Salvați**.

---

## 5. Poze

Apăsați pe secțiune sau pe bloc, apoi **Selectați imaginea**. Până alegeți poze reale,
tema arată imagini provizorii (porumbel cu „Fotografie în curând”).
Completați și câmpul „Ce se vede în poză”, pentru persoanele nevăzătoare și pentru Google.

Dimensiuni potrivite: banner 1920 × 1080; flotă 1200 × 900; echipă pătrată, 800 × 800.

---

## 6. Exemple de cereri sigure (pentru asistent)

1. „În tema Shopify, schimbă prețul la Pachetul Tradițional în 4.900.”
2. „Ascunde secțiunea Flota.”
3. „Adaugă un anunț pentru Vasile Marin, 1950 – 2026, slujba sâmbătă, 14 noiembrie 2026, ora 12:00, Biserica din Vlașca. Șterge anunțurile exemplu.”
4. „Afișează secțiunea Despre noi și mut-o după Servicii.”
5. „Adaugă o secțiune Coloane cu pictograme, «Monumente funerare», cu 3 carduri, înainte de Contact.”

---

## 7. Pentru programatori

- Structură Shopify standard: `layout/`, `templates/` (JSON), `sections/` (cu `{% schema %}`), `snippets/`, `assets/`, `config/`, `locales/`.
- Antetul și subsolul sunt grupuri de secțiuni: `sections/header-group.json`, `sections/footer-group.json`.
- Culorile vin din Setări temă și devin variabile CSS în `layout/theme.liquid`; stilurile sunt în `assets/tema.css`.
- Datele structurate JSON-LD (FuneralHome) se generează din Setări temă: `snippets/date-structurate.liquid`.
- Verificată cu Shopify Theme Check: 0 probleme.
