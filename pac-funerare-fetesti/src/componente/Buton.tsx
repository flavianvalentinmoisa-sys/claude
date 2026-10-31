import { rezolvaLegatura } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import type { Buton as DateButon } from "../content/tipuri.ts";
import Pictograma from "./Pictograma";

interface Props {
  buton: DateButon;
  mare?: boolean;
  className?: string;
}

/**
 * Un buton din site.ts. Butoanele de apel au pictograma telefonului
 * și numărul scris sub text. Butoanele către secțiuni ascunse nu apar.
 */
export default function Buton({ buton, mare = false, className = "" }: Props) {
  const legatura = rezolvaLegatura(buton.catre);
  if (!legatura) return null;
  const stil = buton.stil ?? "plin";
  const marime = mare ? "!min-h-16 !px-8 !text-xl" : "";
  return (
    <a
      href={legatura.href}
      className={`buton buton-${stil} ${marime} ${className}`}
      {...(legatura.extern ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {legatura.telefon ? <Pictograma nume="telefon" className="h-6 w-6 shrink-0" /> : null}
      {legatura.telefon ? (
        <span className="flex flex-col items-start leading-tight">
          <span>{buton.text}</span>
          <span className={`font-normal ${mare ? "text-base" : "text-sm"}`}>{legatura.telefon}</span>
        </span>
      ) : (
        <span>{buton.text}</span>
      )}
      {legatura.extern ? <span className="sr-only"> {setari.texte.filaNoua}</span> : null}
    </a>
  );
}

/** Un rând de butoane (se așază unul sub altul pe telefon). */
export function GrupButoane({
  butoane,
  mare = false,
  aliniere = "centru",
}: {
  butoane: DateButon[];
  mare?: boolean;
  aliniere?: "centru" | "stanga";
}) {
  if (butoane.length === 0) return null;
  return (
    <div
      className={`flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap ${
        aliniere === "centru" ? "items-center sm:justify-center" : "items-stretch sm:items-start"
      }`}
    >
      {butoane.map((b, i) => (
        <Buton key={`${b.catre}-${i}`} buton={b} mare={mare} className="w-full sm:w-auto" />
      ))}
    </div>
  );
}
