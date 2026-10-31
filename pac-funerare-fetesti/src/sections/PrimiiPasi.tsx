import { primiiPasi } from "../content/site";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Pașii simpli pentru primele ore. */
export default function PrimiiPasi({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="primii-pasi" ton={ton} titlu={primiiPasi.titlu} introducere={primiiPasi.introducere}>
      <ol className="mx-auto grid max-w-4xl gap-5">
        {primiiPasi.pasi.map((pas, i) => (
          <li key={pas.titlu} className="bg-card border-linie flex gap-5 rounded-2xl border p-6 md:gap-7 md:p-8">
            <span
              aria-hidden="true"
              className="border-accent text-accent font-text flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-2xl font-semibold md:h-14 md:w-14 md:text-3xl"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-2xl md:text-3xl">{pas.titlu}</h3>
              <p className="text-scris-2 mt-2 text-lg">{pas.text}</p>
              {pas.lista && pas.lista.length > 0 ? (
                <ul className="mt-3 space-y-2 text-lg">
                  {pas.lista.map((element) => (
                    <li key={element} className="flex gap-3">
                      <span aria-hidden="true" className="bg-accent mt-3 h-1.5 w-1.5 shrink-0 rounded-full" />
                      <span>{element}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {primiiPasi.notaFinala ? (
        <p className="border-accent mx-auto mt-8 max-w-4xl border-l-2 pl-5 text-lg italic">
          {primiiPasi.notaFinala}
        </p>
      ) : null}
    </Sectiune>
  );
}
