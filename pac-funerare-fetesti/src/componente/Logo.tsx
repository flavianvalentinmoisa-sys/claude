import { firma } from "../content/site";

interface Props {
  marime?: "mic" | "mare";
  cuNume?: boolean;
}

/** Sigla firmei, opțional cu numele scris lângă. */
export default function Logo({ marime = "mic", cuNume = firma.arataNumeLangaLogo }: Props) {
  const clasaPoza = marime === "mare" ? "h-20 w-auto md:h-28" : "h-10 w-auto md:h-12";
  return (
    <span className="inline-flex items-center gap-3">
      <img src={firma.logo.fisier} alt={firma.logo.descriere} className={clasaPoza} />
      {cuNume ? (
        <span className="font-titluri text-scris text-lg leading-tight font-semibold sm:text-xl md:text-2xl">
          {firma.nume}
        </span>
      ) : null}
    </span>
  );
}
