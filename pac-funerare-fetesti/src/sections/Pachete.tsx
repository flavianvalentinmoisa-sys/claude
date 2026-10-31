import { formatPret } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import type { SectiunePachete } from "../content/tipuri.ts";
import { GrupButoane } from "../componente/Buton";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Pachete informative „de la … lei”. Fără coș și fără plată online. */
export default function Pachete({ id, culori, date }: PropsSectiune<SectiunePachete>) {
  const { texte } = setari;
  const coloane = date.elemente.length >= 3 ? "lg:grid-cols-3" : date.elemente.length === 2 ? "md:grid-cols-2" : "";
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <ul className={`mx-auto grid items-stretch gap-6 ${coloane} ${date.elemente.length < 3 ? "max-w-4xl" : ""}`}>
        {date.elemente.map((p, i) => (
          <li
            key={`${p.nume}-${i}`}
            className={`bg-card rounded-card relative flex flex-col border p-7 md:p-8 ${
              p.recomandat ? "border-accent border-2 lg:-mt-3 lg:mb-3" : "border-linie"
            }`}
          >
            {p.recomandat ? (
              <span className="bg-buton text-buton-scris absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold whitespace-nowrap">
                {texte.recomandat}
              </span>
            ) : null}
            <h3 className="text-3xl">{p.nume}</h3>
            <p className="mt-3">
              <span className="text-scris-2 text-lg">{texte.deLa} </span>
              <span className="font-titluri cifre-drepte text-accent text-5xl font-semibold">{formatPret(p.pretDeLa)}</span>
              <span className="text-scris-2 text-lg"> {texte.moneda}</span>
            </p>
            <p className="text-scris-2 mt-3">{p.descriere}</p>
            <p className="mt-6 font-semibold">{texte.include}</p>
            <ul className="mt-3 grow space-y-2.5">
              {p.include.map((element) => (
                <li key={element} className="flex gap-3">
                  <svg viewBox="0 0 24 24" className="text-accent mt-1 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{element}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-center gap-6 text-center">
        {date.mentiune ? <p className="text-scris-2 max-w-2xl text-lg italic">{date.mentiune}</p> : null}
        <GrupButoane butoane={date.butoane} />
      </div>
    </Sectiune>
  );
}
