import { adresaScurta, esteVizibila, linkEmail, linkTelefon, toateTelefoanele } from "../content/ajutoare";
import { firma, interfata, subsol } from "../content/site";
import Logo from "../componente/Logo";
import Porumbel from "../componente/Porumbel";

/** Partea de jos a paginii. */
export default function Subsol() {
  const linkuri = subsol.linkuri.filter((l) => esteVizibila(l.catre));
  return (
    <footer className="ton-negru bg-fundal text-scris border-linie border-t px-4 pt-14 pb-28 sm:px-6 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="text-scris-2 mt-4">{subsol.descriere}</p>
          <Porumbel className="text-argintiu mt-6 h-6 w-9 opacity-50" />
        </div>

        <nav aria-label={subsol.titluLinkuri}>
          <h2 className="text-2xl">{subsol.titluLinkuri}</h2>
          <ul className="mt-4 space-y-2">
            {linkuri.map((l) => (
              <li key={l.catre}>
                <a href={`#${l.catre}`} className="text-scris-2 hover:text-scris">
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-2xl">{subsol.titluContact}</h2>
          <ul className="mt-4 space-y-2">
            {toateTelefoanele().map((t) => (
              <li key={t}>
                <a href={linkTelefon(t)} className="link-subliniat text-lg font-semibold">
                  {t}
                </a>
              </li>
            ))}
            <li className="text-scris-2">
              <address className="not-italic">
                {adresaScurta()}
                <br />
                {firma.adresa.reper}
              </address>
            </li>
            <li>
              <a href={linkEmail()} className="link-subliniat break-all">
                {firma.email}
              </a>
            </li>
            <li>
              <a href={firma.facebook} target="_blank" rel="noopener noreferrer" className="link-subliniat">
                {firma.textFacebook}
                <span className="sr-only"> {interfata.filaNoua}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="text-scris-2 border-linie mx-auto mt-12 max-w-6xl border-t pt-6 text-sm">
        © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {firma.nume}. {subsol.textDrepturi}
      </p>
    </footer>
  );
}
