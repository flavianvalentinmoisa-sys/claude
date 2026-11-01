# Site servicii funerare

Site de o singură pagină (`index.html`), fără dependențe și fără build. Se deschide direct în browser și se poate urca pe orice hosting static (Netlify, GitHub Pages, cPanel).

## Ce trebuie completat

Toate datele firmei sunt în blocul `CONFIG` de la începutul scriptului din `index.html`:

| Câmp          | Exemplu                     |
|---------------|-----------------------------|
| `nume`        | numele firmei de pe Facebook |
| `telefon`     | `0722 123 456` (cum se afișează) |
| `telefonIntl` | `40722123456` (pentru apel și WhatsApp, fără `+`) |
| `zona`        | `București și Ilfov`        |
| `adresa`      | adresa sediului             |
| `pozaHero`    | `media/hero.jpg` (fundalul de sus) |
| `pozaEchipa`  | `media/echipa.jpg`          |

Recenziile se adaugă în lista `RECENZII` (doar recenzii reale, de pe Facebook sau Google). Cât timp lista e goală, secțiunea arată chenare-substitut.

Structura paginii urmează site-ul exemplu funero.ro: bandă de contact, hero cu două oferte, „Vă ajutăm cu”, configurator de costuri, repatriere, sfaturi, recenzii, echipă, galerie Facebook, formular, comunitate Facebook, întrebări frecvente, footer pe coloane.

Prețurile pachetelor apar ca „Preț la cerere”. Conținutul pachetelor și al serviciilor se modifică direct în HTML.

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

Cât timp lista e goală, galeria arată chenare-substitut.

Recomandat: poze micșorate la max. 1600 px pe latura lungă, videouri MP4 (H.264) sub 20 MB.
