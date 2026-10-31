import { echipa } from "../content/site";
import Imagine from "../componente/Imagine";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Membrii echipei. */
export default function Echipa({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="echipa" ton={ton} titlu={echipa.titlu} introducere={echipa.introducere}>
      <ul className="flex flex-wrap justify-center gap-8">
        {echipa.membri.map((m, i) => (
          <li key={`${m.nume}-${i}`} className="w-full max-w-xs text-center">
            <Imagine
              poza={m.poza}
              className="border-linie mx-auto aspect-square w-48 rounded-full border object-cover md:w-56"
            />
            <h3 className="mt-5 text-2xl">{m.nume}</h3>
            <p className="text-scris-2 mt-1">{m.rol}</p>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
