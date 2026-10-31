import type { SectiuneText } from "../content/tipuri.ts";
import { GrupButoane } from "../componente/Buton";
import Porumbel from "../componente/Porumbel";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Text centrat, cu butoane opționale (de ex. un îndemn la apel). */
export default function Text({ id, culori, date }: PropsSectiune<SectiuneText>) {
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
        {date.paragrafe.length > 0 ? (
          <div className="text-scris-2 space-y-4 text-lg md:text-xl">
            {date.paragrafe.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
        <GrupButoane butoane={date.butoane} mare />
        {date.arataPorumbel ? <Porumbel className="text-argintiu h-6 w-9 opacity-50" /> : null}
      </div>
    </Sectiune>
  );
}
