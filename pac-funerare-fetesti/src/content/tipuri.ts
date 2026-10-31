/*
 * ------------------------------------------------------------------
 *  FORMA DATELOR DIN site.ts
 * ------------------------------------------------------------------
 *  Acest fișier descrie ce câmpuri are fiecare parte din site.ts.
 *  De regulă NU trebuie modificat. Dacă în site.ts lipsește un câmp
 *  obligatoriu sau are o greșeală de scriere, verificarea
 *  („npm run verificare”) va arăta exact unde este problema.
 * ------------------------------------------------------------------
 */

/** Toate secțiunile care există pe site. */
export type IdSectiune =
  | "hero"
  | "primii-pasi"
  | "servicii"
  | "flota"
  | "pachete"
  | "de-ce-noi"
  | "echipa"
  | "anunturi"
  | "intrebari"
  | "contact";

export interface SetareSectiune {
  id: IdSectiune;
  vizibil: boolean;
}

/** Pictogramele disponibile pentru carduri (desenate în componente/Pictograma.tsx). */
export type NumePictograma =
  | "masina"
  | "glob"
  | "maini"
  | "sicriu"
  | "flori"
  | "acte"
  | "lumanare"
  | "masa"
  | "telefon"
  | "ceas"
  | "inima"
  | "scut"
  | "verificat"
  | "locatie"
  | "email"
  | "facebook";

export interface Poza {
  /** Calea fișierului din folderul public/images, de ex. "/images/flota-1.jpg" */
  fisier: string;
  /** Descrierea pozei pentru persoanele cu deficiențe de vedere și pentru Google. */
  descriere: string;
}

export interface DateFirma {
  nume: string;
  telefonPrincipal: string;
  telefonSecundar: string;
  email: string;
  facebook: string;
  textFacebook: string;
  adresa: {
    strada: string;
    localitate: string;
    judet: string;
    tara: string;
    codPostal: string;
    reper: string;
  };
  program: string;
  programScurt: string;
  zonaDeservita: string[];
  logo: Poza;
  /** true = lângă logo apare și numele firmei scris (în bara de sus și în subsol). */
  arataNumeLangaLogo: boolean;
}

export interface Seo {
  titlu: string;
  descriere: string;
  /** Adresa site-ului după publicare, de ex. "https://www.pacfunerare.ro". Poate rămâne goală. */
  adresaSite: string;
  pozaPartajare: string;
  cuvinteCheie: string[];
}

export interface Interfata {
  sariLaContinut: string;
  deschideMeniul: string;
  inchideMeniul: string;
  numeMeniu: string;
  butonApelMobil: string;
  filaNoua: string;
  sunati: string;
}

export interface LinkMeniu {
  text: string;
  catre: IdSectiune;
}

export interface Hero {
  pozaFundal: Poza;
  arataPorumbel: boolean;
  arataLogo: boolean;
  supratitlu: string;
  titlu: string;
  subtitlu: string;
  butonApel: string;
  textInainteDeAlDoileaNumar: string;
  butonServicii: string;
}

export interface Pas {
  titlu: string;
  text: string;
  lista?: string[];
}

export interface PrimiiPasi {
  titlu: string;
  introducere: string;
  pasi: Pas[];
  notaFinala: string;
}

export interface Serviciu {
  pictograma: NumePictograma;
  titlu: string;
  descriere: string;
}

export interface Servicii {
  titlu: string;
  introducere: string;
  lista: Serviciu[];
}

export interface Masina {
  model: string;
  descriere: string;
  poza: Poza;
}

export interface Flota {
  titlu: string;
  introducere: string;
  masini: Masina[];
}

export interface Pachet {
  nume: string;
  /** Doar cifre, fără puncte și fără „lei”. De exemplu: 3500 */
  pretDeLa: number;
  descriere: string;
  include: string[];
  /** true = pachetul apare evidențiat. */
  recomandat: boolean;
}

export interface Pachete {
  titlu: string;
  introducere: string;
  textDeLa: string;
  moneda: string;
  etichetaRecomandat: string;
  titluInclude: string;
  lista: Pachet[];
  mentiune: string;
  butonOferta: string;
}

export interface Argument {
  pictograma: NumePictograma;
  titlu: string;
  text: string;
}

export interface DeCeNoi {
  titlu: string;
  introducere: string;
  argumente: Argument[];
}

export interface MembruEchipa {
  nume: string;
  rol: string;
  poza: Poza;
}

export interface Echipa {
  titlu: string;
  introducere: string;
  membri: MembruEchipa[];
}

export interface Anunt {
  /** true = apare eticheta „EXEMPLU”. Ștergeți anunțurile exemplu când adăugați unele reale. */
  exemplu: boolean;
  nume: string;
  /** De exemplu: "1948 – 2026" sau "12 martie 1948 – 28 octombrie 2026" */
  perioada: string;
  mesaj: string;
  slujba: {
    data: string;
    ora: string;
    loc: string;
  };
  /** Opțional: locul de veci / cimitirul. Lăsați "" dacă nu doriți să apară. */
  inmormantare: string;
  /** Opțional: o poză. Ștergeți rândul sau puneți null dacă nu există poză. */
  poza?: Poza | null;
}

export interface Anunturi {
  titlu: string;
  introducere: string;
  etichetaExemplu: string;
  etichetaSlujba: string;
  etichetaInmormantare: string;
  etichetaOra: string;
  textFaraAnunturi: string;
  lista: Anunt[];
}

export interface Intrebare {
  intrebare: string;
  raspuns: string;
}

export interface Intrebari {
  titlu: string;
  introducere: string;
  lista: Intrebare[];
}

export interface Contact {
  titlu: string;
  introducere: string;
  etichetaTelefoane: string;
  etichetaAdresa: string;
  etichetaEmail: string;
  etichetaProgram: string;
  etichetaFacebook: string;
  harta: {
    cautare: string;
    titlu: string;
  };
  formular: {
    titlu: string;
    explicatie: string;
    etichetaNume: string;
    etichetaTelefon: string;
    etichetaMesaj: string;
    buton: string;
    subiectEmail: string;
  };
}

export interface Subsol {
  descriere: string;
  titluLinkuri: string;
  linkuri: LinkMeniu[];
  titluContact: string;
  textDrepturi: string;
}
