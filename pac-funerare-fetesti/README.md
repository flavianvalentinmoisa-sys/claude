# PAC Funerare Fetești – site de prezentare

React + Vite + TypeScript + Tailwind CSS v4, fără backend.

- **Tot conținutul:** `src/content/site.ts` (tipurile în `src/content/tipuri.ts`).
- **Secțiunile:** `src/sections/` – ordinea și vizibilitatea din lista `sectiuni` din `site.ts`.
- **Culori și fonturi:** `src/stiluri/tema.css` (blocul `@theme`).
- **SEO + JSON-LD (FuneralHome):** generate din `site.ts` de `scripts/seo.ts`, injectate în `<head>`.
- **Pregenerare:** `npm run build` scrie conținutul paginii direct în `dist/index.html`.

Ghid pentru editare fără cunoștințe tehnice: [EDITARE.md](./EDITARE.md).

```bash
npm install
npm run dev
npm run build
```
