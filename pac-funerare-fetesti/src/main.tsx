import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/400-italic.css";
import "@fontsource/source-sans-3/600.css";
import "./stiluri/tema.css";
import Aplicatie from "./Aplicatie";

const radacina = document.getElementById("radacina")!;
const pagina = (
  <StrictMode>
    <Aplicatie />
  </StrictMode>
);

// După „npm run build” pagina vine deja scrisă în HTML (bun pentru Google);
// aici doar o „trezim”. În modul de lucru (npm run dev) o desenăm de la zero.
if (radacina.firstElementChild) {
  hydrateRoot(radacina, pagina);
} else {
  createRoot(radacina).render(pagina);
}
