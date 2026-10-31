import { esteVizibila, linkTelefon } from "../content/ajutoare";
import { firma, hero } from "../content/site";
import Imagine from "../componente/Imagine";
import Logo from "../componente/Logo";
import Pictograma from "../componente/Pictograma";
import Porumbel from "../componente/Porumbel";

/** Primul ecran: poza flotei, siglă, titlu și butoanele de apel. */
export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="titlu-hero"
      className="ton-inchis text-scris relative isolate flex min-h-[88svh] items-center overflow-hidden bg-negru px-4 py-14 md:py-20 sm:px-6"
    >
      <Imagine
        poza={hero.pozaFundal}
        prioritara
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* strat întunecat peste poză, pentru lizibilitate */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-negru/80 via-negru/70 to-negru/90"
      />

      <div className="aparitie mx-auto flex max-w-3xl flex-col items-center text-center">
        {hero.arataLogo ? (
          <div className="mb-4 md:mb-6">
            <Logo marime="mare" cuNume={false} />
          </div>
        ) : null}
        {hero.arataPorumbel ? <Porumbel className="text-argintiu mb-4 h-7 w-10 opacity-70" /> : null}

        <p className="text-accent text-sm font-semibold tracking-[0.18em] uppercase md:text-base">
          {hero.supratitlu}
        </p>
        <h1 id="titlu-hero" className="mt-4 text-4xl sm:text-5xl md:text-6xl">
          {hero.titlu}
        </h1>
        <p className="text-scris-2 mt-6 max-w-2xl text-lg md:text-xl">{hero.subtitlu}</p>

        <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:items-start">
          <div className="flex w-full flex-col items-center sm:w-auto">
            <a
              href={linkTelefon(firma.telefonPrincipal)}
              className="buton buton-plin w-full !min-h-16 !px-8 !text-xl sm:w-auto"
            >
              <Pictograma nume="telefon" className="h-6 w-6" />
              <span className="flex flex-col items-start leading-tight">
                <span>{hero.butonApel}</span>
                <span className="text-base font-normal">{firma.telefonPrincipal}</span>
              </span>
            </a>
            {firma.telefonSecundar ? (
              <p className="text-scris-2 mt-3 text-lg">
                {hero.textInainteDeAlDoileaNumar}{" "}
                <a href={linkTelefon(firma.telefonSecundar)} className="link-subliniat text-scris font-semibold whitespace-nowrap">
                  {firma.telefonSecundar}
                </a>
              </p>
            ) : null}
          </div>
          {esteVizibila("servicii") ? (
            <a href="#servicii" className="buton buton-contur w-full !min-h-16 !px-8 sm:w-auto">
              {hero.butonServicii}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
