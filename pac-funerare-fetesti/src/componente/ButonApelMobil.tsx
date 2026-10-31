import { linkTelefon } from "../content/ajutoare";
import { firma, interfata } from "../content/site";
import Pictograma from "./Pictograma";

/** Butonul de apel fixat în partea de jos a ecranului, doar pe telefon. */
export default function ButonApelMobil() {
  return (
    <div className="ton-negru bg-fundal/95 border-linie fixed inset-x-0 bottom-0 z-50 border-t px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a
        href={linkTelefon(firma.telefonPrincipal)}
        className="buton buton-plin w-full !min-h-14 !px-4 text-center !text-base"
      >
        <Pictograma nume="telefon" className="h-6 w-6" />
        <span>
          {interfata.butonApelMobil}: <span className="whitespace-nowrap">{firma.telefonPrincipal}</span>
        </span>
      </a>
    </div>
  );
}
