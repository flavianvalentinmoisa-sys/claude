import type { Poza } from "../content/tipuri";

interface Props {
  poza: Poza;
  className?: string;
  /** true doar pentru imaginea din primul ecran */
  prioritara?: boolean;
}

/** Imagine cu text alternativ obligatoriu și încărcare amânată. */
export default function Imagine({ poza, className, prioritara = false }: Props) {
  return (
    <img
      src={poza.fisier}
      alt={poza.descriere}
      className={className}
      loading={prioritara ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={prioritara ? "high" : undefined}
    />
  );
}
