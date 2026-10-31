import type { ReactNode } from "react";
import type { SchemaCulori } from "../content/tipuri.ts";

interface Props {
  id: string;
  culori: SchemaCulori;
  eticheta?: string;
  titlu?: string;
  introducere?: string;
  children?: ReactNode;
}

/** Învelișul comun al fiecărei secțiuni: culori, spațiere, titlu. */
export default function Sectiune({ id, culori, eticheta, titlu, introducere, children }: Props) {
  const idTitlu = `titlu-${id}`;
  const areAntet = Boolean(eticheta || titlu || introducere);
  return (
    <section
      id={id}
      aria-labelledby={titlu ? idTitlu : undefined}
      className={`culori-${culori} bg-fundal text-scris px-4 py-16 sm:px-6 md:py-24`}
    >
      <div className="max-w-pagina mx-auto">
        {areAntet ? (
          <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
            {eticheta ? <Eticheta text={eticheta} /> : null}
            {titlu ? (
              <h2 id={idTitlu} className="text-4xl md:text-5xl">
                {titlu}
              </h2>
            ) : null}
            {titlu ? <span className="linie-fina mx-auto mt-5" aria-hidden="true" /> : null}
            {introducere ? <p className="text-scris-2 mt-5 text-lg md:text-xl">{introducere}</p> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Textul mic, cu majuscule, de deasupra titlurilor. */
export function Eticheta({ text }: { text: string }) {
  return (
    <p className="text-accent mb-3 text-sm font-semibold tracking-[0.18em] uppercase md:text-base">{text}</p>
  );
}

/** Ce primește fiecare tip de secțiune de la pagină. */
export interface PropsSectiune<T> {
  id: string;
  culori: SchemaCulori;
  date: T;
  /** true pentru prima secțiune vizibilă (titlul ei devine titlul paginii) */
  primul: boolean;
}
