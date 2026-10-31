/*
 * Funcții mici folosite de temă. Nu conțin texte.
 * De regulă NU trebuie modificat.
 */
import { ordine, sectiuni, setari } from "./site.ts";
import type { SchemaCulori, Sectiune } from "./tipuri.ts";

const { firma } = setari;

/** "0760 396 402" -> "tel:+40760396402" */
export function linkTelefon(numar: string): string {
  const cifre = numar.replace(/\D/g, "");
  if (cifre.startsWith("40")) return `tel:+${cifre}`;
  if (cifre.startsWith("0")) return `tel:+40${cifre.slice(1)}`;
  return `tel:+${cifre}`;
}

/** "0760 396 402" -> "+40760396402" (pentru datele structurate) */
export function telefonInternational(numar: string): string {
  return linkTelefon(numar).replace("tel:", "");
}

/** Ambele telefoane, în ordine: principal, apoi secundar. */
export function toateTelefoanele(): string[] {
  return [firma.telefonPrincipal, firma.telefonSecundar].filter((t) => t.trim() !== "");
}

/** 4500 -> "4.500" */
export function formatPret(pret: number): string {
  return pret.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "Str. Călărași, Fetești, jud. Ialomița" */
export function adresaScurta(): string {
  const a = firma.adresa;
  return `${a.strada}, ${a.localitate}, jud. ${a.judet}`;
}

export const linkEmail = () => `mailto:${firma.email}`;

export const linkHarta = (cautare: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(cautare)}&output=embed`;

/* ------------------------------------------------------------------
 *  Secțiuni
 * ------------------------------------------------------------------ */

export interface SectiuneAfisata {
  id: string;
  date: Sectiune;
  culori: SchemaCulori;
}

/**
 * Secțiunile vizibile, în ordine, fiecare cu schema de culori finală.
 * Fără „culori” setat, secțiunile alternează: deschis, închis, deschis...
 * Bannerul e mereu închis (are poză), iar după el urmează una deschisă.
 */
export function sectiuniAfisate(): SectiuneAfisata[] {
  let anterioara: SchemaCulori = "inchis"; // bara de sus e închisă
  return ordine
    .filter((r) => r.vizibil)
    .map((r) => {
      const date: Sectiune = sectiuni[r.id];
      const implicita: SchemaCulori =
        date.tip === "banner" ? "inchis" : anterioara === "deschis" ? "inchis" : "deschis";
      const culori = date.culori ?? implicita;
      anterioara = culori;
      return { id: r.id, date, culori };
    });
}

/** true dacă secțiunea există și e vizibilă. */
export function esteVizibila(id: string): boolean {
  return ordine.some((r) => r.id === id && r.vizibil);
}

/* ------------------------------------------------------------------
 *  Butoane și legături (câmpul „catre”)
 * ------------------------------------------------------------------ */

export interface LegaturaRezolvata {
  href: string;
  /** true = se deschide într-o filă nouă */
  extern: boolean;
  /** numărul de telefon, dacă e un buton de apel */
  telefon?: string;
}

/**
 * Transformă „catre” într-o adresă reală.
 * Întoarce null dacă legătura duce spre o secțiune ascunsă sau lipsă.
 */
export function rezolvaLegatura(catre: string): LegaturaRezolvata | null {
  const c = catre.trim();
  if (c === "telefon") return { href: linkTelefon(firma.telefonPrincipal), extern: false, telefon: firma.telefonPrincipal };
  if (c === "telefon-2") {
    if (!firma.telefonSecundar.trim()) return null;
    return { href: linkTelefon(firma.telefonSecundar), extern: false, telefon: firma.telefonSecundar };
  }
  if (c === "email") return { href: linkEmail(), extern: false };
  if (c === "facebook") return firma.facebook ? { href: firma.facebook, extern: true } : null;
  if (c.startsWith("#")) return esteVizibila(c.slice(1)) ? { href: c, extern: false } : null;
  if (/^https?:\/\//.test(c)) return { href: c, extern: true };
  return { href: c, extern: false };
}
