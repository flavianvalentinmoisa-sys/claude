/*
 * Funcții mici, folosite de componente. Nu conțin texte.
 * De regulă NU trebuie modificat.
 */
import { firma, sectiuni } from "./site.ts";
import type { IdSectiune } from "./tipuri.ts";

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

export function linkEmail(): string {
  return `mailto:${firma.email}`;
}

export function linkHarta(cautare: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(cautare)}&output=embed`;
}

export function linkHartaMare(cautare: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cautare)}`;
}

/** Secțiunile vizibile, în ordinea din site.ts. */
export function sectiuniVizibile() {
  return sectiuni.filter((s) => s.vizibil);
}

export function esteVizibila(id: IdSectiune): boolean {
  return sectiuni.some((s) => s.id === id && s.vizibil);
}
