import { flota } from "../content/site";
import Imagine from "../componente/Imagine";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Galeria cu mașinile funerare. */
export default function Flota({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="flota" ton={ton} titlu={flota.titlu} introducere={flota.introducere}>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flota.masini.map((m) => (
          <li key={m.poza.fisier + m.model} className="bg-card border-linie overflow-hidden rounded-2xl border">
            <figure>
              <Imagine poza={m.poza} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="p-6">
                <h3 className="text-2xl">{m.model}</h3>
                <p className="text-scris-2 mt-2">{m.descriere}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
