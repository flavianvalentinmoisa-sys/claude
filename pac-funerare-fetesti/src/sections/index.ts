/*
 * Legătura dintre numele secțiunilor din site.ts și componentele lor.
 * Ordinea și vizibilitatea NU se schimbă aici, ci în site.ts (lista „sectiuni”).
 */
import type { ComponentType } from "react";
import type { IdSectiune } from "../content/tipuri";
import type { Ton } from "../componente/Sectiune";
import Anunturi from "./Anunturi";
import Contact from "./Contact";
import DeCeNoi from "./DeCeNoi";
import Echipa from "./Echipa";
import Flota from "./Flota";
import Hero from "./Hero";
import Intrebari from "./Intrebari";
import Pachete from "./Pachete";
import PrimiiPasi from "./PrimiiPasi";
import Servicii from "./Servicii";

export const componenteSectiuni: Record<IdSectiune, ComponentType<{ ton: Ton }>> = {
  hero: Hero,
  "primii-pasi": PrimiiPasi,
  servicii: Servicii,
  flota: Flota,
  pachete: Pachete,
  "de-ce-noi": DeCeNoi,
  echipa: Echipa,
  anunturi: Anunturi,
  intrebari: Intrebari,
  contact: Contact,
};
