import { linkTelefon } from "../content/ajutoare.ts";
import { setari } from "../content/site.ts";
import type { SectiuneBanner } from "../content/tipuri.ts";
import { GrupButoane } from "../componente/Buton";
import Imagine from "../componente/Imagine";
import Logo from "../componente/Logo";
import Porumbel from "../componente/Porumbel";
import { Eticheta, type PropsSectiune } from "../componente/Sectiune";

const inaltimi = {
  mica: "min-h-[50svh]",
  mare: "min-h-[70svh]",
  ecran: "min-h-[88svh]",
};

/** Banner cu poză de fundal întunecată, titlu, text și butoane. */
export default function Banner({ id, culori, date, primul }: PropsSectiune<SectiuneBanner>) {
  const { firma, texte } = setari;
  const Titlu = primul ? "h1" : "h2";
  const opacitate = Math.min(Math.max(date.intunecare, 0), 95) / 100;
  return (
    <section
      id={id}
      aria-labelledby={date.titlu ? `titlu-${id}` : undefined}
      className={`culori-${culori} text-scris relative isolate flex items-center overflow-hidden bg-negru px-4 py-14 sm:px-6 md:py-20 ${inaltimi[date.inaltime]}`}
    >
      <Imagine poza={date.poza} prioritara={primul} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="bg-negru absolute inset-0 -z-10" style={{ opacity: opacitate }} />

      <div className="aparitie mx-auto flex max-w-3xl flex-col items-center text-center">
        {date.arataLogo ? (
          <div className="mb-4 md:mb-6">
            <Logo marime="mare" cuNume={false} />
          </div>
        ) : null}
        {date.arataPorumbel ? <Porumbel className="text-argintiu mb-4 h-7 w-10 opacity-70" /> : null}
        {date.eticheta ? <Eticheta text={date.eticheta} /> : null}
        {date.titlu ? (
          <Titlu id={`titlu-${id}`} className="mt-1 text-4xl sm:text-5xl md:text-6xl">
            {date.titlu}
          </Titlu>
        ) : null}
        {date.text ? <p className="text-scris-2 mt-6 max-w-2xl text-lg md:text-xl">{date.text}</p> : null}

        <div className="mt-10 w-full sm:w-auto">
          <GrupButoane butoane={date.butoane} mare />
        </div>
        {date.arataAlDoileaTelefon && firma.telefonSecundar ? (
          <p className="text-scris-2 mt-4 text-lg">
            {texte.sau}{" "}
            <a href={linkTelefon(firma.telefonSecundar)} className="link-subliniat text-scris font-semibold whitespace-nowrap">
              {firma.telefonSecundar}
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
