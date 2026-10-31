import { sectiuniVizibile } from "./content/ajutoare";
import { interfata } from "./content/site";
import Antet from "./componente/Antet";
import ButonApelMobil from "./componente/ButonApelMobil";
import type { Ton } from "./componente/Sectiune";
import { componenteSectiuni } from "./sections";
import Subsol from "./sections/Subsol";

/**
 * Pagina întreagă. Secțiunile apar în ordinea din site.ts,
 * iar fundalurile se alternează automat (închis / deschis).
 */
export default function Aplicatie() {
  const vizibile = sectiuniVizibile();
  // Dacă pagina începe cu Hero (închis), următoarea secțiune e deschisă.
  const decalaj = vizibile[0]?.id === "hero" ? 0 : 1;

  return (
    <>
      <a
        href="#continut"
        className="bg-auriu text-negru sr-only z-[60] rounded-full px-5 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {interfata.sariLaContinut}
      </a>
      <Antet />
      <main id="continut" tabIndex={-1} className="outline-none">
        {vizibile.map((s, i) => {
          const Componenta = componenteSectiuni[s.id];
          const ton: Ton = (i + decalaj) % 2 === 0 ? "inchis" : "deschis";
          return <Componenta key={s.id} ton={ton} />;
        })}
      </main>
      <Subsol />
      <ButonApelMobil />
    </>
  );
}
