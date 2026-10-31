/*
 * Generează automat, din src/content/site.ts:
 *  • titlul paginii și descrierea pentru Google,
 *  • etichetele pentru partajare (Facebook, WhatsApp),
 *  • datele structurate JSON-LD (FuneralHome) cu ambele telefoane și adresa.
 * Nu conține texte proprii: totul vine din site.ts.
 */
import { firma, pachete, seo, servicii } from "../src/content/site.ts";
import { formatPret, telefonInternational, toateTelefoanele } from "../src/content/ajutoare.ts";

const escapa = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function adresaCompleta(cale: string): string {
  const baza = seo.adresaSite.replace(/\/+$/, "");
  return baza ? `${baza}${cale}` : cale;
}

export function dateStructurate() {
  const telefoane = toateTelefoanele().map(telefonInternational);
  const preturi = pachete.lista.map((p) => p.pretDeLa);
  const a = firma.adresa;

  return {
    "@context": "https://schema.org",
    "@type": ["FuneralHome", "LocalBusiness"],
    name: firma.nume,
    description: seo.descriere,
    ...(seo.adresaSite ? { url: seo.adresaSite } : {}),
    logo: adresaCompleta(firma.logo.fisier),
    image: adresaCompleta(seo.pozaPartajare),
    telephone: telefoane[0],
    email: firma.email,
    sameAs: [firma.facebook],
    address: {
      "@type": "PostalAddress",
      streetAddress: `${a.strada} (${a.reper})`,
      addressLocality: a.localitate,
      addressRegion: a.judet,
      ...(a.codPostal ? { postalCode: a.codPostal } : {}),
      addressCountry: "RO",
    },
    contactPoint: telefoane.map((t) => ({
      "@type": "ContactPoint",
      telephone: t,
      contactType: "customer service",
      areaServed: "RO",
      availableLanguage: "ro",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    areaServed: firma.zonaDeservita.map((z) => ({ "@type": "Place", name: z })),
    ...(preturi.length
      ? { priceRange: `de la ${formatPret(Math.min(...preturi))} lei`, currenciesAccepted: "RON" }
      : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: servicii.titlu,
      itemListElement: servicii.lista.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.titlu, description: s.descriere },
      })),
    },
  };
}

export function etichetaCap(): string {
  const poza = adresaCompleta(seo.pozaPartajare);
  const json = JSON.stringify(dateStructurate(), null, 2).replace(/</g, "\\u003c");
  return [
    `<title>${escapa(seo.titlu)}</title>`,
    `<meta name="description" content="${escapa(seo.descriere)}" />`,
    `<meta name="keywords" content="${escapa(seo.cuvinteCheie.join(", "))}" />`,
    seo.adresaSite ? `<link rel="canonical" href="${escapa(seo.adresaSite)}" />` : "",
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="ro_RO" />`,
    `<meta property="og:site_name" content="${escapa(firma.nume)}" />`,
    `<meta property="og:title" content="${escapa(seo.titlu)}" />`,
    `<meta property="og:description" content="${escapa(seo.descriere)}" />`,
    `<meta property="og:image" content="${escapa(poza)}" />`,
    seo.adresaSite ? `<meta property="og:url" content="${escapa(seo.adresaSite)}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="geo.region" content="RO-IL" />`,
    `<meta name="geo.placename" content="${escapa(firma.adresa.localitate)}" />`,
    `<link rel="icon" type="image/png" href="${escapa(firma.logo.fisier)}" />`,
    `<link rel="apple-touch-icon" href="${escapa(firma.logo.fisier)}" />`,
    `<script type="application/ld+json">\n${json}\n</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");
}
