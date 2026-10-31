import { anunturi } from "../content/site";
import Imagine from "../componente/Imagine";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Anunțurile de deces și condoleanțe. */
export default function Anunturi({ ton }: { ton: Ton }) {
  return (
    <Sectiune id="anunturi" ton={ton} titlu={anunturi.titlu} introducere={anunturi.introducere}>
      {anunturi.lista.length === 0 ? (
        <p className="text-scris-2 text-center text-lg">{anunturi.textFaraAnunturi}</p>
      ) : (
        <ul className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {anunturi.lista.map((a, i) => (
            <li key={`${a.nume}-${i}`}>
              <article className="bg-card border-linie relative flex h-full flex-col overflow-hidden rounded-2xl border sm:flex-row">
                {a.poza ? (
                  <Imagine poza={a.poza} className="h-56 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0" />
                ) : null}
                <div className="flex flex-col p-6 md:p-7">
                  {a.exemplu ? (
                    <p className="border-accent text-accent mb-3 self-start rounded-full border px-3 py-0.5 text-sm font-semibold tracking-wide uppercase">
                      {anunturi.etichetaExemplu}
                    </p>
                  ) : null}
                  <h3 className="text-3xl">{a.nume}</h3>
                  <p className="text-accent mt-1 text-lg">{a.perioada}</p>
                  <span className="linie-fina mt-4" aria-hidden="true" />
                  <p className="mt-4 text-lg">{a.mesaj}</p>
                  <dl className="text-scris-2 mt-5 space-y-3">
                    <div>
                      <dt className="text-scris font-semibold">{anunturi.etichetaSlujba}</dt>
                      <dd>
                        {a.slujba.data}, {anunturi.etichetaOra} {a.slujba.ora}
                        <br />
                        {a.slujba.loc}
                      </dd>
                    </div>
                    {a.inmormantare ? (
                      <div>
                        <dt className="text-scris font-semibold">{anunturi.etichetaInmormantare}</dt>
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
