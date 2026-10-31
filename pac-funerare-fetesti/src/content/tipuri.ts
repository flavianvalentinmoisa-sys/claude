/*
 * ==================================================================
 *   SCHEMA TEMEI: ce câmpuri are fiecare tip de secțiune
 * ==================================================================
 *   De regulă NU trebuie modificat. Dacă în site.ts lipsește un câmp
 *   obligatoriu sau are o greșeală de scriere, „npm run build” arată
 *   exact rândul cu problema.
 *
 *   Câmpurile cu „?” sunt opționale: pot lipsi cu totul.
 * ==================================================================
 */

/* ------------------------------------------------------------------
 *  Piese comune
 * ------------------------------------------------------------------ */

/** Schemele de culori ale temei (definite în src/stiluri/tema.css). */
export type SchemaCulori = "inchis" | "deschis" | "negru";

/** Pictogramele disponibile (desenate în componente/Pictograma.tsx). */
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
  | "facebook"
  | "porumbel";

export interface Poza {
  /** Calea fișierului din public/images, de ex. "/images/flota-1.jpg" */
  fisier: string;
  /** Ce se vede în poză (pentru persoanele nevăzătoare și pentru Google). */
  descriere: string;
}

/**
 * Un buton sau o legătură. Câmpul „catre” poate fi:
 *   "telefon"    – sună la numărul principal (numărul apare sub text)
 *   "telefon-2"  – sună la al doilea număr
 *   "email"      – deschide aplicația de email
 *   "facebook"   – deschide pagina de Facebook într-o filă nouă
 *   "#servicii"  – duce la o secțiune de pe pagină (după numele ei)
 *   "https://…"  – orice altă adresă, într-o filă nouă
 * Butoanele către secțiuni ascunse dispar singure.
 */
export interface Buton {
  text: string;
  catre: string;
  /** "plin" (implicit) sau "contur" */
  stil?: "plin" | "contur";
}

/** Câmpuri pe care le poate avea ORICE secțiune. */
interface Baza {
  /** Schema de culori. Dacă lipsește, secțiunile alternează automat închis / deschis. */
  culori?: SchemaCulori;
  /** Text mic, cu majuscule, deasupra titlului. */
  eticheta?: string;
  titlu?: string;
  introducere?: string;
}

/* ------------------------------------------------------------------
 *  Tipurile de secțiuni
 * ------------------------------------------------------------------ */

/** Banner mare cu poză de fundal (primul ecran). */
export interface SectiuneBanner extends Baza {
  tip: "banner";
  poza: Poza;
  /** "mica", "mare" sau "ecran" (aproape tot ecranul) */
  inaltime: "mica" | "mare" | "ecran";
  /** Cât de întunecată e poza, de la 0 (deloc) la 90 (foarte). */
  intunecare: number;
  arataLogo: boolean;
  arataPorumbel: boolean;
  text?: string;
  butoane: Buton[];
  /** true = sub butoane apare „sau 0760 522 022” */
  arataAlDoileaTelefon: boolean;
}

/** Pași numerotați (de ex. „Ce faceți în primele ore”). */
export interface SectiunePasi extends Baza {
  tip: "pasi";
  elemente: { titlu: string; text: string; lista?: string[] }[];
  notaFinala?: string;
}

/** Coloane cu pictogramă / poză, titlu și text (servicii, argumente). */
export interface SectiuneColoane extends Baza {
  tip: "coloane";
  /** Câte coloane pe un rând, pe calculator: 2, 3 sau 4. */
  coloanePeRand: 2 | 3 | 4;
  /** "carduri" = fiecare coloană într-un chenar; "simplu" = centrat, fără chenar */
  stil: "carduri" | "simplu";
  elemente: { pictograma?: NumePictograma; poza?: Poza; titlu: string; text: string }[];
}

/** Galerie de poze cu titlu și text (flota, echipa). */
export interface SectiuneGalerie extends Baza {
  tip: "galerie";
  coloanePeRand: 2 | 3 | 4;
  /** "dreptunghi" (mașini, locuri) sau "rotund" (portrete) */
  forma: "dreptunghi" | "rotund";
  elemente: { poza: Poza; titlu: string; text?: string }[];
}

/** Pachete informative cu „de la … lei”. Fără coș, fără plată online. */
export interface SectiunePachete extends Baza {
  tip: "pachete";
  elemente: {
    nume: string;
    /** Doar cifre, fără puncte și fără „lei”. De exemplu: 3500 */
    pretDeLa: number;
    descriere: string;
    include: string[];
    /** true = pachetul apare evidențiat */
    recomandat: boolean;
  }[];
  mentiune: string;
  butoane: Buton[];
}

export interface Anunt {
  /** true = apare eticheta „Anunț exemplu”. */
  exemplu: boolean;
  nume: string;
  /** De exemplu: "1948 – 2026" */
  perioada: string;
  mesaj: string;
  slujba: { data: string; ora: string; loc: string };
  /** Locul înmormântării. "" dacă nu doriți să apară. */
  inmormantare: string;
  /** Poză opțională; null = fără poză. */
  poza: Poza | null;
}

/** Anunțuri de deces și condoleanțe. */
export interface SectiuneAnunturi extends Baza {
  tip: "anunturi";
  elemente: Anunt[];
}

/** Întrebări frecvente (se deschid la apăsare). */
export interface SectiuneIntrebari extends Baza {
  tip: "intrebari";
  elemente: { intrebare: string; raspuns: string }[];
}

/** Telefoane, adresă, email, program, hartă, Facebook și formular. */
export interface SectiuneContact extends Baza {
  tip: "contact";
  arataHarta: boolean;
  /** Ce caută harta Google, de ex. "Strada Călărași, Fetești, Ialomița" */
  cautareHarta: string;
  arataFormular: boolean;
}

/** Poză pe o parte, text pe cealaltă (de ex. „Despre noi”). */
export interface SectiuneImagineCuText extends Baza {
  tip: "imagine-cu-text";
  poza: Poza;
  /** Unde stă poza pe calculator: "stanga" sau "dreapta". */
  pozitiePoza: "stanga" | "dreapta";
  paragrafe: string[];
  butoane: Buton[];
}

/** Doar text, centrat, cu butoane opționale (de ex. un îndemn la apel). */
export interface SectiuneText extends Baza {
  tip: "text";
  paragrafe: string[];
  butoane: Buton[];
  arataPorumbel: boolean;
}

export type Sectiune =
  | SectiuneBanner
  | SectiunePasi
  | SectiuneColoane
  | SectiuneGalerie
  | SectiunePachete
  | SectiuneAnunturi
  | SectiuneIntrebari
  | SectiuneContact
  | SectiuneImagineCuText
  | SectiuneText;

export type TipSectiune = Sectiune["tip"];

/* ------------------------------------------------------------------
 *  Setările temei (ca „Theme settings” din Dawn)
 * ------------------------------------------------------------------ */

export interface SetariTema {
  firma: {
    nume: string;
    telefonPrincipal: string;
    telefonSecundar: string;
    email: string;
    facebook: string;
    adresa: {
      strada: string;
      localitate: string;
      judet: string;
      codPostal: string;
      reper: string;
    };
    program: string;
    zonaDeservita: string[];
    logo: Poza;
  };
  seo: {
    titlu: string;
    descriere: string;
    /** Adresa site-ului după publicare, de ex. "https://www.exemplu.ro". Poate rămâne "". */
    adresaSite: string;
    pozaPartajare: string;
    cuvinteCheie: string[];
  };
  baraAnunt: {
    vizibil: boolean;
    text: string;
    /** true = după text apar ambele telefoane */
    arataTelefoane: boolean;
  };
  antet: {
    /** true = lângă siglă apare și numele firmei */
    arataNume: boolean;
    meniu: { text: string; catre: string }[];
    /** true = în dreapta apare butonul cu telefonul principal */
    arataTelefon: boolean;
  };
  butonApelMobil: {
    vizibil: boolean;
    text: string;
  };
  subsol: {
    descriere: string;
    arataPorumbel: boolean;
    titluLinkuri: string;
    linkuri: { text: string; catre: string }[];
    titluContact: string;
    textDrepturi: string;
  };
  /** Texte mărunte folosite de temă (etichete, butoane, mesaje). */
  texte: {
    sariLaContinut: string;
    meniu: string;
    deschideMeniul: string;
    inchideMeniul: string;
    filaNoua: string;
    sau: string;
    deLa: string;
    moneda: string;
    recomandat: string;
    include: string;
    anuntExemplu: string;
    slujba: string;
    ora: string;
    inmormantare: string;
    faraAnunturi: string;
    telefoane: string;
    adresa: string;
    email: string;
    program: string;
    facebook: string;
    urmaritiNeFacebook: string;
    titluHarta: string;
    formularTitlu: string;
    formularExplicatie: string;
    formularNume: string;
    formularTelefon: string;
    formularMesaj: string;
    formularButon: string;
    formularSubiect: string;
  };
}
