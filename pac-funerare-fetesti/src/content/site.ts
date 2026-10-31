/*
 * ==================================================================
 *   CONȚINUTUL SITE-ULUI  (tema „Liniște” pentru servicii funerare)
 * ==================================================================
 *   Fișierul are trei părți:
 *     1. ORDINEA     – ce secțiuni apar și în ce ordine (un rând = o secțiune)
 *     2. SETĂRI      – datele firmei, Google, bara de sus, meniul, subsolul
 *     3. SECȚIUNILE  – conținutul fiecărei secțiuni
 *
 *   Reguli simple:
 *   • Textul stă între ghilimele: "așa". Nu ștergeți ghilimelele.
 *   • După fiecare câmp urmează o virgulă.
 *   • Prețurile se scriu doar cu cifre: 3500 (fără puncte, fără „lei”).
 *   • Pozele se pun în public/images și se scriu așa: "/images/poza.jpg".
 *
 *   Ghidul complet, cu modele de secțiuni gata de copiat: EDITARE.md
 * ==================================================================
 */

import type { Sectiune, SetariTema } from "./tipuri.ts";

/* ==================================================================
 * 1. ORDINEA SECȚIUNILOR
 *    • Mutare: mutați rândul mai sus sau mai jos.
 *    • Ascundere: vizibil: false.   • Afișare: vizibil: true.
 *    • Secțiune nouă: o adăugați în partea 3, apoi îi puneți rândul aici.
 * ================================================================== */
export const ordine: { id: IdSectiune; vizibil: boolean }[] = [
  { id: "acasa", vizibil: true },
  { id: "primii-pasi", vizibil: true },
  { id: "servicii", vizibil: true },
  { id: "flota", vizibil: true },
  { id: "pachete", vizibil: true },
  { id: "de-ce-noi", vizibil: true },
  { id: "despre-noi", vizibil: false },
  { id: "echipa", vizibil: true },
  { id: "anunturi", vizibil: true },
  { id: "intrebari", vizibil: true },
  { id: "apel-final", vizibil: false },
  { id: "contact", vizibil: true },
];

/* ==================================================================
 * 2. SETĂRI GENERALE
 * ================================================================== */
export const setari: SetariTema = {
  /* --- Datele firmei: se folosesc automat peste tot pe site --- */
  firma: {
    nume: "PAC Funerare Fetești",
    // Numărul principal: butonul de jos de pe mobil și butoanele „telefon”.
    telefonPrincipal: "0760 396 402",
    telefonSecundar: "0760 522 022",
    email: "pacfunerare@gmail.com",
    facebook: "https://www.facebook.com/VasyPetre75",
    adresa: {
      strada: "Str. Călărași",
      localitate: "Fetești",
      judet: "Ialomița",
      codPostal: "",
      reper: "stația Policlinică, vis-à-vis de Liceul Teoretic „Carol I”",
    },
    program: "NON-STOP – 24 de ore din 24, 7 zile din 7, inclusiv în sărbători",
    zonaDeservita: [
      "Fetești-Oraș",
      "Fetești-Gară",
      "Buliga",
      "Vlașca",
      "localitățile din jurul Feteștiului, județul Ialomița",
      "transport funerar în alte județe și repatrieri",
    ],
    logo: {
      fisier: "/images/logo.png",
      descriere: "Sigla PAC Funerare Fetești – aripi argintii",
    },
  },

  /* --- Google: titlul din fila browserului și descrierea din căutări --- */
  seo: {
    titlu: "Servicii funerare Fetești, NON-STOP | PAC Funerare Fetești",
    descriere:
      "PAC Funerare Fetești, județul Ialomița: servicii funerare complete, transport funerar local și național, repatrieri, acte și organizarea slujbei. Disponibili NON-STOP: 0760 396 402.",
    adresaSite: "",
    pozaPartajare: "/images/imagine-partajare.jpg",
    cuvinteCheie: [
      "servicii funerare Fetești",
      "pompe funebre Fetești",
      "transport funerar Ialomița",
      "repatrieri decedați",
      "firmă funerară non-stop",
    ],
  },

  /* --- Bara subțire din capul paginii --- */
  baraAnunt: {
    vizibil: true,
    text: "Disponibili NON-STOP, inclusiv în sărbători:",
    arataTelefoane: true,
  },

  /* --- Bara de sus (sigla și meniul) --- */
  antet: {
    arataNume: true,
    arataTelefon: true,
    meniu: [
      { text: "Primii pași", catre: "#primii-pasi" },
      { text: "Servicii", catre: "#servicii" },
      { text: "Flota", catre: "#flota" },
      { text: "Pachete", catre: "#pachete" },
      { text: "Anunțuri", catre: "#anunturi" },
      { text: "Întrebări", catre: "#intrebari" },
      { text: "Contact", catre: "#contact" },
    ],
  },

  /* --- Butonul de apel fixat jos, pe telefon --- */
  butonApelMobil: {
    vizibil: true,
    text: "Sunați NON-STOP",
  },

  /* --- Partea de jos a paginii --- */
  subsol: {
    descriere:
      "Servicii funerare complete în Fetești și în județul Ialomița. Suntem alături de familiile îndoliate, zi și noapte.",
    arataPorumbel: true,
    titluLinkuri: "Legături rapide",
    linkuri: [
      { text: "Primii pași", catre: "#primii-pasi" },
      { text: "Servicii", catre: "#servicii" },
      { text: "Pachete", catre: "#pachete" },
      { text: "Anunțuri", catre: "#anunturi" },
      { text: "Contact", catre: "#contact" },
    ],
    titluContact: "Contact NON-STOP",
    textDrepturi: "Toate drepturile rezervate.",
  },

  /* --- Texte mărunte folosite de temă --- */
  texte: {
    sariLaContinut: "Sari la conținutul principal",
    meniu: "Meniu",
    deschideMeniul: "Deschide meniul",
    inchideMeniul: "Închide meniul",
    filaNoua: "(se deschide într-o filă nouă)",
    sau: "sau",
    deLa: "de la",
    moneda: "lei",
    recomandat: "Cel mai ales",
    include: "Include:",
    anuntExemplu: "Anunț exemplu",
    slujba: "Slujba de înmormântare",
    ora: "ora",
    inmormantare: "Înmormântarea",
    faraAnunturi: "Momentan nu există anunțuri.",
    telefoane: "Telefon NON-STOP",
    adresa: "Adresa",
    email: "Email",
    program: "Program",
    facebook: "Facebook",
    urmaritiNeFacebook: "Urmăriți-ne pe Facebook",
    titluHarta: "Harta: sediul firmei",
    formularTitlu: "Scrieți-ne un mesaj",
    formularExplicatie:
      "La apăsarea butonului se deschide aplicația de email a telefonului sau a calculatorului, cu mesajul gata completat. Pentru situații urgente, vă rugăm să ne sunați.",
    formularNume: "Numele dumneavoastră",
    formularTelefon: "Telefonul dumneavoastră",
    formularMesaj: "Mesajul",
    formularButon: "Trimiteți mesajul",
    formularSubiect: "Mesaj de pe site – PAC Funerare Fetești",
  },
};

/* ==================================================================
 * 3. SECȚIUNILE
 *    Fiecare secțiune are un nume (de ex. "servicii") și un „tip”.
 *    Tipuri disponibile: banner, pasi, coloane, galerie, pachete,
 *    anunturi, intrebari, contact, imagine-cu-text, text.
 *    Același tip se poate folosi de mai multe ori.
 *    Modele gata de copiat pentru fiecare tip: EDITARE.md
 * ================================================================== */
export const sectiuni = {
  /* ---------------- Primul ecran ---------------- */
  acasa: {
    tip: "banner",
    poza: {
      fisier: "/images/hero-flota.jpg",
      descriere: "Mașinile funerare ale firmei PAC Funerare Fetești",
    },
    inaltime: "ecran",
    intunecare: 75,
    arataLogo: true,
    arataPorumbel: true,
    eticheta: "Servicii funerare în Fetești și în județul Ialomița",
    titlu: "Suntem alături de dumneavoastră, cu respect și grijă",
    text: "Preluăm toate grijile, de la acte până la slujbă, ca să puteți fi lângă cei dragi. Răspundem la telefon zi și noapte.",
    butoane: [
      { text: "Sunați acum, NON-STOP", catre: "telefon" },
      { text: "Vedeți serviciile", catre: "#servicii", stil: "contur" },
    ],
    arataAlDoileaTelefon: true,
  },

  /* ---------------- Ce faceți în primele ore ---------------- */
  "primii-pasi": {
    tip: "pasi",
    titlu: "Ce faceți în primele ore",
    introducere:
      "Știm cât de greu este acest moment. Nu trebuie să rezolvați totul singuri. Iată pașii, pe scurt:",
    elemente: [
      {
        titlu: "Sunați-ne, la orice oră",
        text: "Un singur telefon este de ajuns. Vă ascultăm, vă explicăm ce urmează și venim acolo unde este nevoie, oricând, inclusiv noaptea și în sărbători.",
      },
      {
        titlu: "Anunțați medicul",
        text: "Dacă decesul a avut loc acasă, medicul de familie constată decesul și eliberează certificatul medical constatator al decesului. Dacă a avut loc în spital, acest act îl eliberează spitalul. Vă putem ajuta să luați legătura cu medicul.",
      },
      {
        titlu: "Pregătiți actele",
        text: "Puneți deoparte, dacă le aveți la îndemână:",
        lista: [
          "buletinul (cartea de identitate) persoanei decedate",
          "certificatul de naștere și, dacă este cazul, certificatul de căsătorie",
          "buletinul dumneavoastră (al persoanei care declară decesul)",
          "ultimul cupon de pensie, pentru ajutorul de deces",
          "livretul militar, dacă există",
        ],
      },
      {
        titlu: "Noi ne ocupăm de rest",
        text: "Preluăm persoana decedată, o pregătim cu grijă, obținem certificatul de deces de la Starea Civilă, organizăm slujba după tradiția ortodoxă, transportul și tot ce ține de înmormântare. Vă ținem la curent la fiecare pas.",
      },
    ],
    notaFinala: "Dacă nu aveți toate actele, nu vă îngrijorați. Sunați-ne și găsim împreună o soluție.",
  },

  /* ---------------- Servicii ---------------- */
  servicii: {
    tip: "coloane",
    titlu: "Serviciile noastre",
    introducere:
      "Oferim servicii funerare complete, pentru ca familia să aibă un singur sprijin, de la primul telefon până la ultimul drum.",
    coloanePeRand: 4,
    stil: "carduri",
    elemente: [
      {
        pictograma: "masina",
        titlu: "Transport funerar local și național",
        text: "Transport în Fetești, în tot județul Ialomița și oriunde în țară, cu mașini funerare proprii.",
      },
      {
        pictograma: "glob",
        titlu: "Repatrieri",
        text: "Aducem acasă persoanele decedate în străinătate și ne ocupăm de actele necesare.",
      },
      {
        pictograma: "maini",
        titlu: "Preluare și îmbălsămare",
        text: "Preluare de la domiciliu sau de la spital, pregătire, îmbălsămare și îmbrăcare cu toată grija.",
      },
      {
        pictograma: "sicriu",
        titlu: "Sicrie și accesorii",
        text: "Sicrie pentru orice buget, cruci, lumânări, prosoape și toate accesoriile necesare.",
      },
      {
        pictograma: "flori",
        titlu: "Coroane și aranjamente florale",
        text: "Coroane, jerbe și aranjamente florale, realizate la comandă.",
      },
      {
        pictograma: "acte",
        titlu: "Acte și certificat de deces",
        text: "Obținem în locul dumneavoastră certificatul de deces și vă îndrumăm pentru ajutorul de deces.",
      },
      {
        pictograma: "lumanare",
        titlu: "Slujbă după tradiția ortodoxă",
        text: "Organizăm slujba de înmormântare împreună cu preotul și biserica, după rânduiala creștin-ortodoxă.",
      },
      {
        pictograma: "masa",
        titlu: "Pomană și parastase",
        text: "Vă ajutăm cu organizarea mesei de pomenire și a parastaselor de 3 zile, 9 zile, 40 de zile și mai departe.",
      },
    ],
  },

  /* ---------------- Flota ---------------- */
  flota: {
    tip: "galerie",
    titlu: "Flota noastră",
    introducere:
      "Avem mașini funerare proprii, curate și îngrijite, pregătite oricând pentru drumuri scurte sau lungi.",
    coloanePeRand: 3,
    forma: "dreptunghi",
    elemente: [
      {
        poza: { fisier: "/images/flota-1.jpg", descriere: "Mașină funerară de ceremonie PAC Funerare Fetești" },
        titlu: "Mașină funerară de ceremonie",
        text: "Pentru cortegiul funerar din Fetești și din localitățile apropiate. Interior sobru, îngrijit.",
      },
      {
        poza: { fisier: "/images/flota-2.jpg", descriere: "Mașină funerară pentru transport național" },
        titlu: "Mașină pentru transport național",
        text: "Pentru drumuri lungi în alte județe, cu echipare pentru transport în condiții corespunzătoare.",
      },
      {
        poza: { fisier: "/images/flota-3.jpg", descriere: "Mașină funerară pentru repatrieri" },
        titlu: "Mașină pentru repatrieri",
        text: "Pentru preluarea de la aeroport sau de la graniță și aducerea acasă a celor dragi.",
      },
    ],
  },

  /* ---------------- Pachete (doar informativ, fără plată online) ---------------- */
  pachete: {
    tip: "pachete",
    titlu: "Pachete de servicii",
    introducere:
      "Am pregătit trei pachete orientative. Fiecare poate fi adaptat după dorințele și posibilitățile familiei.",
    elemente: [
      {
        nume: "Pachetul Esențial",
        pretDeLa: 2500,
        descriere: "Serviciile de bază, făcute cu aceeași grijă.",
        include: [
          "preluarea persoanei decedate",
          "sicriu simplu și accesorii de bază",
          "pregătirea și îmbrăcarea",
          "transport funerar în Fetești",
          "ajutor pentru obținerea actelor",
        ],
        recomandat: false,
      },
      {
        nume: "Pachetul Tradițional",
        pretDeLa: 4500,
        descriere: "Tot ce este necesar pentru o înmormântare după tradiție.",
        include: [
          "tot ce include Pachetul Esențial",
          "sicriu de calitate superioară",
          "îmbălsămare",
          "coroană de flori",
          "organizarea slujbei cu preotul",
          "obținerea certificatului de deces",
        ],
        recomandat: true,
      },
      {
        nume: "Pachetul Complet",
        pretDeLa: 7500,
        descriere: "Ne ocupăm de absolut tot, de la acte până la pomană.",
        include: [
          "tot ce include Pachetul Tradițional",
          "sicriu premium și accesorii complete",
          "aranjamente florale suplimentare",
          "transport în tot județul Ialomița",
          "organizarea mesei de pomenire",
          "un coordonator alături de familie toată ziua",
        ],
        recomandat: false,
      },
    ],
    mentiune: "Prețurile sunt orientative, vă oferim o ofertă exactă la telefon.",
    butoane: [{ text: "Cereți o ofertă exactă", catre: "telefon" }],
  },

  /* ---------------- De ce noi ---------------- */
  "de-ce-noi": {
    tip: "coloane",
    titlu: "De ce PAC Funerare",
    introducere: "Familiile din Fetești ne aleg pentru că știu că se pot baza pe noi.",
    coloanePeRand: 4,
    stil: "simplu",
    elemente: [
      {
        pictograma: "ceas",
        titlu: "Disponibili NON-STOP",
        text: "Răspundem la telefon zi și noapte, în weekend și în sărbători. Nu sunteți niciodată singuri.",
      },
      {
        pictograma: "masina",
        titlu: "Flotă proprie",
        text: "Mașinile funerare sunt ale noastre, așa că plecăm imediat, fără să așteptăm pe nimeni.",
      },
      {
        pictograma: "verificat",
        titlu: "Ne ocupăm de tot",
        text: "De la acte și certificatul de deces până la slujbă și pomană, totul printr-un singur telefon.",
      },
      {
        pictograma: "inima",
        titlu: "Respect și discreție",
        text: "Tratăm fiecare familie și fiecare persoană decedată cu demnitate, răbdare și discreție.",
      },
    ],
  },

  /* ---------------- Despre noi (pregătită, ascunsă din ordine) ---------------- */
  "despre-noi": {
    tip: "imagine-cu-text",
    eticheta: "Despre noi",
    titlu: "O firmă din Fetești, pentru oamenii din Fetești",
    poza: { fisier: "/images/despre-noi.jpg", descriere: "Sediul PAC Funerare Fetești" },
    pozitiePoza: "stanga",
    paragrafe: [
      "Suntem o firmă locală de servicii funerare și cunoaștem obiceiurile, bisericile și cimitirele din zonă.",
      "Lucrăm cu răbdare și discreție, ca familia să se poată ocupa de ce contează cu adevărat.",
    ],
    butoane: [{ text: "Sunați-ne", catre: "telefon" }],
  },

  /* ---------------- Echipa ---------------- */
  echipa: {
    tip: "galerie",
    titlu: "Echipa noastră",
    introducere:
      "Oameni din comunitate, care vă cunosc și vă înțeleg. Ne puteți suna direct pe oricare dintre noi.",
    coloanePeRand: 3,
    forma: "rotund",
    elemente: [
      {
        poza: { fisier: "/images/echipa-1.jpg", descriere: "Fotografia administratorului PAC Funerare Fetești" },
        titlu: "Nume și prenume",
        text: "Administrator, coordonator servicii funerare",
      },
      {
        poza: { fisier: "/images/echipa-2.jpg", descriere: "Fotografia consilierului funerar" },
        titlu: "Nume și prenume",
        text: "Consilier funerar, acte și organizare",
      },
      {
        poza: { fisier: "/images/echipa-3.jpg", descriere: "Fotografia colegului responsabil cu transportul funerar" },
        titlu: "Nume și prenume",
        text: "Transport funerar și repatrieri",
      },
    ],
  },

  /* ---------------- Anunțuri și condoleanțe ----------------
   * Anunțul cel mai nou se pune PRIMUL. Ștergeți anunțurile
   * exemplu (exemplu: true) când adăugați unul real. */
  anunturi: {
    tip: "anunturi",
    titlu: "Anunțuri și condoleanțe",
    introducere:
      "Aici anunțăm, cu acordul familiilor, trecerea la cele veșnice a celor dragi și programul slujbelor.",
    elemente: [
      {
        exemplu: true,
        nume: "Ion Popescu",
        perioada: "1941 – 2026",
        mesaj:
          "Cu adâncă durere anunțăm trecerea la cele veșnice a celui care a fost un tată și bunic iubit. Dumnezeu să-l odihnească în pace!",
        slujba: {
          data: "Sâmbătă, 7 noiembrie 2026",
          ora: "11:00",
          loc: "Biserica „Sfântul Nicolae”, Fetești",
        },
        inmormantare: "Cimitirul din Fetești-Oraș",
        poza: { fisier: "/images/anunt-exemplu.jpg", descriere: "Lumânare aprinsă – imagine pentru anunțul de deces" },
      },
      {
        exemplu: true,
        nume: "Maria Ionescu",
        perioada: "1950 – 2026",
        mesaj:
          "Familia îndurerată anunță plecarea dintre noi a unei mame și bunici devotate. Sincere condoleanțe familiei!",
        slujba: {
          data: "Duminică, 8 noiembrie 2026",
          ora: "12:00",
          loc: "Biserica din Buliga",
        },
        inmormantare: "",
        poza: null,
      },
    ],
  },

  /* ---------------- Întrebări frecvente ---------------- */
  intrebari: {
    tip: "intrebari",
    titlu: "Întrebări frecvente",
    introducere: "Răspunsuri scurte la întrebările pe care ni le pun cel mai des familiile.",
    elemente: [
      {
        intrebare: "Ce fac imediat după ce a decedat cineva drag?",
        raspuns:
          "Sunați-ne la orice oră. Vă explicăm pas cu pas ce trebuie făcut, anunțăm împreună medicul și venim noi să preluăm persoana decedată.",
      },
      {
        intrebare: "Cât costă o înmormântare?",
        raspuns:
          "Depinde de serviciile alese. Prețurile orientative sunt la secțiunea Pachete, iar la telefon vă facem o ofertă exactă, fără costuri ascunse.",
      },
      {
        intrebare: "Ce acte sunt necesare?",
        raspuns:
          "De regulă: buletinul persoanei decedate, certificatul de naștere și de căsătorie, buletinul dumneavoastră și certificatul medical constatator al decesului. Noi obținem certificatul de deces de la Starea Civilă.",
      },
      {
        intrebare: "Faceți transport în alte județe sau din străinătate?",
        raspuns:
          "Da. Facem transport funerar în toată țara și repatrieri din străinătate, cu mașini proprii, și ne ocupăm de actele necesare.",
      },
      {
        intrebare: "Vă ocupați și de slujbă și de preot?",
        raspuns:
          "Da. Organizăm slujba după tradiția ortodoxă, ne înțelegem cu preotul și cu biserica și pregătim tot ce este nevoie, inclusiv pomana.",
      },
      {
        intrebare: "Pot primi ajutorul de deces?",
        raspuns:
          "Dacă persoana decedată era pensionară sau asigurată, familia poate primi ajutorul de deces. Vă spunem ce acte trebuie depuse și unde.",
      },
    ],
  },

  /* ---------------- Îndemn la apel (pregătită, ascunsă din ordine) ---------------- */
  "apel-final": {
    tip: "text",
    culori: "negru",
    titlu: "Suntem aici, oricând aveți nevoie",
    paragrafe: ["Un singur telefon și ne ocupăm noi de tot. Zi și noapte, inclusiv în sărbători."],
    butoane: [
      { text: "Sunați acum", catre: "telefon" },
      { text: "Al doilea număr", catre: "telefon-2", stil: "contur" },
    ],
    arataPorumbel: true,
  },

  /* ---------------- Contact ---------------- */
  contact: {
    tip: "contact",
    titlu: "Contact",
    introducere:
      "Ne puteți suna oricând, zi și noapte. Dacă preferați, ne puteți scrie sau ne puteți găsi la sediu.",
    arataHarta: true,
    cautareHarta: "Strada Călărași, Fetești, Ialomița",
    arataFormular: true,
  },
} satisfies Record<string, Sectiune>;

/** Numele tuturor secțiunilor de mai sus (folosit pentru verificare). */
export type IdSectiune = keyof typeof sectiuni;
