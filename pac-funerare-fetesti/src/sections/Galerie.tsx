import type { SectiuneGalerie } from "../content/tipuri.ts";
import Imagine from "../componente/Imagine";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";
import { grila } from "./grila";

/** Galerie de poze cu titlu și text: dreptunghiuri (mașini) sau cercuri (portrete). */
export default function Galerie({ id, culori, date }: PropsSectiune<SectiuneGalerie>) {
  if (date.forma === "rotund") {
    return (
      <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-12">
          {date.elemente.map((e, i) => (
            <li key={`${e.titlu}-${i}`} className="w-full max-w-xs text-center">
              <Imagine poza={e.poza} className="border-linie mx-auto aspect-square w-48 max-w-full rounded-full border object-cover md:w-56" />
              <h3 className="mt-5 text-2xl">{e.titlu}</h3>
              {e.text ? <p className="text-scris-2 mt-1">{e.text}</p> : null}
            </li>
          ))}
        </ul>
      </Sectiune>
    );
  }
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <ul className={`grid gap-6 ${grila[date.coloanePeRand]}`}>
        {date.elemente.map((e, i) => (
          <li key={`${e.poza.fisier}-${i}`} className="bg-card border-linie rounded-card overflow-hidden border">
            <figure>
              <Imagine poza={e.poza} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="p-6">
                <h3 className="text-2xl">{e.titlu}</h3>
                {e.text ? <p className="text-scris-2 mt-2">{e.text}</p> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
