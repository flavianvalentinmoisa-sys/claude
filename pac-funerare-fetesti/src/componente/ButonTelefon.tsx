import { linkTelefon } from "../content/ajutoare";
import Pictograma from "./Pictograma";

interface Props {
  numar: string;
  /** Textul de pe buton. Dacă lipsește, apare doar numărul. */
  text?: string;
  varianta?: "plin" | "contur";
  className?: string;
}

/** Buton mare care pornește apelul telefonic. */
export default function ButonTelefon({ numar, text, varianta = "plin", className = "" }: Props) {
  return (
    <a href={linkTelefon(numar)} className={`buton buton-${varianta} ${className}`}>
      <Pictograma nume="telefon" className="h-6 w-6 shrink-0" />
      {text ? (
        <span className="flex flex-col items-start leading-tight">
          <span>{text}</span>
          <span className="text-sm font-normal opacity-85">{numar}</span>
        </span>
      ) : (
        <span className="text-xl tracking-wide">{numar}</span>
      )}
    </a>
  );
}
