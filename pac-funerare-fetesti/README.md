# Tema „Liniște” – site informativ pentru servicii funerare

Temă React + Vite + TypeScript + Tailwind CSS v4, inspirată de structura temei Dawn
(setări de temă, secțiuni refolosibile, ordine separată de conținut), dar mult mai simplă.
Doar informativ: fără produse, coș sau checkout. Fără backend.

Conținutul implicit: PAC Funerare Fetești.

| Ce | Unde |
|----|------|
| Conținut (ordine, setări, secțiuni) | `src/content/site.ts` |
| Schema tipurilor de secțiuni | `src/content/tipuri.ts` |
| Tipurile de secțiuni (banner, pasi, coloane, galerie, pachete, anunturi, intrebari, contact, imagine-cu-text, text) | `src/sections/` |
| Antet, bară de anunț, subsol, butoane, pictograme | `src/componente/` |
| Culori, scheme de culori, forme, fonturi | `src/stiluri/tema.css` |
| SEO + JSON-LD (FuneralHome), generate din conținut | `scripts/seo.ts` |
| Pregenerare HTML la build | `src/pregenerare-server.tsx`, `scripts/pregenerare.mjs` |

Ghid de editare fără cunoștințe tehnice, cu modele pentru fiecare tip: [EDITARE.md](./EDITARE.md).

```bash
npm install
npm run dev
npm run build
```
