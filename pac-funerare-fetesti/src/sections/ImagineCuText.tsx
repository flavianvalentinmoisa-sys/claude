import type { SectiuneImagineCuText } from "../content/tipuri.ts";
import { GrupButoane } from "../componente/Buton";
import Imagine from "../componente/Imagine";
import { Eticheta, type PropsSectiune } from "../componente/Sectiune";

/** Poză pe o parte, text și butoane pe cealaltă. */
export default function ImagineCuText({ id, culori, date, primul }: PropsSectiune<SectiuneImagineCuText>) {
  const Titlu = primul ? "h1" : "h2";
  return (
    <section
      id={id}
      aria-labelledby={date.titlu ? `titlu-${id}` : undefined}
      className={`culori-${culori} bg-fundal text-scris px-4 py-16 sm:px-6 md:py-24`}
    >
      <div className="max-w-pagina mx-auto grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Imagine
          poza={date.poza}
          className={`rounded-card aspect-[4/3] w-full object-cover ${date.pozitiePoza === "dreapta" ? "md:order-2" : ""}`}
        />
        <div className="min-w-0">
          {date.eticheta ? <Eticheta text={date.eticheta} /> : null}
          {date.titlu ? (
            <Titlu id={`titlu-${id}`} className="text-4xl md:text-5xl">
              {date.titlu}
            </Titlu>
          ) : null}
          {date.titlu ? <span className="linie-fina mt-5" aria-hidden="true" /> : null}
          {date.introducere ? <p className="mt-5 text-xl">{date.introducere}</p> : null}
          <div className="text-scris-2 mt-5 space-y-4 text-lg">
            {date.paragrafe.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {date.butoane.length > 0 ? (
            <div className="mt-8">
              <GrupButoane butoane={date.butoane} aliniere="stanga" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
