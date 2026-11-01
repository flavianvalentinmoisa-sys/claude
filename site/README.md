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

`media/hero.mp4` este videoul de la biserică, mărit la 720×1292 cu reducere de zgomot și accentuarea clarității, recodat pentru web: H.264, fără sunet, 5,2 MB, cu `faststart` (pornește înainte să se descarce tot). Imaginea `media/hero-poster.jpg` apare instantaneu până pornește videoul, iar `media/hero-blur.jpg` este fundalul estompat.

Videoul pornește singur, fără sunet, și se oprește când iese din ecran. Nu pornește singur dacă vizitatorul a cerut în telefon mai puțină animație sau economie de date. Butonul din colț îl oprește și îl pornește.

Pentru a schimba videoul principal:

```bash
ffmpeg -i video-nou.mp4 -an -map_metadata -1 -vf "hqdn3d=1.2:1.2:4:4,scale=720:-2:flags=lanczos,unsharp=5:5:0.9:3:3:0.0,eq=contrast=1.04:saturation=1.05" -c:v libx264 -profile:v high -preset slower -tune film -crf 21 -maxrate 1800k -bufsize 3600k -pix_fmt yuv420p -g 30 -movflags +faststart media/hero.mp4
ffmpeg -i media/hero.mp4 -frames:v 1 -q:v 3 media/hero-poster.jpg
```
