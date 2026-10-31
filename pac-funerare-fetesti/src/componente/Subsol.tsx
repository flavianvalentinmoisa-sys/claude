import { adresaScurta, linkEmail, linkTelefon, rezolvaLegatura, toateTelefoanele } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import Logo from "./Logo";
import Porumbel from "./Porumbel";

/** Partea de jos a paginii. */
export default function Subsol() {
  const { subsol, firma, texte, butonApelMobil } = setari;
  const linkuri = subsol.linkuri
    .map((l) => ({ text: l.text, legatura: rezolvaLegatura(l.catre) }))
    .filter((l) => l.legatura !== null);
  return (
    <footer
      className={`culori-negru bg-fundal text-scris border-linie border-t px-4 pt-14 sm:px-6 md:pb-12 ${
        butonApelMobil.vizibil ? "pb-28" : "pb-12"
      }`}
    >
      <div className="max-w-pagina mx-auto grid gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="text-scris-2 mt-4">{subsol.descriere}</p>
          {subsol.arataPorumbel ? <Porumbel className="text-argintiu mt-6 h-6 w-9 opacity-50" /> : null}
        </div>

        {linkuri.length > 0 ? (
          <nav aria-label={subsol.titluLinkuri}>
            <h2 className="text-2xl">{subsol.titluLinkuri}</h2>
            <ul className="mt-4 space-y-2">
              {linkuri.map((l) => (
                <li key={l.legatura!.href}>
                  <a href={l.legatura!.href} className="text-scris-2 hover:text-scris">
                    {l.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div />
        )}

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
            {firma.facebook ? (
              <li>
                <a href={firma.facebook} target="_blank" rel="noopener noreferrer" className="link-subliniat">
                  {texte.urmaritiNeFacebook}
                  <span className="sr-only"> {texte.filaNoua}</span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <p className="text-scris-2 border-linie max-w-pagina mx-auto mt-12 border-t pt-6 text-sm">
        © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {firma.nume}. {subsol.textDrepturi}
      </p>
    </footer>
  );
}
