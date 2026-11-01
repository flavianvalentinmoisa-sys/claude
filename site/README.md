# Site PAC Funerare Nonstop

Site de o singură pagină (`index.html`), fără dependențe și fără build. Se deschide direct în browser și se poate urca pe orice hosting static (Netlify, GitHub Pages, cPanel).

## Ce trebuie completat

Toate datele firmei sunt în blocul `CONFIG` de la începutul scriptului din `index.html`:

| Câmp          | Exemplu                     |
|---------------|-----------------------------|
| `nume`        | `PAC Funerare Nonstop`      |
| `telefon` / `telefonIntl`   | `0760 396 402` / `40760396402` (apel direct) |
| `telefon2` / `telefon2Intl` | `0760 522 022` / `40760522022` |
| `zona`        | `județul Ialomița` — de confirmat |
| `adresa`      | gol = nu se afișează; completați adresa sediului |
| `pozaEchipa` / `textEchipa` | `media/echipa-expo.jpg` / legenda pozei |

Recenziile se adaugă în lista `RECENZII` (doar recenzii reale, de pe Google). Numele se afișează automat ca prenume + inițiala numelui („Maria Popescu” devine „Maria P.”). În `CONFIG` se completează `notaGoogle`, `numarRecenzii` și, doar dacă e o cifră reală, `familiiAjutate`. O recenzie marcată cu `evidentiat: true` (și opțional `foto`) apare mare, cu fotografie. Dacă `notaGoogle` și `numarRecenzii` sunt goale, se afișează media și numărul recenziilor din listă. Cât timp lista e goală, secțiunea de recenzii, insigna cu stele din hero și linkurile „Recenzii” nu apar.

Structura paginii: video principal, „Despre noi” cu colaj foto, servicii în rânduri alternante imagine-text, bandă foto cu motto, sfaturi ilustrate, recenzii, echipă, galerie derulantă, contact cu butoane de apel, Facebook, întrebări frecvente, footer. Pagina nu are formular: toate butoanele sună direct la unul dintre cele două numere.

Textele serviciilor, ale pașilor de repatriere și ale întrebărilor frecvente se modifică direct în HTML.

## Poze și videouri de pe Facebook

1. Descărcați pozele și videourile de pe pagina de Facebook.
2. Puneți-le în folderul `media/` (ex.: `foto-01.jpg`, `video-01.mp4`).
3. Adăugați câte un rând în lista `MEDIA` din `index.html`:

```js
const MEDIA = [
  { tip: "foto",  src: "media/foto-01.jpg", alt: "Capelă pregătită pentru priveghi", lat: true },
  { tip: "video", src: "media/video-01.mp4", poster: "media/video-01.jpg", text: "Autospeciala funerară" },
];
```

Pozele și videourile primite (14 fotografii, logo-ul și 2 videouri) sunt deja în `media/`, micșorate și fără metadate (fără locație GPS). Logo-ul e în `media/logo-alb.png` (alb pe transparent).

Recomandat: poze micșorate la max. 1600 px pe latura lungă, videouri MP4 (H.264) sub 20 MB.

## Videoul principal (sus)

`media/hero.mp4` este videoul de la biserică exact cum a fost trimis (464×832, fără recodare, doar fără sunet și cu `faststart`, 2,5 MB). O recodare sau o mărire nu adaugă detalii și strică imaginea; pentru calitate mai bună e nevoie de fișierul original din telefon. Imaginea `media/hero-poster.jpg` apare instantaneu până pornește videoul.

Videoul pornește singur, fără sunet, și se oprește când iese din ecran. Nu pornește singur dacă vizitatorul a cerut în telefon mai puțină animație sau economie de date. Butonul din colț îl oprește și îl pornește.

Pentru a schimba videoul principal, fără a-i strica calitatea:

```bash
ffmpeg -i video-nou.mp4 -an -map_metadata -1 -c:v copy -movflags +faststart media/hero.mp4
ffmpeg -i media/hero.mp4 -frames:v 1 -q:v 2 media/hero-poster.jpg
```
