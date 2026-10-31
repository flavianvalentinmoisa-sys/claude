import { formatPret, linkTelefon } from "../content/ajutoare";
import { firma, pachete } from "../content/site";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Cele trei pachete orientative. */
export default function Pachete({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="pachete" ton={ton} titlu={pachete.titlu} introducere={pachete.introducere}>
      <ul className="grid items-stretch gap-6 lg:grid-cols-3">
        {pachete.lista.map((p) => (
          <li
            key={p.nume}
            className={`bg-card relative flex flex-col rounded-2xl border p-7 md:p-8 ${
              p.recomandat ? "border-accent border-2 lg:-mt-3 lg:mb-3" : "border-linie"
            }`}
          >
            {p.recomandat ? (
              <span className="bg-buton text-buton-scris absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold whitespace-nowrap">
                {pachete.etichetaRecomandat}
              </span>
            ) : null}
            <h3 className="text-3xl">{p.nume}</h3>
            <p className="mt-3">
              <span className="text-scris-2 text-lg">{pachete.textDeLa} </span>
              <span className="font-titluri cifre-drepte text-accent text-5xl font-semibold">{formatPret(p.pretDeLa)}</span>
              <span className="text-scris-2 text-lg"> {pachete.moneda}</span>
            </p>
            <p className="text-scris-2 mt-3">{p.descriere}</p>
            <p className="mt-6 font-semibold">{pachete.titluInclude}</p>
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
      <div className="mt-10 flex flex-col items-center gap-5 text-center">
        <p className="text-scris-2 max-w-2xl text-lg italic">{pachete.mentiune}</p>
        <a href={linkTelefon(firma.telefonPrincipal)} className="buton buton-plin">
          {pachete.butonOferta}: {firma.telefonPrincipal}
        </a>
      </div>
    </Sectiune>
  );
}
