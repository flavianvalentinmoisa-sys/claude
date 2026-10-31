import { setari } from "../content/site.ts";
import type { SectiuneAnunturi } from "../content/tipuri.ts";
import Imagine from "../componente/Imagine";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Anunțuri de deces și condoleanțe. */
export default function Anunturi({ id, culori, date }: PropsSectiune<SectiuneAnunturi>) {
  const { texte } = setari;
  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      {date.elemente.length === 0 ? (
        <p className="text-scris-2 text-center text-lg">{texte.faraAnunturi}</p>
      ) : (
        <ul className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {date.elemente.map((a, i) => (
            <li key={`${a.nume}-${i}`}>
              <article className="bg-card border-linie rounded-card flex h-full flex-col overflow-hidden border sm:flex-row">
                {a.poza ? (
                  <Imagine poza={a.poza} className="h-56 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0" />
                ) : null}
                <div className="flex min-w-0 flex-col p-6 md:p-7">
                  {a.exemplu ? (
                    <p className="border-accent text-accent mb-3 self-start rounded-full border px-3 py-0.5 text-sm font-semibold tracking-wide uppercase">
                      {texte.anuntExemplu}
                    </p>
                  ) : null}
                  <h3 className="text-3xl">{a.nume}</h3>
                  <p className="text-accent mt-1 text-lg">{a.perioada}</p>
                  <span className="linie-fina mt-4" aria-hidden="true" />
                  <p className="mt-4 text-lg">{a.mesaj}</p>
                  <dl className="text-scris-2 mt-5 space-y-3">
                    <div>
                      <dt className="text-scris font-semibold">{texte.slujba}</dt>
                      <dd>
                        {a.slujba.data}, {texte.ora} {a.slujba.ora}
                        <br />
                        {a.slujba.loc}
                      </dd>
                    </div>
                    {a.inmormantare ? (
                      <div>
                        <dt className="text-scris font-semibold">{texte.inmormantare}</dt>
                        <dd>{a.inmormantare}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </Sectiune>
  );
}
