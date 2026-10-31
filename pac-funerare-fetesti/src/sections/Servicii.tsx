import { servicii } from "../content/site";
import Pictograma from "../componente/Pictograma";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Cardurile cu servicii. */
export default function Servicii({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="servicii" ton={ton} titlu={servicii.titlu} introducere={servicii.introducere}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {servicii.lista.map((s) => (
          <li key={s.titlu} className="bg-card border-linie rounded-2xl border p-6 md:p-7">
            <span className="text-accent border-linie flex h-14 w-14 items-center justify-center rounded-full border">
              <Pictograma nume={s.pictograma} className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-2xl">{s.titlu}</h3>
            <p className="text-scris-2 mt-2">{s.descriere}</p>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
