import { linkTelefon, toateTelefoanele } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";

/** Bara subțire din capul paginii (ca „Announcement bar” din Dawn). */
export default function BaraAnunt() {
  const { baraAnunt, texte } = setari;
  if (!baraAnunt.vizibil) return null;
  const telefoane = baraAnunt.arataTelefoane ? toateTelefoanele() : [];
  return (
    <div className="culori-negru bg-fundal text-scris-2 border-linie border-b px-4 py-2 text-center text-sm sm:text-base">
      <span>{baraAnunt.text}</span>
      {telefoane.map((t, i) => (
        <span key={t}>
          {" "}
          {i > 0 ? `${texte.sau} ` : null}
          <a href={linkTelefon(t)} className="text-scris font-semibold whitespace-nowrap underline-offset-4 hover:underline">
            {t}
          </a>
        </span>
      ))}
    </div>
  );
}
