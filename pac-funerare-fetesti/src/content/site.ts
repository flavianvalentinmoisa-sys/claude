/*
 * ==================================================================
 *   CONȚINUTUL SITE-ULUI PAC FUNERARE FETEȘTI
 * ==================================================================
 *   Aici se află TOATE textele, prețurile, telefoanele, pozele,
 *   serviciile, pachetele, mașinile, echipa, anunțurile și
 *   întrebările de pe site. Schimbați doar textul dintre ghilimele.
 *
 *   Reguli simple:
 *   • Textul stă între ghilimele: "așa". Nu ștergeți ghilimelele.
 *   • După fiecare câmp urmează o virgulă.
 *   • Prețurile se scriu doar cu cifre: 3500 (fără puncte, fără „lei”).
 *   • Pozele se pun în folderul public/images, iar aici se scrie
 *     calea lor, de exemplu "/images/flota-1.jpg".
 *
 *   Ghidul complet este în fișierul EDITARE.md.
 * ==================================================================
 */

import type {
  Anunturi,
  Contact,
  DateFirma,
  DeCeNoi,
  Echipa,
  Flota,
  Hero,
  Interfata,
  Intrebari,
  LinkMeniu,
  Pachete,
  PrimiiPasi,
  Seo,
  Servicii,
  SetareSectiune,
  Subsol,
} from "./tipuri.ts";

/* ------------------------------------------------------------------
 * 1. ORDINEA ȘI VIZIBILITATEA SECȚIUNILOR
 *    • Pentru a muta o secțiune: mutați rândul ei mai sus sau mai jos.
 *    • Pentru a ascunde o secțiune: schimbați vizibil: true în vizibil: false.
 *    Culorile de fundal (închis / deschis) se alternează singure.
 * ------------------------------------------------------------------ */
export const sectiuni: SetareSectiune[] = [
  { id: "hero", vizibil: true },
  { id: "primii-pasi", vizibil: true },
  { id: "servicii", vizibil: true },
  { id: "flota", vizibil: true },
  { id: "pachete", vizibil: true },
  { id: "de-ce-noi", vizibil: true },
  { id: "echipa", vizibil: true },
  { id: "anunturi", vizibil: true },
  { id: "intrebari", vizibil: true },
  { id: "contact", vizibil: true },
];

/* ------------------------------------------------------------------
 * 2. DATELE FIRMEI (telefoane, adresă, email, Facebook)
 *    Se folosesc automat peste tot pe site și în datele pentru Google.
 * ------------------------------------------------------------------ */
export const firma: DateFirma = {
  nume: "PAC Funerare Fetești",
  // Numărul principal: butonul de apel de pe mobil și butonul mare din Hero.
  telefonPrincipal: "0760 396 402",
  telefonSecundar: "0760 522 022",
  email: "pacfunerare@gmail.com",
  facebook: "https://www.facebook.com/VasyPetre75",
  textFacebook: "Urmăriți-ne pe Facebook",
  adresa: {
    strada: "Str. Călărași",
    localitate: "Fetești",
    judet: "Ialomița",
    tara: "România",
    codPostal: "",
    reper: "stația Policlinică, vis-à-vis de Liceul Teoretic „Carol I”",
  },
  program: "NON-STOP – 24 de ore din 24, 7 zile din 7, inclusiv în sărbători",
  programScurt: "NON-STOP",
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
    descriere: "Sigla PAC Funerare Fetești – aripi argintii pe fundal negru",
  },
  arataNumeLangaLogo: true,
};

/* ------------------------------------------------------------------
 * 3. GOOGLE (titlul din fila browserului și descrierea din căutări)
 * ------------------------------------------------------------------ */
export const seo: Seo = {
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
};

/* ------------------------------------------------------------------
 * 4. TEXTE MĂRUNTE DE INTERFAȚĂ (butoane, meniu)
 * ------------------------------------------------------------------ */
export const interfata: Interfata = {
  sariLaContinut: "Sari la conținutul principal",
  deschideMeniul: "Deschide meniul",
  inchideMeniul: "Închide meniul",
  numeMeniu: "Meniu",
  butonApelMobil: "Sunați NON-STOP",
  filaNoua: "(se deschide într-o filă nouă)",
  sunati: "Sunați",
};

/* ------------------------------------------------------------------
 * 5. MENIUL DE SUS
 *    Legăturile către secțiunile ascunse dispar singure din meniu.
 * ------------------------------------------------------------------ */
export const meniu: LinkMeniu[] = [
  { text: "Primii pași", catre: "primii-pasi" },
  { text: "Servicii", catre: "servicii" },
  { text: "Flota", catre: "flota" },
  { text: "Pachete", catre: "pachete" },
  { text: "Anunțuri", catre: "anunturi" },
  { text: "Întrebări", catre: "intrebari" },
  { text: "Contact", catre: "contact" },
];

/* ------------------------------------------------------------------
 * 6. HERO – primul ecran, cu poza flotei
 * ------------------------------------------------------------------ */
export const hero: Hero = {
  pozaFundal: {
    fisier: "/images/hero-flota.jpg",
    descriere: "Mașinile funerare ale firmei PAC Funerare Fetești",
  },
  arataPorumbel: true,
  arataLogo: true,
  supratitlu: "Servicii funerare în Fetești și în județul Ialomița",
  titlu: "Suntem alături de dumneavoastră, cu respect și grijă",
  subtitlu:
    "Preluăm toate grijile, de la acte până la slujbă, ca să puteți fi lângă cei dragi. Răspundem la telefon zi și noapte.",
  butonApel: "Sunați acum, NON-STOP",
  textInainteDeAlDoileaNumar: "sau",
  butonServicii: "Vedeți serviciile",
};

/* ------------------------------------------------------------------
 * 7. CE FACEȚI ÎN PRIMELE ORE
 * ------------------------------------------------------------------ */
export const primiiPasi: PrimiiPasi = {
  titlu: "Ce faceți în primele ore",
  introducere:
    "Știm cât de greu este acest moment. Nu trebuie să rezolvați totul singuri. Iată pașii, pe scurt:",
  pasi: [
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
  notaFinala:
    "Dacă nu aveți toate actele, nu vă îngrijorați. Sunați-ne și găsim împreună o soluție.",
};

/* ------------------------------------------------------------------
 * 8. SERVICII
 *    Pictograme disponibile: masina, glob, maini, sicriu, flori, acte,
 *    lumanare, masa, telefon, ceas, inima, scut, verificat, locatie
 * ------------------------------------------------------------------ */
export const servicii: Servicii = {
  titlu: "Serviciile noastre",
  introducere:
    "Oferim servicii funerare complete, pentru ca familia să aibă un singur sprijin, de la primul telefon până la ultimul drum.",
  lista: [
    {
      pictograma: "masina",
      titlu: "Transport funerar local și național",
      descriere:
        "Transport în Fetești, în tot județul Ialomița și oriunde în țară, cu mașini funerare proprii.",
    },
    {
      pictograma: "glob",
      titlu: "Repatrieri",
      descriere:
        "Aducem acasă persoanele decedate în străinătate și ne ocupăm de actele necesare.",
    },
    {
      pictograma: "maini",
      titlu: "Preluare și îmbălsămare",
      descriere:
        "Preluare de la domiciliu sau de la spital, pregătire, îmbălsămare și îmbrăcare cu toată grija.",
    },
    {
      pictograma: "sicriu",
      titlu: "Sicrie și accesorii",
      descriere:
        "Sicrie pentru orice buget, cruci, lumânări, prosoape și toate accesoriile necesare.",
    },
    {
      pictograma: "flori",
      titlu: "Coroane și aranjamente florale",
      descriere: "Coroane, jerbe și aranjamente florale, realizate la comandă.",
    },
    {
      pictograma: "acte",
      titlu: "Acte și certificat de deces",
      descriere:
        "Obținem în locul dumneavoastră certificatul de deces și vă îndrumăm pentru ajutorul de deces.",
    },
    {
      pictograma: "lumanare",
      titlu: "Slujbă după tradiția ortodoxă",
      descriere:
        "Organizăm slujba de înmormântare împreună cu preotul și biserica, după rânduiala creștin-ortodoxă.",
    },
    {
      pictograma: "masa",
      titlu: "Pomană și parastase",
      descriere:
        "Vă ajutăm cu organizarea mesei de pomenire și a parastaselor de 3 zile, 9 zile, 40 de zile și mai departe.",
    },
  ],
};

/* ------------------------------------------------------------------
 * 9. FLOTA NOASTRĂ – fiecare mașină este un bloc { ... }
 *    Pentru o mașină nouă: copiați un bloc întreg și schimbați textele.
 * ------------------------------------------------------------------ */
export const flota: Flota = {
  titlu: "Flota noastră",
  introducere:
    "Avem mașini funerare proprii, curate și îngrijite, pregătite oricând pentru drumuri scurte sau lungi.",
  masini: [
    {
      model: "Mașină funerară de ceremonie",
      descriere:
        "Pentru cortegiul funerar din Fetești și din localitățile apropiate. Interior sobru, îngrijit.",
      poza: {
        fisier: "/images/flota-1.jpg",
        descriere: "Mașină funerară de ceremonie PAC Funerare Fetești",
      },
    },
    {
      model: "Mașină pentru transport național",
      descriere:
        "Pentru drumuri lungi în alte județe, cu echipare pentru transport în condiții corespunzătoare.",
      poza: {
        fisier: "/images/flota-2.jpg",
        descriere: "Mașină funerară pentru transport național",
      },
    },
    {
      model: "Mașină pentru repatrieri",
      descriere:
        "Pentru preluarea de la aeroport sau de la graniță și aducerea acasă a celor dragi.",
      poza: {
        fisier: "/images/flota-3.jpg",
        descriere: "Mașină funerară pentru repatrieri",
      },
    },
  ],
};

/* ------------------------------------------------------------------
 * 10. PACHETE ȘI PREȚURI
 *     Prețul se scrie doar cu cifre (ex: 3500). Pe site apare „de la 3.500 lei”.
 * ------------------------------------------------------------------ */
export const pachete: Pachete = {
  titlu: "Pachete de servicii",
  introducere:
    "Am pregătit trei pachete orientative. Fiecare poate fi adaptat după dorințele și posibilitățile familiei.",
  textDeLa: "de la",
  moneda: "lei",
  etichetaRecomandat: "Cel mai ales",
  titluInclude: "Include:",
  lista: [
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
  mentiune:
    "Prețurile sunt orientative, vă oferim o ofertă exactă la telefon.",
  butonOferta: "Cereți o ofertă exactă",
};

/* ------------------------------------------------------------------
 * 11. DE CE PAC FUNERARE
 * ------------------------------------------------------------------ */
export const deCeNoi: DeCeNoi = {
  titlu: "De ce PAC Funerare",
  introducere: "Familiile din Fetești ne aleg pentru că știu că se pot baza pe noi.",
  argumente: [
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
};

/* ------------------------------------------------------------------
 * 12. ECHIPA – fiecare om este un bloc { ... }
 * ------------------------------------------------------------------ */
export const echipa: Echipa = {
  titlu: "Echipa noastră",
  introducere:
    "Oameni din comunitate, care vă cunosc și vă înțeleg. Ne puteți suna direct pe oricare dintre noi.",
  membri: [
    {
      nume: "Nume și prenume",
      rol: "Administrator, coordonator servicii funerare",
      poza: {
        fisier: "/images/echipa-1.jpg",
        descriere: "Fotografia administratorului PAC Funerare Fetești",
      },
    },
    {
      nume: "Nume și prenume",
      rol: "Consilier funerar, acte și organizare",
      poza: {
        fisier: "/images/echipa-2.jpg",
        descriere: "Fotografia consilierului funerar",
      },
    },
    {
      nume: "Nume și prenume",
      rol: "Transport funerar și repatrieri",
      poza: {
        fisier: "/images/echipa-3.jpg",
        descriere: "Fotografia colegului responsabil cu transportul funerar",
      },
    },
  ],
};

/* ------------------------------------------------------------------
 * 13. ANUNȚURI ȘI CONDOLEANȚE
 *     Anunțul cel mai nou se pune PRIMUL în listă.
 *     Pentru un anunț nou: copiați un bloc { ... } întreg, puneți
 *     exemplu: false și completați datele.
 *     Ștergeți cele două anunțuri exemplu când adăugați unul real.
 * ------------------------------------------------------------------ */
export const anunturi: Anunturi = {
  titlu: "Anunțuri și condoleanțe",
  introducere:
    "Aici anunțăm, cu acordul familiilor, trecerea la cele veșnice a celor dragi și programul slujbelor.",
  etichetaExemplu: "Anunț exemplu",
  etichetaSlujba: "Slujba de înmormântare",
  etichetaInmormantare: "Înmormântarea",
  etichetaOra: "ora",
  textFaraAnunturi: "Momentan nu există anunțuri.",
  lista: [
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
      poza: {
        fisier: "/images/anunt-exemplu.jpg",
        descriere: "Lumânare aprinsă – imagine pentru anunțul de deces",
      },
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
};

/* ------------------------------------------------------------------
 * 14. ÎNTREBĂRI FRECVENTE
 * ------------------------------------------------------------------ */
export const intrebari: Intrebari = {
  titlu: "Întrebări frecvente",
  introducere: "Răspunsuri scurte la întrebările pe care ni le pun cel mai des familiile.",
  lista: [
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
};

/* ------------------------------------------------------------------
 * 15. CONTACT
 * ------------------------------------------------------------------ */
export const contact: Contact = {
  titlu: "Contact",
  introducere:
    "Ne puteți suna oricând, zi și noapte. Dacă preferați, ne puteți scrie sau ne puteți găsi la sediu.",
  etichetaTelefoane: "Telefon NON-STOP",
  etichetaAdresa: "Adresa",
  etichetaEmail: "Email",
  etichetaProgram: "Program",
  etichetaFacebook: "Facebook",
  harta: {
    cautare: "Strada Călărași, Fetești, Ialomița",
    titlu: "Harta: sediul PAC Funerare Fetești, Strada Călărași",
  },
  formular: {
    titlu: "Scrieți-ne un mesaj",
    explicatie:
      "La apăsarea butonului se deschide aplicația de email a telefonului sau a calculatorului, cu mesajul gata completat. Pentru situații urgente, vă rugăm să ne sunați.",
    etichetaNume: "Numele dumneavoastră",
    etichetaTelefon: "Telefonul dumneavoastră",
    etichetaMesaj: "Mesajul",
    buton: "Trimiteți mesajul",
    subiectEmail: "Mesaj de pe site – PAC Funerare Fetești",
  },
};

/* ------------------------------------------------------------------
 * 16. SUBSOL (partea de jos a paginii)
 * ------------------------------------------------------------------ */
export const subsol: Subsol = {
  descriere:
    "Servicii funerare complete în Fetești și în județul Ialomița. Suntem alături de familiile îndoliate, zi și noapte.",
  titluLinkuri: "Legături rapide",
  linkuri: [
    { text: "Primii pași", catre: "primii-pasi" },
    { text: "Servicii", catre: "servicii" },
    { text: "Pachete", catre: "pachete" },
    { text: "Anunțuri", catre: "anunturi" },
    { text: "Contact", catre: "contact" },
  ],
  titluContact: "Contact NON-STOP",
  textDrepturi: "Toate drepturile rezervate.",
};
