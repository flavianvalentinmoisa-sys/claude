import { type FormEvent, useState } from "react";
import { adresaScurta, linkEmail, linkHarta, toateTelefoanele } from "../content/ajutoare";
import { contact, firma, interfata } from "../content/site";
import ButonTelefon from "../componente/ButonTelefon";
import Pictograma from "../componente/Pictograma";
import Sectiune, { type Ton } from "../componente/Sectiune";

/** Telefoane, adresă, email, hartă, Facebook și formularul de email. */
export default function Contact({ ton }: { ton: Ton }) {
  const f = contact.formular;
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mesaj, setMesaj] = useState("");

  function trimite(e: FormEvent) {
    e.preventDefault();
    const corp = `${mesaj}\n\n${f.etichetaNume}: ${nume}\n${f.etichetaTelefon}: ${telefon}`;
    window.location.href = `${linkEmail()}?subject=${encodeURIComponent(f.subiectEmail)}&body=${encodeURIComponent(corp)}`;
  }

  const camp =
    "bg-card border-linie text-scris mt-2 block w-full rounded-xl border px-4 py-3 text-lg focus:border-accent focus:outline-none";

  return (
    <Sectiune id="contact" ton={ton} titlu={contact.titlu} introducere={contact.introducere}>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Coloana cu datele de contact */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl">{contact.etichetaTelefoane}</h3>
            <div className="mt-4 flex flex-col gap-3">
              {toateTelefoanele().map((t, i) => (
                <ButonTelefon
                  key={t}
                  numar={t}
                  varianta={i === 0 ? "plin" : "contur"}
                  className="w-full !min-h-16 sm:w-auto sm:self-start"
                />
              ))}
            </div>
          </div>

          <dl className="space-y-6 text-lg">
            <div className="flex gap-4">
              <Pictograma nume="locatie" className="text-accent mt-1 h-7 w-7 shrink-0" />
              <div>
                <dt className="font-semibold">{contact.etichetaAdresa}</dt>
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
              <div>
                <dt className="font-semibold">{contact.etichetaEmail}</dt>
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
                <dt className="font-semibold">{contact.etichetaProgram}</dt>
                <dd className="text-scris-2">{firma.program}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Pictograma nume="facebook" className="text-accent mt-1 h-7 w-7 shrink-0" />
              <div>
                <dt className="sr-only">{contact.etichetaFacebook}</dt>
                <dd>
                  <a href={firma.facebook} target="_blank" rel="noopener noreferrer" className="link-subliniat font-semibold">
                    {firma.textFacebook}
                    <span className="sr-only"> {interfata.filaNoua}</span>
                  </a>
                </dd>
              </div>
            </div>
          </dl>

          <iframe
            title={contact.harta.titlu}
            src={linkHarta(contact.harta.cautare)}
            className="border-linie h-80 w-full rounded-2xl border"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Formularul care deschide aplicația de email */}
        <form onSubmit={trimite} className="bg-card border-linie self-start rounded-2xl border p-6 md:p-8">
          <h3 className="text-3xl">{f.titlu}</h3>
          <p className="text-scris-2 mt-3">{f.explicatie}</p>
          <div className="mt-6 space-y-5">
            <label className="block font-semibold">
              {f.etichetaNume}
              <input
                type="text"
                name="nume"
                autoComplete="name"
                required
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                className={camp}
              />
            </label>
            <label className="block font-semibold">
              {f.etichetaTelefon}
              <input
                type="tel"
                name="telefon"
                autoComplete="tel"
                inputMode="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                className={camp}
              />
            </label>
            <label className="block font-semibold">
              {f.etichetaMesaj}
              <textarea
                name="mesaj"
                rows={5}
                required
                value={mesaj}
                onChange={(e) => setMesaj(e.target.value)}
                className={camp}
              />
            </label>
          </div>
          <button type="submit" className="buton buton-plin mt-6 w-full">
            <Pictograma nume="email" className="h-5 w-5" />
            {f.buton}
          </button>
        </form>
      </div>
    </Sectiune>
  );
}
