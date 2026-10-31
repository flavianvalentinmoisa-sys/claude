/*
 * Legătura dintre „tip” (din site.ts) și componenta care îl desenează.
 * Ordinea și vizibilitatea NU se schimbă aici, ci în site.ts.
 * Un tip nou de secțiune: se adaugă în content/tipuri.ts, apoi aici.
 */
import type { SectiuneAfisata } from "../content/ajutoare.ts";
import Anunturi from "./Anunturi";
import Banner from "./Banner";
import Coloane from "./Coloane";
import Contact from "./Contact";
import Galerie from "./Galerie";
import ImagineCuText from "./ImagineCuText";
import Intrebari from "./Intrebari";
import Pachete from "./Pachete";
import Pasi from "./Pasi";
import Text from "./Text";

export function DeseneazaSectiunea({ sectiune, primul }: { sectiune: SectiuneAfisata; primul: boolean }) {
  const { id, culori, date } = sectiune;
  const comun = { id, culori, primul };
  switch (date.tip) {
    case "banner":
      return <Banner {...comun} date={date} />;
    case "pasi":
      return <Pasi {...comun} date={date} />;
    case "coloane":
      return <Coloane {...comun} date={date} />;
    case "galerie":
      return <Galerie {...comun} date={date} />;
    case "pachete":
      return <Pachete {...comun} date={date} />;
    case "anunturi":
      return <Anunturi {...comun} date={date} />;
    case "intrebari":
      return <Intrebari {...comun} date={date} />;
    case "contact":
      return <Contact {...comun} date={date} />;
    case "imagine-cu-text":
      return <ImagineCuText {...comun} date={date} />;
    case "text":
      return <Text {...comun} date={date} />;
  }
}
