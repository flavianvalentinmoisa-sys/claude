import { useState } from "react";
import { linkTelefon, rezolvaLegatura } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import Logo from "./Logo";
import Pictograma from "./Pictograma";

/** Bara de sus: siglă, meniu, telefon. */
export default function Antet() {
  const [deschis, setDeschis] = useState(false);
  const { antet, firma, texte } = setari;
  const linkuri = antet.meniu
    .map((l) => ({ text: l.text, legatura: rezolvaLegatura(l.catre) }))
    .filter((l) => l.legatura !== null);
  const inchide = () => setDeschis(false);

  return (
    <header className="culori-negru bg-fundal/95 text-scris border-linie sticky top-0 z-40 border-b backdrop-blur">
      <div className="max-w-pagina mx-auto flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a href="#" className="rounded" onClick={inchide} aria-label={firma.nume}>
          <Logo />
        </a>

        <nav aria-label={texte.meniu} className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {linkuri.map((l) => (
              <li key={l.legatura!.href}>
                <a href={l.legatura!.href} className="text-scris-2 hover:text-scris text-base transition-colors">
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {antet.arataTelefon ? (
          <a
            href={linkTelefon(firma.telefonPrincipal)}
            className="buton buton-plin hidden !min-h-11 !px-5 !text-base md:inline-flex"
          >
            <Pictograma nume="telefon" className="h-5 w-5" />
            {firma.telefonPrincipal}
          </a>
        ) : null}

        {linkuri.length > 0 ? (
          <button
            type="button"
            className="buton buton-contur !min-h-11 !px-4 !text-base lg:hidden"
            aria-expanded={deschis}
            aria-controls="meniu-mobil"
            aria-label={deschis ? texte.inchideMeniul : texte.deschideMeniul}
            onClick={() => setDeschis((d) => !d)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
              {deschis ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            {texte.meniu}
          </button>
        ) : null}
      </div>

      <nav id="meniu-mobil" aria-label={texte.meniu} className={`border-linie border-t lg:hidden ${deschis ? "block" : "hidden"}`}>
        <ul className="max-w-pagina mx-auto px-4 py-3 sm:px-6">
          {linkuri.map((l) => (
            <li key={l.legatura!.href}>
              <a href={l.legatura!.href} onClick={inchide} className="border-linie hover:text-accent block border-b py-3.5 text-lg">
                {l.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
