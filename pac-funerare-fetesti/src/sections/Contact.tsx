import { type FormEvent, useState } from "react";
import { adresaScurta, linkEmail, linkHarta, linkTelefon, toateTelefoanele } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import type { SectiuneContact } from "../content/tipuri.ts";
import Pictograma from "../componente/Pictograma";
import Sectiune, { type PropsSectiune } from "../componente/Sectiune";

/** Telefoane, adresă, email, program, Facebook, hartă și formularul de email. */
export default function Contact({ id, culori, date }: PropsSectiune<SectiuneContact>) {
  const { firma, texte } = setari;
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mesaj, setMesaj] = useState("");

  function trimite(e: FormEvent) {
    e.preventDefault();
    const corp = `${mesaj}\n\n${texte.formularNume}: ${nume}\n${texte.formularTelefon}: ${telefon}`;
    window.location.href = `${linkEmail()}?subject=${encodeURIComponent(texte.formularSubiect)}&body=${encodeURIComponent(corp)}`;
  }

  const camp =
    "bg-card border-linie text-scris mt-2 block w-full rounded-xl border px-4 py-3 text-lg focus:border-accent focus:outline-none";

  return (
    <Sectiune id={id} culori={culori} eticheta={date.eticheta} titlu={date.titlu} introducere={date.introducere}>
      <div className={`grid gap-10 ${date.arataFormular ? "lg:grid-cols-2" : "mx-auto max-w-3xl"}`}>
        <div className="min-w-0 space-y-8">
          <div>
            <h3 className="text-2xl">{texte.telefoane}</h3>
            <div className="mt-4 flex flex-col gap-3">
              {toateTelefoanele().map((t, i) => (
                <a
                  key={t}
                  href={linkTelefon(t)}
                  className={`buton ${i === 0 ? "buton-plin" : "buton-contur"} w-full !min-h-16 sm:w-auto sm:self-start`}
                >
                  <Pictograma nume="telefon" className="h-6 w-6 shrink-0" />
                  <span className="text-xl tracking-wide">{t}</span>
                </a>
              ))}
            </div>
          </div>

          <dl className="space-y-6 text-lg">
            <div className="flex gap-4">
              <Pictograma nume="locatie" className="text-accent mt-1 h-7 w-7 shrink-0" />
              <div>
                <dt className="font-semibold">{texte.adresa}</dt>
                <dd className="text-scris-2">
                  <address className="not-italic">
                    {adresaScurta()}
                    <br />
                    {firma.adresa.reper}
                  </address>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Pictograma nume="email" className="text-accent mt-1 h-7 w-7 shrink-0" />
              <div className="min-w-0">
                <dt className="font-semibold">{texte.email}</dt>
                <dd>
                  <a href={linkEmail()} className="link-subliniat break-all">
                    {firma.email}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Pictograma nume="ceas" className="text-accent mt-1 h-7 w-7 shrink-0" />
              <div>
                <dt className="font-semibold">{texte.program}</dt>
                <dd className="text-scris-2">{firma.program}</dd>
              </div>
            </div>
            {firma.facebook ? (
              <div className="flex gap-4">
                <Pictograma nume="facebook" className="text-accent mt-1 h-7 w-7 shrink-0" />
                <div>
                  <dt className="sr-only">{texte.facebook}</dt>
                  <dd>
                    <a href={firma.facebook} target="_blank" rel="noopener noreferrer" className="link-subliniat font-semibold">
                      {texte.urmaritiNeFacebook}
                      <span className="sr-only"> {texte.filaNoua}</span>
                    </a>
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>

          {date.arataHarta ? (
            <iframe
              title={texte.titluHarta}
              src={linkHarta(date.cautareHarta)}
              className="border-linie rounded-card h-80 w-full border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}
        </div>

        {date.arataFormular ? (
          <form onSubmit={trimite} className="bg-card border-linie rounded-card self-start border p-6 md:p-8">
            <h3 className="text-3xl">{texte.formularTitlu}</h3>
            <p className="text-scris-2 mt-3">{texte.formularExplicatie}</p>
            <div className="mt-6 space-y-5">
              <label className="block font-semibold" htmlFor={`${id}-nume`}>
                {texte.formularNume}
                <input id={`${id}-nume`} type="text" name="nume" autoComplete="name" required value={nume} onChange={(e) => setNume(e.target.value)} className={camp} />
              </label>
              <label className="block font-semibold" htmlFor={`${id}-telefon`}>
                {texte.formularTelefon}
                <input id={`${id}-telefon`} type="tel" name="telefon" autoComplete="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} className={camp} />
              </label>
              <label className="block font-semibold" htmlFor={`${id}-mesaj`}>
                {texte.formularMesaj}
                <textarea id={`${id}-mesaj`} name="mesaj" rows={5} required value={mesaj} onChange={(e) => setMesaj(e.target.value)} className={camp} />
              </label>
            </div>
            <button type="submit" className="buton buton-plin mt-6 w-full">
              <Pictograma nume="email" className="h-5 w-5" />
              {texte.formularButon}
            </button>
          </form>
        ) : null}
      </div>
    </Sectiune>
  );
}
