import type { SectiunePasi } from "../content/tipuri.ts";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Pași numerotați. */
export default function Pasi({ id, culori, date }: PropsSectiune<SectiunePasi>) {
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <ol className="mx-auto grid max-w-4xl gap-5">
        {date.elemente.map((pas, i) => (
          <li key={`${pas.titlu}-${i}`} className="bg-card border-linie rounded-card flex gap-5 border p-6 md:gap-7 md:p-8">
            <span
              aria-hidden="true"
              className="border-accent text-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-xl font-semibold md:h-14 md:w-14 md:text-2xl"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
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
      {date.notaFinala ? (
        <p className="border-accent mx-auto mt-8 max-w-4xl border-l-2 pl-5 text-lg italic">{date.notaFinala}</p>
      ) : null}
    </Sectiune>
  );
}
