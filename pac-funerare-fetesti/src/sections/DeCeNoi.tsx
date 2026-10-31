import { deCeNoi } from "../content/site";
import Pictograma from "../componente/Pictograma";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Argumentele „De ce PAC Funerare”. */
export default function DeCeNoi({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="de-ce-noi" ton={ton} titlu={deCeNoi.titlu} introducere={deCeNoi.introducere}>
      <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {deCeNoi.argumente.map((a) => (
          <li key={a.titlu} className="text-center">
            <span className="text-accent border-accent mx-auto flex h-16 w-16 items-center justify-center rounded-full border">
              <Pictograma nume={a.pictograma} className="h-8 w-8" />
            </span>
            <h3 className="mt-5 text-2xl">{a.titlu}</h3>
            <p className="text-scris-2 mt-2">{a.text}</p>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
