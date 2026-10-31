import type { ReactNode } from "react";
import type { IdSectiune } from "../content/tipuri";

export type Ton = "inchis" | "deschis";

interface Props {
  id: IdSectiune;
  ton: Ton;
  titlu: string;
  introducere?: string;
  children: ReactNode;
}

/** Învelișul comun al fiecărei secțiuni: fundal, spațiere, titlu. */
export default function Sectiune({ id, ton, titlu, introducere, children }: Props) {
  const idTitlu = `titlu-${id}`;
  return (
    <section
      id={id}
      aria-labelledby={idTitlu}
      className={`ton-${ton} bg-fundal text-scris px-4 py-16 sm:px-6 md:py-24`}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <h2 id={idTitlu} className="text-4xl md:text-5xl">
            {titlu}
          </h2>
          <span className="linie-fina mx-auto mt-5" aria-hidden="true" />
          {introducere ? (
            <p className="text-scris-2 mt-5 text-lg md:text-xl">{introducere}</p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
