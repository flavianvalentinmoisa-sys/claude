import { intrebari } from "../content/site";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Întrebări frecvente, sub formă de acordeon (funcționează și din tastatură). */
export default function Intrebari({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="intrebari" ton={ton} titlu={intrebari.titlu} introducere={intrebari.introducere}>
      <div className="mx-auto max-w-3xl space-y-4">
        {intrebari.lista.map((q) => (
          <details key={q.intrebare} className="bg-card border-linie group rounded-2xl border">
            <summary className="flex items-center justify-between gap-4 rounded-2xl p-5 text-lg font-semibold md:p-6 md:text-xl">
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
