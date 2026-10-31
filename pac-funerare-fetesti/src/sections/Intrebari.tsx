import type { SectiuneIntrebari } from "../content/tipuri.ts";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Întrebări frecvente, ca acordeon (funcționează și din tastatură). */
export default function Intrebari({ id, culori, date }: PropsSectiune<SectiuneIntrebari>) {
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <div className="mx-auto max-w-3xl space-y-4">
        {date.elemente.map((q, i) => (
          <details key={`${q.intrebare}-${i}`} className="bg-card border-linie rounded-card border">
            <summary className="rounded-card flex items-center justify-between gap-4 p-5 text-lg font-semibold md:p-6 md:text-xl">
              <span>{q.intrebare}</span>
              <span
                aria-hidden="true"
                className="semn-acordeon border-accent text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-2xl leading-none transition-transform duration-200"
              >
                +
              </span>
            </summary>
            <p className="text-scris-2 px-5 pb-6 text-lg md:px-6">{q.raspuns}</p>
          </details>
        ))}
      </div>
    </Sectiune>
  );
}
