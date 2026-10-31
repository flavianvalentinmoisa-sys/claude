import type { SectiuneColoane } from "../content/tipuri.ts";
import Imagine from "../componente/Imagine";
import Pictograma from "../componente/Pictograma";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";
import { grila } from "./grila";

/** Coloane cu pictogramă sau poză, titlu și text. */
export default function Coloane({ id, culori, date }: PropsSectiune<SectiuneColoane>) {
  const carduri = date.stil === "carduri";
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <ul className={`grid gap-x-6 ${carduri ? "gap-y-6" : "gap-y-12"} ${grila[date.coloanePeRand]}`}>
        {date.elemente.map((c, i) => (
          <li
            key={`${c.titlu}-${i}`}
            className={carduri ? "bg-card border-linie rounded-card overflow-hidden border" : "text-center"}
          >
            {c.poza ? (
              <Imagine poza={c.poza} className={`aspect-[4/3] w-full object-cover ${carduri ? "" : "rounded-card mb-5"}`} />
            ) : null}
            <div className={carduri ? "p-6 md:p-7" : ""}>
              {c.pictograma && !c.poza ? (
                <span
                  className={`text-accent flex items-center justify-center rounded-full border ${
                    carduri ? "border-linie h-14 w-14" : "border-accent mx-auto h-16 w-16"
                  }`}
                >
                  <Pictograma nume={c.pictograma} className={carduri ? "h-7 w-7" : "h-8 w-8"} />
                </span>
              ) : null}
              <h3 className={`text-2xl ${c.pictograma && !c.poza ? "mt-5" : ""}`}>{c.titlu}</h3>
              <p className="text-scris-2 mt-2">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Sectiune>
  );
}
