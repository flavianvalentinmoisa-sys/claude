import type { ReactNode } from "react";
import type { NumePictograma } from "../content/tipuri";

/*
 * Pictograme simple, desenate cu linii subțiri.
 * Numele lor se folosesc în site.ts (câmpul „pictograma”).
 */
const desene: Record<NumePictograma, ReactNode> = {
  masina: (
    <>
      <path d="M2.5 16.5V12l2.2-4.6A1.5 1.5 0 0 1 6.1 6.5H15l3.6 4.5 2.4.6c.6.2 1 .7 1 1.3v3.6" />
      <path d="M2.5 16.5h1.6M8.4 16.5h7.2M19.9 16.5h2.1" />
      <circle cx="6.2" cy="16.8" r="2" />
      <circle cx="17.8" cy="16.8" r="2" />
      <path d="M5.2 11h12.3M10.5 6.5V11" />
    </>
  ),
  glob: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9Z" />
    </>
  ),
  maini: (
    <>
      <path d="M12 20.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10Z" />
      <path d="M2.5 14.5 6 18M21.5 14.5 18 18" />
    </>
  ),
  sicriu: (
    <>
      <path d="M9 2.5h6l3 5-2.5 14h-7L6 7.5l3-5Z" />
      <path d="M12 7v7M9.5 9.5h5" />
    </>
  ),
  flori: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4.5v-2M12 21.5v-2M4.5 12h-2M21.5 12h-2M6.7 6.7 5.3 5.3M18.7 18.7l-1.4-1.4M6.7 17.3l-1.4 1.4M18.7 5.3l-1.4 1.4" />
    </>
  ),
  acte: (
    <>
      <path d="M6 2.5h8l4.5 4.5v14.5H6Z" />
      <path d="M14 2.5V7h4.5M9 11.5h6.5M9 14.5h6.5M9 17.5h4" />
    </>
  ),
  lumanare: (
    <>
      <path d="M9.5 10.5h5v11h-5Z" />
      <path d="M12 10.5V8.5" />
      <path d="M12 2.5c1.6 1.8 2 3 2 3.8a2 2 0 0 1-4 0c0-.8.4-2 2-3.8Z" />
      <path d="M7 21.5h10" />
    </>
  ),
  masa: (
    <>
      <path d="M3 10.5h18M5 10.5v10M19 10.5v10" />
      <path d="M8.5 7.5c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" />
      <path d="M8 7.5h8" />
    </>
  ),
  telefon: (
    <path d="M5 3.5h3.2l1.6 4.2-2.1 1.4a11 11 0 0 0 5.2 5.2l1.4-2.1 4.2 1.6V17a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5Z" />
  ),
  ceas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  inima: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  ),
  scut: (
    <>
      <path d="M12 2.5 19.5 5v6.5c0 4.7-3.2 8.2-7.5 10-4.3-1.8-7.5-5.3-7.5-10V5Z" />
      <path d="m8.8 12 2.3 2.3 4.3-4.6" />
    </>
  ),
  verificat: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m7.8 12.3 2.8 2.8 5.6-6" />
    </>
  ),
  locatie: (
    <>
      <path d="M12 21.5s-6.5-6-6.5-11.3a6.5 6.5 0 0 1 13 0c0 5.3-6.5 11.3-6.5 11.3Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  facebook: (
    <path d="M14 21.5v-8h2.8l.4-3.2H14V8.4c0-.9.3-1.6 1.6-1.6h1.7V4a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.1H7.8v3.2h2.8v8" />
  ),
};

interface Props {
  nume: NumePictograma;
  className?: string;
}

export default function Pictograma({ nume, className = "h-7 w-7" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {desene[nume]}
    </svg>
  );
}
