import { sectiuniAfisate } from "./content/ajutoare.ts";
import { setari } from "./content/site.ts";
import Antet from "./componente/Antet";
import BaraAnunt from "./componente/BaraAnunt";
import ButonApelMobil from "./componente/ButonApelMobil";
import Subsol from "./componente/Subsol";
import { DeseneazaSectiunea } from "./sections";

/**
 * Pagina întreagă: bara de anunț, antetul, secțiunile din site.ts
 * (în ordinea de acolo) și subsolul.
 */
export default function Aplicatie() {
  const sectiuni = sectiuniAfisate();
  return (
    <>
      <a
        href="#continut"
        className="bg-auriu text-negru sr-only z-[60] rounded-full px-5 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {setari.texte.sariLaContinut}
      </a>
      <BaraAnunt />
      <Antet />
      <main id="continut" tabIndex={-1} className="outline-none">
        {sectiuni.map((s, i) => (
          <DeseneazaSectiunea key={s.id} sectiune={s} primul={i === 0} />
        ))}
      </main>
      <Subsol />
      <ButonApelMobil />
    </>
  );
}
